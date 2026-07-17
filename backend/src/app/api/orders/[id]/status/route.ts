import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, adminLimit } from '@/lib/rateLimit'

const VALID_STATUSES = ['confirmed', 'rejected', 'payment_pending', 'completed']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  // Admin / webhook status updates — rate limit 20 per minute
  if (!rateLimit(request, adminLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests' }, { status: 429 }))
  }

  try {
    // Protect this route with shared-secret header. No default insecure fallbacks.
    const authHeader = request.headers.get('x-shop-owner-key')
    const expectedKey = process.env.SHOP_OWNER_KEY

    if (!expectedKey || !authHeader || authHeader !== expectedKey) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }

    const { id } = await params // Dynamic orderId param, e.g. ORD-7F3K29
    const body = await request.json()
    const { otp, status, shopOwnerNote } = body

    if (!otp || !status) {
      return addCorsHeaders(request, NextResponse.json({ error: 'OTP and status are required.' }, { status: 400 }))
    }

    // Validate status value
    if (!VALID_STATUSES.includes(status)) {
      return addCorsHeaders(request, NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      ))
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
      return addCorsHeaders(request, NextResponse.json({ error: 'Order not found.' }, { status: 404 }))
    }

    // Verify OTP matches before allowing the status update.
    if (order.otp !== otp.toString().trim()) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Verification OTP does not match.' }, { status: 403 }))
    }

    // Update status and optional owner note
    const updateData: any = {
      status,
      updatedAt: new Date()
    }
    
    if (shopOwnerNote !== undefined) {
      // Sanitise note text
      updateData.shopOwnerNote = String(shopOwnerNote).replace(/[<>"'`]/g, '').trim().slice(0, 1000)
    }

    const updatedOrder = await db.collection('orders').findOneAndUpdate(
      { _id: order._id },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return addCorsHeaders(request, NextResponse.json({
      message: 'Order status updated successfully.',
      order: updatedOrder
    }, { status: 200 }))

  } catch (error) {
    console.error('Update order status by OTP error:', error)
    return addCorsHeaders(request, NextResponse.json(
      { error: 'Internal server error while updating order status.' },
      { status: 500 }
    ))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}
