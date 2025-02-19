import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function middleware(request: NextRequest) {
  // Check if it's an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin-token')

    // Exclude login page from check
    if (!request.nextUrl.pathname.includes('/admin/login')) {
      if (!adminToken) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
  }

  // Skip recording for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Record the visit directly
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const path = request.nextUrl.pathname

    // Don't record visits from bots/crawlers
    if (userAgent.toLowerCase().includes('bot') || 
        userAgent.toLowerCase().includes('crawler')) {
      return NextResponse.next()
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

    if (!recentVisit) {
      await prisma.visit.create({
        data: {
          ip,
          userAgent,
          path,
        }
      })
    }
  } catch (error) {
    console.error('Failed to record visit:', error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',  // For admin routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)'  // For tracking visits
  ]
} 