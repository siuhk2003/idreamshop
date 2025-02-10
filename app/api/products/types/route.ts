import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all unique product types and their counts
    const types = await prisma.product.groupBy({
      by: ['producttype'],
      where: {
        display: 'Yes',
        producttype: {
          not: null
        }
      },
      _count: true
    })

    // Format the response
    const formattedTypes = types
      .filter(t => t.producttype) // Remove null types
      .map(t => ({
        type: t.producttype as string, // Assert type as string since we filtered nulls
        count: t._count
      }))
      .sort((a, b) => (a.type || '').localeCompare(b.type || ''))

    return NextResponse.json({
      success: true,
      types: formattedTypes
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch product types'
    }, { status: 500 })
  }
} 