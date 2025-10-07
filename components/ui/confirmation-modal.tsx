'use client'

import { X, AlertTriangle, Trash2, History } from 'lucide-react'
import { Button } from './button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: 'danger' | 'warning'
  confirmText?: string
  cancelText?: string
  icon?: 'trash' | 'history' | 'warning'
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = 'warning'
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (icon) {
      case 'trash':
        return <Trash2 className="w-6 h-6" />
      case 'history':
        return <History className="w-6 h-6" />
      default:
        return <AlertTriangle className="w-6 h-6" />
    }
  }

  const getIconBgColor = () => {
    return type === 'danger' ? 'bg-red-100' : 'bg-orange-100'
  }

  const getIconColor = () => {
    return type === 'danger' ? 'text-red-600' : 'text-orange-600'
  }

  return (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-full ${getIconBgColor()} flex items-center justify-center ${getIconColor()}`}>
              {getIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`p-4 rounded-lg ${type === 'danger' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
            <p className={`text-sm font-medium ${type === 'danger' ? 'text-red-800' : 'text-orange-800'}`}>
              This action cannot be undone
            </p>
            <p className={`text-xs ${type === 'danger' ? 'text-red-600' : 'text-orange-600'} mt-1`}>
              {type === 'danger' 
                ? 'All data will be permanently deleted from the database.'
                : 'Please make sure you want to proceed with this action.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 border-gray-300 hover:bg-gray-100"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-6 py-2 ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Specific modal for deleting a chat session
export function DeleteChatModal({
  isOpen,
  onClose,
  onConfirm,
  chatTitle
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  chatTitle?: string
}) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Chat Session?"
      message={chatTitle ? `Delete "${chatTitle}"?` : "Delete this chat session?"}
      type="danger"
      confirmText="Delete Chat"
      cancelText="Keep Chat"
      icon="trash"
    />
  )
}

// Specific modal for clearing all history (Enhanced with risk details)
export function ClearHistoryModal({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!isOpen) return null

  return (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Clear All Chat History?</h2>
              <p className="text-sm text-gray-600 mt-1">This will delete ALL your conversations</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content with detailed risk information */}
        <div className="p-6 space-y-3">
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-bold text-red-900 mb-2">
              This action cannot be undone
            </p>
            <p className="text-xs text-red-700 mb-3">
              All data will be permanently deleted from the database.
            </p>
            
            {/* What will be deleted */}
            <div className="text-xs text-red-800 space-y-1">
              <p className="font-semibold">Will be deleted:</p>
              <ul className="list-disc list-inside pl-2 space-y-0.5">
                <li>All conversations with the AI</li>
                <li>All chat sessions and messages</li>
                <li>All conversation context and history</li>
              </ul>
            </div>
          </div>

          {/* What will be preserved */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              Will be preserved:
            </p>
            <p className="text-xs text-blue-700">
              Your learned preferences and financial information for personalized advice.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Clear All History
          </Button>
        </div>
      </div>
    </div>
  )
}

// Specific modal for canceling challenge
export function CancelChallengeModal({
  isOpen,
  onClose,
  onConfirm,
  challengeTitle,
  isLoading = false
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  challengeTitle?: string
  isLoading?: boolean
}) {
  if (!isOpen) return null

  return (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cancel Challenge?</h2>
              <p className="text-sm text-gray-600 mt-1">
                {challengeTitle ? `Cancel "${challengeTitle}"?` : "Cancel this challenge?"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 hover:bg-gray-100 rounded-lg"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm font-medium text-orange-800">
              This action cannot be undone
            </p>
            <p className="text-xs text-orange-600 mt-1">
              You may earn partial points based on your current progress.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 border-gray-300 hover:bg-gray-100"
            disabled={isLoading}
          >
            Keep Challenge
          </Button>
          <Button
            onClick={() => {
              onConfirm()
            }}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Canceling...' : 'Yes, Cancel It'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Success modal for completed deletion
export function DeleteCompletedModal({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  return (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Header */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            History Cleared!
          </h2>
          <p className="text-sm text-gray-600">
            All chat history has been successfully deleted.
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 mb-4">
            <p className="text-sm text-green-800 text-center">
              Your conversations have been permanently removed from the database.
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

// Specific modal for deleting a goal
export function DeleteGoalModal({
  isOpen,
  onClose,
  onConfirm,
  goalTitle,
  isLoading = false
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  goalTitle?: string
  isLoading?: boolean
}) {
  if (!isOpen) return null

  return (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delete Goal?</h2>
              <p className="text-sm text-gray-600 mt-1">
                {goalTitle ? `Delete "${goalTitle}"?` : "Delete this goal?"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 hover:bg-gray-100 rounded-lg"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">
              This action cannot be undone
            </p>
            <p className="text-xs text-red-600 mt-1">
              All goal data including progress will be permanently deleted from the database.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 border-gray-300 hover:bg-gray-100"
            disabled={isLoading}
          >
            Keep Goal
          </Button>
          <Button
            onClick={() => {
              onConfirm()
            }}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Yes, Delete It'}
          </Button>
        </div>
      </div>
    </div>
  )
}
