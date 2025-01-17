import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { getJwtSecretKey, verifyAuth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('member-token')?.value

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
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('member-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      const payload = await verifyAuth(token)
      const body = await request.json()
      
      const updatedMember = await prisma.member.update({
        where: { email: payload.email as string },
        data: body,
        select: {
          email: true,
          firstName: true,
          lastName: true,
          address: true,
          apartment: true,
          city: true,
          province: true,
          postalCode: true,
          phone: true,
        }
      })

      return NextResponse.json({ 
        success: true,
        member: updatedMember 
      })

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 