import { Spinner } from '@/components/ui/spinner'

interface PageLoaderProps {
  message?: string // Kept for backwards compatibility but not displayed
}

export function PageLoader({ message }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner size="xl" color="primary" />
    </div>
  )
}
