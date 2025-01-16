'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Suspense } from 'react'
import { useRouter } from 'next/navigation'

function CheckoutSuccessContent() {
  const { clearCart } = useCart()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const processCheckout = async () => {
      try {
        const paymentIntentId = searchParams.get('payment_intent')
        if (!paymentIntentId) {
          throw new Error('No payment intent ID found')
        }

        // Get checkout data from localStorage
        const checkoutDataString = localStorage.getItem('checkout_data')
        const cartDataString = localStorage.getItem('cart')
        
        if (!checkoutDataString || !cartDataString) {
          throw new Error('Missing checkout or cart data')
        }

        const checkoutData = JSON.parse(checkoutDataString)
        const cartItems = JSON.parse(cartDataString)

        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
            items: cartItems,
            shippingInfo: checkoutData.shippingInfo,
            totals: checkoutData.totals
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Checkout failed')
        }

        const data = await response.json()
        if (data.success) {
          setStatus('success')
          clearCart()
          localStorage.removeItem('checkout_data')
        } else {
          throw new Error(data.error || 'Checkout failed')
        }

      } catch (error) {
        console.error('Checkout error:', error)
        setStatus('error')
        setError(error instanceof Error ? error.message : 'Checkout failed')
      }
    }

    processCheckout()
  }, [searchParams, clearCart])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <>
              <h1 className="text-3xl font-bold mb-4 text-red-600">Checkout Error</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <Link href="/checkout">
                <Button>Try Again</Button>
              </Link>
            </>
          ) : status === 'loading' ? (
            <>
              <h1 className="text-3xl font-bold mb-4">Processing Order...</h1>
              <p className="text-gray-600 mb-8">Please wait while we complete your order.</p>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Order Successful!</h1>
              <p className="text-gray-600 mb-8">
                Thank you for your purchase. We'll send you an email with your order details.
              </p>
              <Link href="/products">
                <Button>Continue Shopping</Button>
              </Link>
            </>
          ) : (
            <div>
              <h1 className="text-3xl font-bold mb-4">Initializing Checkout...</h1>
              <p className="text-gray-600 mb-8">Please wait...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div>Processing your order...</div>
        </main>
        <Footer />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
} 