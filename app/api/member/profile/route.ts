import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session.member) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const member = await prisma.member.findUnique({
      where: { id: session.member.id },
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
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const memberWithDefaults = {
      ...member,
      province: member.province || ''
    }

    return NextResponse.json(memberWithDefaults)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session.member) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const data = await request.json()
    const member = await prisma.member.update({
      where: { id: session.member.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        apartment: data.apartment || null,
        city: data.city,
        province: data.province || '',
        postalCode: data.postalCode,
        phone: data.phone
      },
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

    return NextResponse.json(member)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
} 