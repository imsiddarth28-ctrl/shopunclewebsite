import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ZodError } from 'zod'
import { frameOptionSchema } from '@/lib/validations'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; frameId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { frameId } = params
    const body = await request.json()
    const validatedData = frameOptionSchema.parse(body)

    const { db } = await connectToDatabase()

    const frameOption = await db.collection('frame_options').findOneAndUpdate(
      { _id: getObjectId(frameId) },
      { $set: { ...validatedData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    if (!frameOption) {
      return NextResponse.json({ error: 'Frame option not found' }, { status: 404 })
    }

    return NextResponse.json(frameOption)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Update frame option error:', error)
    return NextResponse.json({ error: 'Failed to update frame option' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; frameId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { frameId } = params
    const { db } = await connectToDatabase()

    const result = await db.collection('frame_options').deleteOne({ _id: getObjectId(frameId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Frame option not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Frame option deleted successfully' })
  } catch (error) {
    console.error('Delete frame option error:', error)
    return NextResponse.json({ error: 'Failed to delete frame option' }, { status: 500 })
  }
}
