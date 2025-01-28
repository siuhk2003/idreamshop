import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Discount code is required' },
        { status: 400 }
      )
    }

    const discountCode = await prisma.discountCode.findFirst({
      where: {
        code: code.toUpperCase(),
        active: true,
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: new Date() } }
            ]
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        ]
      }
    })

    if (!discountCode) {
      return NextResponse.json(
        { error: 'Invalid or expired discount code' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      discount: discountCode.discount
    })

  } catch (error) {
    console.error('Discount validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate discount code' },
      { status: 500 }
    )
  }
} 