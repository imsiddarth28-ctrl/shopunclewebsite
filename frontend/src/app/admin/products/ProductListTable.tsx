'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { Edit, Trash2, Sliders, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProductListTableProps {
  initialProducts: any[]
}

export function ProductListTable({ initialProducts }: ProductListTableProps) {
  const [products, setProducts] = useState(initialProducts)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    
    setDeletingId(id)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        throw new Error('Failed to delete product')
      }
      
      setProducts(products.filter(p => p.id !== id))
      toast.success('Product deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  return (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Delete Product"
                    disabled={deletingId === product.id}
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    {deletingId === product.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
