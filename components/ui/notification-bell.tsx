'use client'

import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-hooks'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from './notification-center'

export function NotificationBell() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch unread notification count
  useEffect(() => {
    if (!user?.id || !mounted) return

    async function fetchUnreadCount() {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user!.id)
          .eq('is_read', false)

        if (error) throw error
        setUnreadCount(count || 0)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    fetchUnreadCount()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user, mounted])

  // Handle notification read event
  const handleNotificationRead = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  // Handle mark all as read
  const handleMarkAllRead = () => {
    setUnreadCount(0)
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 h-9"
      >
        <Bell className="w-5 h-5 text-gray-600" />
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 h-9 hover:bg-gray-100"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <NotificationCenter
          onClose={() => setIsOpen(false)}
          onNotificationRead={handleNotificationRead}
          onMarkAllRead={handleMarkAllRead}
        />
      )}
    </div>
  )
}
