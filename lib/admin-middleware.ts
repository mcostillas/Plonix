import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getAdminSession, verifyAdminAccess } from './admin-auth'

/**
 * Admin route protection middleware
 * Add this to middleware.ts to protect /admin routes
 */
export async function adminMiddleware(request: NextRequest) {
  const response = NextResponse.next()

  // Check if session exists
  const adminSession = await getAdminSession()
  
  if (!adminSession) {
    // No session, redirect to login
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Perform comprehensive security check
  const verification = await verifyAdminAccess(adminSession.username)
  
  if (!verification.isAdmin) {
    console.warn('⚠️ Admin access denied:', verification.reasons)
    
    // Clear invalid session
    const clearResponse = NextResponse.redirect(new URL('/auth/signin', request.url))
    clearResponse.cookies.delete('admin_session')
    
    return clearResponse
  }

  // Check session expiration (24 hours)
  const loginTime = new Date(adminSession.loginTime).getTime()
  const now = new Date().getTime()
  const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60)

  if (hoursSinceLogin > 24) {
    // Session expired
    const expiredResponse = NextResponse.redirect(new URL('/auth/signin', request.url))
    expiredResponse.cookies.delete('admin_session')
    
    return expiredResponse
  }

  // All checks passed
  return response
}

/**
 * API route guard for admin endpoints
 * Use this in your API routes: await requireAdmin(request)
 */
export async function requireAdmin(request?: NextRequest): Promise<{
  authorized: boolean
  email?: string
  username?: string
  error?: string
}> {
  try {
    const adminSession = await getAdminSession()
    
    if (!adminSession) {
      return { authorized: false, error: 'No admin session' }
    }

    // Comprehensive security check
    const verification = await verifyAdminAccess(adminSession.username)
    
    if (!verification.isAdmin) {
      return { 
        authorized: false, 
        error: verification.reasons.join(', ')
      }
    }

    // Check session expiration
    const loginTime = new Date(adminSession.loginTime).getTime()
    const now = new Date().getTime()
    const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60)

    if (hoursSinceLogin > 24) {
      return { authorized: false, error: 'Session expired' }
    }

    return { authorized: true, email: adminSession.email, username: adminSession.username }
  } catch (error) {
    console.error('Admin authorization error:', error)
    return { authorized: false, error: 'Authorization failed' }
  }
}

/**
 * Rate limiting for admin login attempts
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): {
  allowed: boolean
  remaining: number
  resetAt?: Date
} {
  const now = Date.now()
  const record = loginAttempts.get(identifier)

  if (!record || now - record.lastAttempt > windowMs) {
    // First attempt or window expired
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
    return { allowed: true, remaining: maxAttempts - 1 }
  }

  if (record.count >= maxAttempts) {
    // Rate limit exceeded
    const resetAt = new Date(record.lastAttempt + windowMs)
    return { allowed: false, remaining: 0, resetAt }
  }

  // Increment attempt count
  record.count++
  record.lastAttempt = now
  loginAttempts.set(identifier, record)

  return { allowed: true, remaining: maxAttempts - record.count }
}

export function resetRateLimit(identifier: string) {
  loginAttempts.delete(identifier)
}
