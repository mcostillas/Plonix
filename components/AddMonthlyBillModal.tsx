'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-hooks'
import { Plus, Loader2, Home, Zap, Smartphone, Car, Shield, CreditCard } from 'lucide-react'

interface AddMonthlyBillModalProps {
  children?: React.ReactNode
  onPaymentAdded?: () => void
  onShowMessage?: (message: string) => void
}

const CATEGORIES = [
  { value: 'Housing', label: 'Housing', icon: Home, color: 'text-blue-600' },
  { value: 'Utilities', label: 'Utilities', icon: Zap, color: 'text-yellow-600' },
  { value: 'Subscriptions', label: 'Subscriptions', icon: Smartphone, color: 'text-purple-600' },
  { value: 'Transportation', label: 'Transportation', icon: Car, color: 'text-green-600' },
  { value: 'Insurance', label: 'Insurance', icon: Shield, color: 'text-red-600' },
  { value: 'Other', label: 'Other', icon: CreditCard, color: 'text-gray-600' },
]

export function AddMonthlyBillModal({ children, onPaymentAdded, onShowMessage }: AddMonthlyBillModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    due_day: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('scheduled_payments')
        .insert({
          user_id: user.id,
          name: formData.name,
          amount: parseFloat(formData.amount),
          category: formData.category,
          due_day: parseInt(formData.due_day),
          description: formData.description || null,
          is_active: true
        })

      if (error) {
        console.error('Error adding monthly bill:', error)
        onShowMessage?.('Failed to add monthly bill. Please try again.')
        return
      }

      // Reset form
      setFormData({
        name: '',
        amount: '',
        category: '',
        due_day: '',
        description: ''
      })

      setOpen(false)
      onPaymentAdded?.()
      
      // Show success message
      onShowMessage?.('Monthly bill added successfully!')
    } catch (error) {
      console.error('Error adding monthly bill:', error)
      onShowMessage?.('Failed to add monthly bill. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Monthly Bill
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md p-3 md:p-6">
        <DialogHeader className="space-y-1 md:space-y-1.5">
          <DialogTitle className="text-base md:text-lg">Add Monthly Bill</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
          {/* Bill Name */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="name" className="text-[10px] md:text-sm">Bill Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Dorm Rent, Internet, Netflix"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
              className="h-8 md:h-10 text-xs md:text-base"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="amount" className="text-[10px] md:text-sm">Amount (₱) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="3500.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              disabled={loading}
              className="h-8 md:h-10 text-xs md:text-base"
            />
          </div>

          {/* Category */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="category" className="text-[10px] md:text-sm">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={loading}
            >
              <SelectTrigger className="h-8 md:h-10 text-xs md:text-base">
                <SelectValue placeholder="Select category">
                  {selectedCategory && (
                    <div className="flex items-center">
                      <selectedCategory.icon className={`w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 ${selectedCategory.color}`} />
                      <span className="text-xs md:text-sm">{selectedCategory.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center">
                      <category.icon className={`w-4 h-4 mr-2 ${category.color}`} />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Day */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="due_day" className="text-[10px] md:text-sm">Due Day of Month *</Label>
            <Select 
              value={formData.due_day} 
              onValueChange={(value) => setFormData({ ...formData, due_day: value })}
              disabled={loading}
            >
              <SelectTrigger className="h-8 md:h-10 text-xs md:text-base">
                <SelectValue placeholder="Select day (1-31)" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    Day {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[9px] md:text-xs text-gray-500">The day when this bill is due each month</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional notes about this bill..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={2}
            />
          </div>

          {/* Preview */}
          {formData.name && formData.amount && formData.due_day && (
            <div className="p-2 md:p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-xs md:text-sm font-medium text-indigo-900 mb-1">Preview:</p>
              <p className="text-xs md:text-sm text-indigo-700">
                <span className="font-medium">{formData.name}</span> - ₱{formData.amount} 
                {` due on day ${formData.due_day}`}
              </p>
            </div>
          )}

          {/* Important Info */}
          <div className="p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-[9px] md:text-xs text-blue-800 font-medium mb-1">💡 How monthly bills work:</p>
            <ul className="text-[8px] md:text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>This amount will be <strong>deducted from your available money immediately</strong></li>
              <li>The due date is only for <strong>payment reminders</strong></li>
              <li>This helps you see your <strong>realistic spending money</strong></li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.amount || !formData.due_day || !formData.category}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}