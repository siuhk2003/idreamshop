import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 4

export async function GET() {
  try {
    return NextResponse.json(
      { 
        status: 'ok',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { status: 'error' },
      { status: 503 }
    )
  }
} 