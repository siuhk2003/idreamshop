import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { verifyAuth } from '@/lib/auth'

export async function GET() {
  try {
    const headersList = await headers()
    const cookieHeader = headersList.get('cookie')
    const tokenMatch = cookieHeader?.match(/member-token=([^;]+)/)
    const token = tokenMatch?.[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Please login to view orders' },
        { status: 401 }
      )
    }

    try {
      const payload = await verifyAuth(token)

      // First find all shipping infos for this email
      const shippingInfos = await prisma.shippingInfo.findMany({
        where: {
          email: payload.email as string
        },
        select: {
          id: true
        }
      })

      const shippingInfoIds = shippingInfos.map(info => info.id)

      // Then find orders using those shipping info IDs
      const orders = await prisma.order.findMany({
        where: {
          shippingInfo: {
            id: {
              in: shippingInfoIds
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
          shippingInfo: true
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
      if (error instanceof Error && error.message === 'Invalid token') {
        return NextResponse.json(
          { error: 'Please login again' },
          { status: 401 }
        )
      }
      throw error
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
} 