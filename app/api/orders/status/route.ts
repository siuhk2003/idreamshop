import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type OrderStatus = 'PROCESSING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

async function handleStatusUpdate(orderId: string, status: OrderStatus, notes: string) {
  const order = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: {
        id: orderId
      },
      data: {
        status
      },
      include: {
        items: true,
        shippingInfo: true,
        statusHistory: true
      }
    })

    await tx.statusHistory.create({
      data: {
        orderId,
        status,
        notes: notes || ''
      }
    })

    return updatedOrder
  })

  return order
}

export async function PATCH(request: Request) {
  try {
    // Get the URL from the request
    const url = new URL(request.url)
    const orderId = url.searchParams.get('id')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const order = await handleStatusUpdate(
      orderId,
      body.status as OrderStatus,
      body.notes || ''
    )

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, order })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
} 