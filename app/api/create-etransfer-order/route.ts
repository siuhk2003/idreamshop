import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getOrderConfirmationEmail } from '@/lib/emailTemplates'
export async function POST(request: Request) {
  try {
    const { shippingInfo, items, totals } = await request.json()

    // Create order in database with detailed price breakdown
    const order = await prisma.order.create({
      data: {
        orderNumber: `E${Date.now()}`,
        status: 'PENDING',
        paymentMethod: 'ETRANSFER',
        paymentIntentId: `et_${Date.now()}`,
        
        // Price breakdown
        subtotal: totals.subtotal,
        discount: totals.discount || 0,
        discountCode: totals.discountCode,
        shippingCost: totals.shippingCost,
        totalBeforeTax: totals.totalBeforeTax,
        gst: totals.gst,
        pst: totals.pst,
        total: totals.total,

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
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
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
            product: true
          }
        },
        shippingInfo: true
      }
    })

    // Send confirmation email with updated template
    try {
      await sendEmail({
        to: shippingInfo.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        html: getOrderConfirmationEmail(order)
      })
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      orderId: order.id,
      orderNumber: order.orderNumber
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Failed to create e-transfer order:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
} 