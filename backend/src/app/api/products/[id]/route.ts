import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ZodError } from 'zod'
import { productSchema } from '@/lib/validations'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, generalLimit, adminLimit } from '@/lib/rateLimit'

const IS_PROD = process.env.NODE_ENV === 'production'

const designerFrameIds = [
  'angelic-designer-frame',
  'converge-designer-frame',
  'crystal-line-designer-frame',
  'whimsical-designer-frame',
  'azure-designer-frame',
  'spring-designer-frame',
  'blossom-designer-frame',
  'velvety-designer-frame'
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  if (!rateLimit(request, generalLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests' }, { status: 429 }))
  }

  try {
    const { id } = await params

    if (designerFrameIds.includes(id)) {
      const formattedName = id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      return addCorsHeaders(request, NextResponse.json({
        _id: id,
        id: id,
        name: formattedName,
        price: 449,
        compareAtPrice: 699,
        images: ['/products/placeholder.jpg'],
        description: 'Custom premium designed photo frame',
        shortDescription: 'Custom premium designed photo frame',
        isCustomizable: true,
        isActive: true,
        categoryId: '65f123456789012345678901',
        frameOptions: [],
        reviews: [],
        averageRating: 4.8,
        reviewCount: 12
      }))
    }

    const { db } = await connectToDatabase()

    let product = null
    try {
      product = await db.collection('products').findOne({ _id: getObjectId(id) })
    } catch (e) {
      // getObjectId throws on invalid format, treat as 404
      return addCorsHeaders(request, NextResponse.json({ error: 'Product not found' }, { status: 404 }))
    }

    if (!product) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Product not found' }, { status: 404 }))
    }

    // Get category details
    const category = await db.collection('categories').findOne({ _id: product.categoryId })

    // Get frame options
    const frameOptions = await db.collection('frame_options')
      .find({ productId: product._id, isActive: true })
      .sort({ price: 1 })
      .toArray()

    // Get reviews
    const reviews = await db.collection('reviews')
      .find({ productId: product._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return addCorsHeaders(request, NextResponse.json({
      ...product,
      category: category ? { name: category.name, slug: category.slug } : null,
      frameOptions,
      reviews,
      averageRating,
      reviewCount: reviews.length,
    }))
  } catch (error) {
    console.error('Get product error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 }))
  }
}

export async function PUT(
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
    const validatedData = productSchema.parse(body)

    const { db } = await connectToDatabase()

    let productObjId
    try {
      productObjId = getObjectId(id)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid product ID' }, { status: 400 }))
    }

    const product = await db.collection('products').findOneAndUpdate(
      { _id: productObjId },
      { $set: { ...validatedData, categoryId: getObjectId(validatedData.categoryId), updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    if (!product) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Product not found' }, { status: 404 }))
    }

    return addCorsHeaders(request, NextResponse.json(product))
  } catch (error) {
    if (error instanceof ZodError) {
      const details = IS_PROD ? undefined : error.errors
      return addCorsHeaders(request, NextResponse.json({ error: 'Validation failed', ...(details && { details }) }, { status: 400 }))
    }
    console.error('Update product error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to update product' }, { status: 500 }))
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

    let productObjId
    try {
      productObjId = getObjectId(id)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid product ID' }, { status: 400 }))
    }

    await db.collection('products').deleteOne({ _id: productObjId })

    return addCorsHeaders(request, NextResponse.json({ message: 'Product deleted successfully' }))
  } catch (error) {
    console.error('Delete product error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to delete product' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}