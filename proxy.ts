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
  '/verify-otp',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/privacy',
  '/support',
]

// Owner verification routes (require auth but accessible to unverified owners)
const verificationRoutes = [
  '/verify-documents',
  '/pending-approval',
]

// Admin-only routes
const adminRoutes = [
  '/users',
  '/admin',
  '/settings/admin',
  '/audit-logs',
  '/owner-verification',
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

  // Check if the current route is a verification route
  const isVerificationRoute = verificationRoutes.some(route => pathname.startsWith(route))

  // Check if the current route is admin-only
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Redirect to login if accessing protected route without auth
  if (!isPublicRoute && !isVerificationRoute && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Decode JWT and check verification status for authenticated users
  let userRole: string | null = null
  let verificationStatus: string | null = null

  if (isAuthenticated && accessToken) {
    try {
      // Decode JWT payload (base64)
      const tokenPayload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString()
      )
      userRole = tokenPayload.role
      verificationStatus = tokenPayload.verificationStatus

      // Debug logging (remove after testing)
      console.log('[Proxy Debug]', {
        pathname,
        userRole,
        verificationStatus,
        isVerificationRoute,
        isPublicRoute,
      })
    } catch (error) {
      // If we can't decode the token, it's invalid - redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // OWNER VERIFICATION FLOW - Check verification status before allowing access
  if (isAuthenticated && userRole === 'OWNER') {
    const url = request.nextUrl.clone()

    // If owner is APPROVED/NOT_REQUIRED, they should NOT be on verification pages
    if ((verificationStatus === 'APPROVED' || verificationStatus === 'NOT_REQUIRED') && isVerificationRoute) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // If owner is NOT approved, check they're on the right verification page
    if (!isVerificationRoute && !isPublicRoute) {
      switch (verificationStatus) {
        case 'PENDING_DOCUMENTS':
        case 'REJECTED':
          // Owner must upload documents
          if (pathname !== '/verify-documents') {
            url.pathname = '/verify-documents'
            return NextResponse.redirect(url)
          }
          break

        case 'PENDING_APPROVAL':
          // Owner is waiting for admin approval
          if (pathname !== '/pending-approval') {
            url.pathname = '/pending-approval'
            return NextResponse.redirect(url)
          }
          break

        case 'APPROVED':
        case 'NOT_REQUIRED':
          // Owner can access all owner routes
          break

        default:
          // Unknown or null status - treat as PENDING_DOCUMENTS only if not already redirecting
          console.error('[Proxy Error] Unknown verification status:', verificationStatus)
          if (pathname !== '/verify-documents') {
            url.pathname = '/verify-documents'
            return NextResponse.redirect(url)
          }
          break
      }
    }
  }

  // Redirect to appropriate page if accessing auth pages while logged in
  if (isPublicRoute && isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()

    // Check verification status for owners
    if (userRole === 'OWNER') {
      switch (verificationStatus) {
        case 'PENDING_DOCUMENTS':
        case 'REJECTED':
          url.pathname = '/verify-documents'
          break
        case 'PENDING_APPROVAL':
          url.pathname = '/pending-approval'
          break
        default:
          url.pathname = '/dashboard'
      }
    } else {
      url.pathname = '/dashboard'
    }

    return NextResponse.redirect(url)
  }

  // For admin routes, check role
  if (isAdminRoute && isAuthenticated) {
    if (userRole !== 'ADMIN') {
      // Redirect non-admins to dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Handle root path
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    if (isAuthenticated) {
      // Check verification status for owners
      if (userRole === 'OWNER') {
        switch (verificationStatus) {
          case 'PENDING_DOCUMENTS':
          case 'REJECTED':
            url.pathname = '/verify-documents'
            break
          case 'PENDING_APPROVAL':
            url.pathname = '/pending-approval'
            break
          default:
            url.pathname = '/dashboard'
        }
      } else {
        url.pathname = '/dashboard'
      }
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