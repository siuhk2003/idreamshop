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
import { validateForm, validateShippingInfo } from '@/lib/validation'

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

interface FormErrors {
  [key: string]: string
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
    phone: ''
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [validationErrors, setValidationErrors] = useState<FormErrors>({})
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'etransfer'>('stripe')
  const [shippingCost, setShippingCost] = useState(0)
  const [clientSecret, setClientSecret] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [discountError, setDiscountError] = useState('')

  const subtotalBeforeDiscount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = (subtotalBeforeDiscount * discount) / 100
  const subtotal = subtotalBeforeDiscount - discountAmount
  const gst = subtotal * GST_RATE
  const pst = subtotal * PST_RATE
  const total = subtotal + gst + pst + shippingCost

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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name in validateShippingInfo) {
      const validator = validateShippingInfo[name as keyof typeof validateShippingInfo]
      const error = validator(value)
      
      setFieldErrors(prev => ({
        ...prev,
        [name]: error || ''
      }))
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    const formData = Object.entries(shippingInfo).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: String(value)
    }), {} as Record<string, string>)

    const errors = validateForm(formData)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setValidationErrors(errors)
      setError('Please fill in all required fields correctly')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return false
    }

    try {
      // Stock check and payment processing...
      const stockResponse = await fetch('/api/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const stockData = await stockResponse.json()
      if (!stockData.success) {
        setError('Some items are no longer available')
        stockData.outOfStock.forEach((item: CartItem) => {
          removeItem(item.id)
        })
        return false // Prevent payment processing
      }

      // If all validations pass, proceed with payment
      const checkoutData = {
        shippingInfo,
        totals: {
          subtotal,
          shipping: shippingCost,
          gst,
          pst,
          total
        }
      }
      localStorage.setItem('checkout_data', JSON.stringify(checkoutData))
      return true // Allow payment processing
    } catch (error) {
      console.error('Checkout error:', error)
      setError(error instanceof Error ? error.message : 'Checkout failed')
      return false // Prevent payment processing
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

  const fetchShippingInfo = async () => {
    try {
      const response = await fetch('/api/member/shipping-info', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - optionally redirect to login
          return
        }
        throw new Error('Failed to fetch shipping info')
      }

      const data = await response.json()
      if (data.success && data.shippingInfo) {
        setShippingInfo({
          firstName: data.shippingInfo.firstName || '',
          lastName: data.shippingInfo.lastName || '',
          email: data.shippingInfo.email || '',
          address: data.shippingInfo.address || '',
          apartment: data.shippingInfo.apartment || '',
          city: data.shippingInfo.city || '',
          province: data.shippingInfo.province || '',
          postalCode: data.shippingInfo.postalCode || '',
          phone: data.shippingInfo.phone || ''
        })
      }
    } catch (error) {
      console.error('Error fetching shipping info:', error)
    }
  }

  const handleETransferCheckout = async () => {
    try {
      // Validate all fields first
      const formData = Object.entries(shippingInfo).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: String(value)
      }), {} as Record<string, string>)

      const validationErrors = validateForm(formData)
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors)
        setValidationErrors(validationErrors)
        setError('Please fill in all required fields correctly')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // Check stock availability
      const stockIsValid = await checkStock(items)
      if (!stockIsValid) {
        return
      }

      // Save checkout data
      const checkoutData = {
        shippingInfo,
        totals: {
          subtotal,
          shipping: shippingCost,
          gst,
          pst,
          total
        }
      }
      localStorage.setItem('checkout_data', JSON.stringify(checkoutData))

      const response = await fetch('/api/checkout/etransfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingInfo,
          totals: { 
            subtotal, 
            shipping: shippingCost,
            gst, 
            pst, 
            total 
          }
        })
      })

      const data = await response.json()
      if (!response.ok) {
        if (data.validationErrors) {
          setFieldErrors(data.validationErrors)
          throw new Error('Please correct the highlighted fields')
        }
        throw new Error(data.error || 'Checkout failed')
      }

      // Store order ID and redirect to success page
      localStorage.setItem('etransfer_order_id', data.orderId)
      router.push('/checkout/etransfer-success')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Checkout failed')
    }
  }

  useEffect(() => {
    const calculateShipping = async () => {
      if (items.length && shippingInfo.province) {
        const response = await fetch(
          `/api/shipping-cost?items=${items.length}&province=${encodeURIComponent(shippingInfo.province)}`
        )
        const data = await response.json()
        if (data.success) {
          setShippingCost(data.cost)
        }
      }
    }

    calculateShipping()
  }, [items.length, shippingInfo.province])

  useEffect(() => {
    if (!items.length) {
      router.push('/cart?message=Your cart is empty')
      return
    }

    const updatePaymentIntent = async () => {
      try {
        if (total <= 0) return

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total })
        })
        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (error) {
        console.error('Error creating payment intent:', error)
      }
    }

    updatePaymentIntent()
  }, [items, total, router])

  const handleApplyDiscount = async () => {
    setDiscountError('')
    
    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: discountCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid discount code')
      }

      setDiscount(data.discount)
    } catch (error) {
      setDiscountError(error instanceof Error ? error.message : 'Failed to apply discount code')
      setDiscount(0)
    }
  }

  // Add early return if cart is empty
  if (!items.length) {
    return null // Return null while redirecting
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                      onBlur={handleBlur}
                      className={fieldErrors.firstName ? 'border-red-500' : ''}
                      required
                    />
                    {fieldErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                      onBlur={handleBlur}
                      className={fieldErrors.lastName ? 'border-red-500' : ''}
                      required
                    />
                    {fieldErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                    onBlur={handleBlur}
                    className={fieldErrors.email ? 'border-red-500' : ''}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    onBlur={handleBlur}
                    className={fieldErrors.address ? 'border-red-500' : ''}
                    required
                  />
                  {fieldErrors.address && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>
                  )}
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
                      name="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      onBlur={handleBlur}
                      className={fieldErrors.city ? 'border-red-500' : ''}
                      required
                    />
                    {fieldErrors.city && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.city}</p>
                    )}
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
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                      onBlur={handleBlur}
                      className={fieldErrors.postalCode ? 'border-red-500' : ''}
                      required
                    />
                    {fieldErrors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.postalCode}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      onBlur={handleBlur}
                      className={fieldErrors.phone ? 'border-red-500' : ''}
                      required
                    />
                    {fieldErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      type="button"
                      variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                      className={`flex-1 justify-center py-6 ${
                        paymentMethod === 'stripe'
                          ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-600 ring-offset-2'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setPaymentMethod('stripe')}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg">Credit Card</span>
                        <span className="text-sm">{paymentMethod === 'stripe' ? 'Selected' : 'Click to select'}</span>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === 'etransfer' ? 'default' : 'outline'}
                      className={`flex-1 justify-center py-6 ${
                        paymentMethod === 'etransfer'
                          ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-600 ring-offset-2'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setPaymentMethod('etransfer')}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg">E-Transfer</span>
                        <span className="text-sm">{paymentMethod === 'etransfer' ? 'Selected' : 'Click to select'}</span>
                      </div>
                    </Button>
                  </div>
                  {paymentMethod === 'stripe' ? (
                    <Elements stripe={getStripe()} options={{
                      mode: 'payment',
                      amount: Math.round(total * 100),
                      currency: 'cad',
                      appearance: {
                        theme: 'stripe',
                      },
                    }}>
                      <PaymentForm 
                        amount={total}
                        onSuccess={handlePaymentSuccess}
                        shippingInfo={shippingInfo}
                      />
                    </Elements>
                  ) : (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-semibold mb-2">E-Transfer Instructions</h3>
                      <p>Please send the total amount of ${total.toFixed(2)} to:</p>
                      <p className="font-mono mt-2">cs@idreamshop.ca</p>
                      <p className="text-sm mt-4">
                        Note: Your order will be processed after payment is received.
                      </p>
                      <Button 
                        onClick={handleETransferCheckout}
                        className="w-full mt-4"
                      >
                        Complete Order
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  {/* Cart Items Summary */}
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotalBeforeDiscount.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount}%)</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>GST (5%)</span>
                      <span>${gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PST (7%)</span>
                      <span>${pst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
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

