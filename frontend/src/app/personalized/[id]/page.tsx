'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Loader2, ArrowLeft, Sparkles, CheckCircle2, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

// Lazy-load the new premium Customizer Studio client-side
const FrameCustomizerStudio = dynamic(
  () => import('@/components/customizer/FrameCustomizerStudio').then((mod) => mod.FrameCustomizerStudio),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-2" />
        <p className="font-semibold text-slate-600 dark:text-slate-400 text-sm">
          Loading Sree Balaji Framing Studio...
        </p>
      </div>
    )
  }
)

// Local designer frame presets matching frames page
const LOCAL_DESIGNER_FRAMES = [
  {
    id: 'angelic-designer-frame',
    name: 'Angelic Designer Frame with Photo',
    price: 449,
    compareAtPrice: 699,
    discount: 35,
    themeId: 't-blossom',
    photoUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=350&auto=format&fit=crop',
    tags: ['floral', 'baby', 'pastel'],
    description: 'A gorgeous, soft pastel pink floral border frame. Perfect for cherishing newborn baby milestones, nursery snapshots, and family portraits.'
  },
  {
    id: 'converge-designer-frame',
    name: 'Converge Designer Frame with Photo',
    price: 449,
    compareAtPrice: 699,
    discount: 35,
    themeId: 't-filigree',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=350&auto=format&fit=crop',
    tags: ['abstract', 'modern', 'minimal'],
    description: 'An elegant, abstract composition framing structure that adds artistic flair to premium landscape and portrait photography.'
  },
  {
    id: 'crystal-line-designer-frame',
    name: 'Crystal Line Designer Frame with Photo',
    price: 449,
    compareAtPrice: 699,
    discount: 35,
    themeId: 't-marigold',
    photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=350&auto=format&fit=crop',
    tags: ['geometric', 'chevron', 'orange'],
    description: 'Warm gold tones with repeating chevron motifs, ideal for nature hikes, beach sunsets, and sunny memories.'
  },
  {
    id: 'whimsical-designer-frame',
    name: 'Whimsical Designer Frame with Photo',
    price: 449,
    compareAtPrice: 699,
    discount: 35,
    themeId: 't-monsoon',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350&auto=format&fit=crop',
    tags: ['gradient', 'pastel', 'playful'],
    description: 'Playful pastel gradients creating a whimsical atmosphere around your travel snaps, holiday selfies, and wedding days.'
  },
  {
    id: 'azure-designer-frame',
    name: 'Azure Designer Frame with Photo',
    price: 449,
    compareAtPrice: 699,
    discount: 35,
    themeId: 't-indigo',
    photoUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=350&auto=format&fit=crop',
    tags: ['gradient', 'teal', 'soothing'],
    description: 'Cool sea gradient themes that bring out the best in coastal photography, wedding shoots, and summer vacations.'
  },
  {
    id: 'spring-designer-frame',
    name: 'Spring Designer Frame with Photo',
    price: 449,
    compareAtPrice: 699,
    discount: 35,
    themeId: 't-sage',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=350&auto=format&fit=crop',
    tags: ['botanical', 'green', 'leafy'],
    description: 'Fresh botanical pattern borders providing a lush spring atmosphere to your memory keepsakes.'
  },
  {
    id: 'blossom-designer-frame',
    name: 'Blossom Designer Frame with Photo',
    price: 449,
    compareAtPrice: 699,
    discount: 35,
    themeId: 't-kraft',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=350&auto=format&fit=crop',
    tags: ['watercolor', 'vintage', 'floral'],
    description: 'Elegant vintage kraft floral design patterns, providing a classic framing context for special anniversaries.'
  },
  {
    id: 'velvety-designer-frame',
    name: 'Velvety Designer Frame with Photo',
    price: 449,
    compareAtPrice: 699,
    discount: 35,
    themeId: 't-walnut',
    photoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=350&auto=format&fit=crop',
    tags: ['velvet', 'luxury', 'wedding'],
    description: 'Rich dark walnut aesthetics coupled with velvet color accents, ideal for wedding galleries and milestone prints.'
  }
]

