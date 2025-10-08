'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-hooks'
import { AddScheduledPaymentModal } from './AddScheduledPaymentModal'
import { SuccessDialog } from './ui/SuccessDialog'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Home, 
  Zap, 
  Smartphone, 
  Car, 
  Shield, 
  CreditCard,
  Clock,
  DollarSign
} from 'lucide-react'

interface ScheduledPayment {
  id: string
  name: string
  amount: number
  category: string
  due_day: number
  frequency: string
  description?: string
  is_active: boolean
  next_due_date: string
  created_at: string
}

const CATEGORY_ICONS = {
  'Housing': Home,
  'Utilities': Zap,
  'Subscriptions': Smartphone,
  'Transportation': Car,
  'Insurance': Shield,
  'Other': CreditCard,
}

const CATEGORY_COLORS = {
  'Housing': 'text-blue-600 bg-blue-100',
  'Utilities': 'text-yellow-600 bg-yellow-100',
  'Subscriptions': 'text-purple-600 bg-purple-100',
  'Transportation': 'text-green-600 bg-green-100',
  'Insurance': 'text-red-600 bg-red-100',
  'Other': 'text-gray-600 bg-gray-100',
}

export function ScheduledPaymentsManager() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<ScheduledPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [totalMonthly, setTotalMonthly] = useState(0)
  
  // Dialog states
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})

  useEffect(() => {
    if (user?.id) {
      fetchScheduledPayments()
    }
  }, [user?.id])

  const fetchScheduledPayments = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const { data, error } = await (supabase as any)
        .from('scheduled_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('due_day', { ascending: true })

      if (error) {
        console.error('Error fetching scheduled payments:', error)
        return
      }

      setPayments(data || [])
      
      // Calculate total monthly amount for active payments
      const activeTotal = data
        ?.filter((payment: ScheduledPayment) => payment.is_active)
        ?.reduce((sum: number, payment: ScheduledPayment) => sum + Number(payment.amount), 0) || 0
      setTotalMonthly(activeTotal)
    } catch (error) {
      console.error('Error fetching scheduled payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePaymentStatus = async (paymentId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('scheduled_payments')
        .update({ is_active: !currentStatus })
        .eq('id', paymentId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Error toggling payment status:', error)
        setSuccessMessage('Failed to update payment status')
        setSuccessOpen(true)
        return
      }

      // Refresh data
      fetchScheduledPayments()
    } catch (error) {
      console.error('Error toggling payment status:', error)
      setSuccessMessage('Failed to update payment status')
      setSuccessOpen(true)
    }
  }

  const deletePayment = (paymentId: string, paymentName: string) => {
    setConfirmMessage(`Are you sure you want to delete "${paymentName}"? This cannot be undone.`)
    setConfirmAction(() => () => handleDeleteConfirm(paymentId))
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async (paymentId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('scheduled_payments')
        .delete()
        .eq('id', paymentId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Error deleting payment:', error)
        setSuccessMessage('Failed to delete payment')
        setSuccessOpen(true)
        return
      }

      // Refresh data
      fetchScheduledPayments()
      setSuccessMessage('Payment deleted successfully')
      setSuccessOpen(true)
    } catch (error) {
      console.error('Error deleting payment:', error)
      setSuccessMessage('Failed to delete payment')
      setSuccessOpen(true)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getCategoryIcon = (category: string) => {
    return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CreditCard
  }

  const getCategoryColors = (category: string) => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
            Scheduled Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
              Scheduled Payments
            </CardTitle>
            <div className="flex items-center mt-2">
              <DollarSign className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-gray-600">
                Total Monthly: <span className="font-semibold text-green-600">₱{totalMonthly.toLocaleString()}</span>
              </span>
            </div>
          </div>
          <AddScheduledPaymentModal 
            onPaymentAdded={fetchScheduledPayments}
            onShowMessage={(message) => {
              setSuccessMessage(message)
              setSuccessOpen(true)
            }}
          >
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </AddScheduledPaymentModal>
        </div>
      </CardHeader>

      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled payments yet</h3>
            <p className="text-gray-600 mb-4">
              Add your recurring expenses like rent, bills, and subscriptions to better track your available money.
            </p>
            <AddScheduledPaymentModal 
              onPaymentAdded={fetchScheduledPayments}
              onShowMessage={(message) => {
                setSuccessMessage(message)
                setSuccessOpen(true)
              }}
            >
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Payment
              </Button>
            </AddScheduledPaymentModal>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const IconComponent = getCategoryIcon(payment.category)
              const colors = getCategoryColors(payment.category)
              
              return (
                <div
                  key={payment.id}
                  className={`p-4 border rounded-lg transition-all ${
                    payment.is_active 
                      ? 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Category Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Payment Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{payment.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {payment.category}
                          </Badge>
                          {!payment.is_active && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Due {payment.due_day}th • {payment.frequency}</span>
                          {payment.description && (
                            <span className="ml-2 text-gray-500">• {payment.description}</span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          payment.is_active ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          ₱{Number(payment.amount).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          /{payment.frequency}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePaymentStatus(payment.id, payment.is_active)}
                        className="text-gray-600 hover:text-indigo-600"
                      >
                        {payment.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePayment(payment.id, payment.name)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Summary */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {payments.filter(p => p.is_active).length} active payments
                </span>
                <span className="font-semibold text-indigo-600">
                  Total: ₱{totalMonthly.toLocaleString()}/month
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Success Dialog */}
      <SuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        message={successMessage}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmAction}
        message={confirmMessage}
      />
    </Card>
  )
}