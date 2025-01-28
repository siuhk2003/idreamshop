import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

interface RouteSegment {
  params: {
    id: string
  }
}

export async function DELETE(
  request: Request,
  context: RouteSegment
) {
  try {
    const headersList = await headers()
    const hasAdminToken = headersList.get('cookie')?.includes('admin-token')

    if (!hasAdminToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const params = await context.params
    const { id } = params

    await prisma.shippingRate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting shipping rate:', error)
    return NextResponse.json(
      { error: 'Failed to delete shipping rate' },
      { status: 500 }
    )
  }
} 