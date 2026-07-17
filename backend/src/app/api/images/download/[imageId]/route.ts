import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { Jimp, loadFont, measureText, measureTextHeight } from 'jimp'
import path from 'path'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, generalLimit } from '@/lib/rateLimit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  // Limit download rate
  if (!rateLimit(request, generalLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests' }, { status: 429 }))
  }

  try {
    const { imageId } = await params

    // Verify user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }

    // Fetch image metadata from MongoDB
    const { db } = await connectToDatabase()

    let imageObjId
    try {
      imageObjId = getObjectId(imageId)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid image ID' }, { status: 400 }))
    }

    const userImage = await db.collection('user_images').findOne({ _id: imageObjId })
    if (!userImage) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Image not found' }, { status: 404 }))
    }

    // Verify ownership (must be owner or admin)
    const isAdmin = session.user.role === 'ADMIN'
    const isOwner = userImage.ownerId.toString() === session.user.id
    if (!isAdmin && !isOwner) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
    }

    // Fetch the original image from Cloudinary
    const cloudinaryResponse = await fetch(userImage.secureUrl)
    if (!cloudinaryResponse.ok) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Failed to fetch original image' }, { status: 500 }))
    }

    const originalBuffer = await cloudinaryResponse.arrayBuffer()

    // Load image in Jimp and apply ShopUncle.com watermark
    const image = await Jimp.read(Buffer.from(originalBuffer))
    
    // Load built-in fonts for shadow effect using process.cwd()
    const fontBlackPath = path.join(process.cwd(), 'node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt')
    const fontWhitePath = path.join(process.cwd(), 'node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt')
    
    const fontBlack = await loadFont(fontBlackPath)
    const fontWhite = await loadFont(fontWhitePath)
    
    const text = 'Sree Balaji Frames & Gifts'
    const textWidth = measureText(fontBlack, text)
    const textHeight = measureTextHeight(fontBlack, text, image.bitmap.width)
    
    // Center alignment coordinates
    const x = (image.bitmap.width - textWidth) / 2
    const y = (image.bitmap.height - textHeight) / 2

    // Print black shadow
    image.print({
      font: fontBlack,
      x: x + 2,
      y: y + 2,
      text,
    })

    // Print white text
    image.print({
      font: fontWhite,
      x,
      y,
      text,
    })

    // Get watermarked image buffer using v1 getBuffer promise api
    const watermarkedBuffer = await image.getBuffer('image/png')

    // Return response as a file attachment download
    const response = new NextResponse(watermarkedBuffer as any, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="sree-balaji-${imageId}.png"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
    return addCorsHeaders(request, response)

  } catch (error) {
    console.error('Download watermarked image error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to generate watermarked download' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}
