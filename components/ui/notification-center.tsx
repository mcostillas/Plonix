'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/auth-hooks'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  Calendar, 
  BookOpen, 
  Trophy, 
  AlertCircle, 
  Info,
  X,
  ExternalLink
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  user_id: string
  type: 'bill_reminder' | 'learning' | 'achievement' | 'budget_alert' | 'system'
  title: string
  message: string
  action_url: string | null
  is_read: boolean
  clicked_at: string | null
  metadata: any
  created_at: string
}

interface NotificationCenterProps {
  onClose: () => void
  onNotificationRead: () => void
  onMarkAllRead: () => void
}

export function NotificationCenter({ 
  onClose, 
  onNotificationRead, 
  onMarkAllRead 
}: NotificationCenterProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Fetch notifications
  useEffect(() => {
    if (!user?.id) return

    async function fetchNotifications() {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error
        setNotifications(data || [])
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await (supabase
        .from('notifications')
        .update as any)({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      onNotificationRead()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await (supabase
        .from('notifications')
        .update as any)({ is_read: true })
        .eq('user_id', user!.id)
        .eq('is_read', false)

      if (error) throw error

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      )
      onMarkAllRead()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }

    // Track click
    try {
      const { supabase } = await import('@/lib/supabase')
      await (supabase
        .from('notifications')
        .update as any)({ clicked_at: new Date().toISOString() })
        .eq('id', notification.id)
    } catch (error) {
      console.error('Error tracking click:', error)
    }

    // Navigate if action URL exists
    if (notification.action_url) {
      onClose()
      router.push(notification.action_url)
    }
  }

  // Get icon based on notification type
  const getIcon = (type: Notification['type']) => {
    const iconClass = "w-4 h-4"
    
    switch (type) {
      case 'bill_reminder':
        return <Calendar className={iconClass + " text-red-600"} />
      case 'learning':
        return <BookOpen className={iconClass + " text-blue-600"} />
      case 'achievement':
        return <Trophy className={iconClass + " text-yellow-600"} />
      case 'budget_alert':
        return <AlertCircle className={iconClass + " text-orange-600"} />
      case 'system':
        return <Info className={iconClass + " text-gray-600"} />
      default:
        return <Bell className={iconClass + " text-gray-600"} />
    }
  }

  // Get background color based on notification type
  const getIconBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'bill_reminder':
        return 'bg-red-50'
      case 'learning':
        return 'bg-blue-50'
      case 'achievement':
        return 'bg-yellow-50'
      case 'budget_alert':
        return 'bg-orange-50'
      default:
        return 'bg-gray-50'
    }
  }

  // Format relative time
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const hasUnread = notifications.some((n) => !n.is_read)

  return (
    <div 
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </h3>
          <div className="flex items-center space-x-2">
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-700 h-7 px-2"
              >
                Mark all as read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 mt-2">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900">No notifications yet</p>
            <p className="text-xs text-gray-500 mt-1">
              We'll notify you about bills, achievements, and more
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.is_read ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${getIconBgColor(notification.type)} flex-shrink-0`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                      {notification.action_url && (
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Unread indicator */}
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose()
              router.push('/notifications')
            }}
            className="w-full text-sm text-center text-gray-600 hover:text-gray-900 h-8"
          >
            View all notifications
          </Button>
        </div>
      )}
    </div>
  )
}
