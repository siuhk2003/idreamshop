'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

interface MemberProfile {
  email: string
  firstName: string
  lastName: string
  address: string
  apartment?: string
  city: string
  province: string
  postalCode: string
  country: string
  phone: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/member/profile')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data.member)
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
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

      const response = await fetch('/api/member/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile.member)
      setEditing(false)
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    setSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      const currentPassword = formData.get('currentPassword')
      const newPassword = formData.get('newPassword')
      const confirmPassword = formData.get('confirmPassword')

      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match')
        return
      }

      const response = await fetch('/api/member/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setPasswordSuccess(true)
      setChangingPassword(false)
      // Reset form
      e.currentTarget.reset()
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="text-center py-8">Loading profile...</div>
      </main>
      <Footer />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Profile</h1>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded mb-6">
              {error}
            </div>
          )}

          {profile && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full border p-2 rounded bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={profile.firstName}
                    disabled={!editing}
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={profile.lastName}
                    disabled={!editing}
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={profile.address}
                    disabled={!editing}
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">Apartment (optional)</label>
                  <input
                    type="text"
                    name="apartment"
                    defaultValue={profile.apartment}
                    disabled={!editing}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={profile.city}
                    disabled={!editing}
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">Province</label>
                  <select
                    name="province"
                    defaultValue={profile.province}
                    disabled={!editing}
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
                </div>

                <div>
                  <label className="block mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    defaultValue={profile.postalCode}
                    disabled={!editing}
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    defaultValue={profile.country}
                    disabled={!editing}
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={profile.phone}
                    disabled={!editing}
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                {editing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          )}

          <div className="mt-8 pt-8 border-t">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Password</h2>
              {!changingPassword && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChangingPassword(true)}
                >
                  Change Password
                </Button>
              )}
            </div>

            {passwordSuccess && (
              <div className="bg-green-50 text-green-600 p-4 rounded mb-4">
                Password successfully updated
              </div>
            )}

            {changingPassword && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordError && (
                  <div className="bg-red-50 text-red-500 p-4 rounded">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setChangingPassword(false)
                      setPasswordError('')
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 