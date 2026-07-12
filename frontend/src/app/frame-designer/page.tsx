'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart'
import toast from 'react-hot-toast'
import { ArrowLeft, Upload, RotateCcw, ShoppingCart, Save, Film } from 'lucide-react'

/* ───────── data ───────── */
const THEMES = [
  { id: 't-blossom',  name: 'Blossom Pink',    desc: 'Soft floral, hand-dotted' },
  { id: 't-marigold', name: 'Marigold',         desc: 'Warm diagonal weave' },
  { id: 't-indigo',   name: 'Indigo Ikat',      desc: 'Bold woven stripes' },
  { id: 't-filigree', name: 'Gold Filigree',    desc: 'Delicate ring motif' },
  { id: 't-walnut',   name: 'Walnut Wood',      desc: 'Natural grain finish' },
  { id: 't-sage',     name: 'Sage Botanical',   desc: 'Crossed leaf pattern' },
  { id: 't-kraft',    name: 'Kraft Lace',       desc: 'Earthy dotted trim' },
  { id: 't-monsoon',  name: 'Monsoon Blue',     desc: 'Watercolor rain streaks' },
]

const SIZES = [
  { label: '4 × 6 in',  short: 4,  long: 6  },
  { label: '5 × 7 in',  short: 5,  long: 7  },
  { label: '8 × 10 in', short: 8,  long: 10 },
  { label: '8 × 12 in', short: 8,  long: 12 },
  { label: '12 × 16 in',short: 12, long: 16 },
  { label: '16 × 20 in',short: 16, long: 20 },
]

/* ───────── price map ───────── */
const PRICE_MAP: Record<string, number> = {
  '4 × 6 in': 299, '5 × 7 in': 399, '8 × 10 in': 549,
  '8 × 12 in': 649, '12 × 16 in': 899, '16 × 20 in': 1199,
}

