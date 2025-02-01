import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
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