import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'
import { getJwtSecretKey } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verified = await jwtVerify(token, getJwtSecretKey())
    const adminId = verified.payload.id as string

    const { currentPassword, newPassword } = await request.json()

    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
} 