import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isAdminPath = path.startsWith('/admin')
  const isLoginPath = path === '/admin/login'
  const adminToken = request.cookies.get('admin-token')

  // If trying to access admin pages without token (except login page)
  if (isAdminPath && !adminToken && !isLoginPath) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // If trying to access login page with valid token
  if (isLoginPath && adminToken) {
    return NextResponse.redirect(new URL('/admin/orders', request.url))
  }

  const response = NextResponse.next()
  
  // Ensure CORS headers are set for API routes
  if (path.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*']
} 