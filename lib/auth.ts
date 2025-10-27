import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  name?: string
  created_at?: string
  membershipType?: 'freemium' | 'premium'
}

export interface AuthSession {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Standalone functions for backward compatibility
export async function signUp(email: string, password: string, name?: string, age?: number) {
  return await auth.signUp(email, password, name, age)
}

export async function signIn(email: string, password: string) {
  return await auth.signIn(email, password)
}

export async function signOut() {
  return await auth.signOut()
}

export async function getCurrentUser() {
  const result = await auth.getCurrentUser()
  return result.user
}

export async function validateAuthentication() {
  const result = await auth.getSession()
  return {
    user: result.user,
    isValid: result.isAuthenticated
  }
}

// Auth helper functions
export const auth = {
  // Sign in with Google OAuth
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  // Sign up with email and password
  async signUp(email: string, password: string, name?: string, age?: number) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
            age: age,
            membership_type: 'freemium', // All users start as freemium (50 messages/month)
          },
        },
      })

      if (error) {
        throw error
      }

      // If user was created, also save age to user_profiles
      if (data.user && age) {
        try {
          await (supabase
            .from('user_profiles')
            .upsert as any)({
              user_id: data.user.id,
              age: age,
              updated_at: new Date().toISOString()
            })
        } catch (profileError) {
          console.error('Error saving age to profile:', profileError)
          // Don't fail registration if profile update fails
        }
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        throw error
      }

      return {
        success: true,
        user: user ? {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email?.split('@')[0],
          created_at: user.created_at,
          membershipType: user.user_metadata?.membership_type || 'freemium',
        } : null,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        user: null,
      }
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }

      return {
        success: true,
        session,
        isAuthenticated: !!session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          created_at: session.user.created_at,
          membershipType: session.user.user_metadata?.membership_type || 'freemium',
        } : null,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        session: null,
        isAuthenticated: false,
        user: null,
      }
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const { isAuthenticated } = await this.getSession()
    return isAuthenticated
  },

  // Require authentication (for protected pages/APIs)
  async requireAuth() {
    const result = await this.getSession()
    
    if (!result.success || !result.isAuthenticated || !result.user) {
      throw new Error('Authentication required')
    }

    return result.user
  }
}

// Auth state listener for real-time updates
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user ? {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
      created_at: session.user.created_at,
      membershipType: session.user.user_metadata?.membership_type || 'freemium',
    } : null

    callback(user)
  })
}

// React hook for authentication is now in auth-hooks.ts (client-side only)
