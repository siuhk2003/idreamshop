import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const member = await prisma.member.findUnique({ where: { email } })

    if (!member || !bcrypt.compareSync(password, member.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const session = await getSession()
    session.member = {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email
    }
    await session.save()

    return NextResponse.json(session.member)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
} 