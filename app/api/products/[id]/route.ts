import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('isAdmin') === 'true'

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        // Only show product if display is 'Yes' or if it's an admin request
        ...(isAdmin ? {} : { display: 'Yes' })
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get variants (products with same styleCode)
    const variants = await prisma.product.findMany({
      where: {
        styleCode: product.styleCode,
        id: { not: product.id }
      }
    })

    return NextResponse.json({ 
      success: true, 
      product,
      variants 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
} 