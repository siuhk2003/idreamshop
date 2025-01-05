import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'
import { validateForm } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, confirmPassword, ...rest } = body

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate all fields using the same validation as checkout
    const validationErrors = validateForm({
      firstName: rest.firstName,
      lastName: rest.lastName,
      email,
      phone: rest.phone,
      address: rest.address,
      city: rest.city,
      province: rest.province,
      postalCode: rest.postalCode
    })

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', validationErrors },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.member.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.$transaction(async (tx) => {
      await tx.member.create({
        data: {
          email,
          password: hashedPassword,
          isVerified: false,
          ...rest
        }
      })

      await tx.verificationToken.create({
        data: {
          token: verificationToken,
          email,
          expires: tokenExpiry
        }
      })
    })

    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
} 