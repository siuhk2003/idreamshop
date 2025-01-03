import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getJwtSecretKey } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

    // Verify the token
    const verified = await jwtVerify(
      token,
      getJwtSecretKey()
    )

    if (!verified.payload || !verified.payload.email) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Fetch member profile from database
    const member = await prisma.member.findUnique({
      where: { email: verified.payload.email as string },
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
        country: true,
        phone: true,
        isVerified: true
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

  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const token = (await cookies()).get('member-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify the token
    const verified = await jwtVerify(
      token,
      getJwtSecretKey()
    )

    if (!verified.payload || !verified.payload.email) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updatedMember = await prisma.member.update({
      where: { email: verified.payload.email as string },
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
        country: true,
        phone: true,
      }
    })

    return NextResponse.json({ 
      success: true,
      member: updatedMember 
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 