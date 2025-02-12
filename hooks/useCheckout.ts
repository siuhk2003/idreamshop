import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'

interface ShippingInfo {
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

export function useCheckout(paymentIntentId: string | null) {
  const { clearCart, items } = useCart()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const processAttempted = useRef(false)

  const processCheckout = useCallback(async () => {
    if (!paymentIntentId) {
      console.warn('No payment intent ID provided')
      return
    }

    if (!items.length) {
      console.warn('No items in cart')
      return
    }

    if (processAttempted.current) {
      console.warn('Checkout already attempted')
      return
    }

    console.log('Starting checkout process:', {
      paymentIntentId,
      itemCount: items.length
    })

    setIsProcessing(true)
    processAttempted.current = true

    try {
      // Get checkout data
      const checkoutDataString = localStorage.getItem('checkout_data')
      if (!checkoutDataString) {
        throw new Error('No checkout data found')
      }

      const checkoutData = JSON.parse(checkoutDataString)
      console.log('Retrieved checkout data')

      // Check for existing order
      const checkResponse = await fetch(`/api/checkout/check/${paymentIntentId}`)
      if (!checkResponse.ok) {
        throw new Error('Failed to check order status')
      }

      const checkData = await checkResponse.json()
      console.log('Order check result:', checkData)

      if (checkData.exists) {
        console.log('Order already exists')
        clearCart()
        localStorage.removeItem('checkout_data')
        setIsComplete(true)
        return
      }

      // Create order
      console.log('Creating new order')
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          items,
          shippingInfo: checkoutData.shippingInfo,
          totals: checkoutData.totals
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create order')
      }

      console.log('Order created successfully')
      clearCart()
      localStorage.removeItem('checkout_data')
      setIsComplete(true)

    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Checkout failed')
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [paymentIntentId, items, clearCart])

  return {
    error,
    isProcessing,
    isComplete,
    processCheckout
  }
} 