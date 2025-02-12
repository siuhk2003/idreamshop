'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCheckout } from '@/hooks/useCheckout'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent')
  const { processCheckout, error, isProcessing } = useCheckout(paymentIntentId)

  useEffect(() => {
    processCheckout()
  }, [processCheckout])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">
        {isProcessing ? 'Processing your order...' : 'Order Confirmed!'}
      </h1>
      <p className="text-gray-600">
        Thank you for your purchase. We'll send you an email with your order details.
      </p>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <CheckoutSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
} 