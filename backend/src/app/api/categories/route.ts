import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, generalLimit, adminLimit } from '@/lib/rateLimit'

// GET /api/categories  (public read, admin write)
export async function GET(request: NextRequest) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult
  if (!rateLimit(request, generalLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests' }, { status: 429 }))
  }
  try {
    const { db } = await connectToDatabase()
    const categories = await db.collection('categories').find({}).sort({ name: 1 }).toArray()
    return addCorsHeaders(request, NextResponse.json({
      categories: categories.map(c => ({ ...c, _id: c._id.toString() })),
    }))
  } catch (error) {
    console.error('Get categories error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const name        = String(body.name        || '').trim().slice(0, 100)
    const slug        = String(body.slug        || '').trim().slice(0, 100)
    const description = String(body.description || '').trim().slice(0, 500)
    const image       = String(body.image       || '').trim().slice(0, 500)

    if (!name || !slug) {
      return addCorsHeaders(request, NextResponse.json({ error: 'name and slug are required' }, { status: 400 }))
    }

    const { db } = await connectToDatabase()
    const existing = await db.collection('categories').findOne({ slug })
    if (existing) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Slug already exists' }, { status: 409 }))
    }

    const now = new Date()
    const result = await db.collection('categories').insertOne({
      name, slug, description, image, createdAt: now, updatedAt: now,
    })

    return addCorsHeaders(request, NextResponse.json({ id: result.insertedId.toString(), message: 'Category created' }, { status: 201 }))
  } catch (error) {
    console.error('Create category error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to create category' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}
