'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

export default function EtransferSuccessPage() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  
  useEffect(() => {
    // Clear cart after successful navigation to success page
    clearCart()
  }, [clearCart])

  const orderNumber = searchParams.get('order')

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order #{orderNumber}. We'll send you an email with your order details and e-transfer instructions.
          </p>
          <p className="text-gray-600 mb-8">
            Your order will be processed once we receive your e-transfer payment.
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