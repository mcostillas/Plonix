'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-hooks'
import { Loader2 } from 'lucide-react'

interface MonthlyBill {
  id: string
  name: string
  amount: number
  category: string
  due_day: number
  description?: string
  is_active: boolean
}

interface EditMonthlyBillModalProps {
  bill: MonthlyBill | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBillUpdated?: () => void
  onShowMessage?: (message: string) => void
}

const CATEGORIES = [
  { value: 'Housing', label: 'Housing' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Subscriptions', label: 'Subscriptions' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Other', label: 'Other' },
]

export function EditMonthlyBillModal({ bill, open, onOpenChange, onBillUpdated, onShowMessage }: EditMonthlyBillModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    due_day: '',
    description: ''
  })

  // Update form when bill changes
  useEffect(() => {
    if (bill) {
      setFormData({
        name: bill.name,
        amount: bill.amount.toString(),
        category: bill.category,
        due_day: bill.due_day.toString(),
        description: bill.description || ''
      })
    }
  }, [bill])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !bill?.id) return

    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('scheduled_payments')
        .update({
          name: formData.name,
          amount: parseFloat(formData.amount),
          category: formData.category,
          due_day: parseInt(formData.due_day),
          description: formData.description || null
        })
        .eq('id', bill.id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating monthly bill:', error)
        onShowMessage?.('Failed to update monthly bill. Please try again.')
        return
      }

      onOpenChange(false)
      onBillUpdated?.()
      
      // Show success message
      onShowMessage?.('Monthly bill updated successfully!')
    } catch (error) {
      console.error('Error updating monthly bill:', error)
      onShowMessage?.('Failed to update monthly bill. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category)

  if (!bill) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-3 md:p-6">
        <DialogHeader className="space-y-1 md:space-y-1.5">
          <DialogTitle className="text-base md:text-lg">Edit Monthly Bill</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
          {/* Bill Name */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="edit-name" className="text-[10px] md:text-sm">Bill Name *</Label>
            <Input
              id="edit-name"
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
            <Label htmlFor="edit-amount" className="text-[10px] md:text-sm">Amount (₱) *</Label>
            <Input
              id="edit-amount"
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
            <Label htmlFor="edit-category" className="text-[10px] md:text-sm">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={loading}
            >
              <SelectTrigger className="h-8 md:h-10 text-xs md:text-base">
                <SelectValue placeholder="Select category">
                  {selectedCategory && (
                    <span className="text-xs md:text-sm">{selectedCategory.label}</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Day */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="edit-due-day" className="text-[10px] md:text-sm">Due Day of Month *</Label>
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
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="edit-description" className="text-[10px] md:text-sm">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Additional notes about this bill..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={2}
              className="text-xs md:text-base"
            />
          </div>

          {/* Preview */}
          {formData.name && formData.amount && formData.due_day && (
            <div className="p-2 md:p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-[10px] md:text-sm font-medium text-indigo-900 mb-0.5 md:mb-1">Preview:</p>
              <p className="text-[10px] md:text-sm text-indigo-700">
                <span className="font-medium">{formData.name}</span> - ₱{formData.amount} 
                {` due on day ${formData.due_day}`}
              </p>
            </div>
          )}

          {/* Important Info */}
          <div className="p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-[9px] md:text-xs text-blue-800 font-medium mb-1">💡 Reminder:</p>
            <p className="text-[8px] md:text-xs text-blue-700">
              Amount changes are <strong>deducted from available money immediately</strong>. Due dates are only for payment reminders.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 md:gap-3 pt-2 md:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 h-8 md:h-10 text-[10px] md:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.amount || !formData.due_day || !formData.category}
              className="flex-1 h-8 md:h-10 text-[10px] md:text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 animate-spin" />
                  <span className="text-[10px] md:text-sm">Updating...</span>
                </>
              ) : (
                <span className="text-[10px] md:text-sm">Update Bill</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
