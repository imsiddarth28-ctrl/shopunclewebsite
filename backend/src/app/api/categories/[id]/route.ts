import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, slug, description, image } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const id = new ObjectId(params.id)

    // Check slug uniqueness (exclude self)
    const existing = await db.collection('categories').findOne({ slug, _id: { $ne: id } })
    if (existing) return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })

    await db.collection('categories').updateOne(
      { _id: id },
      { $set: { name, slug, description: description || '', image: image || '', updatedAt: new Date() } }
    )

    return NextResponse.json({ message: 'Category updated' })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { db } = await connectToDatabase()
    await db.collection('categories').deleteOne({ _id: new ObjectId(params.id) })
    return NextResponse.json({ message: 'Category deleted' })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
