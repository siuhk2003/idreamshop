import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { CartItem } from '@/types/cart'
import { sendEmail } from '@/lib/email'
import { getOrderConfirmationEmail } from '@/lib/emailTemplates'

export async function POST(request: Request) {
  try {
    console.log('=== Starting Checkout API ===')
    
    const body = await request.json()
    console.log('Received order data:', body)

    const { paymentIntentId, items, shippingInfo, totals } = body

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

    // Verify payment first
    console.log('Verifying payment:', paymentIntentId)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    console.log('Payment status:', paymentIntent.status)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({
        success: false,
        error: 'Payment not successful'
      }, { status: 400 })
    }

    // Check for existing order
    const existingOrder = await prisma.order.findFirst({
      where: { paymentIntentId }
    })

    if (existingOrder) {
      console.log('Found existing order:', existingOrder.orderNumber)
      return NextResponse.json({
        success: true,
        order: {
          orderNumber: existingOrder.orderNumber,
          total: existingOrder.total
        }
      })
    }

    console.log('Creating new order...')

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
          status: 'PROCESSING',
          paymentMethod: 'stripe',
          paymentIntentId,
          
          // Use recalculated totals
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
              status: 'PROCESSING',
              notes: 'Order placed successfully'
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

    // Send confirmation email
    try {
      await sendEmail({
        to: shippingInfo.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        html: getOrderConfirmationEmail(order)
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
    // Fix error handling
    const errorMessage = error instanceof Error ? error.message : 'Checkout failed'
    console.error('Checkout failed:', errorMessage)
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
} 