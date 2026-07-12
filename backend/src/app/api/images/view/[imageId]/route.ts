import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 401 })
    }

    // 1. Verify session & admin role
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. Verify JWT token & expiration
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret')
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired access token' }, { status: 401 })
    }

    if (decoded.imageId !== imageId) {
      return NextResponse.json({ error: 'Token is not valid for this image' }, { status: 400 })
    }

    // 3. Retrieve metadata from MongoDB
    const { db } = await connectToDatabase()
    const userImage = await db.collection('user_images').findOne({ _id: getObjectId(imageId) })
    if (!userImage) {
      return NextResponse.json({ error: 'Image metadata not found' }, { status: 404 })
    }

    // 4. Fetch the image from Cloudinary and stream it
    const cloudinaryResponse = await fetch(userImage.secureUrl)
    if (!cloudinaryResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image from storage' }, { status: 500 })
    }

    const imageBuffer = await cloudinaryResponse.arrayBuffer()
    const contentType = cloudinaryResponse.headers.get('Content-Type') || 'image/png'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, max-age=0',
      },
    })

  } catch (error) {
    console.error('View image error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
