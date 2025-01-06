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
      // Update stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          status: 'PROCESSING',
          paymentIntentId: `et_${crypto.randomUUID()}`,
          subtotal: totals.subtotal,
          gst: totals.gst,
          pst: totals.pst,
          total: totals.total,
          items: {
            create: items.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price
            }))
          },
          shippingInfo: {
            create: {
              ...shippingInfo,
              country: shippingInfo.country || 'Canada'
            }
          },
          statusHistory: {
            create: {
              status: 'PROCESSING',
              notes: 'Order placed, awaiting e-transfer payment'
            }
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

      // Send confirmation email
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
            shippingInfo: shippingInfo,
            subtotal: order.subtotal,
            gst: order.gst,
            pst: order.pst,
            total: order.total,
            paymentMethod: 'etransfer'
          })
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
      }

      return order
    })

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