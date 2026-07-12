import { notFound } from 'next/navigation'
import { connectToDatabase, getObjectId, serializeDoc } from '@/lib/mongodb'
import { ProductForm } from '../../ProductForm'

export const revalidate = 0 // Dynamic server rendering

interface EditProductPageProps {
  params: { id: string }
}

async function getProductAndCategories(id: string) {
  try {
    const { db } = await connectToDatabase()
    const [product, categories] = await Promise.all([
      db.collection('products').findOne({ _id: getObjectId(id) }),
      db.collection('categories').find().toArray(),
    ])

    if (!product) return null

    return {
      product: serializeDoc<any>(product),
      categories: categories.map(c => ({
        id: c._id.toString(),
        name: c.name,
      })),
    }
  } catch (error) {
    console.error('Error fetching product and categories for edit:', error)
    return null
  }
}

export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = params
  const data = await getProductAndCategories(id)

  if (!data) {
    notFound()
  }

  return (
    <div className="py-6">
      <ProductForm initialData={data.product} categories={data.categories} />
    </div>
  )
}
