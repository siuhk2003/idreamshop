import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const hasAdminToken = headersList.get('cookie')?.includes('admin-token')

    if (!hasAdminToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const product = await request.json()

    // Validate required fields
    if (!product.name || !product.price || !product.imageUrl) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Add image size validation
    const validateImage = async (imageFile: File) => {
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (imageFile.size > maxSize) {
        throw new Error('Image must be less than 5MB')
      }

      // Recommended dimensions
      const img = new Image()
      await new Promise((resolve) => {
        img.onload = resolve
        img.src = URL.createObjectURL(imageFile)
      })

      if (img.width < 800 || img.height < 800) {
        throw new Error('Image dimensions should be at least 800x800 pixels')
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      product: newProduct
    })

  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create product'
    }, { status: 500 })
  }
} 