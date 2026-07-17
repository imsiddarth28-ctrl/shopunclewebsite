import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ZodError } from 'zod'
import { updateOrderStatusSchema } from '@/lib/validations'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, generalLimit, adminLimit } from '@/lib/rateLimit'

const IS_PROD = process.env.NODE_ENV === 'production'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  if (!rateLimit(request, generalLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests' }, { status: 429 }))
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }

    const { id } = await params
    const { db } = await connectToDatabase()

    let orderObjId
    try {
      orderObjId = getObjectId(id)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Order not found' }, { status: 404 }))
    }

    const order = await db.collection('orders').findOne({ _id: orderObjId })

    if (!order) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Order not found' }, { status: 404 }))
    }

    // Role check: Normal customers can only see their own orders
    if (session.user.role !== 'ADMIN' && (!order.userId || order.userId.toString() !== session.user.id)) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
    }

    // Populate user details
    if (order.userId) {
      const user = await db.collection('users').findOne({ _id: order.userId })
      if (user) {
        order.user = {
          name: user.name,
          email: user.email,
          phone: user.phone,
        }
      }
    }

    // Fetch image access logs (for admins only)
    if (session.user.role === 'ADMIN') {
      const logs = await db.collection('image_access_logs')
        .find({ orderId: orderObjId })
        .sort({ timestamp: -1 })
        .toArray()
      
      // Populate admin name for logs
      const adminIds = logs.map(l => l.adminId)
      const admins = await db.collection('users').find({ _id: { $in: adminIds } }).toArray()
      const adminMap = new Map(admins.map(a => [a._id.toString(), a.name]))
      
      order.logs = logs.map(l => ({
        ...l,
        adminName: adminMap.get(l.adminId.toString()) || 'Unknown Admin',
      }))
    }

    return addCorsHeaders(request, NextResponse.json({ ...order, id: order._id.toString(), _id: order._id.toString() }))
  } catch (error) {
    console.error('Get order error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 }))
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  if (!rateLimit(request, adminLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests' }, { status: 429 }))
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return addCorsHeaders(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateOrderStatusSchema.parse(body)

    const { db } = await connectToDatabase()

    let orderObjId
    try {
      orderObjId = getObjectId(id)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid order ID' }, { status: 400 }))
    }

    const update: any = { 
      status: validatedData.status,
      updatedAt: new Date()
    }
    if (validatedData.trackingNumber) update.trackingNumber = validatedData.trackingNumber
    if (validatedData.notes) update.notes = validatedData.notes
    if (validatedData.estimatedReadyDate !== undefined) update.estimatedReadyDate = validatedData.estimatedReadyDate

    const order = await db.collection('orders').findOneAndUpdate(
      { _id: orderObjId },
      { $set: update },
      { returnDocument: 'after' }
    )

    if (!order) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Order not found' }, { status: 404 }))
    }

    return addCorsHeaders(request, NextResponse.json(order))
  } catch (error) {
    if (error instanceof ZodError) {
      const details = IS_PROD ? undefined : error.errors
      return addCorsHeaders(request, NextResponse.json({ error: 'Validation failed', ...(details && { details }) }, { status: 400 }))
    }
    console.error('Update order error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to update order' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}