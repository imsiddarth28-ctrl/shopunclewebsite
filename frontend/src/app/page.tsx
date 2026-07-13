'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import {
  ArrowRight, Sparkles, Truck, Shield, Star, Heart, Zap,
  Palette, Gift, Image as ImageIcon, MousePointerClick
} from 'lucide-react'
import { TwistingRibbon } from '@/components/ui/TwistingRibbon'
import ExpandableBentoGrid from '@/components/ui/ExpandableBentoGrid'
import { ImageScatter } from '@/components/ui/ImageScatter'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const bentoFeatures = [
  {
    id: 1,
    title: '3D Live Preview',
    subtitle: 'See in real-time 3D',
    description: 'See your personalized gift in real-time 3D before ordering',
    icon: <Sparkles className="w-7 h-7" />,
    className: 'lg:col-span-1',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Our state-of-the-art 3D renderer lets you preview your custom frames and prints from any angle. Rotate, zoom, and inspect every detail before placing your order.
        </p>
        <div className="p-3 bg-primary-50 dark:bg-primary-950/30 rounded-xl border border-primary-100 dark:border-primary-900/30">
          <h4 className="font-semibold text-xs text-primary-800 dark:text-primary-300 mb-1">Key Advantages:</h4>
          <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            <li>Interactive 360-degree rotation & multi-angle inspect</li>
            <li>Ultra-realistic texture mapping (wood grains, canvas weave)</li>
            <li>Accurate lighting shadows for real-world sizing feel</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: 'Photo Customization',
    subtitle: 'Edit and crop online',
    description: 'Upload, crop, rotate, and position your photos with precision',
    icon: <ImageIcon className="w-7 h-7" />,
    className: 'lg:col-span-1',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Easy-to-use photo editor built directly into our site. Drag, pinch, scale, or apply filters to make sure your photos fit perfectly and look professional.
        </p>
        <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-xl border border-pink-100 dark:border-pink-900/20">
          <h4 className="font-semibold text-xs text-pink-800 dark:text-pink-300 mb-1">Key Advantages:</h4>
          <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            <li>Drag-and-drop instant high-resolution uploads</li>
            <li>Crop to exact frame ratios and canvas edges automatically</li>
            <li>Smart contrast, brightness, and color enhancement filters</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'Multiple Materials',
    subtitle: 'Wood, acrylic, metal',
    description: 'Choose from wood, metal, acrylic, and premium finishes',
    icon: <Palette className="w-7 h-7" />,
    className: 'lg:col-span-1',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          We source only high-quality materials for our personalized items, ensuring they stand the test of time and remain vibrant for decades.
        </p>
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/20">
          <h4 className="font-semibold text-xs text-amber-800 dark:text-amber-300 mb-1">Available Finishes:</h4>
          <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            <li>Premium polished Birchwood & classic dark Oak</li>
            <li>Glass-like shatterproof Acrylic for sleek modern looks</li>
            <li>Subtle textured Cotton Canvas with protective varnish</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'Ready-to-Gift',
    subtitle: 'Premium packaging',
    description: 'Beautiful packaging with personalized message cards',
    icon: <Gift className="w-7 h-7" />,
    className: 'lg:col-span-1',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Sending a gift directly? We've got you covered with elegant gift-wrapping options and handwritten greeting cards to make your gift extra special.
        </p>
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/20">
          <h4 className="font-semibold text-xs text-green-800 dark:text-green-300 mb-1">Gifting Options:</h4>
          <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            <li>Satin ribbon gift wraps with bubble corner protection</li>
            <li>Custom personalized greeting notes inside the package</li>
            <li>Zero-price invoice shipping option for direct-to-recipient deliveries</li>
          </ul>
        </div>
      </div>
    )
  }
]

const scatterData = [
  {
    heading: "Elegant Custom Photo Frames",
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544207240-8b1025eb7a6c?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    heading: "Vibrant Cotton Canvas Prints",
    images: [
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=600&auto=format&fit=crop"
    ]
  },
  {
    heading: "Memorable Keepsakes & Gifts",
    images: [
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=600&auto=format&fit=crop"
    ]
  }
]

