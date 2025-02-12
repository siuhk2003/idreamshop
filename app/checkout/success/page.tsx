'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const processAttempted = useRef(false)
  
  useEffect(() => {
    const processOrder = async () => {
      const paymentIntentId = searchParams.get('payment_intent')
      const redirectStatus = searchParams.get('redirect_status')

      console.log('Checking order status:', { 
        paymentIntentId, 
        redirectStatus,
        attempted: processAttempted.current 
      })

      if (!paymentIntentId || processAttempted.current || redirectStatus !== 'succeeded') {
        console.log('Skipping order processing:', { 
          noPaymentIntent: !paymentIntentId,
          alreadyAttempted: processAttempted.current,
          wrongStatus: redirectStatus !== 'succeeded'
        })
        return
      }

      try {
        processAttempted.current = true
        setIsProcessing(true)
        console.log('Starting order processing...')

        const checkoutDataStr = localStorage.getItem('checkout_data')
        if (!checkoutDataStr) {
          throw new Error('No checkout data found')
        }

        const checkoutData = JSON.parse(checkoutDataStr)
        console.log('Found checkout data:', checkoutData)

        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId,
            ...checkoutData
          })
        })

        const data = await response.json()
        console.log('Checkout API response:', data)

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to process order')
        }

        console.log('Order processed successfully, clearing data...')
        clearCart()
        localStorage.removeItem('checkout_data')

      } catch (error) {
        console.error('Order processing failed:', error)
        setError(error instanceof Error ? error.message : 'Failed to process order')
        processAttempted.current = false // Allow retry on error
      } finally {
        setIsProcessing(false)
      }
    }

    processOrder()
  }, [searchParams, clearCart])

  if (isProcessing) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Processing Your Order...</h1>
            <p className="text-gray-600">Please wait while we complete your purchase.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Order Successful!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. We'll send you an email with your order details.
          </p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessContent />
} 