'use client'

import { useState, useEffect } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { CartItem } from '@/types/cart'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { checkStock } from '@/lib/checkStock'

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

interface OutOfStockItem {
  name: string
  availableStock: number
}

interface StockCheckItem extends OutOfStockItem {
  color?: string
}

interface PaymentFormProps {
  shippingInfo: ShippingInfo
  amount: number
  shippingCost: number
  items: CartItem[]
  clientSecret?: string
  discountCode: string
  discountPercent: number | null
}

export function PaymentForm({ shippingInfo, amount, shippingCost, items, discountCode, discountPercent }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add appearance options for Stripe
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0F172A',
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. Submit the form first - this is required by Stripe
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw submitError
      }

      // 2. Check stock first
      const stockResponse = await fetch('/api/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      
      const stockData = await stockResponse.json()
      if (!stockData.success) {
        throw new Error('Some items are out of stock')
      }

      // 3. Create payment intent
      const intentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingInfo,
          discountCode,
          discountPercent
        })
      })
      
      const { clientSecret } = await intentResponse.json()
      if (!clientSecret) {
        throw new Error('Failed to create payment intent')
      }

      // 4. Save checkout data before confirming payment
      const checkoutData = {
        shippingInfo,
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totals: {
          subtotal: amount - shippingCost,
          shippingCost,
          totalBeforeTax: amount - shippingCost + shippingCost,
          discount: discountPercent ? ((amount - shippingCost) * discountPercent / 100) : 0,
          total: amount
        }
      }
      
      console.log('Saving checkout data:', checkoutData)
      localStorage.setItem('checkout_data', JSON.stringify(checkoutData))
      localStorage.setItem('checkout_data_backup', JSON.stringify(checkoutData))

      // 5. Confirm payment - this redirects to success page
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`
        }
      })

      if (paymentError) {
        throw paymentError
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{ 
          layout: "tabs",
          defaultValues: {
            billingDetails: {
              name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
              email: shippingInfo.email,
              phone: shippingInfo.phone,
              address: {
                line1: shippingInfo.address,
                line2: shippingInfo.apartment || '',
                city: shippingInfo.city,
                state: shippingInfo.province,
                postal_code: shippingInfo.postalCode,
                country: 'CA',
              },
            }
          }
        }} 
      />

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full"
      >
        {isLoading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  )
}

export type { PaymentFormProps }; 