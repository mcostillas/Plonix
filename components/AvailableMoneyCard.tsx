'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Wallet, Plus, Calendar, ArrowRight, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-hooks'

interface ScheduledPayment {
  id: string
  name: string
  amount: number
  category: string
  due_day: number
  next_due_date: string
  description?: string
}

interface AvailableMoneyData {
  monthlyIncome: number
  scheduledExpenses: number
  availableMoney: number
  upcomingPayments: ScheduledPayment[]
}

export function AvailableMoneyCard() {
  const { user } = useAuth()
  const [data, setData] = useState<AvailableMoneyData>({
    monthlyIncome: 0,
    scheduledExpenses: 0,
    availableMoney: 0,
    upcomingPayments: []
  })
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchAvailableMoneyData()
    }
  }, [user?.id])

  const fetchAvailableMoneyData = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      // Get current month's income
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

      const { data: incomeData, error: incomeError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('transaction_type', 'income')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)

      // Get scheduled payments
      const { data: scheduledData, error: scheduledError } = await (supabase as any)
        .from('scheduled_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('due_day', { ascending: true })

      if (incomeError) {
        console.error('Error fetching income:', incomeError)
        return
      }

      if (scheduledError) {
        console.error('Error fetching scheduled payments:', scheduledError)
        return
      }

      const monthlyIncome = incomeData?.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0) || 0
      const scheduledExpenses = scheduledData?.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0) || 0
      const availableMoney = monthlyIncome - scheduledExpenses
      
      // Show the actual available money (can be negative for deficit display)
      // But we'll handle the display differently in the UI

      setData({
        monthlyIncome,
        scheduledExpenses,
        availableMoney,
        upcomingPayments: scheduledData || []
      })
    } catch (error) {
      console.error('Error fetching available money data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Housing': 'bg-blue-100 text-blue-800',
      'Utilities': 'bg-yellow-100 text-yellow-800',
      'Subscriptions': 'bg-purple-100 text-purple-800',
      'Transportation': 'bg-green-100 text-green-800',
      'Insurance': 'bg-red-100 text-red-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Wallet className="w-5 h-5 text-indigo-600 mr-2" />
            Available to Spend
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDetails(!showDetails)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            {showDetails ? 'Hide' : 'Details'} <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Main Available Money Display */}
        <div className="text-center mb-4">
          {data.availableMoney >= 0 ? (
            <>
              <div className="text-3xl font-bold mb-2 text-indigo-600">
                ₱{data.availableMoney.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">
                After all monthly bills are set aside
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Monthly bills are deducted immediately to show realistic spending money
              </p>
              {data.availableMoney < 1000 && data.availableMoney > 0 && (
                <div className="mt-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700 font-medium">⚠️ Money running low!</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-3xl font-bold mb-2 text-red-600">
                ₱0
              </div>
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Budget Deficit: ₱{Math.abs(data.availableMoney).toLocaleString()}
              </p>
              <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700">
                  Your monthly bills exceed your income. Add income or reduce bills!
                </p>
              </div>
            </>
          )}
        </div>

        {/* Breakdown */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t">
            {/* Income vs Scheduled */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Income</span>
                <span className="font-medium text-green-600">₱{data.monthlyIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Bills (Set Aside)</span>
                <span className="font-medium text-orange-600">-₱{data.scheduledExpenses.toLocaleString()}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center font-semibold">
                <span>Available to Spend</span>
                <span className={data.availableMoney >= 0 ? 'text-indigo-600' : 'text-red-600'}>
                  ₱{data.availableMoney.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 pt-2 border-t">
                💡 All monthly bills are deducted upfront. Due dates are just reminders for when to pay.
              </p>
            </div>

            {/* Upcoming Payments */}
            {data.upcomingPayments.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Payment Reminders
                </h4>
                <p className="text-xs text-gray-500 -mt-2">
                  These bills are already deducted from your available money. This shows when they're due.
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">{data.upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{payment.name}</span>
                          <span className="font-semibold text-sm">₱{Number(payment.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(payment.category)}`}>
                            {payment.category}
                          </span>
                          <span className="text-xs text-gray-500 ml-2 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Due {payment.due_day}th
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View All Link - Dashboard shows summary only */}
            <Link href="/transactions">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Manage Scheduled Payments
              </Button>
            </Link>

            {/* Warning for negative available money */}
            {data.availableMoney < 0 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Budget Alert!</p>
                  <p>Your scheduled expenses exceed your monthly income. Consider reviewing your payments or increasing income.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}