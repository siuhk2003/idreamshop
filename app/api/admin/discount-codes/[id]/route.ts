import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAdmin } from '@/lib/auth'

interface RouteSegment {
  params: {
    id: string
  }
}

export async function PATCH(
  request: Request,
  context: RouteSegment
) {
  try {
    // Validate admin access
    const adminValidation = await validateAdmin(request)
    if (!adminValidation.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = context.params
    const { active } = await request.json()

    const updatedCode = await prisma.discountCode.update({
      where: { id },
      data: { active }
    })

    return NextResponse.json({ success: true, code: updatedCode })
  } catch (error) {
    console.error('Error updating discount code:', error)
    return NextResponse.json(
      { error: 'Failed to update discount code' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: RouteSegment
) {
  try {
    // Validate admin access
    const adminValidation = await validateAdmin(request)
    if (!adminValidation.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = context.params

    await prisma.discountCode.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting discount code:', error)
    return NextResponse.json(
      { error: 'Failed to delete discount code' },
      { status: 500 }
    )
  }
} 