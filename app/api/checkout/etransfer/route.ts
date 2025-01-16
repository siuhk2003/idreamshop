import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateForm } from '@/lib/validation'
import { sendEmail } from '@/lib/email'
import { getOrderConfirmationEmail } from '@/lib/emailTemplates'
import { CartItem } from '@/types/cart'

interface CheckoutData {
  items: CartItem[]
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    address: string
    apartment?: string
    city: string
    province: string
    postalCode: string
    country: string
    phone: string
  }
  totals: {
    subtotal: number
    shipping: number
    gst: number
    pst: number
    total: number
  }
}

export async function POST(request: Request) {
  try {
    const { items, shippingInfo, totals }: CheckoutData = await request.json()

    // Validate shipping info
    const validationErrors = validateForm(shippingInfo)
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        validationErrors
      }, { status: 400 })
    }

    // Check stock availability
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { stock: true, name: true }
      })

      if (!product || product.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          error: `Insufficient stock for ${item.name}`
        }, { status: 400 })
      }
    }

    // Create order with e-transfer payment method
    const order = await prisma.$transaction(async (tx) => {
      // Create shipping info first
      const createdShippingInfo = await tx.shippingInfo.create({
        data: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          address: shippingInfo.address,
          apartment: shippingInfo.apartment,
          city: shippingInfo.city,
          province: shippingInfo.province,
          postalCode: shippingInfo.postalCode,
          phone: shippingInfo.phone,
          country: shippingInfo.country || 'Canada'
        }
      })

      // Update stock and create order
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      }

      // Create order with the shipping info reference
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          status: 'PROCESSING',
          paymentMethod: 'etransfer',
          paymentIntentId: `et_${crypto.randomUUID()}`,
          subtotal: totals.subtotal,
          shippingCost: totals.shipping || 0,
          gst: totals.gst,
          pst: totals.pst,
          total: totals.total,
          shippingInfo: {
            connect: { id: createdShippingInfo.id }
          },
          items: {
            create: items.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true
                }
              }
            }
          },
          shippingInfo: true
        }
      })

      // Create status history
      await tx.statusHistory.create({
        data: {
          orderId: order.id,
          status: 'PROCESSING',
          notes: 'Order placed, awaiting e-transfer payment'
        }
      })

      return order
    })

    // Send confirmation email outside transaction
    try {
      await sendEmail({
        to: shippingInfo.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        html: getOrderConfirmationEmail({
          orderNumber: order.orderNumber,
          items: order.items.map(item => ({
            quantity: item.quantity,
            price: item.price,
            product: { name: item.product.name }
          })),
          shippingInfo: {
            ...order.shippingInfo,
            apartment: order.shippingInfo.apartment || undefined
          },
          subtotal: order.subtotal,
          shipping: order.shippingCost,
          gst: order.gst,
          pst: order.pst,
          total: order.total,
          paymentMethod: 'etransfer'
        })
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id
    })

  } catch (error) {
    console.error('E-transfer checkout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process e-transfer checkout'
    }, { status: 500 })
  }
} 