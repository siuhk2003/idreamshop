import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'

export function useCheckout(paymentIntentId: string | null) {
  const { clearCart, items } = useCart()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const processAttempted = useRef(false)
  const router = useRouter()

  const processCheckout = useCallback(async () => {
    if (!paymentIntentId || !items.length) {
      router.push('/')
      return
    }

    if (processAttempted.current || isComplete || isProcessing) {
      return
    }

    setIsProcessing(true)
    processAttempted.current = true

    try {
      console.log('Starting checkout process...')
      const checkoutDataString = localStorage.getItem('checkout_data')
      
      if (!checkoutDataString) {
        throw new Error('Checkout data not found')
      }

      const checkoutData = JSON.parse(checkoutDataString)
      console.log('Retrieved checkout data:', checkoutData)

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          items,
          shippingInfo: checkoutData.shippingInfo,
          totals: checkoutData.totals
        }),
      })

      const data = await response.json()
      console.log('Checkout response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      clearCart()
      localStorage.removeItem('checkout_data')
      setIsComplete(true)
    } catch (error) {
      console.error('Checkout error:', error)
      setError(error instanceof Error ? error.message : 'Error processing checkout')
    } finally {
      setIsProcessing(false)
    }
  }, [paymentIntentId, items, clearCart, router, isComplete, isProcessing])

  return {
    error,
    isProcessing,
    isComplete,
    processCheckout
  }
} 