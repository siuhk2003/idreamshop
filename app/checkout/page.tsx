'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { PaymentForm } from '@/components/PaymentForm'
import { CartItem } from '@/types/cart'

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  address: string
  apartment: string
  city: string
  province: string
  postalCode: string
  country: string
  phone: string
}

const PROVINCES = [
  'British Columbia',
  'Alberta',
  'Saskatchewan',
  'Manitoba',
  'Ontario',
  'Quebec',
  'New Brunswick',
  'Nova Scotia',
  'Prince Edward Island',
  'Newfoundland and Labrador',
]

const GST_RATE = 0.05 // 5%
const PST_RATE = 0.07 // 7% for BC

const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0570de',
    colorBackground: '#ffffff',
    colorText: '#30313d',
    colorDanger: '#df1b41',
    fontFamily: 'system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '4px',
  },
}

const options = {
  mode: 'payment',
  amount: 1099,
  currency: 'cad',
  appearance,
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, removeItem, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    apartment: '',
    city: '',
    province: 'British Columbia',
    postalCode: '',
    country: 'Canada',
    phone: ''
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const gst = subtotal * GST_RATE
  const pst = subtotal * PST_RATE
  const total = subtotal + gst + pst

  const checkStock = async (items: CartItem[]) => {
    try {
      const response = await fetch('/api/check-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })

      const data = await response.json()
      if (!data.success) {
        data.outOfStock.forEach((item: CartItem) => {
          removeItem(item.id)
        })
        setError(`Some items are out of stock and have been removed from your cart: ${data.outOfStock.map((item: CartItem) => item.name).join(', ')}`)
        return false
      }
      return true
    } catch (err) {
      setError('Failed to check stock. Please try again.')
      return false
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Check stock before finalizing order
      const stockResponse = await fetch('/api/check-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })

      const stockData = await stockResponse.json()
      if (!stockData.success) {
        setError('Some items are no longer available in the requested quantity')
        stockData.outOfStock.forEach((item: CartItem) => {
          removeItem(item.id)
        })
        return
      }

      // Save complete shipping info and totals objects
      const checkoutData = {
        shippingInfo: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          address: shippingInfo.address,
          apartment: shippingInfo.apartment || '',
          city: shippingInfo.city,
          province: shippingInfo.province,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone
        },
        totals: {
          subtotal,
          gst,
          pst,
          total
        }
      }

      // Store the complete objects
      localStorage.setItem('checkout_data', JSON.stringify(checkoutData))

      // Redirect will happen through Stripe
    } catch (error) {
      console.error('Checkout error:', error)
      setError(error instanceof Error ? error.message : 'Checkout failed. Please try again.')
    }
  }

  // Check login status when component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/member/profile', {
          credentials: 'include'
        })
        setIsLoggedIn(response.ok)
      } catch (error) {
        setIsLoggedIn(false)
      }
    }

    checkLoginStatus()
  }, [])

  const loadProfileInfo = async () => {
    try {
      const response = await fetch('/api/member/shipping-info', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to load profile information')
      }

      const { member } = await response.json()
      
      setShippingInfo({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        address: member.address,
        apartment: member.apartment || '',
        city: member.city,
        province: member.province,
        postalCode: member.postalCode,
        country: 'Canada',
        phone: member.phone || ''
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile information')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Shipping Information</h2>
                {isLoggedIn && (
                  <Button
                    onClick={loadProfileInfo}
                    variant="outline"
                    size="sm"
                    className="ml-4"
                  >
                    Load My Profile
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      required
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      required
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    required
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="apartment">Apartment / Suite (Optional)</Label>
                  <Input
                    id="apartment"
                    value={shippingInfo.apartment}
                    onChange={(e) => setShippingInfo({...shippingInfo, apartment: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <select
                      id="province"
                      className="w-full border rounded-md p-2"
                      value={shippingInfo.province}
                      onChange={(e) => setShippingInfo({...shippingInfo, province: e.target.value})}
                    >
                      {PROVINCES.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      required
                      value={shippingInfo.postalCode}
                      onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <Elements 
                  stripe={getStripe()} 
                  options={{
                    mode: 'payment',
                    amount: Math.round(total * 100),
                    currency: 'cad',
                    appearance: {
                      theme: 'stripe',
                    },
                  }}
                >
                  <PaymentForm 
                    amount={total}
                    onSuccess={handlePaymentSuccess}
                    shippingInfo={shippingInfo}
                  />
                </Elements>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p>${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GST (5%)</span>
                      <span>${gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PST (7%)</span>
                      <span>${pst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

