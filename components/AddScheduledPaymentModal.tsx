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

interface AddScheduledPaymentModalProps {
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

const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

export function AddScheduledPaymentModal({ children, onPaymentAdded, onShowMessage }: AddScheduledPaymentModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    due_day: '',
    frequency: 'monthly',
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
          frequency: formData.frequency,
          description: formData.description || null,
          is_active: true
        })

      if (error) {
        console.error('Error adding scheduled payment:', error)
        onShowMessage?.('Failed to add scheduled payment. Please try again.')
        return
      }

      // Reset form
      setFormData({
        name: '',
        amount: '',
        category: '',
        due_day: '',
        frequency: 'monthly',
        description: ''
      })

      setOpen(false)
      onPaymentAdded?.()
      
      // Show success message
      onShowMessage?.('Scheduled payment added successfully!')
    } catch (error) {
      console.error('Error adding scheduled payment:', error)
      onShowMessage?.('Failed to add scheduled payment. Please try again.')
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
            Add Scheduled Payment
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Scheduled Payment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Payment Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Dormitory Rent, Internet Bill"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          {/* Amount and Due Day */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₱) *</Label>
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="due_day">Due Day *</Label>
              <Select 
                value={formData.due_day} 
                onValueChange={(value) => setFormData({ ...formData, due_day: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category">
                  {selectedCategory && (
                    <div className="flex items-center">
                      <selectedCategory.icon className={`w-4 h-4 mr-2 ${selectedCategory.color}`} />
                      {selectedCategory.label}
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

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select 
              value={formData.frequency} 
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional notes about this payment..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={2}
            />
          </div>

          {/* Preview */}
          {formData.name && formData.amount && formData.due_day && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-800 mb-1">Preview:</p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{formData.name}</span> - ₱{formData.amount} 
                {formData.frequency === 'monthly' && ` due every ${formData.due_day}th of the month`}
              </p>
            </div>
          )}

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