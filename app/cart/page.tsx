'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'

function CartContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const { items } = useCart()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {message && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
            {message}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-8">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div>
            {/* Cart items */}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div>Loading...</div>
        </main>
        <Footer />
      </div>
    }>
      <CartContent />
    </Suspense>
  )
} 