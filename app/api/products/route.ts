import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'

    let whereClause = {}
    if (category !== 'all') {
      whereClause = { category }
    }

    // Get all products
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        styleCode: true,
        sku: true,
        name: true,
        price: true,
        originalPrice: true,
        category: true,
        imageUrl: true,
        color: true,
        stock: true,
        description: true,
        material: true
      }
    })

    return NextResponse.json({ 
      success: true,
      products
    })

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
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