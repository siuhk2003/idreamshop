'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Order {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  items: Array<{
    quantity: number
    price: number
    product: {
      name: string
    }
  }>
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    address: string
    apartment?: string
    city: string
    province: string
    postalCode: string
    phone: string
  }
  subtotal: number
  shippingCost?: number
  gst: number
  pst: number
  total: number
  statusHistory: Array<{
    status: string
    timestamp: string
    notes: string
  }>
  paymentMethod: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/orders', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        })
        
        const data = await response.json()
        console.log('Orders response:', data) // Debug log
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch orders')
        }
        
        setOrders(data.orders)
        setError('')
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch orders')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (newStatus === 'CANCELLED') {
      setCancelOrderId(orderId)
      return
    }
    await updateOrderStatus(orderId, newStatus)
  }

  const handleCancelConfirm = async () => {
    if (cancelOrderId) {
      await updateOrderStatus(cancelOrderId, 'CANCELLED')
      setCancelOrderId(null)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId)
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data?.error || `HTTP error! status: ${response.status}`)
      }

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

    } catch (err) {
      console.error('Error updating status:', err)
      alert(err instanceof Error ? err.message : 'Failed to update order status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getDaysSinceCreation = (createdAt: string) => {
    const days = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  if (loading) {
    return <div>Loading orders...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders ({orders.length})</h1>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map(order => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.createdAt), 'PPP')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${order.total.toFixed(2)}</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingStatus === order.id || order.status === 'CANCELLED'}
                      className="text-sm border rounded p-1"
                    >
                      <option value="PROCESSING">Processing</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    {updatingStatus === order.id && (
                      <span className="text-xs text-gray-500">Updating...</span>
                    )}
                    {order.status === 'CANCELLED' && (
                      <span className="text-xs text-red-500">Cannot change cancelled orders</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                    </p>
                    <p>{order.shippingInfo.email}</p>
                    <p>{order.shippingInfo.phone}</p>
                  </div>

                  <h4 className="font-semibold mt-4 mb-2">Shipping Address</h4>
                  <div className="space-y-1 text-sm">
                    <p>{order.shippingInfo.address}</p>
                    {order.shippingInfo.apartment && (
                      <p>Unit {order.shippingInfo.apartment}</p>
                    )}
                    <p>
                      {order.shippingInfo.city}, {order.shippingInfo.province}
                    </p>
                    <p>{order.shippingInfo.postalCode}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Order Details</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.product.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    
                    <div className="border-t pt-2 mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${(order.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>${(order.shippingCost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>GST (5%):</span>
                        <span>${(order.gst || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>PST (7%):</span>
                        <span>${(order.pst || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-1 border-t">
                        <span>Total:</span>
                        <span>${(order.total || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-4 text-sm">
                      <span className="font-semibold">Payment Method: </span>
                      <span className="capitalize">{order.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              {order.status === 'PROCESSING' && order.paymentMethod === 'etransfer' && (
                <div className={`
                  text-sm px-2 py-1 rounded
                  ${getDaysSinceCreation(order.createdAt) >= 7 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-yellow-100 text-yellow-700'}
                `}>
                  {getDaysSinceCreation(order.createdAt) >= 7 
                    ? '⚠️ Payment overdue' 
                    : 'Awaiting e-transfer'}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}

      <AlertDialog open={!!cancelOrderId} onOpenChange={() => setCancelOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep order</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm}>
              Yes, cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}