/**
 * Next.js Proxy (formerly Middleware)
 * Handles authentication and route protection
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/register/verify',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/privacy',
  '/support',
]

// Admin-only routes
const adminRoutes = [
  '/users',
  '/admin',
  '/settings/admin',
  '/audit-logs',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // Check if user is authenticated
  const isAuthenticated = !!accessToken

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Check if the current route is admin-only
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Redirect to login if accessing protected route without auth
  if (!isPublicRoute && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isPublicRoute && isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // For admin routes, we'll need to decode the JWT to check the role
  // This is a simplified check - in production, you'd want to verify the JWT properly
  if (isAdminRoute && isAuthenticated) {
    try {
      // Decode JWT payload (base64)
      const tokenPayload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString()
      )

      if (tokenPayload.role !== 'ADMIN') {
        // Redirect non-admins to dashboard
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // If we can't decode the token, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Handle root path
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    if (isAuthenticated) {
      url.pathname = '/dashboard'
    } else {
      url.pathname = '/login'
    }
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}