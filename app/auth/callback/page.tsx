'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'
import { PiggyBank } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL hash
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=Authentication failed')
          return
        }

        if (session) {
          // Get user data
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            // Check if this is a new user (first time signing in with Google)
            const isNewUser = new Date(user.created_at!).getTime() > Date.now() - 10000 // Created within last 10 seconds
            
            // Update user metadata to ensure membership_type is set
            if (isNewUser || !user.user_metadata?.membership_type) {
              await supabase.auth.updateUser({
                data: {
                  membership_type: user.user_metadata?.membership_type || 'freemium',
                  name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
                }
              })
            }

            // Create or update user profile
            try {
              const { error: profileError } = await (supabase
                .from('user_profiles')
                .upsert as any)({
                  user_id: user.id,
                  updated_at: new Date().toISOString(),
                })

              if (profileError) {
                console.error('Profile creation error:', profileError)
              }
            } catch (profileError) {
              console.error('Profile upsert error:', profileError)
            }

            // Send welcome email for new users
            if (isNewUser) {
              try {
                await fetch('/api/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'welcome',
                    to: user.email,
                    userName: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
                  })
                })
              } catch (emailError) {
                console.error('Welcome email error:', emailError)
              }
            }

            // Redirect to dashboard
            router.push('/dashboard')
          } else {
            router.push('/auth/login?error=User data not found')
          }
        } else {
          router.push('/auth/login?error=No session found')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/auth/login?error=An unexpected error occurred')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50/30 to-green-50/30 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <PiggyBank className="w-8 h-8 text-primary animate-bounce" />
          <span className="text-2xl font-bold text-primary">Plounix</span>
        </div>
        <div className="space-y-3">
          <Spinner size="xl" color="primary" />
          <p className="text-gray-600 text-lg">Completing sign in...</p>
          <p className="text-gray-500 text-sm">Please wait while we set up your account</p>
        </div>
      </div>
    </div>
  )
}
