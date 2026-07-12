'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart'
import { toast } from 'react-hot-toast'
import { ShoppingCart } from 'lucide-react'

interface AddToCartButtonProps {
  productId: string
  name: string
  price: number
  image: string
  type?: 'STANDARD' | 'PERSONALIZED'
  size?: string
  material?: string
  className?: string
  buttonSize?: 'sm' | 'md' | 'lg' | 'xl'
}

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  type = 'STANDARD',
  size,
  material,
  className,
  buttonSize = 'sm'
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      productId,
      name,
      price,
      quantity: 1,
      image: image || '/products/placeholder.jpg',
      type,
      size,
      material,
    })

    toast.success(`${name} added to cart!`)
  }

  return (
    <Button 
      size={buttonSize} 
      onClick={handleAddToCart}
      className={className}
    >
      <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
      Add to Cart
    </Button>
  )
}
