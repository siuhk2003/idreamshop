import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const { status, notes, revertStock } = await request.json()

    // Update order status and handle stock reversion in a transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Get the order with items before updating
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      if (!currentOrder) {
        throw new Error('Order not found')
      }

      // Update order status
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          items: {
            include: {
              product: true
            }
          },
          shippingInfo: true,
          statusHistory: true
        }
      })

      // Create status history entry
      await tx.statusHistory.create({
        data: {
          orderId,
          status,
          notes: notes || `Status updated to ${status}`
        }
      })

      // If cancelling order, revert stock
      if (revertStock) {
        for (const item of currentOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          })
        }
      }

      return order
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order status'
      },
      { status: 500 }
    )
  }
} 