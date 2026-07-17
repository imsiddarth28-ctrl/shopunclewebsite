import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { orderId, imageId } = await request.json()
    if (!orderId || !imageId) {
      return NextResponse.json({ error: 'Missing orderId or imageId' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find the order
    const order = await db.collection('orders').findOne({ _id: getObjectId(orderId) })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check order status
    if (order.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Access denied: Order has been cancelled' }, { status: 400 })
    }

    // Log the image access
    const logEntry = {
      orderId: getObjectId(orderId),
      imageId: getObjectId(imageId),
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
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '5m' }
    )

    const viewUrl = `/api/images/view/${imageId}?token=${token}`

    return NextResponse.json({ viewUrl })

  } catch (error) {
    console.error('Request image access error:', error)
    return NextResponse.json({ error: 'Failed to request access' }, { status: 500 })
  }
}
