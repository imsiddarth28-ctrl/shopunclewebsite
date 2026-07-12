import { notFound } from 'next/navigation'
import { connectToDatabase, getObjectId, serializeDocs } from '@/lib/mongodb'
import { FrameOptionsManager } from './FrameOptionsManager'

export const revalidate = 0 // Dynamic server rendering

interface AdminFramesPageProps {
  params: { id: string }
}

async function getProductAndFrames(productId: string) {
  try {
    const { db } = await connectToDatabase()
    
    const product = await db.collection('products').findOne({ _id: getObjectId(productId) })
    if (!product) return null

    const frames = await db.collection('frame_options')
      .find({ productId: getObjectId(productId) })
      .sort({ sortOrder: 1 })
      .toArray()

    return {
      productName: product.name,
      frameOptions: serializeDocs<any>(frames)
    }
  } catch (error) {
    console.error('Error fetching frames for admin manage page:', error)
    return null
  }
}

export default async function AdminFramesPage({ params }: AdminFramesPageProps) {
  const { id } = params
  const data = await getProductAndFrames(id)

  if (!data) {
    notFound()
  }

  return (
    <div className="py-6">
      <FrameOptionsManager
        productId={id}
        productName={data.productName}
        initialFrameOptions={data.frameOptions}
      />
    </div>
  )
}
