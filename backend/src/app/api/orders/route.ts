import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { ZodError } from 'zod'
import { orderSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const { db } = await connectToDatabase()
    
    const filter: any = {}
    if (session.user.role !== 'ADMIN') {
      filter.userId = getObjectId(session.user.id)
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
    if (session.user.role === 'ADMIN') {
      const userIds = orders.map(o => o.userId)
      const users = await db.collection('users').find({ _id: { $in: userIds } }).toArray()
      const userMap = new Map(users.map(u => [u._id.toString(), u]))
      orders.forEach(o => {
        o.user = userMap.get(o.userId.toString())
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
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