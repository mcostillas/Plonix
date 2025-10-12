'use client'

import { useAuth } from '@/lib/auth-hooks'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, redirectTo = '/auth/login' }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      // Store the current path to redirect back after login
      const currentPath = window.location.pathname + window.location.search
      const loginUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
      router.replace(loginUrl)
    }
  }, [user, isLoading, router, redirectTo])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="xl" color="primary" />
      </div>
    )
  }

  // Show nothing (redirect happening) if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="xl" color="primary" />
      </div>
    )
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}

// Higher-order component version for easier use
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard redirectTo={redirectTo}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}