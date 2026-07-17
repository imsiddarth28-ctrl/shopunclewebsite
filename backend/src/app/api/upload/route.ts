import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { uploadImage } from '@/lib/cloudinary'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { image } = body
    if (!image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 })
    }

    // Upload to Cloudinary
    const cloudinaryResponse = await uploadImage(image)

    // Save metadata in MongoDB
    const { db } = await connectToDatabase()
    
    const userImage = {
      ownerId: getObjectId(session.user.id),
      publicId: cloudinaryResponse.publicId,
      secureUrl: cloudinaryResponse.secureUrl,
      createdAt: new Date(),
      isDeleted: false,
    }

    const result = await db.collection('user_images').insertOne(userImage)

    return NextResponse.json({
      imageId: result.insertedId.toString(),
      secureUrl: cloudinaryResponse.secureUrl,
    }, { status: 201 })

  } catch (error) {
    console.error('Image upload API error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
