import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { orderNumber, email } = await request.json()

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        shippingInfo: {
          email: {
            equals: email,
            mode: 'insensitive'  // Case-insensitive comparison
          }
        }
      },
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
        shippingInfo: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please check your order number and email address.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, order })

  } catch (error) {
    console.error('Order lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup order' },
      { status: 500 }
    )
  }
} 