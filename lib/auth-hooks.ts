'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { auth, type User } from './auth'

// React hook for authentication (client-side only)
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    auth.getSession().then(({ user }) => {
      setUser(user || null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ? {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          created_at: session.user.created_at,
        } : null

        setUser(user)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
  }
}
