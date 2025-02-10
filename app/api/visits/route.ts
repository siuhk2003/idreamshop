import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'
    const { path } = await request.json()

    await prisma.visit.create({
      data: {
        ip,
        userAgent,
        path,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to record visit:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const headersList = await headers()
    const hasAdminToken = headersList.get('cookie')?.includes('admin-token')

    if (!hasAdminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get visit statistics
    const [totalVisits, uniqueIPs, recentVisits] = await Promise.all([
      prisma.visit.count(),
      prisma.visit.groupBy({
        by: ['ip'],
        _count: true
      }),
      prisma.visit.findMany({
        take: 50,
        orderBy: {
          timestamp: 'desc'
        }
      })
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalVisits,
        uniqueVisitors: uniqueIPs.length,
        recentVisits
      }
    })
  } catch (error) {
    console.error('Failed to get visit stats:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 