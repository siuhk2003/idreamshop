'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

interface ShippingRate {
  id: string
  minItems: number
  maxItems: number | null
  cost: number
  province: string
}

export default function ShippingRatesPage() {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProvince, setSelectedProvince] = useState<string>(PROVINCES[0])

  const [newRate, setNewRate] = useState({
    minItems: '',
    maxItems: '',
    cost: '',
    province: PROVINCES[0]
  })

  const [copyingProvince, setCopyingProvince] = useState<string | null>(null)
  const [targetProvince, setTargetProvince] = useState<string>(PROVINCES[0])

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
      console.log('Submitting shipping rate:', newRate)
      const response = await fetch('/api/admin/shipping-rates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          credentials: 'include'
        },
        body: JSON.stringify({
          minItems: parseInt(newRate.minItems),
          maxItems: newRate.maxItems ? parseInt(newRate.maxItems) : null,
          cost: parseFloat(newRate.cost),
          province: newRate.province
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Failed to add rate:', data.error)
        throw new Error(data.error)
      }
      
      if (data.success) {
        fetchRates()
        setNewRate({ minItems: '', maxItems: '', cost: '', province: PROVINCES[0] })
      }
    } catch (error) {
      setError('Failed to add shipping rate')
    }
  }

  const handleCopyRates = async () => {
    if (!copyingProvince || !targetProvince) return

    try {
      const sourceRates = rates.filter(rate => rate.province === copyingProvince)
      
      for (const rate of sourceRates) {
        await fetch('/api/admin/shipping-rates', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            credentials: 'include'
          },
          body: JSON.stringify({
            minItems: rate.minItems,
            maxItems: rate.maxItems,
            cost: rate.cost,
            province: targetProvince
          })
        })
      }

      fetchRates()
      setCopyingProvince(null)
    } catch (error) {
      setError('Failed to copy shipping rates')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Shipping Rate</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">Province</Label>
                <Select
                  value={newRate.province}
                  onValueChange={(value) => setNewRate({ ...newRate, province: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <h2 className="text-xl font-semibold">Current Rates</h2>
            <Select
              value={selectedProvince}
              onValueChange={setSelectedProvince}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setCopyingProvince(selectedProvince)}
              >
                <Copy className="w-4 h-4" />
                Copy Rates
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Copy Shipping Rates</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>From Province</Label>
                  <p className="text-sm text-gray-500">{copyingProvince}</p>
                </div>
                <div className="space-y-2">
                  <Label>To Province</Label>
                  <Select
                    value={targetProvince}
                    onValueChange={setTargetProvince}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.filter(p => p !== copyingProvince).map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleCopyRates}
                >
                  Copy Rates
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid gap-4">
            {rates
              .filter(rate => rate.province === selectedProvince)
              .map((rate) => (
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