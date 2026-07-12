import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ZodError } from 'zod'
import { productSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { db } = await connectToDatabase()

    const product = await db.collection('products').findOne({ _id: getObjectId(id) })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
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

    return NextResponse.json({
      ...product,
      category: category ? { name: category.name, slug: category.slug } : null,
      frameOptions,
      reviews,
      averageRating,
      reviewCount: reviews.length,
    })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = productSchema.parse(body)

    const { db } = await connectToDatabase()

    const product = await db.collection('products').findOneAndUpdate(
      { _id: getObjectId(id) },
      { $set: { ...validatedData, categoryId: getObjectId(validatedData.categoryId), updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { db } = await connectToDatabase()

    await db.collection('products').deleteOne({ _id: getObjectId(id) })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}