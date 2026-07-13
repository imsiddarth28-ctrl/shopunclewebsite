'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, cn } from '@/lib/utils'
import { Image as ImageIcon, ArrowUpDown, ArrowRight, Heart, Loader2 } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal'
import { motion } from 'framer-motion'
import { useWishlistStore } from '@/store/wishlist'
import { useCartStore } from '@/store/cart'
import { toast } from 'react-hot-toast'

// 8 Premium Designer Frames matching screenshot
const DESIGNER_FRAMES = [
  {
    id: 'angelic-designer-frame',
    name: 'Angelic Designer Frame with Photo',
    price: 449,
    themeId: 't-blossom',
    photoUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=350&auto=format&fit=crop',
    tags: ['floral', 'baby', 'pastel'],
    isCustomizable: true
  },
  {
    id: 'converge-designer-frame',
    name: 'Converge Designer Frame with Photo',
    price: 449,
    themeId: 't-filigree',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=350&auto=format&fit=crop',
    tags: ['abstract', 'modern', 'minimal'],
    isCustomizable: true
  },
  {
    id: 'crystal-line-designer-frame',
    name: 'Crystal Line Designer Frame with Photo',
    price: 449,
    themeId: 't-marigold',
    photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=350&auto=format&fit=crop',
    tags: ['geometric', 'chevron', 'orange'],
    isCustomizable: false
  },
  {
    id: 'whimsical-designer-frame',
    name: 'Whimsical Designer Frame with Photo',
    price: 449,
    themeId: 't-monsoon',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350&auto=format&fit=crop',
    tags: ['gradient', 'pastel', 'playful'],
    isCustomizable: false
  },
  {
    id: 'azure-designer-frame',
    name: 'Azure Designer Frame with Photo',
    price: 449,
    themeId: 't-indigo',
    photoUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=350&auto=format&fit=crop',
    tags: ['gradient', 'teal', 'soothing'],
    isCustomizable: true
  },
  {
    id: 'spring-designer-frame',
    name: 'Spring Designer Frame with Photo',
    price: 449,
    themeId: 't-sage',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=350&auto=format&fit=crop',
    tags: ['botanical', 'green', 'leafy'],
    isCustomizable: false
  },
  {
    id: 'blossom-designer-frame',
    name: 'Blossom Designer Frame with Photo',
    price: 449,
    themeId: 't-kraft',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=350&auto=format&fit=crop',
    tags: ['watercolor', 'vintage', 'floral'],
    isCustomizable: true
  },
  {
    id: 'velvety-designer-frame',
    name: 'Velvety Designer Frame with Photo',
    price: 449,
    themeId: 't-walnut',
    photoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=350&auto=format&fit=crop',
    tags: ['velvet', 'luxury', 'wedding'],
    isCustomizable: false
  }
]

const THEMES = ['t-blossom', 't-marigold', 't-indigo', 't-filigree', 't-walnut', 't-sage', 't-kraft', 't-monsoon']

