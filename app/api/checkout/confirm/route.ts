import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const paymentIntentId = searchParams.get('payment_intent')
  
  if (!paymentIntentId) {
    return NextResponse.redirect('/checkout/error')
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status === 'succeeded') {
      // Always redirect with new=true to ensure processing
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?payment_intent=${paymentIntentId}&new=true&redirect_status=succeeded`
      )
    } else {
      return NextResponse.redirect('/checkout/error')
    }
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.redirect('/checkout/error')
  }
} 