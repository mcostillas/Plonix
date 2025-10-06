'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Receipt, DollarSign, Calendar, Tag, X, CreditCard, FileText } from 'lucide-react'
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

  // Get current user
  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTransactionData({
        amount: '',
        merchant: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        notes: ''
      })
      setTransactionType('expense')
    }
  }, [isOpen])

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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Add Transaction</h2>
              <p className="text-sm text-gray-600">Track your income and expenses</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Transaction Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer hover:shadow-md transition-all ${
                  transactionType === 'income' 
                    ? 'border-green-500 border-2 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
                onClick={() => setTransactionType('income')}
              >
                <CardHeader className="text-center pb-3">
                  <Plus className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <CardTitle className="text-lg text-green-600">Add Income</CardTitle>
                  {transactionType === 'income' && (
                    <p className="text-xs text-green-600 mt-1 font-semibold">✓ Selected</p>
                  )}
                </CardHeader>
              </Card>
              
              <Card 
                className={`cursor-pointer hover:shadow-md transition-all ${
                  transactionType === 'expense' 
                    ? 'border-red-500 border-2 bg-red-50' 
                    : 'border-gray-200 hover:border-red-300'
                }`}
                onClick={() => setTransactionType('expense')}
              >
                <CardHeader className="text-center pb-3">
                  <Receipt className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <CardTitle className="text-lg text-red-600">Add Expense</CardTitle>
                  {transactionType === 'expense' && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">✓ Selected</p>
                  )}
                </CardHeader>
              </Card>
            </div>

            {/* Transaction Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Amount (₱) <span className="text-red-500">*</span></span>
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                  <Receipt className="w-4 h-4" />
                  <span>Description <span className="text-red-500">*</span></span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Grocery shopping, Salary payment"
                  value={transactionData.merchant}
                  onChange={(e) => setTransactionData({...transactionData, merchant: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                  <Tag className="w-4 h-4" />
                  <span>Category <span className="text-red-500">*</span></span>
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={transactionData.category}
                  onChange={(e) => setTransactionData({...transactionData, category: e.target.value})}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Date</span>
                </label>
                <Input
                  type="date"
                  value={transactionData.date}
                  onChange={(e) => setTransactionData({...transactionData, date: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Method</span>
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={transactionData.paymentMethod}
                  onChange={(e) => setTransactionData({...transactionData, paymentMethod: e.target.value})}
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4" />
                  <span>Notes (Optional)</span>
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add any additional notes..."
                  rows={3}
                  value={transactionData.notes}
                  onChange={(e) => setTransactionData({...transactionData, notes: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className={`${
                transactionType === 'income' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Adding...' : `Add ${transactionType === 'income' ? 'Income' : 'Expense'}`}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
