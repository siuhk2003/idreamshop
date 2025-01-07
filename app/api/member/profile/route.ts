import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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
      const memberEmail = payload.email as string

      const member = await prisma.member.findUnique({
        where: { email: memberEmail },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
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
        member
      })

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
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