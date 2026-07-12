import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ZodError } from 'zod'
import { productSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const isCustomizable = searchParams.get('customizable') === 'true'
    const featured = searchParams.get('featured') === 'true'

    const { db } = await connectToDatabase()

    const filter: any = { isActive: true }

    if (category) {
      const cat = await db.collection('categories').findOne({ slug: category })
      if (cat) filter.categoryId = cat._id
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    if (isCustomizable) filter.isCustomizable = true
    if (featured) filter.isFeatured = true

    let sortOption: any = { createdAt: -1 }
    switch (sort) {
      case 'price-low': sortOption = { price: 1 }; break
      case 'price-high': sortOption = { price: -1 }; break
      case 'popular': sortOption = { 'orderCount': -1 }; break
      case 'rating': sortOption = { 'averageRating': -1 }; break
      default: sortOption = { createdAt: -1 }
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      db.collection('products')
        .find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('products').countDocuments(filter)
    ])

    return NextResponse.json({
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    const { db } = await connectToDatabase()

    const product = {
      ...validatedData,
      categoryId: getObjectId(validatedData.categoryId),
      slug: validatedData.slug || validatedData.name.toLowerCase().replace(/\s+/g, '-'),
      images: validatedData.images || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('products').insertOne(product)

    return NextResponse.json({ ...product, _id: result.insertedId }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}