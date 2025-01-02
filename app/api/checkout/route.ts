import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { CartItem } from '@/types/cart'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: Request) {
  try {
    const { items, shippingInfo, paymentIntentId, totals } = await request.json()
    console.log('=== Starting Checkout Process ===')
    console.log('Received items:', JSON.stringify(items, null, 2))
    console.log('Payment Intent ID:', paymentIntentId)

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    console.log('Payment Intent Status:', paymentIntent.status)
    
    if (paymentIntent.status !== 'succeeded') {
      console.log('Payment not successful, status:', paymentIntent.status)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment not successful'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.log('=== Starting Stock Update Transaction ===')
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedProducts = []
      
      // First check and update stock
      for (const item of items) {
        console.log(`Processing item: ${item.id}, Quantity: ${item.quantity}`)
        
        // 1. First check if product exists and get current stock
        const product = await tx.product.findUnique({
          where: { id: item.id },
          select: {
            id: true,
            name: true,
            stock: true
          }
        })

        if (!product) {
          throw new Error(`Product ${item.id} not found`)
        }

        // 2. Check if enough stock is available
        console.log(`Found product: ${product.name}`)
        console.log(`Current stock: ${product.stock}`)
        console.log(`Requested quantity: ${item.quantity}`)

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`)
        }

        // 3. Update the stock by decrementing it
        const updatedProduct = await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity  // This reduces the stock by the ordered quantity
            }
          },
          select: {
            id: true,
            name: true,
            stock: true
          }
        })

        console.log(`Stock updated for ${updatedProduct.name}:`)
        console.log(`Previous stock: ${product.stock}`)
        console.log(`New stock: ${updatedProduct.stock}`)
        
        updatedProducts.push(updatedProduct)
      }

      console.log('=== Creating Order ===')
      console.log('Order data:', {
        orderNumber: `ORD-${Date.now()}`,
        status: 'PROCESSING',
        totals,
        items: items.map((item: CartItem) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingInfo
      })

      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          status: 'PROCESSING',
          subtotal: totals.subtotal,
          gst: totals.gst,
          pst: totals.pst,
          total: totals.total,
          paymentIntentId,
          items: {
            create: items.map((item: CartItem) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price
            }))
          },
          shippingInfo: {
            create: {
              ...shippingInfo,
              country: shippingInfo.country || 'Canada' // Ensure country is set
            }
          },
          statusHistory: {
            create: {
              status: 'PROCESSING',
              notes: 'Order placed successfully'
            }
          }
        },
        include: {
          items: true,
          shippingInfo: true,
          statusHistory: true
        }
      })

      console.log('Created order with relations:', JSON.stringify(order, null, 2))

      return { order, updatedProducts }
    })

    console.log('=== Transaction Completed Successfully ===')
    console.log('Order ID:', result.order.id)

    return new Response(
      JSON.stringify({
        success: true,
        orderId: result.order.id,
        updatedProducts: result.updatedProducts
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('=== Checkout Error ===')
    console.error('Error details:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process checkout'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
} 