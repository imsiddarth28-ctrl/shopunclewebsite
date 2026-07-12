import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ZodError } from 'zod'
import { frameOptionSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { db } = await connectToDatabase()

    const frameOptions = await db.collection('frame_options')
      .find({ productId: getObjectId(id) })
      .sort({ sortOrder: 1 })
      .toArray()

    return NextResponse.json(frameOptions)
  } catch (error) {
    console.error('Get frame options error:', error)
    return NextResponse.json({ error: 'Failed to fetch frame options' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = frameOptionSchema.parse(body)

    const { db } = await connectToDatabase()

    const count = await db.collection('frame_options').countDocuments({ productId: getObjectId(id) })

    const frameOption = {
      ...validatedData,
      productId: getObjectId(id),
      isActive: true,
      sortOrder: count,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('frame_options').insertOne(frameOption)

    return NextResponse.json({ ...frameOption, _id: result.insertedId }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Create frame option error:', error)
    return NextResponse.json({ error: 'Failed to create frame option' }, { status: 500 })
  }
}
