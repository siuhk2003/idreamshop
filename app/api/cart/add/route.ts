import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import { getJwtSecretKey } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get('member-token')?.value

    // Check if user is logged in
    if (!token) {
      return NextResponse.json(
        { error: 'Please login to add items to cart' },
        { status: 401 }
      )
    }

    // Verify token and get member ID
    const verified = await jwtVerify(token, getJwtSecretKey())
    if (!verified.payload || !verified.payload.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const memberId = verified.payload.id as string
    const body = await request.json()
    const { productId, quantity } = body

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      )
    }

    // Find or create cart for the member
    let cart = await prisma.cart.findFirst({
      where: { userId: memberId }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: memberId,
          items: {
            create: {
              productId,
              quantity
            }
          }
        }
      })
    } else {
      // Check if product already exists in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId
        }
      })

      if (existingItem) {
        // Update quantity if item exists
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        })
      } else {
        // Add new item if it doesn't exist
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity
          }
        })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
} 