'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface ShippingRate {
  id: string
  minItems: number
  maxItems: number | null
  cost: number
}

export default function ShippingRatesPage() {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newRate, setNewRate] = useState({
    minItems: '',
    maxItems: '',
    cost: ''
  })

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/admin/shipping-rates', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setRates(data.rates)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      setError('Failed to fetch shipping rates')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/shipping-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          minItems: parseInt(newRate.minItems),
          maxItems: newRate.maxItems ? parseInt(newRate.maxItems) : null,
          cost: parseFloat(newRate.cost)
        })
      })

      const data = await response.json()
      
      if (data.success) {
        fetchRates()
        setNewRate({ minItems: '', maxItems: '', cost: '' })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      setError('Failed to add shipping rate')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Shipping Rates</h1>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Rate</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min Items</label>
                <Input
                  type="number"
                  value={newRate.minItems}
                  onChange={(e) => setNewRate({ ...newRate, minItems: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Items (optional)</label>
                <Input
                  type="number"
                  value={newRate.maxItems}
                  onChange={(e) => setNewRate({ ...newRate, maxItems: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost (CAD)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newRate.cost}
                  onChange={(e) => setNewRate({ ...newRate, cost: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit">Add Rate</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current Rates</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid gap-4">
            {rates.map((rate) => (
              <Card key={rate.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">
                        {rate.minItems} - {rate.maxItems ?? '∞'} items
                      </span>
                      <span className="ml-4">
                        ${rate.cost.toFixed(2)}
                      </span>
                    </div>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        fetch(`/api/admin/shipping-rates/${rate.id}`, {
                          method: 'DELETE',
                          credentials: 'include'
                        }).then(() => fetchRates())
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 