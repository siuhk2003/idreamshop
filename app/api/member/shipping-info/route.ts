import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import { getJwtSecretKey } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get('member-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const verified = await jwtVerify(token, getJwtSecretKey())
    const memberId = verified.payload.id as string

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        apartment: true,
        city: true,
        province: true,
        postalCode: true,
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, member })
  } catch (error) {
    console.error('Get shipping info error:', error)
    return NextResponse.json(
      { error: 'Failed to get shipping information' },
      { status: 500 }
    )
  }
} 