'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductInput } from '@/lib/validations'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Loader2, ArrowLeft, Plus, X, Upload, ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ProductFormProps {
  initialData?: any
  categories: Array<{ id: string; name: string }>
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imageInput, setImageInput] = useState('')
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      slug: initialData.slug,
      description: initialData.description,
      price: initialData.price,
      compareAtPrice: initialData.compareAtPrice || undefined,
      categoryId: initialData.categoryId,
      isCustomizable: initialData.isCustomizable,
      images: initialData.images || [],
    } : {
      name: '',
      slug: '',
      description: '',
      price: 0,
      categoryId: categories[0]?.id || '',
      isCustomizable: false,
      images: [],
    }
  })

  const uploadFile = useCallback(async (file: File) => {
    // Client-side validation before upload
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`Unsupported file type: ${file.type}. Use JPEG, PNG, WebP, or GIF.`)
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB allowed.`)
      return
    }

    setUploadingImage(true)
    setUploadProgress(0)

    try {
      // Use FormData (multipart) — no base64 conversion, no 413 error
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress for UX (real XHR progress would need XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 85))
      }, 200)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type — browser sets multipart/form-data with boundary automatically
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Upload failed (${res.status})`)
      }

      const data = await res.json()
      const newImages = [...images, data.secureUrl]
      setImages(newImages)
      setValue('images', newImages as [string, ...string[]])
      toast.success('Image uploaded successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image')
    } finally {
      setTimeout(() => {
        setUploadingImage(false)
        setUploadProgress(0)
      }, 600)
    }
  }, [images, setValue])

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
    // Reset so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await uploadFile(file)
  }, [uploadFile])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleAddImage = () => {
    if (!imageInput) return
    if (!imageInput.startsWith('http://') && !imageInput.startsWith('https://')) {
      return toast.error('Please enter a valid image URL starting with http:// or https://')
    }
    const newImages = [...images, imageInput]
    setImages(newImages)
    setValue('images', newImages as [string, ...string[]])
    setImageInput('')
    toast.success('Image URL added!')
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    setValue('images', newImages as [string, ...string[]])
  }

  const onSubmit = async (data: ProductInput) => {
    if (images.length === 0) {
      return toast.error('At least one product image is required')
    }

    setSubmitting(true)
    try {
      const url = initialData
        ? `/api/products/${initialData.id}`
        : '/api/products'

      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, images }),
      })

      if (!response.ok) {
        const res = await response.json().catch(() => ({}))
        throw new Error(res.error || 'Failed to save product')
      }

      toast.success(initialData ? 'Product updated successfully!' : 'Product created successfully!')
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" type="button" className="p-2 hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h2 className="heading-3 text-gray-950 dark:text-white">
          {initialData ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 space-y-5">
          {/* Name & Slug */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="group">
              <label className="label">Product Name</label>
              <Input
                {...register('name')}
                placeholder="Classic Wood Photo Frame"
                error={errors.name?.message}
                className="transition-all duration-200 group-focus-within:ring-2"
              />
            </div>
            <div className="group">
              <label className="label">Slug</label>
              <Input
                {...register('slug')}
                placeholder="classic-wood-frame"
                error={errors.slug?.message}
                className="transition-all duration-200 group-focus-within:ring-2"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description <span className="text-gray-400 font-normal">(min 20 characters)</span></label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Provide a detailed description of the product features, sizes, and customizations..."
              className={`input h-auto resize-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/30 ${errors.description ? 'input-error' : ''}`}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.description.message}
              </p>
            )}
          </div>

          {/* Price, Compare Price & Category */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Price (₹)</label>
              <Input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="1299"
                error={errors.price?.message}
              />
            </div>
            <div>
              <label className="label">Compare-at Price (₹)</label>
              <Input
                type="number"
                step="0.01"
                {...register('compareAtPrice', { valueAsNumber: true })}
                placeholder="1799"
                error={errors.compareAtPrice?.message}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="label">Category</label>
              <select
                {...register('categoryId')}
                className="input cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Customizable toggle */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-900/40 transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-700">
            <input
              type="checkbox"
              id="isCustomizable"
              {...register('isCustomizable')}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <label htmlFor="isCustomizable" className="font-medium text-gray-900 dark:text-white cursor-pointer select-none text-sm">
              This product is customizable <span className="text-gray-500 dark:text-gray-400 font-normal">(Allows 3D framing options and photo uploads)</span>
            </label>
          </div>

          {/* ─── Images Section ─── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="label mb-0">Product Images</label>
              {images.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {images.length} image{images.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !uploadingImage && fileInputRef.current?.click()}
              className={`
                relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer
                transition-all duration-300 select-none
                ${isDragging
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02] shadow-lg shadow-primary-500/20'
                  : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                }
                ${uploadingImage ? 'pointer-events-none opacity-80' : ''}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                disabled={uploadingImage}
                className="hidden"
              />

              {uploadingImage ? (
                <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading to Cloudinary…</p>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isDragging
                      ? 'bg-primary-500 text-white scale-110 rotate-3'
                      : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 shadow-sm'
                  }`}>
                    {isDragging ? <CheckCircle2 className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {isDragging ? 'Drop to upload!' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      JPEG, PNG, WebP, GIF — Max 10 MB
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* URL input row */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                  placeholder="Or paste an image URL…"
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddImage}
                variant="outline"
                className="shrink-0 flex items-center gap-1.5 px-4 h-12 hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" /> Add URL
              </Button>
            </div>

            {/* Image preview grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden group shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 animate-fade-in"
                  >
                    {/* Primary badge */}
                    {i === 0 && (
                      <div className="absolute top-1.5 left-1.5 z-10 bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        Main
                      </div>
                    )}
                    <img
                      src={img}
                      alt={`Product image ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2QxZDVkYiI+PzwvdGV4dD48L3N2Zz4='
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-2">
                No images yet — upload or paste a URL above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <Button
          type="submit"
          disabled={submitting}
          className="min-w-[160px] relative overflow-hidden group"
        >
          <span className={`flex items-center gap-2 transition-all duration-200 ${submitting ? 'opacity-0' : 'opacity-100'}`}>
            <CheckCircle2 className="w-4 h-4" />
            {initialData ? 'Save Changes' : 'Create Product'}
          </span>
          {submitting && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </span>
          )}
        </Button>
        <Link href="/admin/products">
          <Button variant="outline" type="button" className="hover:scale-105 transition-transform">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
