import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ZodError } from 'zod'
import { productSchema } from '@/lib/validations'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, generalLimit, adminLimit } from '@/lib/rateLimit'

const IS_PROD = process.env.NODE_ENV === 'production'

/** Safely parse and clamp pagination params. */
function parsePagination(searchParams: URLSearchParams) {
  const page  = Math.max(1, parseInt(searchParams.get('page')  || '1') || 1)
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12') || 12))
  return { page, limit, skip: (page - 1) * limit }
}

export async function GET(request: NextRequest) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  if (!rateLimit(request, generalLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests, please slow down.' }, { status: 429 }))
  }

  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePagination(searchParams)

    const category       = searchParams.get('category')
    const search         = searchParams.get('search')
    const sort           = searchParams.get('sort') || 'newest'
    const minPrice       = searchParams.get('minPrice')
    const maxPrice       = searchParams.get('maxPrice')
    const isCustomizable = searchParams.get('customizable') === 'true'
    const featured       = searchParams.get('featured') === 'true'

    const { db } = await connectToDatabase()
    const filter: any = { isActive: true }

    if (category) {
      const cat = await db.collection('categories').findOne({ slug: category })
      if (cat) filter.categoryId = cat._id
    }

    if (search) {
      // Sanitise search — limit to 100 chars, no regex metacharacters
      const safeSearch = search.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.$or = [
        { name:        { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
      ]
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    if (isCustomizable) filter.isCustomizable = true
    if (featured)       filter.isFeatured = true

    const SORT_MAP: Record<string, any> = {
      'price-low':  { price: 1 },
      'price-high': { price: -1 },
      'popular':    { orderCount: -1 },
      'rating':     { averageRating: -1 },
    }
    const sortOption = SORT_MAP[sort] ?? { createdAt: -1 }

    const [products, total] = await Promise.all([
      db.collection('products').find(filter).sort(sortOption as any).skip(skip).limit(limit).toArray(),
      db.collection('products').countDocuments(filter),
    ])

    return addCorsHeaders(request, NextResponse.json({
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }))
  } catch (error) {
    console.error('Get products error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 }))
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
    const validatedData = productSchema.parse(body)
    const { db } = await connectToDatabase()

    const product = {
      ...validatedData,
      categoryId: getObjectId(validatedData.categoryId),
      slug: validatedData.slug || validatedData.name.toLowerCase().replace(/\s+/g, '-'),
      images: validatedData.images || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('products').insertOne(product)
    return addCorsHeaders(request, NextResponse.json({ ...product, _id: result.insertedId }, { status: 201 }))
  } catch (error) {
    if (error instanceof ZodError) {
      // Never expose internal schema details to clients in production
      const details = IS_PROD ? undefined : error.errors
      return addCorsHeaders(request, NextResponse.json({ error: 'Validation failed', ...(details && { details }) }, { status: 400 }))
    }
    console.error('Create product error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to create product' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}