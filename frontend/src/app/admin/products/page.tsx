import Link from 'next/link'
import Image from 'next/image'
import { connectToDatabase } from '@/lib/mongodb'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { Plus, Edit, Trash2, Settings, Package, Sliders } from 'lucide-react'

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
        
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-left bg-gray-50/50 dark:bg-gray-900/30">
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Image</th>
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Product Name</th>
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Category</th>
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Price</th>
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Inventory</th>
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Customizable</th>
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Status</th>
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="p-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
                          <Image
                            src={product.images[0] || '/products/placeholder.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-900 dark:text-white block">
                          {product.name}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {product.id}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {product.categoryName}
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-950 dark:text-white">
                        {formatPrice(product.price)}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {product.stock} in stock
                      </td>
                      <td className="p-4">
                        {product.isCustomizable ? (
                          <Badge variant="info">3D Custom</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Standard</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        {product.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {product.isCustomizable && (
                            <Link href={`/admin/products/${product.id}/frames`} title="Manage Frame Options">
                              <Button variant="outline" size="sm" className="p-1.5 h-auto">
                                <Sliders className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/admin/products/${product.id}/edit`} title="Edit Product">
                            <Button variant="outline" size="sm" className="p-1.5 h-auto">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="p-1.5 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" title="Delete Product">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
