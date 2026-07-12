import { connectToDatabase } from '@/lib/mongodb'
import { ProductForm } from '../ProductForm'

export const revalidate = 0 // Dynamic server rendering

async function getCategories() {
  try {
    const { db } = await connectToDatabase()
    const categories = await db.collection('categories').find().toArray()
    return categories.map(c => ({
      id: c._id.toString(),
      name: c.name,
    }))
  } catch (error) {
    console.error('Error fetching categories for product creation:', error)
    return []
  }
}

export default async function AdminNewProductPage() {
  const categories = await getCategories()

  return (
    <div className="py-6">
      <ProductForm categories={categories} />
    </div>
  )
}
