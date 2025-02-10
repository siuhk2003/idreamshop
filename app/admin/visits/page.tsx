'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { format } from 'date-fns'

interface VisitStats {
  totalVisits: number
  uniqueVisitors: number
  recentVisits: Array<{
    id: string
    ip: string
    userAgent: string
    path: string
    timestamp: string
  }>
}

export default function VisitsPage() {
  const [stats, setStats] = useState<VisitStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/visits', {
          credentials: 'include'
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch visit statistics')
        }

        setStats(data.stats)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Website Visits</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Total Visits</h2>
            <p className="text-3xl">{stats?.totalVisits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Unique Visitors</h2>
            <p className="text-3xl">{stats?.uniqueVisitors}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Visits</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">IP</th>
                  <th className="text-left p-2">Path</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentVisits.map((visit) => (
                  <tr key={visit.id} className="border-b">
                    <td className="p-2">{format(new Date(visit.timestamp), 'PPpp')}</td>
                    <td className="p-2">{visit.ip}</td>
                    <td className="p-2">{visit.path}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 