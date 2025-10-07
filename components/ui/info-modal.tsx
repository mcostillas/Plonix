'use client'

import { X, AlertCircle, Info } from 'lucide-react'
import { Button } from './button'

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'info' | 'warning'
}

export function InfoModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}: InfoModalProps) {
  if (!isOpen) return null

  const isWarning = type === 'warning'
  const IconComponent = isWarning ? AlertCircle : Info

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 text-center">
          <div className={`w-16 h-16 ${isWarning ? 'bg-orange-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <IconComponent className={`w-8 h-8 ${isWarning ? 'text-orange-600' : 'text-blue-600'}`} />
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
          <div className={`p-4 rounded-lg border mb-4 ${
            isWarning 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-sm text-center ${
              isWarning ? 'text-orange-800' : 'text-blue-800'
            }`}>
              {isWarning ? 'You can only have one active instance per challenge.' : 'Please try again later or choose a different time.'}
            </p>
          </div>
          
          {/* Action Button */}
          <Button
            onClick={onClose}
            className={`w-full py-3 ${
              isWarning 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}

// Specific modal for already joined challenge
export function AlreadyJoinedModal({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      title="Already Joined"
      message="You already have an active instance of this challenge"
      type="warning"
    />
  )
}

// Specific modal for already checked in
export function AlreadyCheckedInModal({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      title="Already Checked In"
      message="Already checked in for this date"
      type="info"
    />
  )
}
