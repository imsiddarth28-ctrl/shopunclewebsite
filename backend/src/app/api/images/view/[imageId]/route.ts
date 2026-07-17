import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, generalLimit } from '@/lib/rateLimit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  if (!rateLimit(request, generalLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests' }, { status: 429 }))
  }

  try {
    const { imageId } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Access token is required' }, { status: 401 }))
    }

    // Verify session & admin role
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return addCorsHeaders(request, NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
    }

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('[images] NEXTAUTH_SECRET is not configured!')
      return addCorsHeaders(request, NextResponse.json({ error: 'Internal configuration error' }, { status: 500 }))
    }

    // Verify JWT token & expiration
    let decoded: any
    try {
      decoded = jwt.verify(token, secret)
    } catch (err) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid or expired access token' }, { status: 401 }))
    }

    if (decoded.imageId !== imageId) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Token is not valid for this image' }, { status: 400 }))
    }

    // Retrieve metadata from MongoDB
    const { db } = await connectToDatabase()
    let imageObjId
    try {
      imageObjId = getObjectId(imageId)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid image ID' }, { status: 400 }))
    }

    const userImage = await db.collection('user_images').findOne({ _id: imageObjId })
    if (!userImage) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Image metadata not found' }, { status: 404 }))
    }

    // Fetch the image from Cloudinary and stream it
    const cloudinaryResponse = await fetch(userImage.secureUrl)
    if (!cloudinaryResponse.ok) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Failed to fetch image from storage' }, { status: 500 }))
    }

    const imageBuffer = await cloudinaryResponse.arrayBuffer()
    const contentType = cloudinaryResponse.headers.get('Content-Type') || 'image/png'

    const response = new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
    return addCorsHeaders(request, response)

  } catch (error) {
    console.error('View image error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}
