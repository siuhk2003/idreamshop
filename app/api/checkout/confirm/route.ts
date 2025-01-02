import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const paymentIntentId = searchParams.get('payment_intent')
  
  if (!paymentIntentId) {
    return NextResponse.redirect('/checkout/error')
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status === 'succeeded') {
      // Redirect to success page with payment intent ID
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?payment_intent=${paymentIntentId}`)
    } else {
      return NextResponse.redirect('/checkout/error')
    }
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.redirect('/checkout/error')
  }
} 