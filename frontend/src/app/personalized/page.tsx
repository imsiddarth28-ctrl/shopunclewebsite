'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { Gift, Sparkles, ArrowRight, Star, Heart, Loader2 } from 'lucide-react'
import { TwistingRibbon } from '@/components/ui/TwistingRibbon'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal'
import { motion } from 'framer-motion'

export default function PersonalizedLandingPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products?customizable=true')
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || [])
        }
      } catch (err) {
        console.error('Failed to fetch customizable products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Loading customizable products...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Banner — full-width 2-column like home page */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent dark:from-primary-900/20 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* ── Left: Text ── */}
            <div className="lg:col-span-7 text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                <Badge className="mb-6 inline-flex bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  3D Personalization Studio
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="heading-1 text-gray-900 dark:text-white mb-6"
              >
                Customize Your{' '}
                <span className="text-primary-600 dark:text-primary-400">Perfect Gift</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mb-8"
              >
                Choose a product, upload your photo, adjust layout and materials &mdash; then see your creation in real-time 3D before ordering.
              </motion.p>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-10"
              >
                {['Real-time 3D Preview', 'Premium Materials', 'Fast Delivery', '100% Satisfaction'].map((feat) => (
                  <span key={feat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-primary-500 fill-primary-500 flex-shrink-0" />
                    {feat}
                  </span>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link href="#products">
                  <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary-500/25">
                    Start Customizing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/frames">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Browse Ready Frames
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* ── Right: 3D Preview Card ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="lg:col-span-5 w-full h-[420px] relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-900/60 dark:to-neutral-800/60 border border-gray-100 dark:border-neutral-800 flex items-center justify-center p-6 group"
            >
              <div className="absolute inset-0 z-0">
                <TwistingRibbon waveAmplitude={0.8} twistCycles={5} className="w-full h-full opacity-90 dark:opacity-80" />
              </div>
              <div className="relative z-10 p-6 bg-white/70 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-white/20 dark:border-neutral-800 shadow-xl max-w-sm text-center transform hover:scale-[1.02] transition-transform duration-500">
                <Sparkles className="w-8 h-8 text-primary-500 mx-auto mb-3 animate-pulse" />
                <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-2">Live 3D Customizer</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Upload your photo and see it rendered in real-time 3D on frames, mugs, canvases and more.
                </p>
                <Link href="#products">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center gap-1 cursor-pointer">
                    Start Creating <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div id="products" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <ScrollReveal className="text-center mb-12">
          <h2 className="heading-3 text-gray-900 dark:text-white mb-3">Pick Your Canvas</h2>
          <p className="body-lg max-w-xl mx-auto">Each product opens our 3D studio — personalize with your photos, text, and style.</p>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.08}>
          {products.map((product) => (
            <StaggerItem key={product._id || product.id}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 180, damping: 20 }}
              >
                <Card className="overflow-hidden flex flex-col h-full border border-gray-200 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-900 transition-colors duration-300 group">
                  <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    <img
                      src={product.images?.[0] || '/products/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {product.isFeatured && (
                      <span className="absolute top-4 left-4 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                        <Heart className="w-3 h-3 fill-white" />
                        Featured
                      </span>
                    )}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(product.tags || []).map((tag: string) => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{product.shortDescription || product.description}</p>
                    </div>

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
                      <Link href={`/personalized/${product._id || product.id}`}>
                        <Button size="sm" className="flex items-center gap-1.5 shadow-sm hover:shadow-md transition-shadow">
                          Customize
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Trust badges */}
        <ScrollReveal delay={0.1} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🎨', title: 'Easy Designer', desc: 'Drag & drop editor' },
            { icon: '📦', title: 'Premium Quality', desc: 'Artisan craftsmanship' },
            { icon: '🚀', title: 'Fast Shipping', desc: '3–5 business days' },
            { icon: '💯', title: 'Guaranteed', desc: 'Or we reprint for free' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-3xl mb-2">{icon}</span>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </div>
  )
}
