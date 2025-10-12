'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-hooks'
import { AddMonthlyBillModal } from './AddMonthlyBillModal'
import { EditMonthlyBillModal } from './EditMonthlyBillModal'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { toast } from 'sonner'
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3,
  ToggleLeft, 
  ToggleRight,
  Home, 
  Zap, 
  Smartphone, 
  Car, 
  Shield, 
  CreditCard
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
      <CardHeader className="p-3 md:p-6 pb-2 md:pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
          <div>
            <CardTitle className="flex items-center text-sm md:text-base lg:text-lg">
              <Calendar className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2 text-indigo-600" />
              Monthly Bills
            </CardTitle>
            <p className="text-[10px] md:text-sm text-gray-600 mt-0.5 md:mt-1">
              Total Monthly: <span className="font-semibold text-green-600">₱{totalMonthly.toLocaleString()}</span>
            </p>
          </div>
          <AddMonthlyBillModal 
            onPaymentAdded={fetchMonthlyBills}
            onShowMessage={(message: string) => {
              toast.success(message)
            }}
          >
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-7 md:h-10 text-[10px] md:text-sm px-2 md:px-4">
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Add Bill
            </Button>
          </AddMonthlyBillModal>
        </div>
      </CardHeader>

      <CardContent className="p-3 md:p-6 pt-0">
        {bills.length === 0 ? (
          <div className="text-center py-4 md:py-8">
            <Calendar className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-4" />
            <h3 className="text-xs md:text-base lg:text-lg font-medium text-gray-900 mb-1 md:mb-2">No monthly bills yet</h3>
            <p className="text-[10px] md:text-sm text-gray-600 mb-2 md:mb-4 px-2">
              Add your recurring expenses like rent, utilities, and subscriptions. They'll be automatically deducted from your available money at the start of each month.
            </p>
            <AddMonthlyBillModal 
              onPaymentAdded={fetchMonthlyBills}
              onShowMessage={(message: string) => {
                toast.success(message)
              }}
            >
              <Button variant="outline" className="h-7 md:h-10 text-[10px] md:text-sm">
                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Add Your First Bill
              </Button>
            </AddMonthlyBillModal>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-4">
            {bills.map((bill) => {
              const IconComponent = getCategoryIcon(bill.category)
              const colors = getCategoryColors(bill.category)
              
              return (
                <div
                  key={bill.id}
                  className={`p-2 md:p-4 border rounded-lg transition-all ${
                    bill.is_active 
                      ? 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
                      {/* Category Icon */}
                      <div className={`w-7 h-7 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors}`}>
                        <IconComponent className="w-3.5 h-3.5 md:w-5 md:h-5" />
                      </div>

                      {/* Bill Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5 md:space-x-2">
                          <h4 className="font-medium text-gray-900 text-[11px] md:text-sm lg:text-base truncate">{bill.name}</h4>
                          {!bill.is_active && (
                            <Badge variant="outline" className="text-[8px] md:text-xs text-gray-500 px-1 py-0">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center mt-0.5 md:mt-1 text-[9px] md:text-xs lg:text-sm text-gray-600">
                          <span className="truncate">Due • on day {bill.due_day}</span>
                          {bill.description && (
                            <span className="ml-1 md:ml-2 text-gray-500 truncate hidden sm:inline">• {bill.description}</span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <div className={`text-xs md:text-base lg:text-lg font-semibold ${
                          bill.is_active ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          ₱{Number(bill.amount).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-0.5 md:space-x-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBillStatus(bill.id, bill.is_active)}
                        className="text-gray-600 hover:text-indigo-600 h-6 w-6 md:h-8 md:w-8 p-0"
                      >
                        {bill.is_active ? (
                          <ToggleRight className="w-4 h-4 md:w-5 md:h-5" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingBill(bill)}
                        className="text-gray-600 hover:text-blue-600 h-6 w-6 md:h-8 md:w-8 p-0"
                      >
                        <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBill(bill.id, bill.name)}
                        className="text-gray-600 hover:text-red-600 h-6 w-6 md:h-8 md:w-8 p-0"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Summary */}
            <div className="pt-2 md:pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-[10px] md:text-sm text-gray-600">
                  {bills.filter(b => b.is_active).length} active bill{bills.filter(b => b.is_active).length !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] md:text-sm font-semibold text-indigo-600">
                  ₱{totalMonthly.toLocaleString()}/month
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Edit Bill Modal */}
      <EditMonthlyBillModal
        bill={editingBill || null}
        open={!!editingBill}
        onOpenChange={(open) => {
          if (!open) setEditingBill(undefined)
        }}
        onBillUpdated={() => {
          fetchMonthlyBills()
          setEditingBill(undefined)
        }}
        onShowMessage={(message) => toast.success(message)}
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