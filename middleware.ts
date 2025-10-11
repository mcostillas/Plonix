import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Get the pathname
  const path = req.nextUrl.pathname

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',           // Landing page
    '/auth/login', // Login page
    '/auth/register', // Register page
    '/onboarding', // Onboarding page (after registration)
    '/pricing',    // Pricing page (if you want it public)
    '/terms',      // Terms of service
    '/privacy',    // Privacy policy
    // Add any other public routes here
  ]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(path)

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, let the client-side handle authentication checks
  // This middleware primarily handles routing logic
  return NextResponse.next()
}

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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}