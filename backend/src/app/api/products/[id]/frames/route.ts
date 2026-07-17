import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ZodError } from 'zod'
import { frameOptionSchema } from '@/lib/validations'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, generalLimit, adminLimit } from '@/lib/rateLimit'

const IS_PROD = process.env.NODE_ENV === 'production'

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
    const { db } = await connectToDatabase()

    let productObjId
    try {
      productObjId = getObjectId(id)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid product ID' }, { status: 400 }))
    }

    const frameOptions = await db.collection('frame_options')
      .find({ productId: productObjId })
      .sort({ sortOrder: 1 })
      .toArray()

    return addCorsHeaders(request, NextResponse.json(frameOptions))
  } catch (error) {
    console.error('Get frame options error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to fetch frame options' }, { status: 500 }))
  }
}

export async function POST(
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
    const validatedData = frameOptionSchema.parse(body)

    const { db } = await connectToDatabase()

    let productObjId
    try {
      productObjId = getObjectId(id)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid product ID' }, { status: 400 }))
    }

    const count = await db.collection('frame_options').countDocuments({ productId: productObjId })

    const frameOption = {
      ...validatedData,
      productId: productObjId,
      isActive: true,
      sortOrder: count,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('frame_options').insertOne(frameOption)

    return addCorsHeaders(request, NextResponse.json({ ...frameOption, _id: result.insertedId }, { status: 201 }))
  } catch (error) {
    if (error instanceof ZodError) {
      const details = IS_PROD ? undefined : error.errors
      return addCorsHeaders(request, NextResponse.json({ error: 'Validation failed', ...(details && { details }) }, { status: 400 }))
    }
    console.error('Create frame option error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to create frame option' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}
