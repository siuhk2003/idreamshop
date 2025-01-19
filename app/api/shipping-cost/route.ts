import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const items = parseInt(searchParams.get('items') || '0')
    const province = searchParams.get('province')

    if (!province) {
      return NextResponse.json(
        { error: 'Province is required' },
        { status: 400 }
      )
    }

    const rate = await prisma.shippingRate.findFirst({
      where: {
        AND: [
          { province },
          { minItems: { lte: items } },
          {
            OR: [
              { maxItems: { gte: items } },
              { maxItems: null }
            ]
          }
        ]
      },
      orderBy: { minItems: 'desc' }
    })

    return NextResponse.json({ 
      success: true, 
      cost: rate?.cost || 0 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate shipping cost' },
      { status: 500 }
    )
  }
} 