function FramesListingPageContent() {
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get('filter') as 'all' | 'customizable' | 'ready' || 'all'

  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default')
  const [filter, setFilter] = useState<'all' | 'customizable' | 'ready'>(initialFilter)

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, string>>({})

  const wishlistItems = useWishlistStore((state) => state.items)
  const addItem = useWishlistStore((state) => state.addItem)
  const removeItem = useWishlistStore((state) => state.removeItem)
  const addToCart = useCartStore((state) => state.addItem)

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products?category=photo-frames&limit=100')
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || [])
        }
      } catch (err) {
        console.error('Failed to load frames:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, frameId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be under 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedPhotos(prev => ({
          ...prev,
          [frameId]: event.target!.result as string
        }))
        toast.success('Photo uploaded successfully!')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddToCart = (frame: any, uploadedPhoto?: string) => {
    addToCart({
      productId: frame._id || frame.id,
      name: frame.name,
      price: frame.price,
      quantity: 1,
      image: uploadedPhoto || frame.images?.[0] || frame.photoUrl || '/products/placeholder.jpg',
      previewImage: uploadedPhoto || frame.images?.[0] || frame.photoUrl || '/products/placeholder.jpg',
      type: 'STANDARD',
      customizationData: uploadedPhoto ? { userUploadedPhoto: true } : undefined
    })
    toast.success(`${frame.name} added to cart!`)
  }

  const toggleWishlist = (frame: any) => {
    const frameId = frame._id || frame.id
    const existing = wishlistItems.find((item) => item.productId === frameId)
    if (existing) {
      removeItem(existing.id)
      toast.success(`${frame.name} removed from wishlist.`)
    } else {
      addItem({
        productId: frameId,
        name: frame.name,
        price: frame.price,
        image: frame.images?.[0] || frame.photoUrl || '/products/placeholder.jpg',
        type: frame.isCustomizable ? 'PERSONALIZED' : 'STANDARD',
      })
      toast.success(`${frame.name} added to wishlist!`)
    }
  }

  const displayList = products.length > 0 ? products : DESIGNER_FRAMES

  const filtered = displayList.filter(f =>
    filter === 'all' ? true : filter === 'customizable' ? f.isCustomizable : !f.isCustomizable
  )
  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'price-asc' ? a.price - b.price :
    sortBy === 'price-desc' ? b.price - a.price : 0
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-2" />
        <p className="font-semibold text-slate-600 dark:text-slate-400 text-sm">
          Loading Photo Frames Catalog...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 py-24">
      <style dangerouslySetInnerHTML={{ __html: `
        .catalog-frame-box {
          --cream: #F7F1E6;
          --cream-2: #EFE6D3;
          --white: #FFFDF9;
        }
        .catalog-frame-box .t-blossom {
          background-color: #E9C3CC;
          background-image:
            repeating-radial-gradient(circle at 12px 12px, #F4DEE3 0 3px, transparent 4px 24px),
            repeating-radial-gradient(circle at 0 0, #C97D90 0 2px, transparent 3px 24px);
          background-size: 24px 24px;
        }
        .catalog-frame-box .t-marigold {
          background-color: #EFC26B;
          background-image:
            repeating-linear-gradient(45deg, #E39A3B 0 4px, transparent 4px 18px),
            repeating-linear-gradient(-45deg, #F6DBA0 0 3px, transparent 3px 18px);
          background-size: 18px 18px;
        }
        .catalog-frame-box .t-indigo {
          background-color: #4C5C82;
          background-image:
            repeating-linear-gradient(90deg, #64769E 0 8px, #3D4A69 8px 16px),
            repeating-linear-gradient(0deg, rgba(255,255,255,.08) 0 2px, transparent 2px 16px);
          background-size: 16px 16px;
        }
        .catalog-frame-box .t-filigree {
          background-color: #EDE2C8;
          background-image:
            repeating-radial-gradient(circle at 10px 10px, transparent 0 6px, #C9A25E 7px 8px, transparent 9px 20px);
          background-size: 20px 20px;
        }
        .catalog-frame-box .t-walnut {
          background-color: #6B4530;
          background-image:
            repeating-linear-gradient(95deg, rgba(0,0,0,.15) 0 2px, transparent 2px 10px, rgba(255,255,255,.05) 10px 12px);
          background-size: 12px 100%;
        }
        .catalog-frame-box .t-sage {
          background-color: #D8DEC4;
          background-image:
            repeating-linear-gradient(60deg, #8FA073 0 3px, transparent 3px 22px),
            repeating-linear-gradient(-60deg, #6E7F5C 0 3px, transparent 3px 22px);
          background-size: 22px 22px;
        }
        .catalog-frame-box .t-kraft {
          background-color: #D9C7A4;
          background-image:
            repeating-radial-gradient(circle at 8px 8px, #C2A876 0 2px, transparent 3px 16px);
          background-size: 16px 16px;
        }
        .catalog-frame-box .t-monsoon {
          background-color: #A9C2CE;
          background-image:
            repeating-linear-gradient(115deg, #7FA1B3 0 6px, transparent 6px 26px),
            repeating-linear-gradient(115deg, rgba(255,255,255,.35) 0 2px, transparent 2px 26px);
          background-size: 26px 26px;
        }
      ` }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Badge variant="info" className="mb-3">Premium Collection</Badge>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Premium Photo Frames</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Transform your digital photos into premium physical art with our custom frames.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
              {(['all', 'customizable', 'ready'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === f
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'customizable' ? 'Design' : 'Ready Made'}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-10"
              onClick={() => setSortBy(s => s === 'price-asc' ? 'price-desc' : s === 'price-desc' ? 'default' : 'price-asc')}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {sortBy === 'default' ? 'Sort' : sortBy === 'price-asc' ? 'Price ↑' : 'Price ↓'}
            </Button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto">
            <CardContent>
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="heading-4 mb-2">No Frames Found</h3>
              <p className="body-sm">No frames match your current filter.</p>
            </CardContent>
          </Card>
        ) : (
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.06}>
            {sorted.map((frame, index) => {
              const isWishlisted = wishlistItems.some((item) => item.productId === (frame._id || frame.id))
              const themeId = frame.themeId || THEMES[index % THEMES.length]
              const photoUrl = uploadedPhotos[frame._id || frame.id] || frame.images?.[0] || frame.photoUrl || '/products/placeholder.jpg'
              const hasUploaded = !!uploadedPhotos[frame._id || frame.id]

              return (
                <StaggerItem key={frame._id || frame.id}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <Card className="overflow-hidden flex flex-col h-full border border-slate-150 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900 transition-all duration-300 group shadow-sm hover:shadow-md rounded-3xl relative">
                      <div className="relative aspect-square bg-[#EFE6D3] flex items-center justify-center p-6 catalog-frame-box select-none overflow-hidden">
                        <div
                          className={`w-[160px] aspect-[4/5] rounded shadow-2xl p-4 transition-transform duration-500 group-hover:scale-102 ${themeId}`}
                        >
                          <div className="w-full h-full bg-[#FFFDF9] p-2 rounded-sm shadow-inner flex items-center justify-center">
                            <div className="w-full h-full relative overflow-hidden bg-[#E7E0D2]">
                              <img
                                src={photoUrl}
                                alt={frame.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleWishlist(frame)
                          }}
                          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-slate-100 text-slate-500 hover:text-red-500 hover:scale-110 transition-all duration-200"
                        >
                          <Heart className={cn("w-4 h-4 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-slate-600")} />
                        </button>
                      </div>

                      <CardContent className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {(frame.tags || []).slice(0, 2).map((tag: string) => (
                              <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          {frame.isCustomizable ? (
                            <Link href={`/personalized/${frame._id || frame.id}?theme=${themeId}`}>
                              <h3 className="font-bold text-slate-800 dark:text-white text-sm hover:text-rose-500 transition-colors leading-snug line-clamp-1">
                                {frame.name}
                              </h3>
                            </Link>
                          ) : (
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug line-clamp-1">
                              {frame.name}
                            </h3>
                          )}
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {frame.shortDescription || frame.description}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                              {formatPrice(frame.price)}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {frame.isCustomizable ? (
                              <Link href={`/personalized/${frame._id || frame.id}?theme=${themeId}`}>
                                <Button size="sm" className="h-8 text-xs font-bold gap-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full">
                                  Design
                                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </Button>
                              </Link>
                            ) : (
                              <div className="flex gap-1 items-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id={`upload-${frame._id || frame.id}`}
                                  onChange={(e) => handlePhotoUpload(e, frame._id || frame.id)}
                                />
                                {hasUploaded ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-full"
                                      onClick={() => document.getElementById(`upload-${frame._id || frame.id}`)?.click()}
                                    >
                                      Change
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddToCart(frame, uploadedPhotos[frame._id || frame.id])}
                                      className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-full"
                                    >
                                      Order Now
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => document.getElementById(`upload-${frame._id || frame.id}`)?.click()}
                                    className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-full"
                                  >
                                    Upload & Order
                                  </Button>
                                )}
                              </div>
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

      {/* ── vintage strip promo band ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 mt-12">
        <div className="flex items-center justify-between gap-6 flex-wrap bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl px-8 py-7 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Premium Feature</p>
            <h3 className="font-serif text-xl font-medium mb-1">Try the Vintage Photo Strip</h3>
            <p className="text-gray-300 text-sm">Three photos, one film-booth strip — a premium extra you can order framed.</p>
          </div>
          <Link
            href="/vintage-strip"
            className="shrink-0 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-6 py-3 rounded-full transition-colors text-sm"
          >
            Explore
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function FramesListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    }>
      <FramesListingPageContent />
    </Suspense>
  )
}
