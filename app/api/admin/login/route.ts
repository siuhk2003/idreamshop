import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signAuth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 })
    }

    // Create token with just the username
    const token = await signAuth({
      username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed' 
    }, { status: 500 })
  }
} 