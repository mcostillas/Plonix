'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BookOpen, X, Target, TrendingUp, Wallet } from 'lucide-react'

interface MotivationalModalProps {
  userId: string
  daysSinceLastVisit: number
  onClose: () => void
}

interface SuggestedLesson {
  id: string
  title: string
  description: string
  duration: string
  icon: React.ReactNode
}

const suggestedLessons: SuggestedLesson[] = [
  {
    id: 'emergency-fund',
    title: 'Emergency Fund Basics',
    description: 'Learn why everyone needs an emergency fund',
    duration: '5 minutes',
    icon: <Wallet className="w-4 h-4 text-indigo-600" />
  },
  {
    id: 'budgeting',
    title: 'Budgeting Made Simple',
    description: 'Master the 50/30/20 budgeting rule',
    duration: '6 minutes',
    icon: <Target className="w-4 h-4 text-indigo-600" />
  },
  {
    id: 'investing-101',
    title: 'Investing 101',
    description: 'Start your investment journey today',
    duration: '8 minutes',
    icon: <TrendingUp className="w-4 h-4 text-indigo-600" />
  }
]

export function MotivationalModal({ userId, daysSinceLastVisit, onClose }: MotivationalModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<SuggestedLesson>(suggestedLessons[0])

  useEffect(() => {
    // Randomly select a lesson
    const randomLesson = suggestedLessons[Math.floor(Math.random() * suggestedLessons.length)]
    setSelectedLesson(randomLesson)

    // Show modal after a short delay
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleMaybeLater = () => {
    setIsOpen(false)
    // Store in localStorage to not show again for 24 hours
    localStorage.setItem('plounix_last_motivational_modal', Date.now().toString())
    onClose()
  }

  const handleLetsLearn = () => {
    setIsOpen(false)
    router.push('/learning')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleMaybeLater()
    }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleMaybeLater}
          className="absolute top-2 md:top-4 right-2 md:right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-3 md:p-6">
          {/* Icon */}
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="p-2 md:p-4 bg-indigo-50 rounded-full">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
            </div>
          </div>

          {/* Title & Message */}
          <div className="text-center">
            <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">
              Ready to learn something new?
            </h3>
            <p className="text-[10px] md:text-sm text-gray-600 mb-3 md:mb-6">
              You haven't visited the Learning Hub in {daysSinceLastVisit} days. 
              Your financial knowledge is important!
            </p>

            {/* Suggested Lesson Card */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  {selectedLesson.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedLesson.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {selectedLesson.description}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1 font-medium">
                    Just {selectedLesson.duration}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-6">
              <p className="text-xs text-indigo-900">
                <span className="font-semibold">Did you know?</span> People who spend just 10 minutes learning 
                about personal finance each week are 50% more likely to reach their financial goals.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleMaybeLater}
            >
              Maybe Later
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleLetsLearn}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Let's Learn
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-center text-gray-500 mt-4">
            This reminder appears when you haven't visited in a while. 
            You can disable it in <button 
              onClick={() => router.push('/notifications/settings')}
              className="text-indigo-600 hover:underline"
            >
              notification settings
            </button>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to manage motivational modal display logic
 * @param userId - User ID
 * @param daysSinceLastVisit - Days since last Learning Hub visit
 * @returns Whether to show the modal
 */
export function useMotivationalModal(userId: string | undefined, daysSinceLastVisit: number) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!userId) return

    // Check if user has learning prompts enabled
    async function checkPreferences() {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data } = await supabase
          .from('user_notification_preferences')
          .select('learning_prompts')
          .eq('user_id', userId!)
          .maybeSingle()

        const learningPromptsEnabled = data ? (data as any).learning_prompts : true

        // Don't show if disabled
        if (!learningPromptsEnabled) return

        // Check localStorage for last shown time
        const lastShown = localStorage.getItem('plounix_last_motivational_modal')
        if (lastShown) {
          const hoursSinceLastShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60)
          // Don't show if shown in last 24 hours
          if (hoursSinceLastShown < 24) return
        }

        // Show if user hasn't visited in 5+ days
        if (daysSinceLastVisit >= 5) {
          // Random chance (30%) to avoid annoying users
          if (Math.random() < 0.3) {
            setShowModal(true)
          }
        }
      } catch (error) {
        console.error('Error checking motivational modal preferences:', error)
      }
    }

    checkPreferences()
  }, [userId, daysSinceLastVisit])

  return {
    showModal,
    closeModal: () => setShowModal(false)
  }
}
