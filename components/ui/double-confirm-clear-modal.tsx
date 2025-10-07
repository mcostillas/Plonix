'use client'

import { X, AlertTriangle, History } from 'lucide-react'
import { Button } from './button'

interface DoubleConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DoubleConfirmClearHistoryModal({
  isOpen,
  onClose,
  onConfirm
}: DoubleConfirmationModalProps) {
  if (!isOpen) return null

  return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with strong warning */}
        <div className="flex items-start justify-between p-6 border-b border-red-200 bg-red-50">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900">⚠️ Final Warning</h2>
              <p className="text-sm text-red-700 mt-1 font-semibold">Are you ABSOLUTELY sure?</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 hover:bg-red-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content with detailed warnings */}
        <div className="p-6 space-y-4">
          {/* Main warning message */}
          <div className="p-4 rounded-lg bg-red-100 border-2 border-red-300">
            <div className="flex items-start space-x-3">
              <History className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base font-bold text-red-900">
                  This will PERMANENTLY delete ALL your chat history
                </p>
                <p className="text-sm text-red-700 mt-2">
                  This includes:
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                  <li>All conversations with the AI</li>
                  <li>All chat sessions and messages</li>
                  <li>All saved context and history</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cannot be undone warning */}
          <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
            <div className="flex items-start space-x-2">
              <span className="text-2xl">🚫</span>
              <div>
                <p className="text-base font-bold text-orange-900">
                  This action CANNOT be undone
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Once deleted, your chat history is gone forever. There is no way to recover it.
                </p>
              </div>
            </div>
          </div>

          {/* What will be preserved */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start space-x-2">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  What will be preserved:
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Your learned preferences and financial information will be kept so the AI can still provide personalized advice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with final confirmation */}
        <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
          <p className="text-center text-sm font-medium text-gray-700 mb-4">
            Do you really want to delete ALL your chat history?
          </p>
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-8 py-3 border-2 border-gray-300 hover:bg-gray-100 font-semibold"
            >
              No, Keep History
            </Button>
            <Button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Yes, Delete Everything
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