const categories = [
  { name: 'Photo Frames', slug: 'frames', count: 150, icon: '🖼️', bg: 'from-blue-400 to-indigo-600', featured: true },
  { name: 'Custom Mugs', slug: 'mugs', count: 80, icon: '☕', bg: 'from-orange-400 to-rose-500' },
  { name: 'Canvas Prints', slug: 'canvas', count: 60, icon: '🎨', bg: 'from-purple-400 to-violet-600' },
  { name: 'Photo Books', slug: 'photobooks', count: 45, icon: '📚', bg: 'from-indigo-400 to-blue-600' },
  { name: 'Keychains', slug: 'keychains', count: 120, icon: '🔑', bg: 'from-yellow-400 to-orange-500' },
  { name: 'Cushions', slug: 'cushions', count: 40, icon: '🛋️', bg: 'from-rose-400 to-pink-600' },
  { name: 'Wall Clocks', slug: 'clocks', count: 35, icon: '🕐', bg: 'from-teal-400 to-emerald-600' },
  { name: 'Phone Cases', slug: 'cases', count: 90, icon: '📱', bg: 'from-pink-400 to-rose-600' },
]

const stats = [
  { value: 50000, suffix: 'K+', label: 'Happy Customers', display: '50K+' },
  { value: 100000, suffix: 'K+', label: 'Orders Delivered', display: '100K+' },
  { value: 4.9, suffix: '/5', label: 'Average Rating', display: '4.9/5' },
  { value: 3, suffix: '-5 Days', label: 'Avg. Delivery', display: '3-5 Days' },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The 3D preview was amazing! I could see exactly how my photo would look in the frame before ordering. Quality is exceptional.',
    initials: 'PS',
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Rahul Patel',
    location: 'Delhi',
    rating: 5,
    text: 'Ordered a custom canvas for my parents anniversary. The colors were vibrant and delivery was faster than expected. Highly recommended!',
    initials: 'RP',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Anita Desai',
    location: 'Bangalore',
    rating: 5,
    text: 'The personalization options are incredible. I made a photo book for my daughter and the quality of printing is professional grade.',
    initials: 'AD',
    color: 'from-rose-500 to-pink-600',
  },
]

// Animated stat counter
function AnimatedStat({ value, label, display }: { value: number; label: string; display: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center group"
    >
      <div className="text-4xl sm:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2 tabular-nums">
        {display}
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm">{label}</div>
    </motion.div>
  )
}

