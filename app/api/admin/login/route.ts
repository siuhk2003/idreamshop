import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 })
    }

    const token = await signAuth({
      id: admin.id,
      username: admin.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60
    })

    return response
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed' 
    }, { status: 500 })
  }
} 