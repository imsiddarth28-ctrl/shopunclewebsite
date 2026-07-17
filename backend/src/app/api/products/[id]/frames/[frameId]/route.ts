import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ZodError } from 'zod'
import { frameOptionSchema } from '@/lib/validations'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, adminLimit } from '@/lib/rateLimit'

const IS_PROD = process.env.NODE_ENV === 'production'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; frameId: string }> }
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

    const { frameId } = await params
    const body = await request.json()
    const validatedData = frameOptionSchema.parse(body)

    const { db } = await connectToDatabase()

    let frameObjId
    try {
      frameObjId = getObjectId(frameId)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid Frame ID' }, { status: 400 }))
    }

    const frameOption = await db.collection('frame_options').findOneAndUpdate(
      { _id: frameObjId },
      { $set: { ...validatedData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    if (!frameOption) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Frame option not found' }, { status: 404 }))
    }

    return addCorsHeaders(request, NextResponse.json(frameOption))
  } catch (error) {
    if (error instanceof ZodError) {
      const details = IS_PROD ? undefined : error.errors
      return addCorsHeaders(request, NextResponse.json({ error: 'Validation failed', ...(details && { details }) }, { status: 400 }))
    }
    console.error('Update frame option error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to update frame option' }, { status: 500 }))
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; frameId: string }> }
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

    const { frameId } = await params
    const { db } = await connectToDatabase()

    let frameObjId
    try {
      frameObjId = getObjectId(frameId)
    } catch (e) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Invalid Frame ID' }, { status: 400 }))
    }

    const result = await db.collection('frame_options').deleteOne({ _id: frameObjId })

    if (result.deletedCount === 0) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Frame option not found' }, { status: 404 }))
    }

    return addCorsHeaders(request, NextResponse.json({ message: 'Frame option deleted successfully' }))
  } catch (error) {
    console.error('Delete frame option error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to delete frame option' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}
