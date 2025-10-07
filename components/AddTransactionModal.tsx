'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Receipt, DollarSign, Calendar as CalendarIcon, Tag, X, CreditCard, FileText } from 'lucide-react'
import { getCurrentUser, type User } from '@/lib/auth'
import type { Transaction } from '@/lib/database.types'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const [user, setUser] = useState<User | null>(null)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [transactionData, setTransactionData] = useState({
    amount: '',
    merchant: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [month, setMonth] = useState<Date | undefined>(new Date())
  const [dateInputValue, setDateInputValue] = useState('')

  // Helper functions for date formatting
  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return ''
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const isValidDate = (date: Date | undefined) => {
    if (!date) return false
    return !isNaN(date.getTime())
  }

  // Get current user
  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      setTransactionData({
        amount: '',
        merchant: '',
        category: '',
        date: today.toISOString().split('T')[0],
        paymentMethod: '',
        notes: ''
      })
      setTransactionType('expense')
      setSelectedDate(today)
      setMonth(today)
      setDateInputValue(formatDateDisplay(today))
    }
  }, [isOpen])

  // Update transaction date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setTransactionData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0]
      }))
    }
  }, [selectedDate])

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Savings/Investment',
    'Salary',
    'Freelance',
    'Business',
    'Other'
  ]

  const paymentMethods = [
    'Cash',
    'GCash',
    'PayMaya',
    'Credit Card',
    'Debit Card',
    'Bank Transfer'
  ]

  // Save transaction to Supabase
  const handleSubmit = async () => {
    if (!transactionData.amount || !transactionData.merchant || !transactionData.category) {
      alert('Please fill in required fields: Amount, Description, and Category')
      return
    }

    if (!user?.id) {
      alert('Please sign in to add transactions')
      return
    }

    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('transactions')
        .insert([{
          amount: parseFloat(transactionData.amount),
          merchant: transactionData.merchant,
          category: transactionData.category,
          date: transactionData.date || new Date().toISOString().split('T')[0],
          payment_method: transactionData.paymentMethod,
          notes: transactionData.notes || null,
          transaction_type: transactionType,
          user_id: user.id
        }])

      if (error) {
        console.error('Error adding transaction:', error)
        alert('Error adding transaction: ' + error.message)
      } else {
        // Success
        if (onSuccess) {
          onSuccess()
        }
        onClose()
      }
    } catch (err) {
      console.error('Error:', err)
      alert('An error occurred while adding the transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Transaction</DialogTitle>
          <DialogDescription>
            Track your income and expenses
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all duration-200 ${
                transactionType === 'income' 
                  ? 'border-green-500 border-2 bg-green-50 shadow-sm' 
                  : 'border-gray-200 hover:border-green-400 hover:shadow-sm'
              }`}
              onClick={() => setTransactionType('income')}
            >
              <CardHeader className="text-center pb-3 pt-4">
                <Plus className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg text-green-600">Add Income</CardTitle>
                {transactionType === 'income' && (
                  <p className="text-xs text-green-600 mt-1 font-semibold">✓ Selected</p>
                )}
              </CardHeader>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all duration-200 ${
                transactionType === 'expense' 
                  ? 'border-red-500 border-2 bg-red-50 shadow-sm' 
                  : 'border-gray-200 hover:border-red-400 hover:shadow-sm'
              }`}
              onClick={() => setTransactionType('expense')}
            >
              <CardHeader className="text-center pb-3 pt-4">
                <Receipt className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <CardTitle className="text-lg text-red-600">Add Expense</CardTitle>
                {transactionType === 'expense' && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">✓ Selected</p>
                )}
              </CardHeader>
            </Card>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">Transaction Details</span>
            </div>
          </div>

          {/* Transaction Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span>Amount (₱) <span className="text-red-500">*</span></span>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={transactionData.amount}
                onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant" className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-gray-500" />
                <span>{transactionType === 'income' ? 'Source' : 'Description'} <span className="text-red-500">*</span></span>
              </Label>
              <Input
                id="merchant"
                type="text"
                placeholder={transactionType === 'income' ? 'e.g., Monthly Salary, Freelance Project' : 'e.g., Grocery shopping, Restaurant'}
                value={transactionData.merchant}
                onChange={(e) => setTransactionData({...transactionData, merchant: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span>Category <span className="text-red-500">*</span></span>
              </Label>
              <Select value={transactionData.category} onValueChange={(value) => setTransactionData({...transactionData, category: value})}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {transactionType === 'income' ? (
                    <>
                      <SelectItem value="Salary">Salary</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Business">Business Income</SelectItem>
                      <SelectItem value="Investment">Investment Returns</SelectItem>
                      <SelectItem value="Gift">Gift/Allowance</SelectItem>
                      <SelectItem value="Other">Other Income</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Bills & Utilities">Bills & Utilities</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Savings/Investment">Savings/Investment</SelectItem>
                      <SelectItem value="Other">Other Expense</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-date" className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span>Date</span>
              </Label>
              <div className="relative flex gap-2">
                <Input
                  id="transaction-date"
                  value={dateInputValue}
                  placeholder={formatDateDisplay(new Date())}
                  className="pr-10"
                  onChange={(e) => {
                    const date = new Date(e.target.value)
                    setDateInputValue(e.target.value)
                    if (isValidDate(date)) {
                      setSelectedDate(date)
                      setMonth(date)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault()
                      setDatePickerOpen(true)
                    }
                  }}
                />
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2"
                    >
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span className="sr-only">Select date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}
                  >
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      captionLayout="dropdown"
                      month={month}
                      onMonthChange={setMonth}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        setDateInputValue(formatDateDisplay(date))
                        setDatePickerOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {transactionType === 'expense' && (
              <div className="space-y-2">
                <Label htmlFor="payment-method" className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span>Payment Method</span>
                </Label>
                <Select value={transactionData.paymentMethod} onValueChange={(value) => setTransactionData({...transactionData, paymentMethod: value})}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span>Notes (Optional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                rows={3}
                value={transactionData.notes}
                onChange={(e) => setTransactionData({...transactionData, notes: e.target.value})}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full sm:w-auto text-white ${
              transactionType === 'income' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Adding...' : `Add ${transactionType === 'income' ? 'Income' : 'Expense'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
