import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, adminLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  if (!rateLimit(request, adminLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests' }, { status: 429 }))
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return addCorsHeaders(request, NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
    }

    const { orderId, imageId } = await request.json()
    if (!orderId || !imageId) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Missing orderId or imageId' }, { status: 400 }))
    }

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('[images] NEXTAUTH_SECRET is not configured!')
      return addCorsHeaders(request, NextResponse.json({ error: 'Internal configuration error' }, { status: 500 }))
    }

    const { db } = await connectToDatabase()

    let orderObjId, imageObjId
    try {
      orderObjId = getObjectId(orderId)
      imageObjId = getObjectId(imageId)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid ID parameters' }, { status: 400 }))
    }

    // Find the order
    const order = await db.collection('orders').findOne({ _id: orderObjId })
    if (!order) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Order not found' }, { status: 404 }))
    }

    // Check order status
    if (order.status === 'CANCELLED') {
      return addCorsHeaders(request, NextResponse.json({ error: 'Access denied: Order has been cancelled' }, { status: 400 }))
    }

    // Log the image access
    const logEntry = {
      orderId: orderObjId,
      imageId: imageObjId,
      adminId: getObjectId(session.user.id),
      timestamp: new Date(),
      reason: 'Order Fulfillment',
    }
    await db.collection('image_access_logs').insertOne(logEntry)

    // Generate JWT token valid for 5 minutes
    const token = jwt.sign(
      {
        imageId: imageId.toString(),
        adminId: session.user.id,
      },
      secret,
      { expiresIn: '5m' }
    )

    const viewUrl = `/api/images/view/${imageId}?token=${token}`

    return addCorsHeaders(request, NextResponse.json({ viewUrl }))

  } catch (error) {
    console.error('Request image access error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to request access' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}
