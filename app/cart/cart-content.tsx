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

export function CartContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const { items, removeItem, updateQuantity } = useCart()

  useEffect(() => {
    console.log('Cart Content Items:', items)
  }, [items])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {message && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="relative w-full sm:w-24 h-24 flex-shrink-0">
                        <Image
                          src={getCloudinaryUrl(item.imageUrl)}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow space-y-2">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                              >
                                +
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
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