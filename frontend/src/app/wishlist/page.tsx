'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useWishlistStore } from '@/store/wishlist'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { 
  Heart, Trash2, ArrowLeft, ShoppingCart, 
  Sparkles, Gift, Inbox, ArrowRight 
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function WishlistPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const { addItem } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddToCart = (item: any) => {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      type: item.type,
      frameOptionId: item.frameOptionId,
      frameOptionName: item.frameOptionName,
      size: item.size,
      material: item.material,
    })
    toast.success(`${item.name} added to cart!`)
  }

  const handleRemove = (id: string, name: string) => {
    removeItem(id)
    toast.success(`${name} removed from wishlist.`)
  }

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="text-center p-12 shadow-xl border border-gray-100 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                <Heart className="w-10 h-10 text-red-500 fill-red-100 dark:fill-red-950/30" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Wishlist is Empty</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Save your favorite personalized gifts, photo frames, and canvases here to keep track of what you love.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/personalized">
                  <Button size="lg" className="w-full sm:w-auto shadow-md">
                    <Sparkles className="w-4 h-4 mr-2" />
                    3D Custom Studio
                  </Button>
                </Link>
                <Link href="/frames">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse Frames
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/products" className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
              </Link>
            </div>
            <h1 className="heading-2 text-gray-900 dark:text-white flex items-center gap-3">
              My Wishlist
              <Badge variant="info" className="text-sm font-semibold py-1 px-3">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Badge>
            </h1>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              clearWishlist()
              toast.success('Wishlist cleared!')
            }}
            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-950 dark:hover:bg-red-950/20 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Wishlist
          </Button>
        </div>

        {/* Grid List */}
        <motion.div 
          layout 
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <Card className="overflow-hidden flex flex-col h-full border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 relative group">
                  
                  {/* Floating Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id, item.name)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-800 transition-all duration-200"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Product Image */}
                  <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    <Image
                      src={item.image || '/products/placeholder.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-102 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {item.type === 'PERSONALIZED' && (
                      <span className="absolute top-4 left-4 flex items-center gap-1 bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        3D Customizable
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="heading-4 text-gray-900 dark:text-white mb-2 line-clamp-1">{item.name}</h3>
                      
                      {/* Configuration Details (if variant/customized) */}
                      {(item.size || item.material || item.frameOptionName) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.frameOptionName && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                              Frame: {item.frameOptionName}
                            </span>
                          )}
                          {item.size && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                              Size: {item.size}
                            </span>
                          )}
                          {item.material && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                              Mat: {item.material}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom Actions */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-auto gap-4">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(item.price)}
                      </span>
                      
                      <div className="flex gap-2">
                        {item.type === 'PERSONALIZED' ? (
                          <Link href={`/personalized/${item.productId}`}>
                            <Button size="sm" className="gap-1.5 shadow-sm">
                              <Sparkles className="w-3.5 h-3.5" />
                              Personalize
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleAddToCart(item)}
                            className="gap-1.5 shadow-sm"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
