import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(
  request: Request,
  context: RouteParams
) {
  try {
    const headersList = await headers()
    const hasAdminToken = headersList.get('cookie')?.includes('admin-token')

    if (!hasAdminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get params and await it
    const params = await context.params
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const data = await request.json()
    
    // Remove id from data object to prevent Prisma error
    const { id: _, createdAt, updatedAt, OrderItem, ...updateData } = data

    // Convert wholesaleCo to string or null
    const wholesaleCo = data.wholesaleCo !== undefined ? String(data.wholesaleCo) : null

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        wholesaleCo,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        wholesalePrice: data.wholesalePrice ? parseFloat(data.wholesalePrice) : null,
        stock: parseInt(data.stock),
        productcost: parseFloat(data.productcost),
        productcharges: parseFloat(data.productcharges),
        exchangeRate: parseFloat(data.exchangeRate),
        version: { increment: 1 }
      }
    })

    return NextResponse.json({ success: true, product })

  } catch (error) {
    if (error instanceof Error) {
      console.error('Product update error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: RouteParams
) {
  try {
    const headersList = await headers()
    const hasAdminToken = headersList.get('cookie')?.includes('admin-token')

    if (!hasAdminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get params and await it
    const params = await context.params
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Product delete error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
} 