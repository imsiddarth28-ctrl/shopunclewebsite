'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductInput } from '@/lib/validations'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import { Loader2, ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

interface ProductFormProps {
  initialData?: any
  categories: Array<{ id: string; name: string }>
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [imageInput, setImageInput] = useState('')
  const [images, setImages] = useState<string[]>(initialData?.images || [])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProductInput>({
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

  const handleAddImage = () => {
    if (!imageInput) return
    if (!imageInput.startsWith('http://') && !imageInput.startsWith('https://')) {
      return toast.error('Please enter a valid image URL')
    }
    const newImages = [...images, imageInput]
    setImages(newImages)
    setValue('images', newImages as [string, ...string[]])
    setImageInput('')
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
        body: JSON.stringify({
          ...data,
          images,
        }),
      })

      if (!response.ok) {
        const res = await response.json()
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" type="button" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h2 className="heading-3 text-gray-950 dark:text-white">
          {initialData ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Name & Slug */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name</label>
              <Input
                {...register('name')}
                placeholder="Classic Wood Photo Frame"
                error={errors.name?.message}
              />
            </div>
            <div>
              <label className="label">Slug</label>
              <Input
                {...register('slug')}
                placeholder="classic-wood-frame"
                error={errors.slug?.message}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (Min 20 characters)</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Provide a detailed description of the product features, sizes, and customizations..."
              className={`input h-auto ${errors.description ? 'input-error' : ''}`}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Price, Compare Price & Stock */}
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
                className="input"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle Customizable */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-150 dark:border-gray-800">
            <input
              type="checkbox"
              id="isCustomizable"
              {...register('isCustomizable')}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isCustomizable" className="font-medium text-gray-900 dark:text-white cursor-pointer select-none text-sm">
              This product is customizable (Allows 3D framing options and photo uploads)
            </label>
          </div>

          {/* Images Section */}
          <div className="space-y-3">
            <label className="label">Product Images</label>
            <div className="flex gap-2">
              <Input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <Button type="button" onClick={handleAddImage} className="h-12 px-4 flex-shrink-0">
                <Plus className="w-5 h-5 mr-1" /> Add
              </Button>
            </div>
            
            {images.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 overflow-hidden group">
                    <img
                      src={img}
                      alt={`Product image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mt-2">No images added. Enter a URL above and click Add.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting} className="min-w-[140px]">
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          Save Product
        </Button>
        <Link href="/admin/products">
          <Button variant="outline" type="button">Cancel</Button>
        </Link>
      </div>
    </form>
  )
}
