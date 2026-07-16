import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase, getObjectId } from '@/lib/mongodb'
import { parseCSV } from '@/lib/csv'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    // 1. Check Auth (only ADMIN role allowed)
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { csvText } = await request.json()
    if (!csvText) {
      return NextResponse.json({ error: 'CSV data is required' }, { status: 400 })
    }

    const parsedRecords = parseCSV(csvText)
    if (parsedRecords.length === 0) {
      return NextResponse.json({ error: 'No valid rows found in CSV' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Cache categories to avoid redundant queries
    const categoriesList = await db.collection('categories').find({}).toArray()
    const categoryMap = new Map<string, ObjectId>()
    categoriesList.forEach(c => {
      categoryMap.set(c.slug, c._id)
      categoryMap.set(c.name.toLowerCase(), c._id)
    })

    const bulkOps: any[] = []
    const errors: string[] = []
    let processedCount = 0

    for (let index = 0; index < parsedRecords.length; index++) {
      const record = parsedRecords[index]
      const rowNum = index + 2 // 1-based index + header row

      // Basic validations
      const name = record.name || record.productname || record.title
      if (!name) {
        errors.push(`Row ${rowNum}: Name is missing.`)
        continue
      }

      const price = parseFloat(record.price || '0')
      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${rowNum}: Price must be a positive number.`)
        continue
      }

      const compareAtPrice = parseFloat(record.compareatprice || record.compareprice || '0')
      const stock = parseInt(record.stock || record.inventory || '0')
      const isCustomizable = record.iscustomizable === 'true' || record.customizable === 'true' || record.customizable === '1'
      const isActive = record.isactive !== 'false' && record.active !== 'false' && record.active !== '0'
      const isFeatured = record.isfeatured === 'true' || record.featured === 'true' || record.featured === '1'
      const sku = record.sku || record.productsku || null
      const description = record.description || record.body || `Premium ${name}`
      const shortDescription = record.shortdescription || record.summary || null

      // Resolve category
      const categoryVal = (record.category || record.categoryslug || record.categoryname || '').trim()
      let categoryId: ObjectId | null = null

      if (categoryVal) {
        const slugifiedCategory = categoryVal.toLowerCase().replace(/\s+/g, '-')
        if (categoryMap.has(slugifiedCategory)) {
          categoryId = categoryMap.get(slugifiedCategory)!
        } else if (categoryMap.has(categoryVal.toLowerCase())) {
          categoryId = categoryMap.get(categoryVal.toLowerCase())!
        } else {
          // Dynamic category creation
          const now = new Date()
          const newCategory = {
            name: categoryVal,
            slug: slugifiedCategory,
            description: `Auto-created category for ${categoryVal}`,
            image: '',
            createdAt: now,
            updatedAt: now,
          }
          try {
            const catInsert = await db.collection('categories').insertOne(newCategory)
            categoryId = catInsert.insertedId
            categoryMap.set(slugifiedCategory, categoryId)
            categoryMap.set(categoryVal.toLowerCase(), categoryId)
          } catch (catErr) {
            console.error('Failed to auto-create category:', catErr)
          }
        }
      }

      // Images formatting
      const rawImages = record.images || record.imageurls || record.image || ''
      const images = rawImages
        ? rawImages.split(/[,;|]/).map((img: string) => img.trim()).filter((img: string) => img.startsWith('http'))
        : []

      if (images.length === 0) {
        // Default placeholder if no image provided
        images.push('/products/placeholder.jpg')
      }

      // Tags formatting
      const rawTags = record.tags || record.producttags || ''
      const tags = rawTags
        ? rawTags.split(/[,;|]/).map((tag: string) => tag.trim().toLowerCase()).filter(Boolean)
        : []

      // Slug formatting
      const slug = record.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      const productDoc: any = {
        name,
        slug,
        description,
        shortDescription,
        price,
        compareAtPrice: compareAtPrice > 0 ? compareAtPrice : null,
        sku,
        categoryId: categoryId || new ObjectId('65f123456789012345678901'), // Fallback fallback if completely uncategorized
        images,
        isCustomizable,
        isActive,
        isFeatured,
        tags,
        stock,
        trackInventory: true,
        updatedAt: new Date()
      }

      // MongoDB bulk upsert by SKU (if provided) or slug
      const filter = sku ? { sku } : { slug }
      
      bulkOps.push({
        updateOne: {
          filter,
          update: {
            $set: productDoc,
            $setOnInsert: { createdAt: new Date() }
          },
          upsert: true
        }
      })

      processedCount++
    }

    if (bulkOps.length > 0) {
      await db.collection('products').bulkWrite(bulkOps, { ordered: false })
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errors.length > 0 ? errors : null,
      message: `Bulk import completed. Successfully processed ${processedCount} products.`
    }, { status: 200 })

  } catch (error: any) {
    console.error('Bulk upload products error:', error)
    return NextResponse.json({ error: error.message || 'Failed to bulk import products' }, { status: 500 })
  }
}
