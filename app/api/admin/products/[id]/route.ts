import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

type Props = {
  params: Promise<{ id: string }> | { id: string }
}

export async function PATCH(
  request: Request,
  { params }: Props
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

    let updates
    try {
      updates = await request.json()
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON data'
      }, { status: 400 })
    }

    // Validate updates
    if (updates.price && isNaN(Number(updates.price))) {
      return NextResponse.json({
        success: false,
        error: 'Price must be a number'
      }, { status: 400 })
    }

    const updateData = {
      name: updates.name,
      description: updates.description,
      price: Number(updates.price),
      wholesalePrice: updates.wholesalePrice ? Number(updates.wholesalePrice) : null,
      originalPrice: updates.category === 'clearance' 
        ? Number(updates.originalPrice) || Number(updates.price)
        : null,
      stock: Number(updates.stock),
      category: updates.category,
      imageUrl: updates.imageUrl,
      mancode: updates.mancode,
      productcost: Number(updates.productcost),
      productcharges: Number(updates.productcharges),
      remarks: updates.remarks,
      exchangeRate: Number(updates.exchangeRate),
      additionalImages: Array.isArray(updates.additionalImages) 
        ? updates.additionalImages 
        : updates.additionalImages?.split('\n').filter(Boolean).map((url: string) => url.trim()) || [],
      updatedAt: new Date()
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ 
      success: true,
      product: updatedProduct
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update product'
    }, { status: 500 })
  }
} 