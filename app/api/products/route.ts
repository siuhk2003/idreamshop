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
          category: 'new'  // Match products with category 'new'
        }
        break

      case 'clearance':
        whereClause = {
          category: 'clearance'  // Match products with category 'clearance'
        }
        break

      case 'all':
      default:
        // No filter needed for 'all'
        break
    }

    console.log('Using where clause:', JSON.stringify(whereClause, null, 2))

    // Fetch products using the same structure as home page
    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
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

    console.log(`Found ${products.length} products for category: ${category}`)

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