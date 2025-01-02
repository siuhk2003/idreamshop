'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const processAttempted = useRef(false)
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent')

  useEffect(() => {
    const processCheckout = async () => {
      if (!paymentIntentId) {
        console.log('No payment intent ID')
        setError('Invalid checkout session')
        setIsProcessing(false)
        return
      }

      if (processAttempted.current || isComplete) {
        return
      }

      processAttempted.current = true

      try {
        // Get checkout data first
        const checkoutDataString = localStorage.getItem('checkout_data')
        if (!checkoutDataString) {
          throw new Error('Checkout data not found')
        }

        // Get cart data from localStorage
        const cartDataString = localStorage.getItem('cart')
        if (!cartDataString) {
          throw new Error('Cart data not found')
        }

        let checkoutData, cartItems
        try {
          checkoutData = JSON.parse(checkoutDataString)
          cartItems = JSON.parse(cartDataString)
          console.log('Processing checkout with data:', { checkoutData, cartItems })
        } catch (e) {
          console.error('Parse error:', e)
          throw new Error('Invalid checkout or cart data')
        }

        if (!cartItems?.length) {
          throw new Error('No items in cart')
        }

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
          }),
        })

        const data = await response.json()
        console.log('Checkout response:', data)

        if (!response.ok) {
          throw new Error(data.error || 'Checkout failed')
        }

        if (data.success) {
          console.log('Order completed successfully:', data.orderId)
          setIsComplete(true)
          // Clear cart and checkout data after successful order
          clearCart()
          localStorage.removeItem('checkout_data')
        } else {
          throw new Error(data.error || 'Checkout failed')
        }

      } catch (error) {
        console.error('Checkout error:', error)
        setError(error instanceof Error ? error.message : 'Error processing checkout')
      } finally {
        setIsProcessing(false)
      }
    }

    processCheckout()
  }, [paymentIntentId, clearCart, isComplete])

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
          ) : isProcessing ? (
            <>
              <h1 className="text-3xl font-bold mb-4">Processing Order...</h1>
              <p className="text-gray-600 mb-8">Please wait while we complete your order.</p>
            </>
          ) : isComplete ? (
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