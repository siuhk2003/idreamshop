import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rates = await prisma.shippingRate.findMany({
      orderBy: [
        { province: 'asc' },
        { minItems: 'asc' }
      ]
    })
    return NextResponse.json({ success: true, rates })
  } catch (error) {
    console.error('Error fetching shipping rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping rates' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Update validation to check if values are defined rather than truthy
    if (
      typeof data.minItems !== 'number' || 
      typeof data.cost !== 'number' || 
      !data.province
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const shippingRate = await prisma.shippingRate.create({
      data: {
        minItems: data.minItems,
        maxItems: data.maxItems || null,
        cost: data.cost,
        province: data.province
      }
    })

    return NextResponse.json({
      success: true,
      rate: shippingRate
    })
  } catch (error) {
    console.error('Error creating shipping rate:', error)
    return NextResponse.json(
      { error: 'Failed to create shipping rate' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Rate ID is required' },
        { status: 400 }
      )
    }

    await prisma.shippingRate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting shipping rate:', error)
    return NextResponse.json(
      { error: 'Failed to delete shipping rate' },
      { status: 500 }
    )
  }
} 