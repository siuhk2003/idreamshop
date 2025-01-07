import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const headersList = await headers()
    const cookieHeader = headersList.get('cookie')
    const tokenMatch = cookieHeader?.match(/member-token=([^;]+)/)
    const token = tokenMatch?.[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      const payload = await verifyAuth(token)
      const memberId = payload.id as string

      const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          address: true,
          apartment: true,
          city: true,
          province: true,
          postalCode: true,
          phone: true
        }
      })

      if (!member) {
        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        shippingInfo: member
      })

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Get shipping info error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping info' },
      { status: 500 }
    )
  }
} 