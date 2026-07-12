'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'
import { WishlistButton } from '@/components/ui/WishlistButton'
import { AddToCartButton } from '@/components/ui/AddToCartButton'
import {
  Search, SlidersHorizontal, ArrowUpDown, Sparkles,
  ArrowRight, Loader2, Inbox, Grid, List, Check, Gift
} from 'lucide-react'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProductsCatalogPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest')
  
  // Category map for quick lookup
  const [categoryMap, setCategoryMap] = useState<Record<string, { name: string; slug: string }>>({})

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch categories
        const catRes = await fetch('/api/categories')
        let cats: any[] = []
        let catLookup: Record<string, any> = {}
        if (catRes.ok) {
          const catData = await catRes.json()
          cats = catData.categories || []
          setCategories(cats)
          
          catLookup = cats.reduce((acc, c) => {
            acc[c._id || c.id] = { name: c.name, slug: c.slug }
            return acc;
          }, {} as Record<string, any>)
          setCategoryMap(catLookup)
        }

        // Fetch products (limit=100 to get the full catalog for client-side filtering)
        const prodRes = await fetch('/api/products?limit=100')
        if (prodRes.ok) {
          const prodData = await prodRes.json()
          setProducts(prodData.products || [])
        }
      } catch (err) {
        console.error('Failed to load catalog data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Helper to determine if a product belongs to the Photo Frames category
  const isPhotoFrame = (product: any) => {
    const catInfo = categoryMap[product.categoryId]
    return catInfo?.slug === 'photo-frames'
  }

  // Filter products client-side
  const filteredProducts = products
    .filter((product) => {
      // 1. Search Query filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      // 2. Category filter
      const catInfo = categoryMap[product.categoryId]
      const matchesCategory = selectedCategory === 'all' || catInfo?.slug === selectedCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      // 3. Sorting
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'popular') return (b.orderCount || 0) - (a.orderCount || 0)
      
      // Default: Newest / createdAt
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Loading our beautiful catalog...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="info" className="mb-4">Complete Collection</Badge>
          <h1 className="heading-1 text-gray-900 dark:text-white mb-4">
            Explore All Products
          </h1>
          <p className="body-lg text-gray-600 dark:text-gray-400">
            Browse our curated selection of premium gifts and custom photo frames. 
            Only photo frames are personalizable in our 3D framing studio.
          </p>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm mb-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, materials, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
              />
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Popularity</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="border-t border-gray-100 dark:border-gray-850 pt-4">
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider mb-3">
              Categories
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id || cat._id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="p-16 text-center max-w-md mx-auto rounded-3xl border border-gray-200 dark:border-gray-800">
            <CardContent>
              <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Products Found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Try adjusting your search keywords or switching categories.
              </p>
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}>
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.06}>
            {filteredProducts.map((product) => {
              const customizable = isPhotoFrame(product)
              
              return (
                <StaggerItem key={product._id || product.id}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                  >
                    <Card className="overflow-hidden flex flex-col h-full border border-gray-200 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-900 transition-all duration-300 group shadow-sm hover:shadow-md rounded-3xl">
                      {/* Image Frame */}
                      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-950 overflow-hidden">
                        <img
                          src={product.images?.[0] || '/products/placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Floating Wishlist Heart */}
                        <WishlistButton
                          productId={product._id || product.id}
                          name={product.name}
                          price={product.price}
                          image={product.images?.[0]}
                          isCustomizable={customizable}
                          className="absolute top-4 right-4"
                        />

                        {/* Banner badges */}
                        {customizable ? (
                          <span className="absolute top-4 left-4 flex items-center gap-1 bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" />
                            3D Customize
                          </span>
                        ) : (
                          <span className="absolute top-4 left-4 flex items-center gap-1 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10">
                            <Gift className="w-3.5 h-3.5" />
                            Personalize
                          </span>
                        )}
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="absolute bottom-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow z-10">
                            -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>

                      {/* Content details */}
                      <CardContent className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {(product.tags || []).slice(0, 3).map((tag: string) => (
                              <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
                            {product.shortDescription || product.description}
                          </p>
                        </div>

                        {/* Pricing and CTA */}
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
                            {customizable ? (
                              <Link href={`/personalized/${product._id || product.id}`}>
                                <Button size="sm" className="flex items-center gap-1.5 shadow-sm hover:shadow-md transition-shadow">
                                  Customize
                                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Button>
                              </Link>
                            ) : (
                              <Link href={`/personalize/${product._id || product.id}`}>
                                <Button size="sm" variant="outline" className="flex items-center gap-1.5 shadow-sm hover:shadow-md transition-shadow">
                                  Personalize
                                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  )
}
