import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^(\+?91)?[6-9]\d{9}$/, 'Invalid Indian phone number'),
})

export const addressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(\+?91)?[6-9]\d{9}$/, 'Invalid Indian phone number'),
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  postalCode: z.string().regex(/^\d{6}$/, 'Invalid PIN code'),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
})

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  isCustomizable: z.boolean().default(false),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
})

export const frameOptionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  modelUrl: z.string().url().optional().or(z.literal('')),
  textureUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url(),
  price: z.number().positive('Price must be positive'),
  sizes: z.array(z.object({
    size: z.string(),
    price: z.number().positive(),
    dimensions: z.object({
      width: z.number().positive(),
      height: z.number().positive(),
      depth: z.number().positive(),
    }),
  })).min(1, 'At least one size is required'),
  materials: z.array(z.object({
    name: z.string(),
    textureUrl: z.string().url(),
    priceModifier: z.number().default(0),
  })).optional(),
})

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    frameOptionId: z.string().optional(),
    customizationData: z.any().optional(),
    previewImage: z.string().optional(),
  })).min(1, 'Cart cannot be empty'),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  billingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  paymentMethod: z.enum(['razorpay', 'stripe', 'cod']),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().positive(),
  minOrderValue: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  validFrom: z.date(),
  validUntil: z.date(),
})

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
  images: z.array(z.string().url()).optional(),
})

export const customizationSchema = z.object({
  frameOptionId: z.string(),
  originalImage: z.string().url(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  scale: z.number().default(1),
  rotation: z.number().default(0),
  textOverlays: z.array(z.object({
    text: z.string(),
    fontSize: z.number(),
    fontFamily: z.string(),
    color: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
  })).optional(),
  collageLayout: z.string().optional(),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ProductInput = z.infer<typeof productSchema>
export type FrameOptionInput = z.infer<typeof frameOptionSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type CouponInput = z.infer<typeof couponSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type CustomizationInput = z.infer<typeof customizationSchema>