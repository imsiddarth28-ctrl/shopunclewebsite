import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { v2 as cloudinary } from 'cloudinary'

// Allow up to 15 MB for image uploads (overrides Next.js default 1 MB)
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Uploads a Buffer directly to Cloudinary (no base64 overhead).
 */
async function uploadBufferToCloudinary(
  buffer: Buffer,
  mimeType: string,
  folder = 'shopuncle/products'
): Promise<{ publicId: string; secureUrl: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'))
        } else {
          resolve({ publicId: result.public_id, secureUrl: result.secure_url })
        }
      }
    )
    uploadStream.end(buffer)
  })
}

/**
 * POST /api/upload
 * Accepts multipart/form-data with a "file" field.
 * Streams the file to Cloudinary without base64 conversion (avoids 413).
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided. Send a multipart/form-data request with a "file" field.' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF, AVIF.` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed is 10 MB.` },
        { status: 400 }
      )
    }

    // Convert to Buffer for streaming upload (no base64 overhead)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary via stream
    const { publicId, secureUrl } = await uploadBufferToCloudinary(buffer, file.type)

    // Persist metadata in MongoDB
    const { db } = await connectToDatabase()
    const userImage = {
      ownerId: getObjectId(session.user.id),
      publicId,
      secureUrl,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      createdAt: new Date(),
      isDeleted: false,
    }
    const result = await db.collection('user_images').insertOne(userImage)

    return NextResponse.json(
      { imageId: result.insertedId.toString(), secureUrl },
      { status: 201 }
    )
  } catch (error) {
    console.error('Image upload API error:', error)
    return NextResponse.json({ error: 'Failed to upload image. Please try again.' }, { status: 500 })
  }
}
