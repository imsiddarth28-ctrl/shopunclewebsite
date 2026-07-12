import { Db, ObjectId, WithId, Filter, UpdateFilter } from 'mongodb'
import { getDb } from './mongodb'

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  role: 'USER' | 'ADMIN'
  emailVerified?: Date
  image?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  _id?: ObjectId
  userId: ObjectId
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  _id?: ObjectId
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  _id?: ObjectId
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  compareAtPrice?: number
  sku?: string
  categoryId: ObjectId
  images: string[]
  isCustomizable: boolean
  isActive: boolean
  isFeatured: boolean
  tags: string[]
  stock: number
  trackInventory: boolean
  weight?: number
  dimensions?: any
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

export interface FrameOption {
  _id?: ObjectId
  productId: ObjectId
  name: string
  description?: string
  thumbnailUrl: string
  modelUrl?: string
  textureUrl?: string
  basePrice: number
  sizes: FrameSize[]
  materials: FrameMaterial[]
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface FrameSize {
  size: string
  price: number
  dimensions: {
    width: number
    height: number
    depth: number
  }
}

export interface FrameMaterial {
  name: string
  textureUrl: string
  priceModifier: number
}

export interface CartItem {
  productId: ObjectId
  quantity: number
  frameOptionId?: ObjectId
  size?: string
  material?: string
  customizationData?: any
  previewImage?: string
  price: number
}

export interface Cart {
  _id?: ObjectId
  userId: ObjectId
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

export interface Wishlist {
  _id?: ObjectId
  userId: ObjectId
  items: WishlistItem[]
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  productId: ObjectId
  frameOptionId?: ObjectId
  size?: string
  material?: string
  createdAt: Date
}

export interface Order {
  _id?: ObjectId
  orderNumber: string
  userId: ObjectId
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY_FOR_SHIPMENT' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  paymentMethod: 'RAZORPAY' | 'STRIPE' | 'COD'
  paymentId?: string
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
  shippingAddress: Address
  billingAddress?: Address
  notes?: string
  couponCode?: string
  couponId?: ObjectId
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
  shippedAt?: Date
  deliveredAt?: Date
}

export interface OrderItem {
  productId: ObjectId
  quantity: number
  frameOptionId?: ObjectId
  size?: string
  material?: string
  customizationData?: any
  previewImage?: string
  unitPrice: number
  totalPrice: number
}

export interface Coupon {
  _id?: ObjectId
  code: string
  description?: string
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
  minOrderValue?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  _id?: ObjectId
  userId: ObjectId
  productId: ObjectId
  orderId: ObjectId
  rating: number
  title?: string
  comment?: string
  images: string[]
  isVerified: boolean
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Customization {
  _id?: ObjectId
  frameOptionId: ObjectId
  userId: ObjectId
  originalImage: string
  processedImage?: string
  previewImage?: string
  position: any
  scale: number
  rotation: number
  textOverlays?: any
  collageLayout?: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export const COLLECTIONS = {
  USERS: 'users',
  ADDRESSES: 'addresses',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  FRAME_OPTIONS: 'frame_options',
  CARTS: 'carts',
  WISHLISTS: 'wishlists',
  ORDERS: 'orders',
  COUPONS: 'coupons',
  REVIEWS: 'reviews',
  CUSTOMIZATIONS: 'customizations',
} as const

export async function getUserByEmail(email: string): Promise<WithId<User> | null> {
  const db = await getDb()
  return db.collection<User>(COLLECTIONS.USERS).findOne({ email })
}

export async function getUserById(id: ObjectId): Promise<WithId<User> | null> {
  const db = await getDb()
  return db.collection<User>(COLLECTIONS.USERS).findOne({ _id: id })
}

export async function createUser(user: User): Promise<WithId<User>> {
  const db = await getDb()
  const result = await db.collection<User>(COLLECTIONS.USERS).insertOne(user)
  return { ...user, _id: result.insertedId }
}

export async function getProductById(id: ObjectId): Promise<WithId<Product> | null> {
  const db = await getDb()
  return db.collection<Product>(COLLECTIONS.PRODUCTS).findOne({ _id: id })
}

export async function getProducts(filters: any = {}, page = 1, limit = 12): Promise<{ products: WithId<Product>[], total: number }> {
  const db = await getDb()
  const query: Filter<Product> = { isActive: true, ...filters }
  const total = await db.collection<Product>(COLLECTIONS.PRODUCTS).countDocuments(query)
  const products = await db.collection<Product>(COLLECTIONS.PRODUCTS)
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray()
  return { products, total }
}

export async function getFrameOptions(productId: ObjectId) {
  const db = await getDb()
  return db.collection(COLLECTIONS.FRAME_OPTIONS)
    .find({ productId, isActive: true })
    .sort({ sortOrder: 1 })
    .toArray()
}

export async function getCart(userId: ObjectId) {
  const db = await getDb()
  return db.collection<Cart>('carts').findOne({ userId })
}

export async function updateCart(userId: ObjectId, items: any[]) {
  const db = await getDb()
  return db.collection('carts').findOneAndUpdate(
    { userId },
    { $set: { items, updatedAt: new Date() } },
    { upsert: true, returnDocument: 'after' }
  )
}

export async function createOrder(order: Order) {
  const db = await getDb()
  const result = await db.collection('orders').insertOne(order)
  return { ...order, _id: result.insertedId }
}

export async function getUserOrders(userId: ObjectId, page = 1, limit = 10) {
  const db = await getDb()
  const skip = (page - 1) * limit
  const orders = await db.collection('orders')
    .find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()
  const total = await db.collection('orders').countDocuments({ userId })
  return { orders, total }
}

export async function getOrderById(id: ObjectId) {
  const db = await getDb()
  return db.collection('orders').findOne({ _id: id })
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb()
  return db.collection('orders').findOne({ orderNumber })
}

export async function updateOrderStatus(id: ObjectId, status: string, trackingNumber?: string) {
  const db = await getDb()
  const update: any = { status, updatedAt: new Date() }
  if (trackingNumber) update.trackingNumber = trackingNumber
  return db.collection('orders').findOneAndUpdate(
    { _id: id },
    { $set: update },
    { returnDocument: 'after' }
  )
}

export async function getAddresses(userId: ObjectId) {
  const db = await getDb()
  return db.collection('addresses').find({ userId }).toArray()
}

export async function createAddress(address: any) {
  const db = await getDb()
  const result = await db.collection('addresses').insertOne(address)
  return { ...address, _id: result.insertedId }
}

export async function getCouponByCode(code: string) {
  const db = await getDb()
  return db.collection('coupons').findOne({ 
    code: code.toUpperCase(), 
    isActive: true, 
    validFrom: { $lte: new Date() }, 
    validUntil: { $gte: new Date() } 
  })
}

export async function incrementCouponUsage(couponId: ObjectId) {
  const db = await getDb()
  await db.collection('coupons').updateOne({ _id: couponId }, { $inc: { usedCount: 1 } })
}