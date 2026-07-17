import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, adminLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    const { db } = await connectToDatabase()

    // Run all aggregations in parallel
    const [
      totalOrders, totalRevenue, totalCustomers,
      ordersByStatus, revenueByMonth, topProducts, recentOrders,
    ] = await Promise.all([
      // Total orders
      db.collection('orders').countDocuments({}),

      // Total revenue from paid orders
      db.collection('orders').aggregate([
        { $match: { paymentStatus: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]).toArray(),

      // Total customers
      db.collection('users').countDocuments({ role: 'CUSTOMER' }),

      // Orders by status
      db.collection('orders').aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).toArray(),

      // Revenue by month (last 6 months)
      db.collection('orders').aggregate([
        { $match: { paymentStatus: 'PAID', createdAt: { $gte: new Date(Date.now() - 180 * 86400000) } } },
        {
          $group: {
            _id: {
              year:  { $year:  '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$total' },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]).toArray(),

      // Top 5 selling products
      db.collection('orders').aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            totalSold: { $sum: '$items.quantity' },
            revenue:   { $sum: '$items.totalPrice' },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products', localField: '_id', foreignField: '_id', as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name:      { $ifNull: ['$product.name', 'Unknown Product'] },
            totalSold: 1,
            revenue:   1,
          },
        },
      ]).toArray(),

      // Recent 5 orders
      db.collection('orders')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
    ])

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

    return addCorsHeaders(request, NextResponse.json({
      overview: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCustomers,
        pendingOrders: ordersByStatus.find(s => s._id?.toUpperCase() === 'PENDING')?.count || 0,
      },
      ordersByStatus: ordersByStatus.map(s => ({ status: s._id?.toUpperCase() || 'PENDING', count: s.count })),
      revenueByMonth: revenueByMonth.map(m => ({
        month:   `${monthNames[m._id.month - 1]} ${m._id.year}`,
        revenue: m.revenue,
        orders:  m.orders,
      })),
      topProducts: topProducts.map(p => ({
        _id:      p._id?.toString() || 'unknown',
        name:     p.name,
        totalSold: p.totalSold,
        revenue:  p.revenue,
      })),
      recentOrders: recentOrders.map(o => ({
        ...o,
        _id:    o._id.toString(),
        userId: o.userId?.toString(),
      })),
    }))
  } catch (error) {
    console.error('Analytics error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}
