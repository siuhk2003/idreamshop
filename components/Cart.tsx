'use client'

import { Button } from "@/components/ui/button"
import { ShoppingCart, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'

export function Cart() {
  const { items, removeItem, updateQuantity, setItems } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const cartRef = useRef<HTMLDivElement>(null)
  const [selectedProvince, setSelectedProvince] = useState('')
  const [estimatedShipping, setEstimatedShipping] = useState(0)

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    const success = await updateQuantity(id, newQuantity)
    if (!success) {
      // Refresh the cart to show correct quantities
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    }
  }

  useEffect(() => {
    if (selectedProvince && items.length) {
      fetch(`/api/shipping-cost?items=${items.length}&province=${encodeURIComponent(selectedProvince)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setEstimatedShipping(data.cost)
          }
        })
    }
  }, [selectedProvince, items.length])

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="relative">
        <ShoppingCart className="w-5 h-5 mr-2" />
        <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs absolute -top-2 -right-2">
          {items.reduce((sum, item) => sum + item.quantity, 0)}
        </span>
      </Button>
      
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-lg z-50 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
                <span className="sr-only">Close cart</span>
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full mb-4 text-gray-900 border-gray-300 hover:bg-gray-100"
            >
              Continue Shopping
            </Button>
            
            {items.length === 0 ? (
              <p className="text-gray-900">Your cart is empty.</p>
            ) : (
              <>
                {items.map(item => (
                  <div key={item.id} className="flex items-center py-4 border-b">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                      <div className="flex items-center mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                        >
                          -
                        </Button>
                        <span className="mx-2 text-gray-900">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3" size="lg">
                      Checkout Now (${total.toFixed(2)})
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

