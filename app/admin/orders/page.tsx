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
    city: string
    province: string
    postalCode: string
    phone: string
  }
  subtotal: number
  gst: number
  pst: number
  total: number
  statusHistory: Array<{
    status: string
    timestamp: string
    notes: string
  }>
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
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-bold">Order #{order.orderNumber}</h3>
                  <p className="text-gray-600">
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
                <h4 className="font-semibold mb-2">Shipping To:</h4>
                <p className="text-sm">
                  {order.shippingInfo.firstName} {order.shippingInfo.lastName}<br />
                  {order.shippingInfo.address}<br />
                  {order.shippingInfo.city}, {order.shippingInfo.province}<br />
                  {order.shippingInfo.postalCode}<br />
                  {order.shippingInfo.phone}
                </p>
              </div>
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