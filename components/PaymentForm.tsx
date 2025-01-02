'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

interface PaymentFormProps {
  amount: number
  onSuccess: (paymentIntentId: string) => void
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

    if (!stripe || !elements || !shippingInfo) {
      return
    }

    setProcessing(true)
    setMessage("")
    setError(null)

    try {
      // Calculate totals with proper precision
      const subtotal = Number((amount * 0.87).toFixed(2))
      const gst = Number((amount * 0.05).toFixed(2))
      const pst = Number((amount * 0.08).toFixed(2))
      const total = Number(amount.toFixed(2))

      const checkoutData = {
        shippingInfo,
        totals: {
          subtotal,
          gst,
          pst,
          total
        }
      }
      
      console.log('Storing checkout data:', checkoutData)
      const checkoutDataString = JSON.stringify(checkoutData)
      console.log('Stringified checkout data:', checkoutDataString)
      localStorage.setItem('checkout_data', checkoutDataString)

      // First, validate the payment element
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || "Please check your payment details")
        return
      }

      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      const { clientSecret, error: intentError } = await response.json()
      if (intentError) {
        setError(intentError)
        setProcessing(false)
        return
      }

      // Confirm the payment
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
      });

      if (result.error) {
        if (result.error.type === "card_error" || result.error.type === "validation_error") {
          setError(result.error.message || "Please check your card details");
        } else {
          setError("An unexpected error occurred.");
        }
      } else {
        const { paymentIntent } = result as unknown as { paymentIntent: { id: string, status: string } };
        if (paymentIntent.status === 'succeeded') {
          setMessage("Payment successful!");
          onSuccess(paymentIntent.id);
        }
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('Payment failed. Please try again.')
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