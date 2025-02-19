import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if it's an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin-token')

    if (!request.nextUrl.pathname.includes('/admin/login') && !adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
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

  // Create response and add visit tracking headers
  const response = NextResponse.next()
  
  // Add visit tracking headers
  response.headers.set('x-visit-path', request.nextUrl.pathname)
  response.headers.set('x-visit-ip', request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown')
  response.headers.set('x-visit-ua', request.headers.get('user-agent') || 'unknown')

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
} 