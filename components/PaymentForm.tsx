'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

interface PaymentFormProps {
  amount: number
  onSuccess: (paymentIntentId: string) => Promise<boolean>
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    address: string
    apartment?: string
    city: string
    province: string
    postalCode: string
    country: string
    phone: string
  }
}

export function PaymentForm({ amount, onSuccess, shippingInfo }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<string>("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)

    try {
      // Validate shipping info first
      const validationResult = await onSuccess('validation-check')
      if (!validationResult) {
        setProcessing(false)
        return // Stop here if validation fails
      }

      if (!stripe || !elements) {
        throw new Error('Stripe not initialized')
      }

      // Only validate payment element after shipping info is valid
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || "Please check your payment details")
        return
      }

      // Create payment intent only after all validations pass
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      const { clientSecret } = await response.json()

      // Process payment
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
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
            },
          },
        },
      })

      if (result.error) {
        throw result.error
      }

    } catch (error) {
      console.error('Payment error:', error)
      setError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md">
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
                }
              }
            }
          }}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="text-green-500 text-sm">
          {message}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
      >
        {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  )
} 