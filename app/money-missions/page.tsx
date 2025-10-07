'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

export default function MoneyMissionsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to challenges page since money-missions and challenges are the same
    router.replace('/challenges')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="xl" color="primary" className="mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to Challenges...</p>
      </div>
    </div>
  )
}