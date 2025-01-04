import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const headersList = await headers()
    const hasAdminToken = headersList.get('cookie')?.includes('admin-token')

    if (!hasAdminToken) {
      return NextResponse.json({ 
        success: false,
        orders: [],
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        subtotal: true,
        gst: true,
        pst: true,
        total: true,
        items: {
          select: {
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        shippingInfo: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            address: true,
            city: true,
            province: true,
            postalCode: true,
            phone: true
          }
        },
        statusHistory: {
          select: {
            status: true,
            timestamp: true,
            notes: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true,
      orders: orders.map(order => ({
        ...order,
        createdAt: order.createdAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ 
      success: false,
      orders: [],
      error: error instanceof Prisma.PrismaClientKnownRequestError 
        ? `Database error: ${error.code}`
        : 'Failed to fetch orders'
    }, { status: 500 })
  }
}