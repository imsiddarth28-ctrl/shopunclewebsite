import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, generalLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  // Client status tracking requests - rate limit 100/15min
  if (!rateLimit(request, generalLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests' }, { status: 429 }))
  }

  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const otp = searchParams.get('otp')

    if (!orderId || !otp) {
      return addCorsHeaders(request, NextResponse.json(
        { error: 'Both orderId and otp query parameters are required.' },
        { status: 400 }
      ))
    }

    const { db } = await connectToDatabase()

    // Look up the order where BOTH the human-readable orderId/orderNumber and the OTP match.
    // The OTP serves as a customer possession check to prevent unauthorized lookup of guest order details.
    const order = await db.collection('orders').findOne({
      $or: [
        { orderId: orderId },
        { orderNumber: orderId }
      ],
      otp: otp.toString().trim()
    })

    if (!order) {
      return addCorsHeaders(request, NextResponse.json(
        { error: 'Order not found or verification OTP is incorrect.' },
        { status: 404 }
      ))
    }

    return addCorsHeaders(request, NextResponse.json({
      orderId: order.orderId || order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      status: order.status,
      items: order.items,
      total: order.totalAmount || order.total,
      shopOwnerNote: order.shopOwnerNote || '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }, { status: 200 }))
  } catch (error) {
    console.error('Track order status by OTP error:', error)
    return addCorsHeaders(request, NextResponse.json(
      { error: 'Internal server error while tracking order status.' },
      { status: 500 }
    ))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}
