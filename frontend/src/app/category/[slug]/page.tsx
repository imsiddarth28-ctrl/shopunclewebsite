import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Inbox } from 'lucide-react'
import { WishlistButton } from '@/components/ui/WishlistButton'
import { AddToCartButton } from '@/components/ui/AddToCartButton'

export const revalidate = 0 // Dynamic server rendering

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

async function getCategoryData(slug: string) {
  try {
    const { db } = await connectToDatabase()
    
    const category = await db.collection('categories').findOne({ slug })
    if (!category) return null

    const products = await db.collection('products')
      .find({ categoryId: category._id, isActive: true })
      .toArray()
    
    return {
      category: {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      products: products.map(p => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.shortDescription || p.description.substring(0, 100) + '...',
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: p.images || [],
        isCustomizable: p.isCustomizable && category.slug === 'photo-frames',
      }))
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return null
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const data = await getCategoryData(slug)

  if (!data) {
    notFound()
  }

  const { category, products } = data

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href="/categories" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to all categories
        </Link>

        {/* Category Header */}
        <div className="mb-12">
          <h1 className="heading-2 text-gray-900 dark:text-white">{category.name}</h1>
          {category.description && (
            <p className="body text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto">
            <CardContent>
              <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="heading-4 mb-2">No Products Found</h3>
              <p className="body-sm">
                We are currently adding new items to this category. Please check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="card-hover overflow-hidden flex flex-col h-full">
                <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-900">
                  <Image
                    src={product.images[0] || '/products/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Floating Wishlist Heart Button */}
                  <WishlistButton
                    productId={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images[0]}
                    isCustomizable={product.isCustomizable}
                    className="absolute top-4 right-4"
                  />

                  {product.isCustomizable && (
                    <span className="absolute top-4 left-4 badge badge-info bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm z-10">
                      3D Customize
                    </span>
                  )}
                </div>
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="heading-4 text-gray-900 dark:text-white mb-2">{product.name}</h3>
                    <p className="body-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {product.isCustomizable ? (
                        <Link href={`/personalized/${product.id}`}>
                          <Button size="sm">
                            Personalize
                          </Button>
                        </Link>
                      ) : (
                        <AddToCartButton
                          productId={product.id}
                          name={product.name}
                          price={product.price}
                          image={product.images[0]}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
