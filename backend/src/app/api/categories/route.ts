import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'

// GET /api/categories  (public read, admin write)
export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const categories = await db.collection('categories')
      .find({})
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({
      categories: categories.map(c => ({ ...c, _id: c._id.toString() })),
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, image } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const existing = await db.collection('categories').findOne({ slug })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const now = new Date()
    const result = await db.collection('categories').insertOne({
      name, slug, description: description || '', image: image || '',
      createdAt: now, updatedAt: now,
    })

    return NextResponse.json({ id: result.insertedId.toString(), message: 'Category created' }, { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
