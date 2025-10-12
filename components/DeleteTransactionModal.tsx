'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  transaction: {
    id: string
    merchant: string
    amount: number
    transaction_type: string
    user_id: string
  } | null
}

export function DeleteTransactionModal({ isOpen, onClose, onSuccess, transaction }: DeleteTransactionModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!transaction?.id) {
      toast.error('Transaction not found')
      return
    }

    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('transactions')
        .delete()
        .eq('id', transaction.id)
        .eq('user_id', transaction.user_id) // Ensure user can only delete their own transactions

      if (error) {
        console.error('Error deleting transaction:', error)
        toast.error('Failed to delete transaction', {
          description: error.message
        })
      } else {
        // Success
        toast.success('Transaction deleted successfully', {
          description: `₱${transaction.amount.toLocaleString()} ${transaction.transaction_type} removed`
        })
        
        // Close modal first
        onClose()
        
        // Trigger refresh after a small delay to ensure DB commit
        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 100)
        }
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('An error occurred while deleting the transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">Delete Transaction</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {transaction && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Description:</span>
              <span className="text-sm font-medium">{transaction.merchant}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className={`text-sm font-semibold ${
                transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.transaction_type === 'income' ? '+' : '-'}₱{transaction.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm font-medium capitalize">{transaction.transaction_type}</span>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Deleting...' : 'Delete Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