export default function FrameDesignerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const addToCart = useCartStore((s) => s.addItem)

  const [selectedTheme, setSelectedTheme] = useState(searchParams.get('theme') || 't-blossom')
  const [selectedSize, setSelectedSize] = useState(SIZES[1])
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [matPadding, setMatPadding] = useState(14)
  const [noMat, setNoMat] = useState(false)
  const [photoSrc, setPhotoSrc] = useState<string | null>(
    searchParams.get('strip') ? decodeURIComponent(searchParams.get('strip')!) : null
  )
  const fileRef = useRef<HTMLInputElement>(null)

  /* frame dimensions */
  const frameW = orientation === 'portrait' ? selectedSize.short : selectedSize.long
  const frameH = orientation === 'portrait' ? selectedSize.long  : selectedSize.short
  const frameAspect = `${frameW} / ${frameH}`
  const previewW = orientation === 'portrait' ? 220 : 300

  const effectivePadding = noMat ? 0 : matPadding

  /* photo upload */
  const handleFile = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return }
    const reader = new FileReader()
    reader.onload = (e) => setPhotoSrc(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }, [])

  /* add to cart */
  const handleAddToCart = () => {
    if (!photoSrc) { toast.error('Upload a photo first'); return }
    const theme = THEMES.find(t => t.id === selectedTheme)
    const price = PRICE_MAP[selectedSize.label] || 449
    addToCart({
      productId: `frame-designer-${selectedTheme}-${selectedSize.label}-${orientation}`,
      name: `${theme?.name} Frame · ${selectedSize.label} · ${orientation === 'portrait' ? 'Portrait' : 'Landscape'}`,
      price,
      quantity: 1,
      image: photoSrc,
      type: 'PERSONALIZED',
      previewImage: photoSrc,
      customizationData: { themeId: selectedTheme, size: selectedSize.label, orientation, matPadding: effectivePadding },
    })
    toast.success('Frame added to cart!')
    router.push('/cart')
  }

  /* pass strip image via sessionStorage */
  useEffect(() => {
    const strip = sessionStorage.getItem('vintage-strip-photo')
    if (strip) { setPhotoSrc(strip); sessionStorage.removeItem('vintage-strip-photo'); toast('Vintage strip loaded — pick a size and theme 🎞️') }
  }, [])

  const price = PRICE_MAP[selectedSize.label] || 449

  return (
    <div className="min-h-screen bg-[#F7F1E6] dark:bg-gray-950 pb-32">
      {/* ── header ── */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-2">
        <Link href="/frames" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Gallery
        </Link>
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-600 dark:text-amber-400 mb-1">Frame Designer</p>
        <h1 className="font-serif text-3xl font-medium text-gray-900 dark:text-white mb-1">Design your custom frame</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Pick a size, upload your photo, choose a frame theme — then add to cart.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* ── step 1: size ── */}
        <section>
          <StepHeader num="1" title="Choose a size" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SIZES.map((s) => (
              <button
                key={s.label}
                onClick={() => setSelectedSize(s)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-xs font-medium ${
                  selectedSize.label === s.label
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-rose-300'
                }`}
              >
                {/* size swatch visual */}
                <span
                  className="border-2 border-current opacity-60"
                  style={{ width: 28, height: 28 * (s.long / s.short) < 36 ? 28 * (s.long / s.short) : 36, display: 'block', maxHeight: 36 }}
                />
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── step 2: orientation ── */}
        <section>
          <StepHeader num="2" title="Choose orientation" />
          <div className="flex gap-3">
            {(['portrait', 'landscape'] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOrientation(o)}
                className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl border-2 transition-all text-xs font-medium ${
                  orientation === o
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-rose-300'
                }`}
              >
                <span
                  className="border-2 border-current opacity-60"
                  style={{ width: o === 'portrait' ? 22 : 30, height: o === 'portrait' ? 30 : 22, display: 'block' }}
                />
                {o.charAt(0).toUpperCase() + o.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* ── step 3: photo + live preview ── */}
        <section>
          <StepHeader num="3" title="Upload your photo" />

          {/* live frame preview */}
          <div
            className="flex justify-center items-center py-10 px-6 rounded-2xl mb-5"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.2), transparent 70%), #EFE6D3' }}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div
              className={`${selectedTheme} rounded shadow-2xl transition-all duration-300`}
              style={{ width: previewW, aspectRatio: frameAspect, padding: 26 }}
            >
              <div
                className="w-full h-full bg-white rounded-sm shadow-inner transition-all duration-200 overflow-hidden flex items-center justify-center"
                style={{ padding: effectivePadding }}
              >
                {photoSrc ? (
                  <img src={photoSrc} alt="Preview" className="w-full h-full object-cover block" />
                ) : (
                  <label
                    htmlFor="frameFileInput"
                    className="flex flex-col items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-4 text-center"
                  >
                    <Upload className="w-7 h-7" />
                    <span className="text-xs font-medium">Upload photo</span>
                    <span className="text-[10px] text-gray-400">JPG or PNG</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileRef}
            id="frameFileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          {/* mat controls */}
          <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-900 rounded-xl px-5 py-4 border border-gray-100 dark:border-gray-800">
            {/* no-mat toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="relative inline-block w-10 h-6">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={noMat}
                  onChange={(e) => setNoMat(e.target.checked)}
                />
                <span
                  className={`block w-10 h-6 rounded-full transition-colors ${noMat ? 'bg-rose-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                />
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${noMat ? 'translate-x-4' : ''}`}
                />
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Edge-to-edge <strong className="text-gray-800 dark:text-white">(no mat)</strong></span>
            </label>

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-xs text-gray-500 dark:text-gray-400">Mat width</span>
              <input
                type="range"
                min={0}
                max={30}
                value={matPadding}
                disabled={noMat}
                onChange={(e) => setMatPadding(Number(e.target.value))}
                className="w-28 accent-rose-600 disabled:opacity-40"
              />
              <span className="text-xs font-mono text-gray-500 w-6">{noMat ? '0' : matPadding}</span>
            </div>
          </div>
        </section>

        {/* ── step 4: theme ── */}
        <section>
          <StepHeader num="4" title="Choose a frame theme" />
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                title={t.name}
                onClick={() => setSelectedTheme(t.id)}
                className={`relative rounded-xl border-2 transition-all hover:-translate-y-1 overflow-hidden ${
                  selectedTheme === t.id ? 'border-rose-600 ring-2 ring-rose-300 dark:ring-rose-700' : 'border-transparent'
                }`}
                style={{ aspectRatio: '4/5' }}
              >
                <div className={`w-full h-full ${t.id}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1/2 h-1/2 bg-white/70 rounded-full flex items-center justify-center">
                    <div className="w-1/2 h-1/2 rounded-full bg-gray-300/80" />
                  </div>
                </div>
                <p className="absolute -bottom-5 left-0 right-0 text-center text-[9px] text-gray-500 whitespace-nowrap truncate px-1">{t.name}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 text-xs text-gray-500 dark:text-gray-400 text-center">
            Selected: <strong className="text-gray-800 dark:text-white">{THEMES.find(t => t.id === selectedTheme)?.name}</strong> — {THEMES.find(t => t.id === selectedTheme)?.desc}
          </div>
        </section>

        {/* vintage strip promo */}
        <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl px-6 py-5 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-0.5">Premium Feature</p>
            <h3 className="font-serif text-lg font-medium">Try the Vintage Strip</h3>
            <p className="text-xs text-gray-300 mt-0.5">3 photos → 1 classic film-booth strip you can frame.</p>
          </div>
          <Link href="/vintage-strip" className="shrink-0 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm px-4 py-2.5 rounded-full transition-colors">
            <Film className="w-4 h-4" /> Try it
          </Link>
        </div>
      </div>

      {/* ── sticky action bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedSize.label} · {orientation} · {THEMES.find(t => t.id === selectedTheme)?.name}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">₹{price.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex gap-3">
            {photoSrc && (
              <button
                onClick={() => { fileRef.current?.click() }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-gray-400 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Change photo
              </button>
            )}
            <button
              onClick={handleAddToCart}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-2 mb-4">
      <span className="font-serif text-base text-rose-600 dark:text-amber-400">{num}</span>
      <span className="text-sm font-semibold text-gray-800 dark:text-white">{title}</span>
    </div>
  )
}
