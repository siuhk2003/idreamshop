import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    console.log('Received request for category:', category)

    let whereClause = {}

    // Handle different categories
    switch (category) {
      case 'new':
        whereClause = {
          category: 'new'
        }
        break

      case 'clearance':
        whereClause = {
          category: 'clearance'
        }
        break

      case 'all':
      default:
        break
    }

    const products = await prisma.product.findMany({
      where: whereClause,
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
        createdAt: true,
        color: true,
        material: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('API Response:', {
      success: true,
      products: products.length,
      firstProduct: products[0]
    })

    return NextResponse.json({ 
      success: true,
      products 
    })

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') 
          : undefined
      },
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