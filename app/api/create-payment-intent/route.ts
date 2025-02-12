import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe-server'
import { sendEmail } from '@/lib/email'
import { getOrderConfirmationEmail } from '@/lib/emailTemplates'

export async function POST(request: Request) {
  try {
    const { items, shippingInfo, discountCode, discountPercent } = await request.json()
    
    // Validate incoming data
    if (!items?.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Get shipping cost from shipping-cost API
    const shippingResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/shipping-cost?` + 
      new URLSearchParams({
        items: items.length.toString(),
        province: shippingInfo.province
      })
    )
    
    const shippingData = await shippingResponse.json()
    if (!shippingResponse.ok) {
      throw new Error('Failed to calculate shipping cost')
    }

    const amountInCents = Math.round(Number(shippingData.cost) * 100)
    
    if (isNaN(amountInCents) || amountInCents <= 0) {
      return NextResponse.json({ 
        error: 'Invalid amount calculated',
        details: { amountInCents, shippingData }
      }, { status: 400 })
    }

    // Calculate price breakdown
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (Number(item.price) * Number(item.quantity)), 0)
    const discount = discountPercent ? Number((subtotal * Number(discountPercent) / 100).toFixed(2)) : 0
    const shippingCost = Number(shippingData.cost)
    const totalBeforeTax = Number((subtotal - discount + shippingCost).toFixed(2))
    const gst = Number((totalBeforeTax * 0.05).toFixed(2))  // 5% GST
    const pst = Number((totalBeforeTax * 0.07).toFixed(2))  // 7% PST
    const total = Number((totalBeforeTax + gst + pst).toFixed(2))

    console.log('Calculated amounts:', {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      totalBeforeTax: totalBeforeTax.toFixed(2),
      gst: gst.toFixed(2),
      pst: pst.toFixed(2),
      total: total.toFixed(2)
    })

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'cad',
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        orderTotal: total.toString(),
        customerEmail: shippingInfo.email
      }
    })

    // Return checkout data
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      checkoutData: {
        items,
        shippingInfo,
        totals: {
          subtotal: Number(subtotal.toFixed(2)),
          discount: Number(discount.toFixed(2)),
          shippingCost: Number(shippingCost.toFixed(2)),
          totalBeforeTax: Number(totalBeforeTax.toFixed(2)),
          gst: Number(gst.toFixed(2)),
          pst: Number(pst.toFixed(2)),
          total: Number(total.toFixed(2))
        }
      }
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
} 