import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { items } = await request.json()
    const outOfStock = []

    // Check each item's stock
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id }
      })

      if (!product || product.stock < item.quantity) {
        outOfStock.push({
          id: item.id,
          name: item.name,
          requestedQuantity: item.quantity,
          availableStock: product?.stock || 0
        })
      }
    }

    if (outOfStock.length > 0) {
      return NextResponse.json({
        success: false,
        outOfStock
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Stock check error:', error)
    return NextResponse.json(
      { error: 'Failed to check stock' },
      { status: 500 }
    )
  }
} 