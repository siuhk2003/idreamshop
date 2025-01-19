'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from "@/components/ui/card"
import { format } from 'date-fns'

interface OrderItem {
  quantity: number
  price: number
  product: {
    name: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  items: OrderItem[]
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    address: string
    city: string
    province: string
    postalCode: string
  }
  subtotal: number
  shippingCost: number
  gst: number
  pst: number
  total: number
  paymentMethod: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // First check if we're logged in
        const profileResponse = await fetch('/api/member/profile', {
          credentials: 'include'
        })

        if (!profileResponse.ok) {
          router.push('/login?redirect=/orders')
          return
        }

        const response = await fetch('/api/member/orders', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to fetch orders')
          return
        }

        setOrders(data.orders || [])
      } catch (err) {
        console.error('Error in fetchOrders:', err)
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>
        
        {loading ? (
          <div>Loading orders...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.createdAt), 'PPP')}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Items:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.product.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span>${order.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GST:</span>
                      <span>${order.gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PST:</span>
                      <span>${order.pst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold mt-2">
                      <span>Total:</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {order.paymentMethod === 'etransfer' && order.status === 'PROCESSING' && (
                    <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                      Please complete your e-transfer payment to: cs@idreamshop.ca
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
} 