'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { validateForm } from '@/lib/validation'
import Link from 'next/link'

interface FormErrors {
  [key: string]: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const errors = validateForm({ [name]: value })
    setFieldErrors(prev => ({
      ...prev,
      [name]: errors[name] || ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries()) as Record<string, string>

    // Check passwords match
    if (data.password !== data.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' })
      setLoading(false)
      return
    }

    // Validate all fields
    const validationErrors = validateForm(data)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.validationErrors) {
          setFieldErrors(result.validationErrors)
          throw new Error('Please correct the highlighted fields')
        }
        throw new Error(result.error || 'Registration failed')
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Registration Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              A verification email has been sent to your email address.
              Please check your inbox and click the verification link to complete your registration.
            </p>
            <p className="text-sm text-gray-500 text-center">
              If you don't see the email, please check your spam folder.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Register</h1>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-[200px,1fr] gap-4 items-start">
              <Label htmlFor="email" className="text-right pt-2">Email</Label>
              <div className="space-y-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={fieldErrors.email ? 'border-red-500' : ''}
                  onBlur={handleBlur}
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm">{fieldErrors.email}</p>
                )}
              </div>

              <Label htmlFor="password" className="text-right pt-2">Password</Label>
              <div className="space-y-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={fieldErrors.password ? 'border-red-500' : ''}
                  onBlur={handleBlur}
                />
                {fieldErrors.password && (
                  <p className="text-red-500 text-sm">{fieldErrors.password}</p>
                )}
              </div>

              <Label htmlFor="confirmPassword" className="text-right pt-2">Confirm Password</Label>
              <div className="space-y-1">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
                  onBlur={(e) => {
                    const password = (e.currentTarget.form?.elements.namedItem('password') as HTMLInputElement)?.value
                    if (e.target.value !== password) {
                      setFieldErrors(prev => ({
                        ...prev,
                        confirmPassword: 'Passwords do not match'
                      }))
                    } else {
                      setFieldErrors(prev => ({
                        ...prev,
                        confirmPassword: ''
                      }))
                    }
                  }}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-red-500 text-sm">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <Label htmlFor="firstName" className="text-right pt-2">First Name</Label>
              <div className="space-y-1">
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  className={fieldErrors.firstName ? 'border-red-500' : ''}
                  onBlur={handleBlur}
                />
                {fieldErrors.firstName && (
                  <p className="text-red-500 text-sm">{fieldErrors.firstName}</p>
                )}
              </div>

              <Label htmlFor="lastName" className="text-right pt-2">Last Name</Label>
              <div className="space-y-1">
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  className={fieldErrors.lastName ? 'border-red-500' : ''}
                  onBlur={handleBlur}
                />
                {fieldErrors.lastName && (
                  <p className="text-red-500 text-sm">{fieldErrors.lastName}</p>
                )}
              </div>

              <Label htmlFor="address" className="text-right pt-2">Address</Label>
              <div className="space-y-1">
                <Input
                  id="address"
                  name="address"
                  required
                  className={fieldErrors.address ? 'border-red-500' : ''}
                  onBlur={handleBlur}
                />
                {fieldErrors.address && (
                  <p className="text-red-500 text-sm">{fieldErrors.address}</p>
                )}
              </div>

              <Label htmlFor="apartment" className="text-right pt-2">Apartment</Label>
              <div className="space-y-1">
                <Input
                  id="apartment"
                  name="apartment"
                  className={fieldErrors.apartment ? 'border-red-500' : ''}
                  onBlur={handleBlur}
                />
                {fieldErrors.apartment && (
                  <p className="text-red-500 text-sm">{fieldErrors.apartment}</p>
                )}
              </div>

              <Label htmlFor="city" className="text-right pt-2">City</Label>
              <div className="space-y-1">
                <Input
                  id="city"
                  name="city"
                  required
                  className={fieldErrors.city ? 'border-red-500' : ''}
                  onBlur={handleBlur}
                />
                {fieldErrors.city && (
                  <p className="text-red-500 text-sm">{fieldErrors.city}</p>
                )}
              </div>

              <Label htmlFor="province" className="text-right pt-2">Province</Label>
              <select
                name="province"
                required
                className={fieldErrors.province ? 'border-red-500' : ''}
                onBlur={handleBlur}
              >
                <option value="">Select Province</option>
                <option value="Alberta">Alberta</option>
                <option value="British Columbia">British Columbia</option>
                <option value="Manitoba">Manitoba</option>
                <option value="New Brunswick">New Brunswick</option>
                <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                <option value="Nova Scotia">Nova Scotia</option>
                <option value="Ontario">Ontario</option>
                <option value="Prince Edward Island">Prince Edward Island</option>
                <option value="Quebec">Quebec</option>
                <option value="Saskatchewan">Saskatchewan</option>
              </select>
              {fieldErrors.province && (
                <p className="text-red-500 text-sm">{fieldErrors.province}</p>
              )}

              <Label htmlFor="postalCode" className="text-right pt-2">Postal Code</Label>
              <div className="space-y-1">
                <Input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  className={fieldErrors.postalCode ? 'border-red-500' : ''}
                  onBlur={handleBlur}
                />
                {fieldErrors.postalCode && (
                  <p className="text-red-500 text-sm">{fieldErrors.postalCode}</p>
                )}
              </div>

              <Label htmlFor="country" className="text-right pt-2">Country</Label>
              <div className="space-y-1">
                <Input
                  id="country"
                  name="country"
                  type="text"
                  required
                  defaultValue="Canada"
                  className={fieldErrors.country ? 'border-red-500' : ''}
                  onBlur={handleBlur}
                />
                {fieldErrors.country && (
                  <p className="text-red-500 text-sm">{fieldErrors.country}</p>
                )}
              </div>

              <Label htmlFor="phone" className="text-right pt-2">Phone</Label>
              <div className="space-y-1">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className={fieldErrors.phone ? 'border-red-500' : ''}
                  onBlur={handleBlur}
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-sm">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="submit"
                className="w-32"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500 hover:text-blue-600">
              Login here
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
} 