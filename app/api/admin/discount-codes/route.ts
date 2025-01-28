import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const headersList = await headers()
    const hasAdminToken = headersList.get('cookie')?.includes('admin-token')

    if (!hasAdminToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const codes = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, codes })
  } catch (error) {
    console.error('Error fetching discount codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discount codes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const hasAdminToken = headersList.get('cookie')?.includes('admin-token')

    if (!hasAdminToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const { code, discount, startDate, endDate } = await request.json()

    // Validate input
    if (!code || typeof discount !== 'number' || discount < 0 || discount > 100) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    const newCode = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        discount,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    return NextResponse.json({ success: true, code: newCode })
  } catch (error) {
    console.error('Error creating discount code:', error)
    return NextResponse.json(
      { error: 'Failed to create discount code' },
      { status: 500 }
    )
  }
} 