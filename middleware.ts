import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  // Record the visit
  try {
    const response = await fetch(`${request.nextUrl.origin}/api/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: request.nextUrl.pathname,
      }),
    })
    if (!response.ok) {
      console.error('Failed to record visit:', await response.text())
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