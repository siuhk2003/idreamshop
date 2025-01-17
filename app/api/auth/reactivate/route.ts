import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json()

    const reactivationToken = await prisma.reactivationToken.findUnique({
      where: { token }
    })

    if (!reactivationToken || reactivationToken.expires < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired reactivation token' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.$transaction([
      // Update member
      prisma.member.update({
        where: { email: reactivationToken.email },
        data: {
          password: hashedPassword,
          loginAttempts: 0,
          isLocked: false,
          lastLoginAttempt: null
        }
      }),
      // Delete the used token
      prisma.reactivationToken.delete({
        where: { token }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Account reactivated successfully'
    })

  } catch (error) {
    console.error('Reactivation error:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate account' },
      { status: 500 }
    )
  }
} 