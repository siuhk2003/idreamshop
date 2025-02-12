import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateForm } from '@/lib/validation'
import { sendEmail } from '@/lib/email'
import { getOrderConfirmationEmail } from '@/lib/emailTemplates'
import { CartItem } from '@/types/cart'
import { OrderStatus } from '@prisma/client'

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
    console.log('=== Starting E-Transfer Checkout ===')
    
    const body = await request.json()
    console.log('Received order data:', body)

    const { items, shippingInfo, totals } = body

    // Recalculate totals to ensure accuracy
    const subtotal = items.reduce((sum: number, item: CartItem) => 
      sum + (Number(item.price) * Number(item.quantity)), 0)
    const discount = Number(totals.discount || 0)
    const shippingCost = Number(totals.shippingCost)
    const totalBeforeTax = Number((subtotal - discount + shippingCost).toFixed(2))
    const gst = Number((totalBeforeTax * 0.05).toFixed(2))
    const pst = Number((totalBeforeTax * 0.07).toFixed(2))
    const total = Number((totalBeforeTax + gst + pst).toFixed(2))

    console.log('Verified totals:', {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      totalBeforeTax: totalBeforeTax.toFixed(2),
      gst: gst.toFixed(2),
      pst: pst.toFixed(2),
      total: total.toFixed(2)
    })

    // Process new order in transaction
    const order = await prisma.$transaction(async (tx) => {
      console.log('=== Processing Stock Updates ===')
      
      // Update stock first
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
          select: { id: true, name: true, stock: true }
        })

        if (!product) {
          throw new Error(`Product not found: ${item.id}`)
        }

        console.log('Current stock:', {
          productId: item.id,
          stock: product.stock,
          requested: item.quantity
        })

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`)
        }

        const updatedProduct = await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } }
        })

        console.log('Stock updated:', {
          productId: item.id,
          oldStock: product.stock,
          newStock: updatedProduct.stock,
          deducted: item.quantity
        })
      }

      // Create order with all details
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          status: OrderStatus.PROCESSING,
          paymentMethod: 'etransfer',
          paymentIntentId: `et_${Date.now()}`,
          
          // Use calculated totals
          subtotal,
          discount,
          shippingCost,
          totalBeforeTax,
          gst,
          pst,
          total,

          // Relations
          shippingInfo: {
            create: {
              firstName: shippingInfo.firstName,
              lastName: shippingInfo.lastName,
              email: shippingInfo.email,
              phone: shippingInfo.phone,
              address: shippingInfo.address,
              apartment: shippingInfo.apartment || '',
              city: shippingInfo.city,
              province: shippingInfo.province,
              postalCode: shippingInfo.postalCode,
              country: 'CA'
            }
          },
          items: {
            create: items.map((item: CartItem) => ({
              productId: item.id,
              quantity: item.quantity,
              price: Number(item.price)
            }))
          },
          statusHistory: {
            create: {
              status: OrderStatus.PROCESSING,
              notes: 'Order placed, awaiting e-transfer payment'
            }
          }
        },
        include: {
          shippingInfo: true,
          items: {
            include: {
              product: { select: { name: true } }
            }
          }
        }
      })

      console.log('Created order:', newOrder)
      return newOrder
    })

    // Send confirmation email with e-transfer instructions
    try {
      const emailHtml = getOrderConfirmationEmail(order)
      const etransferInstructions = `
        <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 5px;">
          <h3 style="margin-bottom: 10px;">E-Transfer Instructions</h3>
          <p>Please send the total amount of CAD$${total.toFixed(2)} to:</p>
          <p style="color: #2563eb; font-weight: 500; margin: 10px 0;">cs@idreamshop.ca</p>
          <p style="color: #4b5563; font-size: 0.875rem;">Note: Your order will be processed after payment is received.</p>
        </div>
      `

      await sendEmail({
        to: shippingInfo.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        html: emailHtml + etransferInstructions
      })
      console.log('Confirmation email sent')
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        total: order.total
      }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'E-transfer checkout failed'
    console.error('Checkout failed:', errorMessage)
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
} 