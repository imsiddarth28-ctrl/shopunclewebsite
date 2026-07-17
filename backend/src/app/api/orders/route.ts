import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { ZodError } from 'zod'
import { orderSchema } from '@/lib/validations'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, generalLimit, orderLimit } from '@/lib/rateLimit'
import { randomInt, randomBytes } from 'crypto'

const IS_PROD = process.env.NODE_ENV === 'production'

/** Clamp pagination safely */
function parsePagination(sp: URLSearchParams) {
  const page  = Math.max(1, parseInt(sp.get('page')  || '1') || 1)
  const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '10') || 10))
  return { page, limit, skip: (page - 1) * limit }
}

/** Generate a cryptographically secure 6-character order ID suffix */
function genOrderSuffix(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const bytes = randomBytes(6)
  return Array.from(bytes).map(b => chars[b % chars.length]).join('')
}

/** Sanitise a plain-text string — strips HTML-dangerous chars, trims, caps length */
function sanitise(str: string, maxLen = 200): string {
  return str.replace(/[<>"'`]/g, '').trim().slice(0, maxLen)
}

/** Validate Indian phone number */
const PHONE_RE = /^(\+?91)?[6-9]\d{9}$/

export async function GET(request: NextRequest) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  if (!rateLimit(request, generalLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests' }, { status: 429 }))
  }

  try {
    const authHeader = request.headers.get('x-shop-owner-key')
    const isValidApiKey = authHeader && authHeader === process.env.SHOP_OWNER_KEY

    let isAdmin = false
    let userIdFilter: any = null

    if (isValidApiKey) {
      isAdmin = true
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return addCorsHeaders(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }
      isAdmin = session.user.role === 'ADMIN'
      if (!isAdmin) {
        userIdFilter = getObjectId(session.user.id)
      }
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePagination(searchParams)
    const status = searchParams.get('status')

    const { db } = await connectToDatabase()

    const filter: any = {}
    if (userIdFilter) filter.userId = userIdFilter
    if (status) {
      filter.status = { $regex: `^${status}$`, $options: 'i' }
    }

    const [orders, total] = await Promise.all([
      db.collection('orders').find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection('orders').countDocuments(filter),
    ])

    // Populate user details for admin
    if (isAdmin) {
      const userIds = orders.map(o => o.userId).filter(Boolean)
      const users = await db.collection('users').find({ _id: { $in: userIds } }).toArray()
      const userMap = new Map(users.map(u => [u._id.toString(), u]))
      orders.forEach(o => {
        if (o.userId) {
          o.user = userMap.get(o.userId.toString())
        } else if (o.customerName) {
          o.user = { name: o.customerName, phone: o.customerPhone }
        }
      })
    }

    return addCorsHeaders(request, NextResponse.json({
      orders: orders.map(o => ({ ...o, id: o._id.toString(), _id: o._id.toString() })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }))
  } catch (error) {
    console.error('Get orders error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  if (!rateLimit(request, orderLimit)) {
    return addCorsHeaders(request, NextResponse.json({ error: 'Too many requests, please slow down.' }, { status: 429 }))
  }

  try {
    const body = await request.json()

    // 1. Detect if it's a WhatsApp click-to-chat guest order
    if (body && body.customerName && body.customerPhone) {
      const rawName  = body.customerName
      const rawPhone = body.customerPhone
      const rawItems = body.items
      const rawAddr  = body.address
      const rawNotes = body.notes

      // ── Input validation ────────────────────────────────────
      if (typeof rawName !== 'string' || rawName.trim().length < 2) {
        return addCorsHeaders(request, NextResponse.json({ error: 'Customer name must be at least 2 characters' }, { status: 400 }))
      }
      if (typeof rawPhone !== 'string' || !PHONE_RE.test(rawPhone.replace(/\s/g, ''))) {
        return addCorsHeaders(request, NextResponse.json({ error: 'Invalid Indian phone number' }, { status: 400 }))
      }
      if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
        return addCorsHeaders(request, NextResponse.json({ error: 'Items array is required' }, { status: 400 }))
      }
      if (rawItems.length > 20) {
        return addCorsHeaders(request, NextResponse.json({ error: 'Too many items (max 20)' }, { status: 400 }))
      }

      const customerName  = sanitise(rawName, 100)
      const customerPhone = rawPhone.replace(/\s/g, '').slice(0, 15)
      const address       = rawAddr  ? sanitise(rawAddr,  300) : ''
      const notes         = rawNotes ? sanitise(rawNotes, 500) : ''

      // Calculate totalAmount from items (server-side, never trust client total)
      const totalAmount = (rawItems as any[]).reduce((sum: number, item: any) => {
        const qty   = Math.max(1, parseInt(item.qty)   || 1)
        const price = Math.max(0, parseFloat(item.price) || 0)
        return sum + (qty * price)
      }, 0)

      // Cryptographically secure order ID
      const orderId = `ORD-${genOrderSuffix()}`

      // Cryptographically secure 6-digit OTP — NOT Math.random()
      const otp = randomInt(100000, 999999).toString()

      const { db } = await connectToDatabase()

      const orderItems = []
      for (const item of rawItems as any[]) {
        let imageId: any  = undefined
        let publicId: string | undefined = undefined
        let previewImage: string | undefined = item.previewImage

        const imageIdStr = item.imageId || item.customizationData?.imageId
        if (imageIdStr) {
          try { imageId = getObjectId(imageIdStr) } catch { /* invalid id — skip */ }
          if (imageId) {
            const userImage = await db.collection('user_images').findOne({ _id: imageId })
            if (userImage) {
              publicId     = userImage.publicId
              previewImage = userImage.secureUrl ?? previewImage
            }
          }
        }

        orderItems.push({
          productId:         item.productId ? (() => { try { return getObjectId(item.productId) } catch { return undefined } })() : undefined,
          name:              sanitise(String(item.name || ''), 200),
          quantity:          Math.max(1, parseInt(item.qty) || 1),
          unitPrice:         Math.max(0, parseFloat(item.price) || 0),
          totalPrice:        Math.max(1, parseInt(item.qty) || 1) * Math.max(0, parseFloat(item.price) || 0),
          frameOptionId:     item.frameOptionId ? (() => { try { return getObjectId(item.frameOptionId) } catch { return undefined } })() : undefined,
          customizationData: item.customizationData,
          previewImage,
          imageId,
          publicId,
        })
      }

      const orderDoc = {
        orderId,
        orderNumber:   orderId,
        customerName,
        customerPhone,
        address,
        notes,
        items:         orderItems,
        totalAmount,
        total:         totalAmount,
        status:        'pending',
        otp,
        shopOwnerNote: '',
        createdAt:     new Date(),
        updatedAt:     new Date(),
      }

      await db.collection('orders').insertOne(orderDoc)

      const itemListText = orderItems.map((item: any) => {
        let t = `- ${item.name} x ${item.quantity} (₹${item.unitPrice})`
        if (item.previewImage) t += `\n  Image: ${item.previewImage}`
        return t
      }).join('\n')

      let messageText = `Hi, I would like to place an order:\nOrder ID: ${orderId}\nCustomer: ${customerName}\nPhone: ${customerPhone}\nDelivery Address: ${address || 'N/A'}\n`
      if (notes) messageText += `Notes: ${notes}\n`
      messageText += `\nItems:\n${itemListText}\n\nTotal: ₹${totalAmount}\nVerification OTP: ${otp}\n\n📸 Please attach and send the photo you want printed in this chat.\n\nPlease confirm my order.`

      const shopOwnerNumber = process.env.SHOP_OWNER_NUMBER || '919876543210'
      const whatsappLink = `https://wa.me/${shopOwnerNumber}?text=${encodeURIComponent(messageText)}`

      return addCorsHeaders(request, NextResponse.json({ orderId, otp, whatsappLink }, { status: 201 }))
    }

    // 2. Logged-in user checkout
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return addCorsHeaders(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }

    const validatedData = orderSchema.parse(body)

    const { db } = await connectToDatabase()
    
    // Calculate totals - fetch product and frame options prices
    const itemIds = validatedData.items.map(item => getObjectId(item.productId))
    const products = await db.collection('products')
      .find({ _id: { $in: itemIds } })
      .toArray()
    
    const productMap = new Map(products.map(p => [p._id.toString(), p]))


    const frameOptionIds = validatedData.items
      .filter(item => item.frameOptionId)
      .map(item => getObjectId(item.frameOptionId!))
    
    const frameOptions = frameOptionIds.length > 0
      ? await db.collection('frame_options').find({ _id: { $in: frameOptionIds } }).toArray()
      : []
    
    const frameOptionMap = new Map(frameOptions.map(fo => [fo._id.toString(), fo]))

    const orderItems = []
    for (const item of validatedData.items) {
      const product = productMap.get(item.productId)
      let unitPrice = product?.price || 0

      if (item.frameOptionId) {
        const frameOption = frameOptionMap.get(item.frameOptionId)
        if (frameOption) {
          const basePrice = frameOption.basePrice || frameOption.price || 0
          let sizePrice = basePrice
          let materialModifier = 0

          const selectedSize = item.customizationData?.selectedSize
          const selectedMaterial = item.customizationData?.selectedMaterial

          if (selectedSize && frameOption.sizes) {
            const sizeObj = frameOption.sizes.find((s: any) => s.size === selectedSize)
            if (sizeObj) {
              sizePrice = sizeObj.price
            }
          }

          if (selectedMaterial && frameOption.materials) {
            const matObj = frameOption.materials.find((m: any) => m.name === selectedMaterial)
            if (matObj) {
              materialModifier = matObj.priceModifier || 0
            }
          }

          unitPrice = sizePrice + materialModifier
        }
      }

      let imageId: ObjectId | undefined = undefined
      let publicId: string | undefined = undefined

      const imageIdStr = item.customizationData?.imageId
      if (imageIdStr) {
        imageId = getObjectId(imageIdStr)
        // ── Image ownership check — user can only reference their own uploaded images ──
        const userImage = await db.collection('user_images').findOne({
          _id: imageId,
          ownerId: getObjectId(session.user.id),
        })
        if (!userImage) {
          return addCorsHeaders(request, NextResponse.json(
            { error: 'Image not found or does not belong to your account' },
            { status: 403 }
          ))
        }
        publicId = userImage.publicId
        delete item.customizationData.imageId
      }

      orderItems.push({
        productId: getObjectId(item.productId),
        quantity: item.quantity,
        frameOptionId: item.frameOptionId ? getObjectId(item.frameOptionId) : undefined,
        customizationData: item.customizationData,
        previewImage: item.previewImage,
        imageId,
        publicId,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      })
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    
    const shipping = subtotal >= 999 ? 0 : 99
    const total = subtotal + shipping

    const order = {
      orderNumber:       `ORD-${genOrderSuffix()}`,
      userId: getObjectId(session.user.id),
      items: orderItems,
      orderType: validatedData.items.some(i => i.customizationData) ? 'PERSONALIZED' : 'STANDARD',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: validatedData.paymentMethod,
      subtotal,
      tax: 0,
      shipping,
      discount: 0,
      total,
      shippingAddress: validatedData.shippingAddress,
      billingAddress: validatedData.billingAddress,
      notes: validatedData.notes,
      customizationData: validatedData.items.find(i => i.customizationData)?.customizationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('orders').insertOne(order)

    // Update user_images with the created order ID
    for (const item of orderItems) {
      if (item.imageId) {
        await db.collection('user_images').updateOne(
          { _id: item.imageId },
          { $set: { orderId: result.insertedId } }
        )
      }
    }

    return addCorsHeaders(request, NextResponse.json({
      order: { ...order, _id: result.insertedId },
      message: 'Order placed successfully',
    }, { status: 201 }))
  } catch (error) {
    if (error instanceof ZodError) {
      const details = IS_PROD ? undefined : error.errors
      return addCorsHeaders(request, NextResponse.json({ error: 'Validation failed', ...(details && { details }) }, { status: 400 }))
    }
    console.error('Create order error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Failed to create order' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}