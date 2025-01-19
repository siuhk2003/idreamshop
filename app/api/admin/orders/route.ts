import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        },
        shippingInfo: true,
        statusHistory: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to ensure all numeric fields are properly typed
    const transformedOrders = orders.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),  // Ensure shipping cost is a number
      gst: Number(order.gst),
      pst: Number(order.pst),
      total: Number(order.total),
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity)
      }))
    }))

    return NextResponse.json({
      success: true,
      orders: transformedOrders
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}