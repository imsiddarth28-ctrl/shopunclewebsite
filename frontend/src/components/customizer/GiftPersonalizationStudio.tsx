'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatPrice, cn, compressImage } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { Loader2, Search, Gift, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const DECORATIVE_BORDERS = [
  { id: 'none', name: 'No Border', src: null },
  { id: 'flower', name: 'Flower Border', src: '/frames/flowerborder.png' },
  { id: 'black-minimalist', name: 'Black Minimalist', src: '/frames/blackminimalistic.png' },
  { id: 'simple', name: 'Simple Border', src: '/frames/simpleborder.png' }
]

export function GiftPersonalizationStudio({ productId }: { productId: string }) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [customText, setCustomText] = useState('')
  const [selectedBorder, setSelectedBorder] = useState(DECORATIVE_BORDERS[0])
  const [isAdding, setIsAdding] = useState(false)
  const [imageWidth, setImageWidth] = useState(250)
  const [imageHeight, setImageHeight] = useState(250)
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)
  const [lockAspectRatio, setLockAspectRatio] = useState(true)

  const handleWidthChange = (val: number) => {
    setImageWidth(val)
    if (lockAspectRatio && aspectRatio) {
      setImageHeight(Math.round(val / aspectRatio))
    }
  }

  const handleHeightChange = (val: number) => {
    setImageHeight(val)
    if (lockAspectRatio && aspectRatio) {
      setImageWidth(Math.round(val * aspectRatio))
    }
  }

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
        } else {
          toast.error('Failed to load product details')
        }
      } catch (e) {
        console.error('Failed to load product details:', e)
        toast.error('Error loading product details')
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [productId])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const photoData = reader.result as string
        setUserPhoto(photoData)
        
        // Calculate natural aspect ratio
        const img = new window.Image()
        img.src = photoData
        img.onload = () => {
          const ratio = img.naturalWidth / img.naturalHeight
          setAspectRatio(ratio)
          if (ratio >= 1) {
            setImageWidth(250)
            setImageHeight(Math.round(250 / ratio))
          } else {
            setImageHeight(250)
            setImageWidth(Math.round(250 * ratio))
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddToPersonalizedCart = async () => {
    if (!userPhoto) {
      toast.error('Please upload a photo to personalize this item!')
      return
    }

    setIsAdding(true)
    try {
      const compressedPhoto = await compressImage(userPhoto)
      addItem({
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '/products/placeholder.jpg',
        previewImage: compressedPhoto,
        type: 'PERSONALIZED',
        quantity: 1,
        customizationData: {
          text: customText,
          frameBorder: selectedBorder.name,
          imageWidth,
          imageHeight,
        }
      })
      toast.success(`${product.name} personalized and added to cart!`)
      router.push('/cart')
    } catch (err) {
      console.error(err)
      toast.error('Failed to add personalized item to cart')
    } finally {
      setIsAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-450 font-semibold text-sm">Loading Personalization Studio...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Product Not Found</h2>
          <p className="text-slate-650 dark:text-slate-400">The product you are trying to personalize could not be loaded.</p>
          <Link href="/products">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest block mb-1">
              Personalization Studio
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-6 h-6 text-rose-500" />
              Personalize {product.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Upload your picture and add a name or message to make it uniquely yours.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-405 block uppercase tracking-wider">Price</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Beautiful Mockup Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm relative min-h-[450px]">
            
            <span className="absolute top-4 left-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Live Preview
            </span>

            {/* Mockup Display Wrapper */}
            <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-6 shadow-inner group">
              <Image
                src={product.images?.[0] || '/products/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover opacity-35 blur-[2px] transition-opacity duration-300"
              />

              <div className="relative w-[280px] h-[280px] bg-white rounded-xl shadow-2xl border border-white/50 overflow-hidden flex flex-col items-center justify-center p-4">
                {userPhoto ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-50 overflow-hidden">
                    <div 
                      className="relative overflow-hidden flex items-center justify-center"
                      style={{
                        width: `${imageWidth}px`,
                        height: `${imageHeight}px`
                      }}
                    >
                      <Image
                        src={userPhoto}
                        alt="Your personalization photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {selectedBorder.src && (
                      <img
                        src={selectedBorder.src}
                        alt={selectedBorder.name}
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none" />
                  </div>
                ) : (
                  <div className="text-center p-6 text-slate-400 relative w-full h-full flex flex-col items-center justify-center">
                    {selectedBorder.src && (
                      <img
                        src={selectedBorder.src}
                        alt={selectedBorder.name}
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10"
                      />
                    )}
                    <Gift className="w-12 h-12 mx-auto text-rose-300 mb-3 animate-bounce" />
                    <p className="text-sm font-semibold text-slate-500">Your Photo Here</p>
                    <p className="text-xs text-slate-400 mt-1">Upload an image on the right to see preview</p>
                  </div>
                )}

                {customText && (
                  <div className="absolute bottom-6 inset-x-4 bg-white/80 dark:bg-black/80 backdrop-blur-md py-2 px-3 rounded-lg border border-white/20 text-center shadow-lg transform translate-y-0 transition-transform">
                    <p className="font-display font-bold text-sm tracking-wide text-slate-900 dark:text-white truncate">
                      {customText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Controls Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                Personalize Options
              </h3>

              {/* Photo Uploader */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Upload Print Image
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-rose-500 rounded-2xl p-6 bg-slate-50 dark:bg-slate-950 transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Search className="w-8 h-8 text-slate-400 group-hover:text-rose-500 mb-2 transition-colors" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                    {userPhoto ? 'Change Photo' : 'Select a JPEG / PNG'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Drag & drop or browse from device</p>
                </div>

                {userPhoto && (
                  <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 rounded-xl mt-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-rose-200/50 flex-shrink-0">
                      <Image src={userPhoto} alt="Thumbnail" fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-rose-800 dark:text-rose-300 truncate">Image Loaded</p>
                      <p className="text-[10px] text-rose-500/80 truncate">Ready to print</p>
                    </div>
                    <button
                      onClick={() => setUserPhoto(null)}
                      className="text-xs font-bold text-rose-600 hover:underline px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Frame Border Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-350">
                  Select Frame Design
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DECORATIVE_BORDERS.map((border) => (
                    <button
                      key={border.id}
                      type="button"
                      onClick={() => setSelectedBorder(border)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900",
                        selectedBorder.id === border.id
                          ? "border-rose-500 ring-2 ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-800"
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white flex items-center justify-center relative mb-1.5">
                        {border.src ? (
                          <img
                            src={border.src}
                            alt={border.name}
                            className="w-full h-full object-fill"
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase">None</span>
                        )}
                      </div>
                      <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 leading-tight truncate w-full">
                        {border.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Dimensions Scale Controls */}
              {userPhoto && (
                <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h4 className="font-bold text-sm text-slate-850 dark:text-slate-200">
                    Adjust Photo Size
                  </h4>
                  
                  {/* Width Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Width</span>
                      <span>{imageWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={280}
                      value={imageWidth}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>

                  {/* Height Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Height</span>
                      <span>{imageHeight}px</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={280}
                      value={imageHeight}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>

                  {/* Lock aspect ratio Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={lockAspectRatio}
                      onChange={(e) => setLockAspectRatio(e.target.checked)}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4 accent-rose-500"
                    />
                    <span>Lock width and height together</span>
                  </label>
                </div>
              )}

              {/* Custom Text Field */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Custom Text or Names
                </label>
                <input
                  type="text"
                  maxLength={40}
                  placeholder="E.g., Happy Birthday, Sweet Memories, etc."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all text-sm"
                />
                <p className="text-[10px] text-slate-400 flex justify-between">
                  <span>Will be printed elegantly on the product</span>
                  <span>{customText.length}/40 chars</span>
                </p>
              </div>

              {/* Cart Action Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={handleAddToPersonalizedCart}
                  disabled={isAdding}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Gift className="w-5 h-5" />
                  {isAdding ? 'Adding to Cart...' : 'Add Personalized Gift to Cart'}
                </Button>
              </div>

            </div>
            
            {/* Back Button */}
            <div className="text-center">
              <Link href="/products" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                &larr; Back to Catalog
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
