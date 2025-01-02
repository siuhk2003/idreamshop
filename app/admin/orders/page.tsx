'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface OrderWithRelations {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  items: {
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    address: string
    city: string
    province: string
    postalCode: string
    phone: string
  }
  subtotal: number
  gst: number
  pst: number
  total: number
}

const ORDER_STATUSES = ['ALL', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({})

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/admin/orders')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders')
      }
      
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (orderId: string, newStatus: string, currentStatus: string) => {
    if (currentStatus === 'CANCELLED') {
      alert('Cancelled orders cannot be modified')
      return
    }
    
    setPendingChanges(prev => ({
      ...prev,
      [orderId]: newStatus
    }))
  }

  const saveStatusChange = async (orderId: string) => {
    const newStatus = pendingChanges[orderId]
    if (!newStatus) return

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status updated to ${newStatus} by admin`,
          revertStock: newStatus === 'CANCELLED'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Clear pending change and refresh orders
      setPendingChanges(prev => {
        const { [orderId]: removed, ...rest } = prev
        return rest
      })
      fetchOrders()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update order status')
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })

      if (response.ok) {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const filteredOrders = orders.filter(order => 
    statusFilter === 'ALL' || order.status === statusFilter
  )

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) return <div className="text-center py-8">Loading orders...</div>
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchOrders}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Order Management</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded p-2"
          >
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'All Orders' : status}
              </option>
            ))}
          </select>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Logout
        </Button>
      </div>

      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No orders found for the selected status.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b">
                  <div>
                    <h3 className="text-xl font-bold">Order #{order.orderNumber}</h3>
                    <p className="text-gray-500">
                      {format(new Date(order.createdAt), 'PPP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="mb-2 flex items-center gap-2">
                      <select
                        value={pendingChanges[order.id] || order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value, order.status)}
                        className={`border rounded p-2 ${
                          order.status === 'CANCELLED' 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : ''
                        }`}
                        disabled={order.status === 'CANCELLED'}
                      >
                        {ORDER_STATUSES.filter(status => status !== 'ALL').map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      {pendingChanges[order.id] && (
                        <Button
                          onClick={() => saveStatusChange(order.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          Save
                        </Button>
                      )}
                    </div>
                    <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                    {order.status === 'CANCELLED' && (
                      <p className="text-sm text-red-600">This order has been cancelled</p>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <div className="space-y-1">
                      <p className="font-medium">{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                      <p>{order.shippingInfo.email}</p>
                      <p>{order.shippingInfo.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <div className="space-y-1">
                      <p>{order.shippingInfo.address}</p>
                      <p>{order.shippingInfo.city}, {order.shippingInfo.province}</p>
                      <p>{order.shippingInfo.postalCode}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-2">Order Items</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{item.product.name}</span>
                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                          </div>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>GST (5%)</span>
                          <span>${order.gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>PST (7%)</span>
                          <span>${order.pst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}