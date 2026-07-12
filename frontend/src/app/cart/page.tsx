'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { 
  Trash2, Plus, Minus, ArrowLeft, 
  ShoppingCart, Gift,
  Truck, Shield, Heart,
  Package, ArrowRight, RotateCcw
} from 'lucide-react'

const shippingCost = 99
const freeShippingThreshold = 999

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getSubtotal, 
    getItemCount,
    getStandardItems,
    getPersonalizedItems,
    clearCart 
  } = useCartStore()

  const subtotal = getSubtotal()
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-12">
          <CardContent className="pt-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Cart is Empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Looks like you haven't added any gifts yet. Start shopping to find the perfect personalized present!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/personalized">
                <Button size="lg" className="w-full sm:w-auto">
                  <Gift className="w-5 h-5 mr-2" />
                  Create Personalized Gift
                </Button>
              </Link>
              <Link href="/frames">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Browse Ready Frames
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const standardItems = getStandardItems()
  const personalizedItems = getPersonalizedItems()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="heading-2 text-gray-900 dark:text-white">Shopping Cart</h1>
          <p className="body text-gray-600 dark:text-gray-400 mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {personalizedItems.length > 0 && (
              <section>
                <h2 className="heading-4 text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-500" />
                  Personalized Items
                  <Badge variant="info" className="ml-2">{personalizedItems.length}</Badge>
                </h2>
                <div className="space-y-4">
                  {personalizedItems.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                      isPersonalized
                    />
                  ))}
                </div>
              </section>
            )}

            {standardItems.length > 0 && (
              <section>
                <h2 className="heading-4 text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-500" />
                  Ready-Made Items
                  <Badge variant="info" className="ml-2">{standardItems.length}</Badge>
                </h2>
                <div className="space-y-4">
                  {standardItems.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </section>
            )}

            <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
              <Link href="/">
                <Button variant="ghost" size="lg">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              {items.length > 1 && (
                <Button variant="destructive" onClick={clearCart} size="lg">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Clear Cart
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="heading-4 text-gray-900 dark:text-white mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal ({getItemCount()} items)</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600 dark:text-green-400">FREE</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
                    {shipping > 0 && subtotal < freeShippingThreshold && (
                      <p className="text-xs text-primary-600 dark:text-primary-400 text-center">
                        Add {formatPrice(freeShippingThreshold - subtotal)} more for FREE shipping!
                      </p>
                    )}
                    <div className="border-t dark:border-gray-700 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Link href="/checkout">
                      <Button className="w-full" size="lg">
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full">
                      <Heart className="w-5 h-5 mr-2" />
                      Save for Later
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t dark:border-gray-700 grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50">
                      <Truck className="w-5 h-5 mx-auto text-primary-600 dark:text-primary-400 mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Free Shipping</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50">
                      <Shield className="w-5 h-5 mx-auto text-primary-600 dark:text-primary-400 mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50">
                      <RotateCcw className="w-5 h-5 mx-auto text-primary-600 dark:text-primary-400 mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Easy Returns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CartItemCardProps {
  item: any
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  isPersonalized?: boolean
}

function CartItemCard({ item, onUpdateQuantity, onRemove, isPersonalized }: CartItemCardProps) {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          {item.previewImage ? (
            <Image
              src={item.previewImage}
              alt={item.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          )}
          {isPersonalized && (
            <div className="absolute top-2 left-2">
              <Badge variant="info" className="text-xs">
                <Gift className="w-3 h-3 mr-1" />
                Custom
              </Badge>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
              {item.frameOptionName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Frame: {item.frameOptionName}</p>
              )}
              {item.size && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Size: {item.size}</p>
              )}
              {item.material && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Material: {item.material}</p>
              )}
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {formatPrice(item.price)}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-xl">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-10 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}