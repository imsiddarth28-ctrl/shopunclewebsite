import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const otp = searchParams.get('otp')

    if (!orderId || !otp) {
      return NextResponse.json(
        { error: 'Both orderId and otp query parameters are required.' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Look up the order where BOTH the human-readable orderId/orderNumber and the OTP match.
    // The OTP serves as a customer possession check to prevent unauthorized lookup of guest order details.
    const order = await db.collection('orders').findOne({
      $or: [
        { orderId: orderId },
        { orderNumber: orderId }
      ],
      otp: otp
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or verification OTP is incorrect.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      orderId: order.orderId || order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      status: order.status,
      items: order.items,
      total: order.totalAmount || order.total,
      shopOwnerNote: order.shopOwnerNote || '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }, { status: 200 })
  } catch (error) {
    console.error('Track order status by OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error while tracking order status.' },
      { status: 500 }
    )
  }
}
