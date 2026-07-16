import Link from 'next/link'
import { connectToDatabase } from '@/lib/mongodb'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Package, Upload } from 'lucide-react'
import { ProductListTable } from './ProductListTable'

export const revalidate = 0 // Dynamic server rendering

async function getProductsList() {
  try {
    const { db } = await connectToDatabase()
    
    // Fetch products and categories to map names
    const [products, categories] = await Promise.all([
      db.collection('products').find().sort({ createdAt: -1 }).toArray(),
      db.collection('categories').find().toArray(),
    ])
    
    const categoryMap = new Map(categories.map(c => [c._id.toString(), c.name]))
    
    return products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images || [],
      isCustomizable: p.isCustomizable,
      isActive: p.isActive,
      stock: p.stock || 0,
      categoryName: categoryMap.get(p.categoryId.toString()) || 'Uncategorized',
    }))
  } catch (error) {
    console.error('Error fetching admin products list:', error)
    return []
  }
}

export default async function AdminProductsPage() {
  const products = await getProductsList()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="heading-2 text-gray-900 dark:text-white">Products</h2>
          <p className="body-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your store products, inventory, and framing options.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/admin/products/bulk">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="heading-4 mb-2">No Products Yet</h3>
              <p className="body-sm mb-6">
                Start by creating your first product to display on the storefront.
              </p>
              <Link href="/admin/products/new">
                <Button size="sm">Create Product</Button>
              </Link>
            </div>
          ) : (
            <ProductListTable initialProducts={products} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
