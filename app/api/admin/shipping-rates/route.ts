import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const rates = await prisma.shippingRate.findMany({
      orderBy: { minItems: 'asc' }
    })

    return NextResponse.json({ 
      success: true, 
      rates 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shipping rates' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const hasAdminToken = cookieStore.has('admin-token')

    if (!hasAdminToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const data = await request.json()
    const rate = await prisma.shippingRate.create({
      data: {
        minItems: data.minItems,
        maxItems: data.maxItems,
        cost: data.cost
      }
    })

    return NextResponse.json({ success: true, rate })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create shipping rate' },
      { status: 500 }
    )
  }
} 