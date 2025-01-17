import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { getJwtSecretKey } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const member = await prisma.member.findUnique({
      where: { email }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (member.isLocked) {
      return NextResponse.json(
        { error: 'Account is locked. Please check your email for reactivation instructions.' },
        { status: 403 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, member.password)
    if (!passwordMatch) {
      // Increment login attempts
      const attempts = member.loginAttempts + 1
      const updates: any = {
        loginAttempts: attempts,
        lastLoginAttempt: new Date()
      }

      // Lock account if max attempts reached
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        updates.isLocked = true
        
        // Generate reactivation token
        const reactivationToken = crypto.randomBytes(32).toString('hex')
        await prisma.reactivationToken.create({
          data: {
            token: reactivationToken,
            email: member.email,
            expires: new Date(Date.now() + LOCKOUT_DURATION)
          }
        })

        // Send reactivation email
        const reactivationLink = `${process.env.NEXT_PUBLIC_APP_URL}/reactivate-account?token=${reactivationToken}`
        await sendEmail({
          to: member.email,
          subject: 'Account Locked - Reactivation Required',
          html: `
            <p>Your account has been locked due to multiple failed login attempts.</p>
            <p>Click the link below to reactivate your account:</p>
            <a href="${reactivationLink}">${reactivationLink}</a>
            <p>This link will expire in 24 hours.</p>
          `
        })
      }

      await prisma.member.update({
        where: { id: member.id },
        data: updates
      })

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Reset login attempts on successful login
    await prisma.member.update({
      where: { id: member.id },
      data: {
        loginAttempts: 0,
        lastLoginAttempt: null,
        isLocked: false
      }
    })

    // Create token with proper payload
    const token = await new SignJWT({
      id: member.id,
      email: member.email,
      role: 'member'
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(getJwtSecretKey())

    const response = NextResponse.json({ success: true })
    
    // Set cookie with proper encoding
    response.cookies.set('member-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
} 