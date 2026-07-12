import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ZodError } from 'zod'
import { updateOrderStatusSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { db } = await connectToDatabase()

    const order = await db.collection('orders').findOne({ _id: getObjectId(id) })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && order.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Populate user details
    const user = await db.collection('users').findOne({ _id: order.userId })
    if (user) {
      order.user = {
        name: user.name,
        email: user.email,
        phone: user.phone,
      }
    }

    // Fetch image access logs (for admins only)
    if (session.user.role === 'ADMIN') {
      const logs = await db.collection('image_access_logs')
        .find({ orderId: getObjectId(id) })
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

    return NextResponse.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateOrderStatusSchema.parse(body)

    const { db } = await connectToDatabase()

    const update: any = { 
      status: validatedData.status,
      updatedAt: new Date()
    }
    if (validatedData.trackingNumber) update.trackingNumber = validatedData.trackingNumber
    if (validatedData.notes) update.notes = validatedData.notes

    const order = await db.collection('orders').findOneAndUpdate(
      { _id: getObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}