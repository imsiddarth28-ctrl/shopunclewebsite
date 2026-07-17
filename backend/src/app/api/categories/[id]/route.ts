import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, adminLimit } from '@/lib/rateLimit'

export async function PATCH(
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
    const name        = String(body.name        || '').trim().slice(0, 100)
    const slug        = String(body.slug        || '').trim().slice(0, 100)
    const description = String(body.description || '').trim().slice(0, 500)
    const image       = String(body.image       || '').trim().slice(0, 500)

    if (!name || !slug) {
      return addCorsHeaders(request, NextResponse.json({ error: 'name and slug are required' }, { status: 400 }))
    }

    const { db } = await connectToDatabase()

    let catObjId
    try {
      catObjId = getObjectId(id)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid category ID' }, { status: 400 }))
    }

    // Check slug uniqueness (exclude self)
    const existing = await db.collection('categories').findOne({ slug, _id: { $ne: catObjId } })
    if (existing) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Slug already in use' }, { status: 409 }))
    }

    await db.collection('categories').updateOne(
      { _id: catObjId },
      { $set: { name, slug, description, image, updatedAt: new Date() } }
    )

    return addCorsHeaders(request, NextResponse.json({ message: 'Category updated' }))
  } catch (error) {
    console.error('Update category error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to update category' }, { status: 500 }))
  }
}

export async function DELETE(
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
    const { db } = await connectToDatabase()

    let catObjId
    try {
      catObjId = getObjectId(id)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid category ID' }, { status: 400 }))
    }

    await db.collection('categories').deleteOne({ _id: catObjId })
    return addCorsHeaders(request, NextResponse.json({ message: 'Category deleted' }))
  } catch (error) {
    console.error('Delete category error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to delete category' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}
