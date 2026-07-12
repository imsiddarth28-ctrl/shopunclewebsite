import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { Jimp, loadFont, measureText, measureTextHeight } from 'jimp'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params

    // 1. Verify user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch image metadata from MongoDB
    const { db } = await connectToDatabase()
    const userImage = await db.collection('user_images').findOne({ _id: getObjectId(imageId) })
    if (!userImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // 3. Verify ownership (must be owner or admin)
    const isAdmin = session.user.role === 'ADMIN'
    const isOwner = userImage.ownerId.toString() === session.user.id
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 4. Fetch the original image from Cloudinary
    const cloudinaryResponse = await fetch(userImage.secureUrl)
    if (!cloudinaryResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch original image' }, { status: 500 })
    }

    const originalBuffer = await cloudinaryResponse.arrayBuffer()

    // 5. Load image in Jimp and apply ShopUncle.com watermark
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

    // 6. Return response as a file attachment download
    return new NextResponse(watermarkedBuffer as any, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="sree-balaji-${imageId}.png"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })

  } catch (error) {
    console.error('Download watermarked image error:', error)
    return NextResponse.json({ error: 'Failed to generate watermarked download' }, { status: 500 })
  }
}
