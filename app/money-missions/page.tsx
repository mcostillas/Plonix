'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MoneyMissionsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to challenges page since money-missions and challenges are the same
    router.replace('/challenges')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Challenges...</p>
      </div>
    </div>
  )
}