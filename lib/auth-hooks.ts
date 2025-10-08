'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { auth, type User } from './auth'

// React hook for authentication (client-side only)
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session and validate it
    auth.getSession().then(async ({ user, session, isAuthenticated }) => {
      // Only set user if we have a valid, authenticated session
      if (isAuthenticated && session && user) {
        // Double-check by making an actual request to verify the session
        try {
          const { data: { user: validUser }, error } = await supabase.auth.getUser()
          if (!error && validUser) {
            setUser(user)
          } else {
            // Session is invalid, clear it
            setUser(null)
            await supabase.auth.signOut()
          }
        } catch (error) {
          console.error('Session validation failed:', error)
          setUser(null)
          await supabase.auth.signOut()
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const user = session?.user ? {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            created_at: session.user.created_at,
          } : null
          setUser(user)
        }
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
