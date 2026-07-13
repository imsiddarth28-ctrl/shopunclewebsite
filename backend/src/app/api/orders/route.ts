import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { ZodError } from 'zod'
import { orderSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
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
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      isAdmin = session.user.role === 'ADMIN'
      if (!isAdmin) {
        userIdFilter = getObjectId(session.user.id)
      }
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const { db } = await connectToDatabase()
    
    const filter: any = {}
    if (userIdFilter) {
      filter.userId = userIdFilter
    }
    if (status) filter.status = status

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      db.collection('orders')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('orders').countDocuments(filter)
    ])

    // Populate user details for admin dashboard
    if (isAdmin) {
      const userIds = orders.map(o => o.userId).filter(Boolean)
      const users = await db.collection('users').find({ _id: { $in: userIds } }).toArray()
      const userMap = new Map(users.map(u => [u._id.toString(), u]))
      orders.forEach(o => {
        if (o.userId) {
          o.user = userMap.get(o.userId.toString())
        } else if (o.customerName) {
          o.user = {
            name: o.customerName,
            phone: o.customerPhone
          }
        }
      })
    }

    return NextResponse.json({
      orders: orders.map(o => ({ ...o, id: o._id.toString(), _id: o._id.toString() })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Detect if it's a WhatsApp click-to-chat guest order
    if (body && body.customerName && body.customerPhone) {
      const { customerName, customerPhone, items, address, notes } = body
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'Items array is required' }, { status: 400 })
      }

      // Calculate totalAmount from items
      const totalAmount = items.reduce((sum: number, item: any) => sum + (item.qty * item.price), 0)

      // Generate a unique human-readable orderId (e.g. ORD-7F3K29)
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let randomPart = ''
      for (let i = 0; i < 6; i++) {
        randomPart += chars[Math.floor(Math.random() * chars.length)]
      }
      const orderId = `ORD-${randomPart}`

      // Generate a 6-digit numeric OTP
      // Note: This OTP is not a login credential. It binds the WhatsApp message to the correct order
      // when updating status, and allows the customer to look up their order details without an account.
      const otp = Math.floor(100000 + Math.random() * 900000).toString()

      const { db } = await connectToDatabase()

      const orderItems = []
      for (const item of items) {
        let imageId: any = undefined
        let publicId: string | undefined = undefined
        let previewImage: string | undefined = item.previewImage

        const imageIdStr = item.imageId || item.customizationData?.imageId
        if (imageIdStr) {
          imageId = getObjectId(imageIdStr)
          const userImage = await db.collection('user_images').findOne({ _id: imageId })
          if (userImage) {
            publicId = userImage.publicId
            if (userImage.secureUrl) {
              previewImage = userImage.secureUrl
            }
          }
        }

        orderItems.push({
          productId: item.productId ? getObjectId(item.productId) : undefined,
          name: item.name,
          quantity: item.qty,
          unitPrice: item.price,
          totalPrice: item.qty * item.price,
          frameOptionId: item.frameOptionId ? getObjectId(item.frameOptionId) : undefined,
          customizationData: item.customizationData,
          previewImage,
          imageId,
          publicId,
        })
      }

      const orderDoc = {
        orderId,
        orderNumber: orderId, // Uniformity with existing schema
        customerName,
        customerPhone,
        address: address || '',
        notes: notes || '',
        items: orderItems,
        totalAmount,
        total: totalAmount, // Uniformity with existing schema
        status: 'pending',
        otp,
        shopOwnerNote: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection('orders').insertOne(orderDoc)

      // Build WhatsApp message text
      const itemListText = orderItems.map((item: any) => {
        let itemText = `- ${item.name} x ${item.quantity} (₹${item.unitPrice})`
        if (item.previewImage) {
          itemText += `\n  Image: ${item.previewImage}`
        }
        return itemText
      }).join('\n')

      let messageText = `Hi, I would like to place an order:\nOrder ID: ${orderId}\nCustomer: ${customerName}\nPhone: ${customerPhone}\nDelivery Address: ${address || 'N/A'}\n`
      if (notes) {
        messageText += `Notes: ${notes}\n`
      }
      messageText += `\nItems:\n${itemListText}\n\nTotal: ₹${totalAmount}\nVerification OTP: ${otp}\n\nPlease confirm my order.`

      const shopOwnerNumber = process.env.SHOP_OWNER_NUMBER || '919876543210'
      const whatsappLink = `https://wa.me/${shopOwnerNumber}?text=${encodeURIComponent(messageText)}`

      return NextResponse.json({
        orderId,
        otp,
        whatsappLink
      }, { status: 201 })
    }

    // 2. Otherwise fallback to the normal logged-in user checkout
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        const userImage = await db.collection('user_images').findOne({ _id: imageId })
        if (!userImage) {
          return NextResponse.json({ error: `Image not found for ID: ${imageIdStr}` }, { status: 400 })
        }
        publicId = userImage.publicId
        // Remove imageId from customizationData
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
      orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
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

    return NextResponse.json({ 
      order: { ...order, _id: result.insertedId },
      message: 'Order placed successfully' 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}