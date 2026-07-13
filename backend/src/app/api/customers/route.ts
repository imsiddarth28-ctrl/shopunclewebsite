import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

// GET /api/customers — admin only
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page  = parseInt(searchParams.get('page')  || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const skip  = (page - 1) * limit

    const { db } = await connectToDatabase()

    const filter: any = { role: 'CUSTOMER' }
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const [users, total] = await Promise.all([
      db.collection('users')
        .find(filter, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('users').countDocuments(filter),
    ])

    // Attach order counts
    const userIds = users.map(u => u._id)
    const orderStats = await db.collection('orders').aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', orderCount: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
    ]).toArray()

    const statsMap = new Map(orderStats.map(s => [s._id.toString(), s]))

    const enriched = users.map(u => ({
      ...u,
      _id: u._id.toString(),
      orderCount: statsMap.get(u._id.toString())?.orderCount || 0,
      totalSpent: statsMap.get(u._id.toString())?.totalSpent || 0,
    }))

    return NextResponse.json({
      customers: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
