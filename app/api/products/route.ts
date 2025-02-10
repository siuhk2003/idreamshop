import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const type = searchParams.get('type') || 'all'
    const isAdmin = searchParams.get('isAdmin') === 'true'

    let whereClause: any = {
      // Only show products with display = 'Yes' unless it's an admin request
      ...(isAdmin ? {} : { display: 'Yes' }),
      // Add category filter if specified
      ...(category !== 'all' ? { category } : {}),
      // Add type filter if specified
      ...(type !== 'all' ? { producttype: type } : {})
    }

    // Get all products
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        wholesalePrice: true,
        imageUrl: true,
        category: true,
        stock: true,
        color: true,
        material: true,
        styleCode: true,
        sku: true,
        mancode: true,
        productcost: true,
        productcharges: true,
        remarks: true,
        additionalImages: true,
        createdAt: true,
        updatedAt: true,
        exchangeRate: true,
        wholesaleCo: true,
        producttype: true,
        display: true
      }
    })

    return NextResponse.json({ 
      success: true,
      products
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch products'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const product = await prisma.product.create({
      data: json
    })
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 