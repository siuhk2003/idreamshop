'use client'

import { useEffect } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ETransferSuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
    localStorage.removeItem('checkout_data')
  }, [clearCart])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Order Received!</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Please complete your e-transfer payment to:
              <br />
              <span className="font-mono font-bold">cs@idreamshop.ca</span>
            </p>
          </div>
          <p className="mb-4">
            Your order will be processed once we receive your payment.
            This usually takes 1-2 business days.
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