import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopuncle'
const dbName = process.env.MONGODB_DB || 'shopuncle'

async function seed() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)

  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  await db.collection('users').updateOne(
    { email: 'admin@shopuncle.com' },
    { $set: {
      email: 'admin@shopuncle.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }},
    { upsert: true }
  )
  console.log('✅ Admin user created: admin@shopuncle.com / admin123')

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 12)
  await db.collection('users').updateOne(
    { email: 'customer@shopuncle.com' },
    { $set: {
      email: 'customer@shopuncle.com',
      name: 'Test Customer',
      password: customerPassword,
      role: 'USER',
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }},
    { upsert: true }
  )
  console.log('✅ Test customer created: customer@shopuncle.com / customer123')

  // Create categories
  const categories = [
    { name: 'Photo Frames', slug: 'photo-frames', description: 'Beautiful frames for your cherished memories', image: '/categories/frames.jpg' },
    { name: 'Personalized Gifts', slug: 'personalized-gifts', description: 'Custom gifts made with your photos and messages', image: '/categories/personalized.jpg' },
    { name: 'Custom Mugs', slug: 'mugs', description: 'Personalized coffee mugs and tea cups', image: '/categories/mugs.jpg' },
    { name: 'Canvas Prints', slug: 'canvas-prints', description: 'Premium canvas wall art for your home', image: '/categories/canvas.jpg' },
    { name: 'Keychains', slug: 'keychains', description: 'Custom photo keychains and accessories', image: '/categories/keychains.jpg' },
    { name: 'Photo Books', slug: 'photo-books', description: 'Custom photo books and albums', image: '/categories/photobooks.jpg' },
  ]

  for (const cat of categories) {
    await db.collection('categories').updateOne(
      { slug: cat.slug },
      { $set: { ...cat, createdAt: new Date(), updatedAt: new Date() } },
      { upsert: true }
    )
  }
  console.log('✅ Categories created')

  const framesCategory = await db.collection('categories').findOne({ slug: 'photo-frames' })
  const personalizedCategory = await db.collection('categories').findOne({ slug: 'personalized-gifts' })

  // Create frame options
  const frameOptions = [
    {
      name: 'Premium Dark Wood Frame',
      description: 'Rich dark wood frame with tabletop support',
      thumbnailUrl: '/frames/dark-wood.jpg',
      modelUrl: '/models/classic-wood.glb',
      textureUrl: '/textures/wood-walnut.jpg',
      basePrice: 1299,
      sizes: [
        { size: '5x7', price: 1299, dimensions: { width: 15, height: 20, depth: 2.5 } },
        { size: '8x10', price: 1899, dimensions: { width: 20, height: 25, depth: 2.5 } },
        { size: '11x14', price: 2499, dimensions: { width: 28, height: 35, depth: 3 } },
        { size: '16x20', price: 3499, dimensions: { width: 40, height: 50, depth: 3 } },
      ],
      materials: [
        { name: 'Walnut', textureUrl: '/textures/wood-walnut.jpg', priceModifier: 0 },
        { name: 'Oak', textureUrl: '/textures/wood-oak.jpg', priceModifier: 200 },
        { name: 'Mahogany', textureUrl: '/textures/wood-mahogany.jpg', priceModifier: 400 },
      ],
      isActive: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Modern Black Frame',
      description: 'Sleek matte black gallery frame style',
      thumbnailUrl: '/frames/modern-black.jpg',
      modelUrl: '/models/modern-metal.glb',
      textureUrl: '/textures/metal-black.jpg',
      basePrice: 1599,
      sizes: [
        { size: '5x7', price: 1599, dimensions: { width: 15, height: 20, depth: 1.5 } },
        { size: '8x10', price: 2199, dimensions: { width: 20, height: 25, depth: 1.5 } },
        { size: '11x14', price: 2999, dimensions: { width: 28, height: 35, depth: 2 } },
        { size: '16x20', price: 3999, dimensions: { width: 40, height: 50, depth: 2 } },
      ],
      materials: [
        { name: 'Matte Black', textureUrl: '/textures/metal-black.jpg', priceModifier: 0 },
        { name: 'Brushed Silver', textureUrl: '/textures/metal-silver.jpg', priceModifier: 200 },
        { name: 'Rose Gold', textureUrl: '/textures/metal-rose-gold.jpg', priceModifier: 400 },
      ],
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Ornate Gold Frame',
      description: 'Classic gold ornate frame border style',
      thumbnailUrl: '/frames/gold-ornate.jpg',
      modelUrl: '/models/acrylic-float.glb',
      textureUrl: '/textures/metal-gold.jpg',
      basePrice: 1999,
      sizes: [
        { size: '5x7', price: 1999, dimensions: { width: 15, height: 20, depth: 2 } },
        { size: '8x10', price: 2699, dimensions: { width: 20, height: 25, depth: 2 } },
        { size: '11x14', price: 3499, dimensions: { width: 28, height: 35, depth: 2.5 } },
        { size: '16x20', price: 4499, dimensions: { width: 40, height: 50, depth: 3 } },
      ],
      materials: [
        { name: 'Gold', textureUrl: '/textures/metal-gold.jpg', priceModifier: 0 },
        { name: 'Rose Gold', textureUrl: '/textures/metal-rose-gold.jpg', priceModifier: 300 },
      ],
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  for (const frame of frameOptions) {
    await db.collection('frame_options').updateOne(
      { name: frame.name },
      { $set: frame },
      { upsert: true }
    )
  }
  console.log('✅ Frame options created')

  // Create products
  const products = [
    {
      name: 'Classic Wood Photo Frame',
      slug: 'classic-wood-frame',
      description: 'Elegant wooden frame crafted from premium oak wood. Perfect for displaying your favorite memories with a timeless touch. Available in multiple sizes and wood finishes.',
      shortDescription: 'Premium oak wood frame with multiple finish options',
      price: 1299,
      compareAtPrice: 1799,
      images: ['/products/frame-1.jpg', '/products/frame-1-2.jpg', '/products/frame-1-3.jpg'],
      categoryId: framesCategory._id,
      isCustomizable: true,
      isFeatured: true,
      isActive: true,
      tags: ['wood', 'classic', 'customizable'],
      stock: 50,
      trackInventory: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Modern Metal Photo Frame',
      slug: 'modern-metal-frame',
      description: 'Sleek and contemporary metal frame with brushed finish. Minimalist design that complements any decor style. Available in multiple metallic finishes.',
      shortDescription: 'Sleek metal frame with multiple finish options',
      price: 1599,
      compareAtPrice: 2199,
      images: ['/products/frame-2.jpg', '/products/frame-2-2.jpg', '/products/frame-2-3.jpg'],
      categoryId: framesCategory._id,
      isCustomizable: true,
      isFeatured: true,
      isActive: true,
      tags: ['metal', 'modern', 'customizable'],
      stock: 30,
      trackInventory: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Acrylic Float Frame',
      slug: 'acrylic-float-frame',
      description: 'Premium acrylic frame with floating effect. Crystal clear acrylic gives your photos a modern, gallery-like appearance. Perfect for professional photography.',
      shortDescription: 'Crystal clear acrylic float frame for gallery-style display',
      price: 1999,
      compareAtPrice: 2699,
      images: ['/products/frame-3.jpg', '/products/frame-3-2.jpg', '/products/frame-3-3.jpg'],
      categoryId: framesCategory._id,
      isCustomizable: true,
      isFeatured: false,
      isActive: true,
      tags: ['acrylic', 'float', 'premium', 'customizable'],
      stock: 25,
      trackInventory: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Custom Photo Mug',
      slug: 'custom-photo-mug',
      description: 'Personalized ceramic mug with your favorite photo. High-quality sublimation printing ensures vibrant colors that last. Dishwasher and microwave safe.',
      shortDescription: 'Personalized ceramic mug with photo',
      price: 499,
      compareAtPrice: 699,
      images: ['/products/mug-1.jpg', '/products/mug-1-2.jpg'],
      categoryId: personalizedCategory._id,
      isCustomizable: false,
      isFeatured: true,
      isActive: true,
      tags: ['mug', 'personalized', 'gift'],
      stock: 100,
      trackInventory: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Custom Canvas Print',
      slug: 'canvas-print',
      description: 'Premium canvas wall art printed with archival inks. Stretched over solid wood frame. Ready to hang. Perfect for turning photos into art.',
      shortDescription: 'Premium canvas wall art with archival inks',
      price: 1499,
      compareAtPrice: 1999,
      images: ['/products/canvas-1.jpg', '/products/canvas-1-2.jpg'],
      categoryId: personalizedCategory._id,
      isCustomizable: false,
      isFeatured: true,
      isActive: true,
      tags: ['canvas', 'wall-art', 'personalized'],
      stock: 40,
      trackInventory: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Custom Photo Keychain',
      slug: 'photo-keychain',
      description: 'Personalized acrylic keychain with your photo. Lightweight and durable. Perfect gift for loved ones. Double-sided printing available.',
      shortDescription: 'Personalized acrylic keychain with photo',
      price: 299,
      compareAtPrice: 399,
      images: ['/products/keychain-1.jpg', '/products/keychain-1-2.jpg'],
      categoryId: personalizedCategory._id,
      isCustomizable: false,
      isFeatured: false,
      isActive: true,
      tags: ['keychain', 'personalized', 'gift', 'acrylic'],
      stock: 200,
      trackInventory: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  for (const product of products) {
    await db.collection('products').updateOne(
      { slug: product.slug },
      { $set: { ...product, createdAt: new Date(), updatedAt: new Date() } },
      { upsert: true }
    )
  }
  console.log('✅ Products created')

  // Link frame options to products
  const classicWoodProduct = await db.collection('products').findOne({ slug: 'classic-wood-frame' })
  if (classicWoodProduct) {
    await db.collection('frame_options').updateMany(
      { name: 'Premium Dark Wood Frame' },
      { $set: { productId: classicWoodProduct._id } }
    )
  }

  const modernMetalProduct = await db.collection('products').findOne({ slug: 'modern-metal-frame' })
  if (modernMetalProduct) {
    await db.collection('frame_options').updateMany(
      { name: 'Modern Black Frame' },
      { $set: { productId: modernMetalProduct._id } }
    )
  }

  const acrylicFloatProduct = await db.collection('products').findOne({ slug: 'acrylic-float-frame' })
  if (acrylicFloatProduct) {
    await db.collection('frame_options').updateMany(
      { name: 'Ornate Gold Frame' },
      { $set: { productId: acrylicFloatProduct._id } }
    )
  }
  console.log('✅ Linked frame options to products')

  // Create coupons
  await db.collection('coupons').updateOne(
    { code: 'WELCOME10' },
    { $set: {
      code: 'WELCOME10',
      description: '10% off on first order',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 500,
      maxDiscount: 500,
      usageLimit: 1000,
      usedCount: 0,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }},
    { upsert: true }
  )

  await db.collection('coupons').updateOne(
    { code: 'FREESHIP' },
    { $set: {
      code: 'FREESHIP',
      description: 'Free shipping on orders above ₹999',
      discountType: 'FIXED_AMOUNT',
      discountValue: 99,
      minOrderValue: 999,
      usageLimit: 5000,
      usedCount: 0,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }},
    { upsert: true }
  )

  await db.collection('coupons').updateOne(
    { code: 'SAVE20' },
    { $set: {
      code: 'SAVE20',
      description: 'Flat ₹200 off on orders above ₹2000',
      discountType: 'FIXED_AMOUNT',
      discountValue: 200,
      minOrderValue: 2000,
      usageLimit: 200,
      usedCount: 0,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }},
    { upsert: true }
  )
  console.log('✅ Coupons created')

  // Site settings
  await db.collection('site_settings').updateOne(
    { key: 'store_info' },
    { $set: {
      key: 'store_info',
      value: {
        name: 'ShopUncle',
        tagline: 'Personalized Gifts & Photo Frames',
        phone: '+91 98765 43210',
        email: 'support@shopuncle.com',
        address: '123 Gift Street, Mumbai, Maharashtra 400001',
        gstin: '27AAAAA0000A1Z5',
      },
      description: 'Store information and contact details',
    }},
    { upsert: true }
  )

  await db.collection('site_settings').updateOne(
    { key: 'shipping' },
    { $set: {
      key: 'shipping',
      value: {
        freeShippingThreshold: 999,
        standardShippingCost: 99,
        expressShippingCost: 199,
        codAvailable: true,
        codCharges: 50,
        estimatedDelivery: {
          standard: '3-5 business days',
          express: '1-2 business days',
        },
      },
      description: 'Shipping configuration',
    }},
    { upsert: true }
  )

  await db.collection('site_settings').updateOne(
    { key: 'payment' },
    { $set: {
      key: 'payment',
      value: {
        razorpayEnabled: true,
        stripeEnabled: false,
        codEnabled: true,
        upiEnabled: true,
        netbankingEnabled: true,
        walletEnabled: true,
        emiEnabled: true,
      },
      description: 'Payment gateway configuration',
    }},
    { upsert: true }
  )
  console.log('✅ Site settings created')

  console.log('🎉 Database seeding completed successfully!')
  await client.close()
}

seed().catch(console.error)