'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-hooks'
import { AddMonthlyBillModal } from './AddMonthlyBillModal'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { toast } from 'sonner'
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
  DollarSign,
  AlertCircle
} from 'lucide-react'

interface MonthlyBill {
  id: string
  name: string
  amount: number
  category: string
  due_day: number  // Day of month (1-31)
  description?: string
  is_active: boolean
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

export function MonthlyBillsManager() {
  const { user } = useAuth()
  const [bills, setBills] = useState<MonthlyBill[]>([])
  const [loading, setLoading] = useState(true)
  const [totalMonthly, setTotalMonthly] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<MonthlyBill | undefined>()
  
  // Dialog states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})

  useEffect(() => {
    if (user?.id) {
      fetchMonthlyBills()
    }
  }, [user?.id])

  const fetchMonthlyBills = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const { data, error } = await (supabase as any)
        .from('scheduled_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('due_day', { ascending: true })

      if (error) {
        console.error('Error fetching monthly bills:', error)
        return
      }

      setBills(data || [])
      
      // Calculate total monthly amount for active bills
      const activeTotal = data
        ?.filter((bill: MonthlyBill) => bill.is_active)
        ?.reduce((sum: number, bill: MonthlyBill) => sum + Number(bill.amount), 0) || 0
      setTotalMonthly(activeTotal)
    } catch (error) {
      console.error('Error fetching monthly bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBillStatus = async (billId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('scheduled_payments')
        .update({ is_active: !currentStatus })
        .eq('id', billId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Error toggling bill status:', error)
        toast.error('Failed to update bill status')
        return
      }

      // Refresh data
      fetchMonthlyBills()
    } catch (error) {
      console.error('Error toggling bill status:', error)
      toast.error('Failed to update bill status')
    }
  }

  const deleteBill = (billId: string, billName: string) => {
    setConfirmMessage(`Are you sure you want to delete "${billName}"? This cannot be undone.`)
    setConfirmAction(() => () => handleDeleteConfirm(billId))
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async (billId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('scheduled_payments')
        .delete()
        .eq('id', billId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Error deleting bill:', error)
        toast.error('Failed to delete bill')
        return
      }

      // Refresh data
      fetchMonthlyBills()
      toast.success('Bill deleted successfully')
    } catch (error) {
      console.error('Error deleting bill:', error)
      toast.error('Failed to delete bill')
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

  const getDaysUntilDue = (dueDay: number): number => {
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    let dueDate = new Date(currentYear, currentMonth, dueDay)
    if (currentDay > dueDay) {
      // Already passed this month, use next month
      dueDate = new Date(currentYear, currentMonth + 1, dueDay)
    }
    
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDueDateBadge = (daysUntil: number) => {
    if (daysUntil === 0) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Due Today
        </Badge>
      )
    } else if (daysUntil === 1) {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
          <Clock className="w-3 h-3 mr-1" />
          Due Tomorrow
        </Badge>
      )
    } else if (daysUntil <= 3) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <Calendar className="w-3 h-3 mr-1" />
          Due in {daysUntil} days
        </Badge>
      )
    } else if (daysUntil <= 7) {
      return (
        <Badge variant="outline" className="text-gray-600">
          <Calendar className="w-3 h-3 mr-1" />
          Due in {daysUntil} days
        </Badge>
      )
    }
    return null // Don't show badge if more than 7 days away
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
            Monthly Bills
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
              Monthly Bills
            </CardTitle>
            <div className="flex items-center mt-2">
              <DollarSign className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-gray-600">
                Total Monthly: <span className="font-semibold text-green-600">₱{totalMonthly.toLocaleString()}</span>
              </span>
            </div>
          </div>
          <AddMonthlyBillModal 
            onPaymentAdded={fetchMonthlyBills}
            onShowMessage={(message: string) => {
              toast.success(message)
            }}
          >
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Bill
            </Button>
          </AddMonthlyBillModal>
        </div>
      </CardHeader>

      <CardContent>
        {bills.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No monthly bills yet</h3>
            <p className="text-gray-600 mb-4">
              Add your recurring expenses like rent, utilities, and subscriptions. They'll be automatically deducted from your available money at the start of each month.
            </p>
            <AddMonthlyBillModal 
              onPaymentAdded={fetchMonthlyBills}
              onShowMessage={(message: string) => {
                toast.success(message)
              }}
            >
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Bill
              </Button>
            </AddMonthlyBillModal>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => {
              const IconComponent = getCategoryIcon(bill.category)
              const colors = getCategoryColors(bill.category)
              
              return (
                <div
                  key={bill.id}
                  className={`p-4 border rounded-lg transition-all ${
                    bill.is_active 
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

                      {/* Bill Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{bill.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {bill.category}
                          </Badge>
                          {!bill.is_active && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              Inactive
                            </Badge>
                          )}
                          {bill.is_active && getDueDateBadge(getDaysUntilDue(bill.due_day))}
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Due: Day {bill.due_day} of each month</span>
                          {bill.description && (
                            <span className="ml-2 text-gray-500">• {bill.description}</span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          bill.is_active ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          ₱{Number(bill.amount).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          /month
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBillStatus(bill.id, bill.is_active)}
                        className="text-gray-600 hover:text-indigo-600"
                      >
                        {bill.is_active ? (
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
                        onClick={() => deleteBill(bill.id, bill.name)}
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
                  {bills.filter(b => b.is_active).length} active bills
                </span>
                <span className="font-semibold text-indigo-600">
                  Total: ₱{totalMonthly.toLocaleString()}/month
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

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