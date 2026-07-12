'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'
import { Loader2, Gift, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

import { compressImage } from '@/lib/utils'

/* ---- sizes ---- */
const SIZES = [
  { label: '4 x 6 in', short: 4, long: 6 },
  { label: '5 x 7 in', short: 5, long: 7 },
  { label: '8 x 10 in', short: 8, long: 10 },
  { label: '8 x 12 in', short: 8, long: 12 },
  { label: '12 x 16 in', short: 12, long: 16 },
  { label: '16 x 20 in', short: 16, long: 20 },
]

/* ---- themes ---- */
const THEMES = [
  { id: 't-blossom', name: 'Blossom pink' },
  { id: 't-marigold', name: 'Marigold' },
  { id: 't-indigo', name: 'Indigo ikat' },
  { id: 't-filigree', name: 'Gold filigree' },
  { id: 't-walnut', name: 'Walnut wood' },
  { id: 't-sage', name: 'Sage botanical' },
  { id: 't-kraft', name: 'Kraft lace' },
  { id: 't-monsoon', name: 'Monsoon blue' },
]

export function FrameCustomizerStudio({ productId }: { productId?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const addToCart = useCartStore((state) => state.addItem)

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPersonalizeOnly, setIsPersonalizeOnly] = useState(false)

  // Customizer state
  const [currentSize, setCurrentSize] = useState(SIZES[1])
  const [currentOrientation, setCurrentOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [noMat, setNoMat] = useState(false)
  const [matWidth, setMatWidth] = useState(14)
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [isAdding, setIsAdding] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync selectedTheme from URL themeParam
  useEffect(() => {
    const themeParam = searchParams.get('theme')
    if (themeParam) {
      const foundTheme = THEMES.find((t) => t.id === themeParam)
      if (foundTheme) {
        setSelectedTheme(foundTheme)
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (!productId) {
      setProduct({
        id: 'custom-frame',
        _id: 'custom-frame',
        name: 'Custom Designed Photo Frame',
        price: 999,
        images: ['/products/placeholder.jpg'],
        description: 'Your custom framed memories'
      })
      setLoading(false)
      return
    }
    const id = productId
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.category && data.category.slug !== 'photo-frames') {
            setIsPersonalizeOnly(true)
          }
          setProduct(data)
        } else {
          if (id.endsWith('-designer-frame')) {
            const formattedName = id
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
            setProduct({
              _id: id,
              id: id,
              name: formattedName,
              price: 449,
              compareAtPrice: 699,
              images: ['/products/placeholder.jpg'],
              description: 'Custom premium designed photo frame',
              category: { name: 'Photo Frames', slug: 'photo-frames' }
            })
          } else {
            toast.error('Failed to load product details')
          }
        }
      } catch (e) {
        console.error('Failed to load product details:', e)
        if (id.endsWith('-designer-frame')) {
          const formattedName = id
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          setProduct({
            _id: id,
            id: id,
            name: formattedName,
            price: 449,
            compareAtPrice: 699,
            images: ['/products/placeholder.jpg'],
            description: 'Custom premium designed photo frame',
            category: { name: 'Photo Frames', slug: 'photo-frames' }
          })
        } else {
          toast.error('Error loading product details')
        }
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [productId])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setUserPhoto(ev.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddToCart = async () => {
    if (!userPhoto) {
      toast.error('Please upload a photo first!')
      return
    }
    setIsAdding(true)
    try {
      const compressedPhoto = await compressImage(userPhoto)
      addToCart({
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '/products/placeholder.jpg',
        previewImage: compressedPhoto,
        type: 'PERSONALIZED',
        quantity: 1,
        customizationData: {
          size: currentSize.label,
          orientation: currentOrientation,
          theme: selectedTheme.name,
          matWidth: noMat ? '0px' : `${matWidth}px`,
        }
      })
      toast.success(`${product.name} customized and added to cart!`)
      router.push('/cart')
    } catch (e) {
      console.error(e)
      toast.error('Failed to add custom frame to cart')
    } finally {
      setIsAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Loading Sree Balaji Frame Studio...</p>
      </div>
    )
  }

  if (isPersonalizeOnly && product) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Customization Unavailable</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The item "{product.name}" is a personalized gift and cannot be configured in the Frame Studio. Please use the Personalization Studio instead.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Link href={`/personalize/${product._id || product.id}`}>
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20">
                Go to Personalization Studio
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calculate dynamic dimensions for preview block
  const w = currentOrientation === 'portrait' ? currentSize.short : currentSize.long
  const h = currentOrientation === 'portrait' ? currentSize.long : currentSize.short

  return (
    <div className="frame-designer-scoped">
      {/* Scope Styling Block */}
      <style dangerouslySetInnerHTML={{ __html: `
        .frame-designer-scoped {
          --cream: #F7F1E6;
          --cream-2: #EFE6D3;
          --ink: #382A26;
          --ink-soft: #6B5A52;
          --mauve: #AD5F73;
          --mauve-dark: #7C3F4F;
          --gold: #B9904F;
          --sage: #6E7F5C;
          --line: #DFD3BE;
          --white: #FFFDF9;
        }
        .frame-designer-scoped .app-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 24px 130px;
          color: var(--ink);
        }
        .frame-designer-scoped .eyebrow {
          font-size: 12px;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--mauve-dark);
          font-weight: 600;
          margin: 0 0 6px;
        }
        .frame-designer-scoped h1 {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-size: 32px;
          margin: 0 0 6px;
          letter-spacing: -.01em;
        }
        .frame-designer-scoped .sub {
          color: var(--ink-soft);
          font-size: 15px;
          margin: 0 0 28px;
        }
        .frame-designer-scoped .step {
          margin-bottom: 28px;
        }
        .frame-designer-scoped .step-head {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 14px;
        }
        .frame-designer-scoped .step-num {
          font-family: 'Fraunces', serif;
          font-size: 15px;
          color: var(--mauve-dark);
        }
        .frame-designer-scoped .step-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }
        .frame-designer-scoped .size-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
          gap: 10px;
        }
        .frame-designer-scoped .size-opt {
          border: 1.5px solid var(--line);
          background: var(--white);
          border-radius: 10px;
          padding: 12px 8px 10px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: border-color .15s ease, background .15s ease;
        }
        .frame-designer-scoped .size-opt:hover { border-color: var(--mauve); }
        .frame-designer-scoped .size-opt.active { border-color: var(--mauve-dark); background: #F7ECEF; }
        .frame-designer-scoped .size-swatch {
          width: 34px;
          height: 34px;
          border: 1.5px solid var(--ink-soft);
          background: transparent;
        }
        .frame-designer-scoped .size-label {
          font-size: 12.5px;
          font-weight: 500;
        }
        .frame-designer-scoped .size-sub {
          font-size: 10.5px;
          color: var(--ink-soft);
        }
        .frame-designer-scoped .orient-row {
          display: flex;
          gap: 10px;
        }
        .frame-designer-scoped .orient-opt {
          flex: 1;
          max-width: 160px;
          border: 1.5px solid var(--line);
          background: var(--white);
          border-radius: 10px;
          padding: 14px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: border-color .15s ease, background .15s ease;
        }
        .frame-designer-scoped .orient-opt:hover { border-color: var(--mauve); }
        .frame-designer-scoped .orient-opt.active { border-color: var(--mauve-dark); background: #F7ECEF; }
        .frame-designer-scoped .orient-icon {
          border: 1.5px solid var(--ink-soft);
        }
        .frame-designer-scoped .orient-opt[data-o="portrait"] .orient-icon { width: 22px; height: 30px; }
        .frame-designer-scoped .orient-opt[data-o="landscape"] .orient-icon { width: 30px; height: 22px; }
        .frame-designer-scoped .orient-label { font-size: 12.5px; font-weight: 500; }
        .frame-designer-scoped .stage {
          display: flex;
          justify-content: center;
          padding: 36px 20px;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.5), transparent 60%),
            var(--cream-2);
          border-radius: 20px;
          margin-bottom: 14px;
          position: relative;
        }
        .frame-designer-scoped .frame-outer {
          box-shadow: 0 18px 40px -18px rgba(56,42,38,.45), 0 2px 6px rgba(56,42,38,.15);
          border-radius: 4px;
          transition: background .25s ease, aspect-ratio .2s ease, width .2s ease;
        }
        .frame-designer-scoped .frame-mat {
          width: 100%;
          height: 100%;
          background: var(--white);
          border-radius: 2px;
          box-shadow: inset 0 0 0 1px rgba(56,42,38,.08);
          transition: padding .18s ease;
        }
        .frame-designer-scoped .photo-slot {
          width: 100%;
          height: 100%;
          background: #E7E0D2;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .frame-designer-scoped .photo-slot img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .frame-designer-scoped .upload-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--ink-soft);
          font-size: 12.5px;
          text-align: center;
          padding: 16px;
        }
        .frame-designer-scoped .upload-cta svg { width: 26px; height: 26px; stroke: var(--ink-soft); }
        .frame-designer-scoped .upload-cta span { font-weight: 500; }
        .frame-designer-scoped .gap-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .frame-designer-scoped .switch {
          position: relative;
          width: 40px;
          height: 23px;
          flex-shrink: 0;
        }
        .frame-designer-scoped .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
        .frame-designer-scoped .switch-track {
          position: absolute; inset: 0;
          background: var(--line);
          border-radius: 999px;
          transition: background .15s ease;
          cursor: pointer;
        }
        .frame-designer-scoped .switch-track:before {
          content: '';
          position: absolute;
          width: 17px; height: 17px;
          left: 3px; top: 3px;
          background: var(--white);
          border-radius: 50%;
          transition: transform .15s ease;
        }
        .frame-designer-scoped .switch input:checked + .switch-track { background: var(--mauve-dark); }
        .frame-designer-scoped .switch input:checked + .switch-track:before { transform: translateX(17px); }
        .frame-designer-scoped .gap-label { font-size: 13px; color: var(--ink-soft); }
        .frame-designer-scoped .gap-label b { color: var(--ink); font-weight: 600; }
        .frame-designer-scoped #matSlider { width: 140px; }
        .frame-designer-scoped #matSlider:disabled { opacity: .4; }
        .frame-designer-scoped .swatches {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 10px;
        }
        @media (max-width: 640px) {
          .frame-designer-scoped .size-grid { grid-template-columns: repeat(4, 1fr); }
          .frame-designer-scoped .swatches { grid-template-columns: repeat(4, 1fr); }
        }
        .frame-designer-scoped .swatch {
          aspect-ratio: 4/5;
          border-radius: 8px;
          padding: 6px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color .15s ease, transform .1s ease;
          position: relative;
        }
        .frame-designer-scoped .swatch:hover { transform: translateY(-2px); }
        .frame-designer-scoped .swatch.active { border-color: var(--mauve-dark); }
        .frame-designer-scoped .swatch-inner {
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,.75);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .frame-designer-scoped .swatch-inner .dot {
          width: 55%;
          height: 55%;
          border-radius: 50%;
          background: #C7B8AC;
        }
        .frame-designer-scoped .swatch-name {
          position: absolute;
          bottom: -20px;
          left: 0; right: 0;
          text-align: center;
          font-size: 10.5px;
          color: var(--ink-soft);
          white-space: nowrap;
        }
        .frame-designer-scoped .t-blossom {
          background-color: #E9C3CC;
          background-image:
            repeating-radial-gradient(circle at 12px 12px, #F4DEE3 0 3px, transparent 4px 24px),
            repeating-radial-gradient(circle at 0 0, #C97D90 0 2px, transparent 3px 24px);
          background-size: 24px 24px;
        }
        .frame-designer-scoped .t-marigold {
          background-color: #EFC26B;
          background-image:
            repeating-linear-gradient(45deg, #E39A3B 0 4px, transparent 4px 18px),
            repeating-linear-gradient(-45deg, #F6DBA0 0 3px, transparent 3px 18px);
          background-size: 18px 18px;
        }
        .frame-designer-scoped .t-indigo {
          background-color: #4C5C82;
          background-image:
            repeating-linear-gradient(90deg, #64769E 0 8px, #3D4A69 8px 16px),
            repeating-linear-gradient(0deg, rgba(255,255,255,.08) 0 2px, transparent 2px 16px);
          background-size: 16px 16px;
        }
        .frame-designer-scoped .t-filigree {
          background-color: #EDE2C8;
          background-image:
            repeating-radial-gradient(circle at 10px 10px, transparent 0 6px, #C9A25E 7px 8px, transparent 9px 20px);
          background-size: 20px 20px;
        }
        .frame-designer-scoped .t-walnut {
          background-color: #6B4530;
          background-image:
            repeating-linear-gradient(95deg, rgba(0,0,0,.15) 0 2px, transparent 2px 10px, rgba(255,255,255,.05) 10px 12px);
          background-size: 12px 100%;
        }
        .frame-designer-scoped .t-sage {
          background-color: #D8DEC4;
          background-image:
            repeating-linear-gradient(60deg, #8FA073 0 3px, transparent 3px 22px),
            repeating-linear-gradient(-60deg, #6E7F5C 0 3px, transparent 3px 22px);
          background-size: 22px 22px;
        }
        .frame-designer-scoped .t-kraft {
          background-color: #D9C7A4;
          background-image:
            repeating-radial-gradient(circle at 8px 8px, #C2A876 0 2px, transparent 3px 16px);
          background-size: 16px 16px;
        }
        .frame-designer-scoped .t-monsoon {
          background-color: #A9C2CE;
          background-image:
            repeating-linear-gradient(115deg, #7FA1B3 0 6px, transparent 6px 26px),
            repeating-linear-gradient(115deg, rgba(255,255,255,.35) 0 2px, transparent 2px 26px);
          background-size: 26px 26px;
        }
        .frame-designer-scoped .actionbar {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          background: var(--white);
          border-top: 1px solid var(--line);
          padding: 14px 24px;
          display: flex;
          justify-content: center;
          gap: 12px;
          z-index: 50;
        }
        .frame-designer-scoped .actionbar-inner {
          width: 100%;
          max-width: 960px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .frame-designer-scoped button {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          padding: 11px 20px;
          border-radius: 999px;
          border: 1.5px solid var(--mauve-dark);
          background: transparent;
          color: var(--mauve-dark);
          cursor: pointer;
          transition: background .15s ease, color .15s ease;
        }
        .frame-designer-scoped button:hover { background: rgba(124,63,79,.08); }
        .frame-designer-scoped button.primary {
          background: var(--mauve-dark);
          color: var(--white);
        }
        .frame-designer-scoped button.primary:hover { background: #652F3D; }
      ` }} />

      <div className="app-container">
        <p className="eyebrow">Frame designer</p>
        <h1>Design your custom frame</h1>
        <p className="sub">Pick a size and orientation, upload your photo, then choose a frame theme.</p>

        {/* Step 1: Sizes */}
        <div className="step">
          <div className="step-head">
            <span className="step-num">1</span>
            <span className="step-title">Choose a size</span>
          </div>
          <div className="size-grid">
            {SIZES.map((size) => {
              const isActive = currentSize.label === size.label
              return (
                <div
                  key={size.label}
                  onClick={() => setCurrentSize(size)}
                  className={`size-opt ${isActive ? 'active' : ''}`}
                >
                  <div className="size-swatch" />
                  <span className="size-label">{size.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 2: Orientation */}
        <div className="step">
          <div className="step-head">
            <span className="step-num">2</span>
            <span className="step-title">Choose orientation</span>
          </div>
          <div className="orient-row">
            <div
              onClick={() => setCurrentOrientation('portrait')}
              className={`orient-opt ${currentOrientation === 'portrait' ? 'active' : ''}`}
              data-o="portrait"
            >
              <div className="orient-icon" />
              <span className="orient-label">Portrait</span>
            </div>
            <div
              onClick={() => setCurrentOrientation('landscape')}
              className={`orient-opt ${currentOrientation === 'landscape' ? 'active' : ''}`}
              data-o="landscape"
            >
              <div className="orient-icon" />
              <span className="orient-label">Landscape</span>
            </div>
          </div>
        </div>

        {/* Step 3: Photo Upload and Canvas */}
        <div className="step">
          <div className="step-head">
            <span className="step-num">3</span>
            <span className="step-title">Upload your photo</span>
          </div>
          <div className="stage">
            <div
              className={`frame-outer ${selectedTheme.id}`}
              style={{
                aspectRatio: `${w} / ${h}`,
                width: `${currentOrientation === 'portrait' ? 220 : 300}px`,
                padding: '18px', // Fixed decorative frame border width
              }}
            >
              <div
                className="frame-mat"
                style={{
                  padding: noMat ? '0px' : `${matWidth}px`,
                  background: noMat ? 'transparent' : 'var(--white)',
                  boxShadow: noMat ? 'none' : 'inset 0 0 0 1px rgba(56,42,38,.08)',
                  width: '100%',
                  height: '100%',
                  borderRadius: '2px',
                  transition: 'padding 0.18s ease',
                }}
              >
                <div className="photo-slot">
                  {userPhoto ? (
                    <img src={userPhoto} alt="Your uploaded photo" />
                  ) : (
                    <label className="upload-cta" onClick={() => fileInputRef.current?.click()}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <span>Upload photo</span>
                      <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>JPG or PNG</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Mat Control Options */}
          <div className="gap-row">
            <label className="switch">
              <input
                type="checkbox"
                checked={noMat}
                onChange={(e) => setNoMat(e.target.checked)}
              />
              <span className="switch-track" />
            </label>
            <span className="gap-label">Photo edge-to-edge <b>(no gap between frame and photo)</b></span>
            
            <span className="gap-label" style={{ marginLeft: 'auto' }}>Mat width</span>
            <input
              type="range"
              min="0"
              max="24"
              value={matWidth}
              disabled={noMat}
              onChange={(e) => setMatWidth(parseInt(e.target.value))}
              style={{ width: '140px', opacity: noMat ? 0.4 : 1 }}
            />
          </div>
        </div>

        {/* Step 4: Theme Swatches */}
        <div className="step">
          <div className="step-head">
            <span className="step-num">4</span>
            <span className="step-title">Choose a frame theme</span>
          </div>
          <div className="swatches">
            {THEMES.map((theme) => {
              const isActive = selectedTheme.id === theme.id
              return (
                <div
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`swatch ${theme.id} ${isActive ? 'active' : ''}`}
                  role="button"
                  aria-label={`Select ${theme.name} theme`}
                >
                  <div className="swatch-inner">
                    <div className="dot" />
                  </div>
                  <div className="swatch-name">{theme.name}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="actionbar">
        <div className="actionbar-inner">
          <button onClick={() => fileInputRef.current?.click()}>
            Change photo
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => toast.success('Design saved successfully!')}>
              Save creation
            </button>
            <button
              className="primary"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? 'Adding...' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
