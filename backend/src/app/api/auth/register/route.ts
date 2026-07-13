import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { signUpSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signUpSchema.parse(body)

    const { db } = await connectToDatabase()

    const existingUser = await db.collection('users').findOne({ email: validatedData.email })
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const user = {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      phone: validatedData.phone,
      role: 'CUSTOMER',
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('users').insertOne(user)

    return NextResponse.json({
      user: {
        id: result.insertedId.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: 'Account created successfully'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}