interface PageProps {
  params: { id: string }
}

export default function DynamicFrameCustomizerPage({ params }: PageProps) {
  const { id } = params
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isCustomizing, setIsCustomizing] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (res.ok) {
          const data = await res.json()
          setProduct(data)
        } else {
          // Fallback to local designer frames
          const matchedLocal = LOCAL_DESIGNER_FRAMES.find(f => f.id === id)
          if (matchedLocal) {
            setProduct({
              _id: matchedLocal.id,
              id: matchedLocal.id,
              name: matchedLocal.name,
              price: matchedLocal.price,
              compareAtPrice: matchedLocal.compareAtPrice,
              discount: matchedLocal.discount,
              description: matchedLocal.description,
              images: [matchedLocal.photoUrl],
              category: { name: 'Photo Frames', slug: 'photo-frames' }
            })
          } else {
            toast.error('Product not found')
          }
        }
      } catch (err) {
        console.error('Error loading product:', err)
        const matchedLocal = LOCAL_DESIGNER_FRAMES.find(f => f.id === id)
        if (matchedLocal) {
          setProduct({
            _id: matchedLocal.id,
            id: matchedLocal.id,
            name: matchedLocal.name,
            price: matchedLocal.price,
            compareAtPrice: matchedLocal.compareAtPrice,
            discount: matchedLocal.discount,
            description: matchedLocal.description,
            images: [matchedLocal.photoUrl],
            category: { name: 'Photo Frames', slug: 'photo-frames' }
          })
        } else {
          toast.error('Failed to load product details')
        }
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-2" />
        <p className="font-semibold text-slate-600 dark:text-slate-450 text-sm">
          Loading Frame Details...
        </p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Frame Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">The product you are trying to view does not exist.</p>
        <Link href="/products">
          <Button>Back to Catalog</Button>
        </Link>
      </div>
    )
  }

  if (isCustomizing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm animate-fadeIn">
          <button
            onClick={() => setIsCustomizing(false)}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Frame Info
          </button>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Sree Balaji Framing Studio
          </span>
        </div>
        <React.Suspense fallback={
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-2" />
            <p className="font-semibold text-slate-600 dark:text-slate-450 text-sm">
              Loading Sree Balaji Framing Studio...
            </p>
          </div>
        }>
          <FrameCustomizerStudio productId={id} />
        </React.Suspense>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products Catalog
          </Link>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-sm">
          
          {/* Left Side: Frame Image Preview */}
          <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-850 relative aspect-square overflow-hidden group">
            <img
              src={product.images?.[0] || '/products/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 bg-primary-600/10 text-primary-600 dark:text-primary-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Customizable Frame
            </div>
          </div>

          {/* Right Side: Information Panel */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Sree Balaji Frames & Gifts
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h1>
              
              {/* Pricing */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-lg text-slate-400 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <span className="text-xs font-bold bg-red-100 text-red-650 px-2 py-0.5 rounded">
                      -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 pt-2">
                {product.description}
              </p>

              {/* Features List */}
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Frame Specifications
                </h4>
                <ul className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-450">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Premium Synthetic Wood
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Sturdy MDF Back Board
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Ultra-Clear Acrylic Cover
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Dual-Orientation Hooks
                  </li>
                </ul>
              </div>

              {/* Safe Shopping Badges */}
              <div className="grid grid-cols-3 gap-3 pt-6 text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-5 h-5 text-slate-400" />
                  <span>Quality Assured</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-5 h-5 text-slate-400" />
                  <span>Safe Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="w-5 h-5 text-slate-400" />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-6">
              <Button
                onClick={() => setIsCustomizing(true)}
                className="w-full py-6 text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary-500/10 hover:shadow-xl hover:shadow-primary-500/20"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                Customize & Create Frame
              </Button>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}