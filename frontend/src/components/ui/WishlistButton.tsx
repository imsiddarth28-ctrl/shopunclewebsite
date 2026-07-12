'use client'

import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlist'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  name: string
  price: number
  image: string
  isCustomizable: boolean
  className?: string
}

export function WishlistButton({
  productId,
  name,
  price,
  image,
  isCustomizable,
  className,
}: WishlistButtonProps) {
  const [mounted, setMounted] = useState(false)
  const wishlistItems = useWishlistStore((state) => state.items)
  const addItem = useWishlistStore((state) => state.addItem)
  const removeItem = useWishlistStore((state) => state.removeItem)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isWishlisted = mounted && wishlistItems.some((item) => item.productId === productId)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!mounted) return

    const existing = wishlistItems.find((item) => item.productId === productId)
    if (existing) {
      removeItem(existing.id)
      toast.success(`${name} removed from wishlist.`)
    } else {
      addItem({
        productId,
        name,
        price,
        image: image || '/products/placeholder.jpg',
        type: isCustomizable ? 'PERSONALIZED' : 'STANDARD',
      })
      toast.success(`${name} added to wishlist!`)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "z-10 p-2 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-md border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-red-500 hover:scale-110 transition-all duration-200",
        className
      )}
      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-colors",
          isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-400"
        )}
      />
    </button>
  )
}
