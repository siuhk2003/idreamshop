import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { OrderStatus, Prisma } from '@prisma/client'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = await headers()
    const hasAdminToken = headersList.get('cookie')?.includes('admin-token')
    const { id } = await params

    if (!hasAdminToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Check if order is already cancelled
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true }
    })

    if (existingOrder?.status === OrderStatus.CANCELLED) {
      return NextResponse.json({ 
        success: false,
        error: 'Cannot modify cancelled orders'
      }, { status: 400 })
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body'
      }, { status: 400 })
    }

    if (!body?.status) {
      return NextResponse.json({
        success: false,
        error: 'Status is required'
      }, { status: 400 })
    }

    const { status } = body

    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status'
      }, { status: 400 })
    }

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { 
          status: status as OrderStatus 
        }
      }),
      prisma.statusHistory.create({
        data: {
          orderId: id,
          status: status as OrderStatus,
          notes: `Status updated to ${status}`
        }
      })
    ])

    return NextResponse.json({ 
      success: true,
      order: updatedOrder
    })

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ 
        success: false,
        error: `Database error: ${error.code}`
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: false,
      error: 'Failed to update status'
    }, { status: 500 })
  }
} 