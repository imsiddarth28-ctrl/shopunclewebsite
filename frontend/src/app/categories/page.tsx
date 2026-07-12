import Link from 'next/link'
import Image from 'next/image'
import { connectToDatabase } from '@/lib/mongodb'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ArrowRight } from 'lucide-react'

export const revalidate = 0 // Dynamic server rendering

async function getCategories() {
  try {
    const { db } = await connectToDatabase()
    const categories = await db.collection('categories').find().toArray()
    
    // Count products per category
    const counts = await db.collection('products').aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } }
    ]).toArray()
    
    const countMap = new Map(counts.map(c => [c._id.toString(), c.count]))
    
    return categories.map(c => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description || 'Explore our custom selection',
      image: c.image || `/categories/${c.slug}.jpg`,
      count: countMap.get(c._id.toString()) || 0
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="info" className="mb-4">Gift Collection</Badge>
          <h1 className="heading-1 text-gray-900 dark:text-white mb-4">Shop by Category</h1>
          <p className="body-lg">Explore our curated collections of customizable and ready-made gifts for every occasion.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="group">
              <Card className="card-hover overflow-hidden h-full flex flex-col">
                <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-sm font-medium bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full border border-white/10">
                      {category.count} Products
                    </span>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="heading-4 text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h2>
                    <p className="body-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                  <div className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    Browse Collection
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
