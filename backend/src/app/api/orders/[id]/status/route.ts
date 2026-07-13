import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

const VALID_STATUSES = ['confirmed', 'rejected', 'payment_pending', 'completed']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Protect this route with simple shared-secret header
    const authHeader = request.headers.get('x-shop-owner-key')
    const expectedKey = process.env.SHOP_OWNER_KEY || 'shop-owner-secret-key-123'
    
    if (!authHeader || authHeader !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized: Invalid shop owner key.' }, { status: 401 })
    }

    const { id } = await params // Dynamic orderId param, e.g. ORD-7F3K29
    const body = await request.json()
    const { otp, status, shopOwnerNote } = body

    if (!otp || !status) {
      return NextResponse.json({ error: 'OTP and status are required.' }, { status: 400 })
    }

    // Validate status value
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Find the order matching the human-readable orderId/orderNumber
    const order = await db.collection('orders').findOne({
      $or: [
        { orderId: id },
        { orderNumber: id }
      ]
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }

    // 2. Verify OTP matches before allowing the status update.
    // The OTP serves as a security check matching the WhatsApp message sent by the customer
    // to verify that the shop owner is updating the correct order.
    if (order.otp !== otp.toString().trim()) {
      return NextResponse.json({ error: 'Verification OTP does not match.' }, { status: 403 })
    }

    // 3. Update status and optional owner note
    const updateData: any = {
      status,
      updatedAt: new Date()
    }
    
    if (shopOwnerNote !== undefined) {
      updateData.shopOwnerNote = shopOwnerNote
    }

    const updatedOrder = await db.collection('orders').findOneAndUpdate(
      { _id: order._id },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return NextResponse.json({
      message: 'Order status updated successfully.',
      order: updatedOrder
    }, { status: 200 })

  } catch (error) {
    console.error('Update order status by OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error while updating order status.' },
      { status: 500 }
    )
  }
}
