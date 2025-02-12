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
import { getStripe } from '@/lib/stripe-client'
import { PaymentForm } from '@/components/PaymentForm'
import { CartItem } from '@/types/cart'
import { validateForm } from '@/lib/validation'
import { ETransferInstructions } from '@/app/components/ETransferInstructions'
import { Banknote, CreditCard } from 'lucide-react'

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

export function CheckoutContent() {
  const router = useRouter()
  const { items, clearCart, discount } = useCart()
  const [selectedPayment, setSelectedPayment] = useState<'stripe' | 'etransfer' | null>(null)
  const [showStripeForm, setShowStripeForm] = useState(false)
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [shippingCost, setShippingCost] = useState(0)
  const [discountCode, setDiscountCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState<number | null>(null)
  const [discountError, setDiscountError] = useState('')
  const [isMemberLoggedIn, setIsMemberLoggedIn] = useState(false)
  const [isLoadingMemberInfo, setIsLoadingMemberInfo] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'etransfer'>('stripe')
  const [showEtransferInstructions, setShowEtransferInstructions] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    console.log('Current step:', selectedPayment);
    console.log('Client secret:', clientSecret);
  }, [selectedPayment, clientSecret]);

  useEffect(() => {
    const calculateShipping = async () => {
      try {
        const response = await fetch(
          `/api/shipping-cost?province=${shippingInfo.province}&items=${items.reduce((sum, item) => sum + item.quantity, 0)}`
        );
        const data = await response.json();
        
        if (data.success) {
          setShippingCost(data.cost);
        }
      } catch (error) {
        console.error('Error calculating shipping:', error);
      }
    };

    if (shippingInfo.province && items.length > 0) {
      calculateShipping();
    }
  }, [shippingInfo.province, items]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/member/shipping-info')
        setIsMemberLoggedIn(response.ok)
      } catch (error) {
        console.error('Error checking login status:', error)
      }
    }
    checkLoginStatus()
  }, [])

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const discountAmount = discountPercent ? Number((subtotal * discountPercent / 100).toFixed(2)) : 0
  const subtotalAfterDiscount = subtotal - discountAmount
  const totalBeforeTax = subtotalAfterDiscount + shippingCost
  const gst = Number((totalBeforeTax * GST_RATE).toFixed(2))
  const pst = Number((totalBeforeTax * PST_RATE).toFixed(2))
  const total = totalBeforeTax + gst + pst

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Save checkout data to localStorage before creating payment intent
      const checkoutData = {
        shippingInfo,
        totals: {
          subtotal,
          shippingCost: Number(shippingCost),
          discount: discountAmount,
          totalBeforeTax,
          gst,
          pst,
          total
        }
      };
      localStorage.setItem('checkout_data', JSON.stringify(checkoutData));

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingInfo,
          discountCode,
          discountPercent
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
      setSelectedPayment('stripe');
      setShowStripeForm(true);

    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to process form' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setShippingInfo(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateContactAndShipping = () => {
    const validationErrors = validateForm({
      firstName: shippingInfo.firstName,
      lastName: shippingInfo.lastName,
      email: shippingInfo.email,
      address: shippingInfo.address,
      city: shippingInfo.city,
      province: shippingInfo.province,
      postalCode: shippingInfo.postalCode,
      phone: shippingInfo.phone
    })
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return false
    }
    return true
  }

  const handlePaymentMethodSelect = (method: 'stripe' | 'etransfer') => {
    if (!validateContactAndShipping()) {
      return
    }
    
    setSelectedPayment(method)
    if (method === 'stripe') {
      setShowStripeForm(true)
    }
  }

  const handleApplyDiscount = async () => {
    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: discountCode }),
      })

      const data = await response.json()

      if (data.success) {
        setDiscountPercent(data.discount)
        setDiscountError('')
      } else {
        setDiscountPercent(null)
        setDiscountError(data.error || 'Invalid discount code')
      }
    } catch (error) {
      setDiscountError('Failed to validate discount code')
      setDiscountPercent(null)
    }
  }

  const handleLoadMemberInfo = async () => {
    setIsLoadingMemberInfo(true)
    try {
      const response = await fetch('/api/member/shipping-info')
      if (response.ok) {
        const data = await response.json()
        setShippingInfo(data.shippingInfo)
        // Clear any existing errors
        setErrors({})
      }
    } catch (error) {
      console.error('Error loading member info:', error)
    } finally {
      setIsLoadingMemberInfo(false)
    }
  }

  const handlePaymentMethodChange = (method: 'stripe' | 'etransfer') => {
    setPaymentMethod(method)
    setShowEtransferInstructions(method === 'etransfer')
    setSelectedPayment(method)
  }

  const handleEtransferCheckout = async () => {
    if (!validateContactAndShipping()) {
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      // Check stock first
      const stockResponse = await fetch('/api/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      
      const stockData = await stockResponse.json()
      if (!stockData.success) {
        throw new Error('Some items are out of stock')
      }

      // Process e-transfer order
      const response = await fetch('/api/checkout/etransfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingInfo,
          totals: {
            subtotal,
            discount: discountAmount,
            shippingCost,
            totalBeforeTax,
            gst,
            pst,
            total
          }
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process e-transfer order')
      }

      // Store order number in localStorage before clearing cart
      const orderNumber = data.order.orderNumber
      localStorage.setItem('lastOrderNumber', orderNumber)

      // Navigate first, then clear cart
      window.location.href = `/checkout/etransfer-success?order=${orderNumber}`
      
      // Cart will be cleared after navigation completes
      
    } catch (error) {
      console.error('E-transfer checkout error:', error)
      setError(error instanceof Error ? error.message : 'Failed to process order')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Contact & Shipping */}
          <div className="md:col-span-2 space-y-6">
            {/* Shipping Information Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Shipping Information</h2>
                {isMemberLoggedIn && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadMemberInfo}
                    disabled={isLoadingMemberInfo}
                  >
                    {isLoadingMemberInfo ? (
                      <span>Loading...</span>
                    ) : (
                      <span>Load My Shipping Info</span>
                    )}
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
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
                    onChange={handleInputChange}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="apartment">Apartment/Suite (Optional)</Label>
                  <Input
                    id="apartment"
                    name="apartment"
                    value={shippingInfo.apartment}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <select
                      id="province"
                      name="province"
                      value={shippingInfo.province}
                      onChange={handleInputChange}
                      className={`w-full rounded-md border ${
                        errors.province ? 'border-red-500' : 'border-gray-300'
                      } p-2`}
                    >
                      {PROVINCES.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    className={errors.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('stripe')}
                  className={`p-4 border rounded-lg flex items-center gap-2 ${
                    paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Credit Card</div>
                    <div className="text-sm text-gray-500">Pay with credit card</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange('etransfer')}
                  className={`p-4 border rounded-lg flex items-center gap-2 ${
                    paymentMethod === 'etransfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">E-Transfer</div>
                    <div className="text-sm text-gray-500">Pay via Interac e-Transfer</div>
                  </div>
                </button>
              </div>

              {/* Show E-Transfer instructions and confirm button when selected */}
              {showEtransferInstructions && (
                <div className="mt-4 space-y-4">
                  <ETransferInstructions total={total} />
                  <Button
                    onClick={handleEtransferCheckout}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm E-Transfer Order'}
                  </Button>
                </div>
              )}

              {/* Show Stripe Elements only for credit card payment */}
              {paymentMethod === 'stripe' && (
                <div className="mt-6">
                  <Elements stripe={getStripe()} options={{
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#0F172A',
                      },
                    },
                    mode: 'payment',
                    currency: 'cad',
                    amount: Math.round(total * 100),
                  }}>
                    <PaymentForm
                      shippingInfo={shippingInfo}
                      amount={total}
                      shippingCost={shippingCost}
                      items={items}
                      discountCode={discountCode}
                      discountPercent={discountPercent}
                    />
                  </Elements>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="md:sticky md:top-4 h-fit">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Order Summary</h3>
              <div className="space-y-4">
                {/* Products List */}
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                {/* Subtotal */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {/* Discount Code Input */}
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="text"
                      placeholder="Discount Code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-grow"
                    />
                    <Button 
                      onClick={handleApplyDiscount}
                      variant="outline"
                      size="sm"
                    >
                      Apply
                    </Button>
                  </div>
                  {discountError && (
                    <p className="text-red-500 text-sm">{discountError}</p>
                  )}

                  {/* Discount Amount */}
                  {discountPercent && discountPercent > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between text-sm">
                    <span>Shipping & Handling</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>

                  {/* Total before tax */}
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total before tax</span>
                    <span>${totalBeforeTax.toFixed(2)}</span>
                  </div>

                  {/* Taxes */}
                  <div className="flex justify-between text-sm">
                    <span>GST (5%)</span>
                    <span>${gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>PST (7%)</span>
                    <span>${pst.toFixed(2)}</span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
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