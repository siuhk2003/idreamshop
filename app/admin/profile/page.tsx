'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminProfile() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const currentPassword = formData.get('currentPassword')
    const newPassword = formData.get('newPassword')
    const confirmPassword = formData.get('confirmPassword')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setSuccess('Password updated successfully')
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Change Admin Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                name="currentPassword"
                type="password"
                placeholder="Current Password"
                required
              />
            </div>
            <div>
              <Input
                name="newPassword"
                type="password"
                placeholder="New Password"
                required
              />
            </div>
            <div>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            {success && (
              <div className="text-green-500 text-sm">{success}</div>
            )}
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 