'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'
import { Button } from "@/components/ui/button"
import { getCloudinaryUrl } from '@/lib/utils'
import Link from 'next/link'

const cloudinaryLoader = ({ src, width, quality }: any) => {
  console.log('Cloudinary Loader Input:', { src, width, quality })
  const url = getCloudinaryUrl(src)
  console.log('Cloudinary Loader Output:', url)
  return url
}

function CartContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const { items, removeItem, updateQuantity } = useCart()

  useEffect(() => {
    console.log('Cart Content Items:', items)
  }, [items])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

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
            <p className="text-lg mb-4">Your cart is empty</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg shadow">
                  <div className="relative w-24 h-24">
                    <Image
                      loader={cloudinaryLoader}
                      src={item.imageUrl}
                      alt={item.name || 'Product image'}
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 768px) 96px, 96px"
                      onError={(e) => {
                        console.error('Image Load Error:', {
                          src: item.imageUrl,
                          error: e
                        })
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        className="border rounded p-1"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow h-fit">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <Link href="/checkout">
                    <Button className="w-full">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
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