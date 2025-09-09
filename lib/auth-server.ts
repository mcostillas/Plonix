import { createClient } from '@supabase/supabase-js'

export interface User {
  id: string
  email?: string
  user_metadata?: any
  app_metadata?: any
  aud?: string
  created_at?: string
}

export interface AuthResponse {
  success: boolean
  user?: User | null
  error?: string
}

// Server-side auth utilities (no React hooks)
export const serverAuth = {
  // Create server client for API routes
  getServerClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for server
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  },

  // Get user from request headers (for API routes)
  async getUserFromHeaders(request: Request): Promise<AuthResponse> {
    try {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'No authorization header' }
      }

      const token = authHeader.substring(7)
      const supabase = this.getServerClient()
      
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        return { success: false, error: 'Invalid token' }
      }

      return { success: true, user }
    } catch (error) {
      return { success: false, error: 'Authentication failed' }
    }
  },

  // Validate session token
  async validateSession(sessionToken: string): Promise<AuthResponse> {
    try {
      const supabase = this.getServerClient()
      const { data: { user }, error } = await supabase.auth.getUser(sessionToken)
      
      if (error || !user) {
        return { success: false, error: 'Invalid session' }
      }

      return { success: true, user }
    } catch (error) {
      return { success: false, error: 'Session validation failed' }
    }
  },

  // Check if user is authenticated (server-side)
  async isAuthenticated(request: Request): Promise<boolean> {
    const result = await this.getUserFromHeaders(request)
    return result.success
  },

  // Require authentication (throws if not authenticated)
  async requireAuth(request: Request): Promise<User> {
    const result = await this.getUserFromHeaders(request)
    if (!result.success || !result.user) {
      throw new Error('Authentication required')
    }
    return result.user
  },

  // Get current user (server-side)
  async getCurrentUser(request: Request): Promise<AuthResponse> {
    return await this.getUserFromHeaders(request)
  }
}
