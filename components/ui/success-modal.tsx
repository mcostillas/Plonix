'use client'

import { X, CheckCircle, Trophy } from 'lucide-react'
import { Button } from './button'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  icon?: 'check' | 'trophy'
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  icon = 'check'
}: SuccessModalProps) {
  if (!isOpen) return null

  const IconComponent = icon === 'trophy' ? Trophy : CheckCircle

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Header */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconComponent className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-sm text-gray-600">
            {message}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 mb-4">
            <p className="text-sm text-green-800 text-center">
              {icon === 'trophy' ? 'Challenge joined successfully!' : 'Check-in recorded!'}
            </p>
          </div>
          
          {/* Action Button */}
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3"
          >
            Got it, thanks!
          </Button>
        </div>
      </div>
    </div>
  )
}

// Specific modal for joining challenge
export function JoinChallengeSuccessModal({
  isOpen,
  onClose,
  challengeTitle
}: {
  isOpen: boolean
  onClose: () => void
  challengeTitle?: string
}) {
  return (
    <SuccessModal
      isOpen={isOpen}
      onClose={onClose}
      title="Challenge Joined!"
      message={challengeTitle ? `You've joined "${challengeTitle}". Check your dashboard to track progress!` : "You've joined the challenge. Check your dashboard to track progress!"}
      icon="trophy"
    />
  )
}

// Specific modal for check-in success
export function CheckInSuccessModal({
  isOpen,
  onClose,
  challengeTitle
}: {
  isOpen: boolean
  onClose: () => void
  challengeTitle?: string
}) {
  return (
    <SuccessModal
      isOpen={isOpen}
      onClose={onClose}
      title="Check-In Complete!"
      message={challengeTitle ? `Great job! Your progress for "${challengeTitle}" has been updated.` : "Great job! Your progress has been updated."}
      icon="check"
    />
  )
}

// Specific modal for challenge cancellation
export function ChallengeCanceledModal({
  isOpen,
  onClose,
  partialPoints
}: {
  isOpen: boolean
  onClose: () => void
  partialPoints?: number
}) {
  return (
    <SuccessModal
      isOpen={isOpen}
      onClose={onClose}
      title="Challenge Canceled"
      message={partialPoints && partialPoints > 0 
        ? `You earned ${partialPoints} points for your progress! Try again when you're ready.`
        : "Challenge canceled. Try again when you're ready!"}
      icon="check"
    />
  )
}

// Specific modal for goal creation
export function GoalCreatedModal({
  isOpen,
  onClose,
  goalTitle
}: {
  isOpen: boolean
  onClose: () => void
  goalTitle?: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Header */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Goal Created!
          </h2>
          <p className="text-sm text-gray-600">
            {goalTitle ? `"${goalTitle}" has been added to your goals.` : "Your new goal has been created successfully!"}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 mb-4">
            <p className="text-sm text-green-800 text-center font-medium mb-2">
              Start tracking your progress!
            </p>
            <p className="text-xs text-green-700 text-center">
              Update your goal progress regularly to stay motivated and reach your target.
            </p>
          </div>
          
          {/* Action Button */}
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3"
          >
            Got it, thanks!
          </Button>
        </div>
      </div>
    </div>
  )
}