const howItWorks = [
  {
    step: '01',
    title: 'Choose Your Product',
    description: 'Browse our collection of frames, mugs, canvases, and more. Select the perfect base for your creation.',
    icon: MousePointerClick,
  },
  {
    step: '02',
    title: 'Personalize It',
    description: 'Upload your photos, add text, choose layouts, and see a live 3D preview of your customized gift.',
    icon: ImageIcon,
  },
  {
    step: '03',
    title: 'Order & Relax',
    description: "Place your order securely. We'll craft it with care and deliver it beautifully packaged to your door.",
    icon: Gift,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent dark:from-primary-900/20 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column */}
            <div className="lg:col-span-7 text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Badge variant="success" className="mb-6 inline-flex">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                  Free Shipping on orders above ₹999
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="heading-1 text-gray-900 dark:text-white mb-6"
              >
                Create <span className="text-gradient">Memories</span> That Last Forever
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="body-lg mb-8"
              >
                Transform your favorite photos into stunning personalized gifts. From elegant frames to custom mugs,
                canvas prints, and more — all crafted with premium quality and delivered to your doorstep.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-start"
              >
                <Link href="/frames?filter=customizable">
                  <Button size="xl" className="w-full sm:w-auto shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-shadow duration-300">
                    Start Personalizing
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/frames?filter=ready">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-300">
                    Browse Ready Frames
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.55 }}
                className="mt-12 flex flex-wrap items-center gap-6"
              >
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <Shield className="w-5 h-5 text-primary-500" />
                  <span>100% Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <Truck className="w-5 h-5 text-primary-500" />
                  <span>Free Shipping ₹999+</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <Star className="w-5 h-5 text-primary-500 fill-current" />
                  <span>4.9/5 Rating</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Ribbon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="lg:col-span-5 w-full h-[400px] relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-900/60 dark:to-neutral-800/60 border border-gray-100 dark:border-neutral-800 flex items-center justify-center p-6 group"
            >
              <div className="absolute inset-0 z-0">
                <TwistingRibbon waveAmplitude={0.8} twistCycles={5} className="w-full h-full opacity-90 dark:opacity-80" />
              </div>
              <div className="relative z-10 p-6 bg-white/70 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-white/20 dark:border-neutral-800 shadow-xl max-w-sm text-center transform hover:scale-[1.02] transition-transform duration-500">
                <Sparkles className="w-8 h-8 text-primary-500 mx-auto mb-3 animate-pulse" />
                <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-2">Live Customizer Inside</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Select your product, upload your picture, and preview in real-time 3D with our customized canvas weaver technology.
                </p>
                <Link href="/frames?filter=customizable">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center gap-1 cursor-pointer group">
                    Try Live Preview Now <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="info" className="mb-4">Why Choose Sree Balaji</Badge>
            <h2 className="heading-2 text-gray-900 dark:text-white mb-4">Crafted with Love, Delivered with Care</h2>
            <p className="body-lg">Every piece is made to order in our Hyderabad workshop with premium materials and attention to detail.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <ExpandableBentoGrid items={bentoFeatures} />
          </ScrollReveal>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <ScrollReveal>
              <Badge variant="info" className="mb-4">Shop by Category</Badge>
              <h2 className="heading-2 text-gray-900 dark:text-white">Find Your Perfect Gift</h2>
            </ScrollReveal>
            <ScrollReveal direction="left">
              <Link href="/categories" className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1 group">
                View All Categories <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </ScrollReveal>
          </div>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4" staggerDelay={0.06}>
            {categories.map((category, i) => (
              <StaggerItem key={category.slug} className={category.featured ? 'lg:col-span-2 lg:row-span-2' : ''}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden block h-full"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.bg} opacity-90 group-hover:opacity-100 transition-opacity duration-400`} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center"
                  >
                    <span className={`${category.featured ? 'text-5xl mb-3' : 'text-3xl mb-2'}`}>{category.icon}</span>
                    <h3 className={`text-white font-semibold ${category.featured ? 'text-xl' : 'text-sm'} leading-tight`}>
                      {category.name}
                    </h3>
                    <p className="text-white/75 text-xs mt-1">{category.count} products</p>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="info" className="mb-4">How It Works</Badge>
            <h2 className="heading-2 text-gray-900 dark:text-white mb-4">Create Your Custom Gift in 3 Easy Steps</h2>
            <p className="body-lg">Our intuitive customization process makes it simple to create something truly unique.</p>
          </ScrollReveal>
          <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.12}>
            {howItWorks.map((step) => (
              <StaggerItem key={step.step}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                >
                  <Card className="relative card-hover h-full overflow-visible">
                    <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xl shadow-sm z-10">
                      {step.step}
                    </div>
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6 mx-auto">
                        <step.icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="heading-4 text-center text-gray-900 dark:text-white mb-3">{step.title}</h3>
                      <p className="body text-center">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Gallery Showcase */}
      <section className="section bg-gray-50 dark:bg-gray-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="info" className="mb-4">Gallery of Memories</Badge>
            <h2 className="heading-2 text-gray-900 dark:text-white mb-4">Inspiration For Your Next Creation</h2>
            <p className="body-lg">Take a look at how other customers have styled their custom canvas prints and frame designs.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <ImageScatter data={scatterData} className="shadow-lg border border-gray-200 dark:border-gray-800" />
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="info" className="mb-4">Customer Stories</Badge>
            <h2 className="heading-2 text-gray-900 dark:text-white mb-4">Loved by 50,000+ Customers</h2>
            <p className="body-lg">Real stories from people who created unforgettable memories with Sree Balaji.</p>
          </ScrollReveal>
          <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
            {testimonials.map((testimonial) => (
              <StaggerItem key={testimonial.name}>
                <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 150, damping: 20 }}>
                  <Card className="card-hover h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="body mb-6 italic flex-1">"{testimonial.text}"</p>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                          {testimonial.initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{testimonial.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-500/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-10">
          {/* Decorative dots pattern */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative text-center">
          <ScrollReveal>
            <h2 className="heading-2 text-white mb-6">Ready to Create Something Special?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of happy customers who trust Sree Balaji for their personalized gifting needs.
              Start creating your masterpiece today.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/frames?filter=customizable">
              <Button size="xl" variant="secondary" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
                Start Personalizing Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/frames?filter=ready">
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 transition-colors duration-300">
                Browse Ready Frames
              </Button>
            </Link>
          </ScrollReveal>
          <ScrollReveal delay={0.2} className="mt-12 flex flex-wrap items-center justify-center gap-8 text-primary-100">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-current" />
              <span>Made with Love</span>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}