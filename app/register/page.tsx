'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      address: formData.get('address'),
      apartment: formData.get('apartment'),
      city: formData.get('city'),
      province: formData.get('province'),
      postalCode: formData.get('postalCode'),
      country: formData.get('country'),
      phone: formData.get('phone'),
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      router.push('/login?registered=true&message=' + encodeURIComponent(result.message))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
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
            <div className="grid grid-cols-[200px,1fr] gap-4 items-center">
              <label className="font-medium text-right">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full border p-2 rounded"
              />

              <label className="font-medium text-right">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full border p-2 rounded"
              />

              <label className="font-medium text-right">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="w-full border p-2 rounded"
              />

              <label className="font-medium text-right">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                className="w-full border p-2 rounded"
              />

              <label className="font-medium text-right">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                className="w-full border p-2 rounded"
              />

              <label className="font-medium text-right">Address</label>
              <input
                type="text"
                name="address"
                required
                className="w-full border p-2 rounded"
              />

              <label className="font-medium text-right">Apartment</label>
              <input
                type="text"
                name="apartment"
                className="w-full border p-2 rounded"
              />

              <label className="font-medium text-right">City</label>
              <input
                type="text"
                name="city"
                required
                className="w-full border p-2 rounded"
              />

              <label className="font-medium text-right">Province</label>
              <select
                name="province"
                required
                className="w-full border p-2 rounded"
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

              <label className="font-medium text-right">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                required
                className="w-full border p-2 rounded"
              />

              <label className="font-medium text-right">Country</label>
              <input
                type="text"
                name="country"
                required
                defaultValue="Canada"
                className="w-full border p-2 rounded"
              />

              <label className="font-medium text-right">Phone</label>
              <input
                type="tel"
                name="phone"
                required
                className="w-full border p-2 rounded"
              />
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