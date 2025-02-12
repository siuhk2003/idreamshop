import { loadStripe } from '@stripe/stripe-js'

let stripePromise: Promise<any> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
    if (!key) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set')
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
} 