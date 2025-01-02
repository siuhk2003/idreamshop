import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { Order, OrderItem, Product } from '@prisma/client'

interface OrderWithRelations extends Order {
  items: (OrderItem & {
    product: Pick<Product, 'id' | 'name' | 'price' | 'imageUrl'>
  })[]
  shippingInfo: any
  statusHistory: any
}

export async function GET() {
  try {
    const headersList = await headers()
    const cookie = headersList.get('cookie')
    const hasAdminToken = cookie?.includes('admin-token')

    if (!hasAdminToken) {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ 
        success: false,
        orders: [],
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    console.log('Fetching orders...')

    // First, check if we have any orders
    const orderCount = await prisma.order.count()
    console.log(`Found ${orderCount} orders in database`)

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        shippingInfo: true,
        statusHistory: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('Found orders:', JSON.stringify(orders, null, 2))

    return NextResponse.json({ 
      success: true,
      orders: orders || [] 
    })

  } catch (error) {
    // Fix the error handling syntax
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ 
      success: false,
      orders: [],
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    }, { 
      status: 500 
    })
  }
}