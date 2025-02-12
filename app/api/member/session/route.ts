import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    return NextResponse.json({ member: session.member || null })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ member: null })
  }
} 