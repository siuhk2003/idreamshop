import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session.member) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // Get member with password
    const member = await prisma.member.findUnique({
      where: { id: session.member.id },
      select: {
        id: true,
        password: true
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, member.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.member.update({
      where: { id: session.member.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
} 