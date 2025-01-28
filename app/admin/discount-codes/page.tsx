'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface DiscountCode {
  id: string
  code: string
  discount: number
  active: boolean
  startDate: string | null
  endDate: string | null
}

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newCode, setNewCode] = useState({
    code: '',
    discount: '',
    startDate: '',
    endDate: ''
  })

  const fetchCodes = async () => {
    try {
      const response = await fetch('/api/admin/discount-codes', {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setCodes(data.codes)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      setError('Failed to fetch discount codes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCodes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: newCode.code.toUpperCase(),
          discount: parseFloat(newCode.discount),
          startDate: newCode.startDate || null,
          endDate: newCode.endDate || null
        })
      })

      const data = await response.json()
      if (data.success) {
        setNewCode({ code: '', discount: '', startDate: '', endDate: '' })
        fetchCodes()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create discount code')
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      })

      if (response.ok) {
        fetchCodes()
      }
    } catch (error) {
      setError('Failed to update discount code')
    }
  }

  const deleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return

    try {
      const response = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCodes()
      }
    } catch (error) {
      setError('Failed to delete discount code')
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Manage Discount Codes</h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                  placeholder="SUMMER2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={newCode.discount}
                  onChange={(e) => setNewCode({ ...newCode, discount: e.target.value })}
                  placeholder="10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={newCode.startDate}
                  onChange={(e) => setNewCode({ ...newCode, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={newCode.endDate}
                  onChange={(e) => setNewCode({ ...newCode, endDate: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create Discount Code
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : codes.length === 0 ? (
          <div>No discount codes found.</div>
        ) : (
          codes.map((code) => (
            <Card key={code.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{code.code}</h3>
                    <p className="text-sm text-gray-500">{code.discount}% off</p>
                    {code.startDate && (
                      <p className="text-sm text-gray-500">
                        Start: {new Date(code.startDate).toLocaleDateString()}
                      </p>
                    )}
                    {code.endDate && (
                      <p className="text-sm text-gray-500">
                        End: {new Date(code.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={code.active ? "default" : "secondary"}
                      onClick={() => toggleActive(code.id, code.active)}
                    >
                      {code.active ? 'Active' : 'Inactive'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteCode(code.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  )
} 