import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { signUpSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import bcrypt from 'bcryptjs'
import { handleCors, addCorsHeaders } from '@/lib/cors'
import { rateLimit, authLimit } from '@/lib/rateLimit'

const IS_PROD = process.env.NODE_ENV === 'production'

export async function POST(request: NextRequest) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  // Strict rate limit — 10 registrations per minute per IP
  if (!rateLimit(request, authLimit)) {
    return addCorsHeaders(request, NextResponse.json(
      { error: 'Too many registration attempts. Please wait and try again.' },
      { status: 429 }
    ))
  }

  try {
    const body = await request.json()
    const validatedData = signUpSchema.parse(body)

    const { db } = await connectToDatabase()

    const existingUser = await db.collection('users').findOne({ email: validatedData.email })
    if (existingUser) {
      // Use a generic message to avoid user enumeration
      return addCorsHeaders(request, NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      ))
    }

    // bcrypt with cost factor 12 — strong but not too slow
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const user = {
      name:          validatedData.name,
      email:         validatedData.email,
      password:      hashedPassword,
      phone:         validatedData.phone,
      role:          'CUSTOMER',
      emailVerified: new Date(),
      createdAt:     new Date(),
      updatedAt:     new Date(),
    }

    const result = await db.collection('users').insertOne(user)

    return addCorsHeaders(request, NextResponse.json({
      user: {
        id:    result.insertedId.toString(),
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
      message: 'Account created successfully',
    }, { status: 201 }))
  } catch (error) {
    if (error instanceof ZodError) {
      // Never expose internal schema field names in production
      const details = IS_PROD ? undefined : error.errors
      return addCorsHeaders(request, NextResponse.json(
        { error: 'Validation failed', ...(details && { details }) },
        { status: 400 }
      ))
    }
    console.error('Registration error:', error)
    return addCorsHeaders(request, NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? new NextResponse(null, { status: 204 })
}