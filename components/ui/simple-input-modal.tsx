'use client'

import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'

interface SimpleInputModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (value: string) => void
  title: string
  placeholder?: string
  defaultValue?: string
  okText?: string
  cancelText?: string
}

export function SimpleInputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder = '',
  defaultValue = '',
  okText = 'OK',
  cancelText = 'Cancel'
}: SimpleInputModalProps) {
  const [inputValue, setInputValue] = useState(defaultValue)

  if (!isOpen) return null

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim())
      setInputValue('')
      onClose()
    }
  }

  const handleCancel = () => {
    setInputValue(defaultValue)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleCancel}
    >
      <div 
        className="bg-[#2a2a3e] rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <h3 className="text-white text-sm font-medium mb-4">
            {title}
          </h3>
          
          {/* Input Field */}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="bg-transparent border-2 border-white/40 text-white placeholder:text-white/50 focus:border-white/60 rounded-lg h-12"
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="bg-purple-400 hover:bg-purple-500 text-white px-6 py-2 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {okText}
          </Button>
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-2 rounded-full font-medium"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  )
}
