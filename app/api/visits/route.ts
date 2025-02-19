import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'
    const { path } = await request.json()

    // Don't record visits from bots/crawlers
    if (userAgent.toLowerCase().includes('bot') || 
        userAgent.toLowerCase().includes('crawler')) {
      return NextResponse.json({ success: true })
    }

    // Don't record repeated visits from same IP to same path within 30 minutes
    const recentVisit = await prisma.visit.findFirst({
      where: {
        ip,
        path,
        timestamp: {
          gte: new Date(Date.now() - 30 * 60 * 1000)
        }
      }
    })

    if (recentVisit) {
      return NextResponse.json({ success: true })
    }

    await prisma.visit.create({
      data: { ip, userAgent, path }
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

    // Get visit statistics for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [totalVisits, uniqueIPs, recentVisits] = await Promise.all([
      prisma.visit.count({
        where: {
          timestamp: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.visit.groupBy({
        by: ['ip'],
        where: {
          timestamp: {
            gte: thirtyDaysAgo
          }
        },
        _count: true
      }),
      prisma.visit.findMany({
        take: 50,
        orderBy: {
          timestamp: 'desc'
        },
        where: {
          timestamp: {
            gte: thirtyDaysAgo
          }
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