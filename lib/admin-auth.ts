import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export interface AdminSession {
  username: string
  email: string
  loginTime: string
}

/**
 * Create Supabase admin client (bypasses RLS)
 */
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key - has admin access
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

/**
 * Verify admin credentials and return session
 */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
  try {
    const supabase = await createAdminClient()

    // Fetch admin credentials
    const { data: admin, error } = await supabase
      .from('admin_credentials')
      .select('username, password_hash, email, is_active, last_login')
      .eq('username', username)
      .single()

    if (error || !admin) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Check if admin is active
    if (!admin.is_active) {
      return { success: false, error: 'This admin account has been deactivated' }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)

    if (!isValidPassword) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Update last login time
    await supabase
      .from('admin_credentials')
      .update({ last_login: new Date().toISOString() })
      .eq('username', username)

    const session: AdminSession = {
      username: admin.username,
      email: admin.email,
      loginTime: new Date().toISOString(),
    }

    return { success: true, session }
  } catch (error) {
    console.error('Admin auth error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Get current admin session from cookie
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin_session')

    if (!sessionCookie) {
      return null
    }

    // Parse and verify session
    const session = JSON.parse(sessionCookie.value) as AdminSession

    // Check if session is still valid (24 hours)
    const loginTime = new Date(session.loginTime).getTime()
    const now = new Date().getTime()
    const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60)

    if (hoursSinceLogin > 24) {
      return null // Session expired
    }

    return session
  } catch (error) {
    console.error('Session parse error:', error)
    return null
  }
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession()
  return session !== null
}

/**
 * Set admin session cookie
 */
export async function setAdminSession(session: AdminSession) {
  const cookieStore = await cookies()
  
  cookieStore.set('admin_session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

/**
 * Clear admin session (logout)
 */
export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}

/**
 * Log admin activity
 */
export async function logAdminActivity({
  username,
  action,
  actionType,
  targetType,
  targetId,
  details,
  ipAddress,
  userAgent,
}: {
  username: string
  action: string
  actionType: 'read' | 'create' | 'update' | 'delete' | 'export'
  targetType?: string
  targetId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
}) {
  try {
    const supabase = await createAdminClient()

    await supabase.from('admin_activity_log').insert({
      admin_username: username,
      action,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  } catch (error) {
    console.error('Failed to log admin activity:', error)
  }
}

/**
 * Middleware helper to protect admin routes
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession()

  if (!session) {
    throw new Error('Unauthorized: Admin access required')
  }

  return session
}
