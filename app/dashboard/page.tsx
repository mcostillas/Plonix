'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/lib/auth-hooks'
import { AuthGuard } from '@/components/AuthGuard'
import { AddTransactionModal } from '@/components/AddTransactionModal'
import { PlusCircle, Calculator, TrendingUp, PieChart, Target, Trophy, BookOpen, PiggyBank, Search, Globe, MessageCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [monthlySpent, setMonthlySpent] = useState<number>(0)
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0)
  const [totalSaved, setTotalSaved] = useState<number>(0)
  const [activeGoalsCount, setActiveGoalsCount] = useState<number>(0)
  const [topGoals, setTopGoals] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Total modules count (should match learning page)
  const totalModules = 7 // 3 core + 4 essential modules

  // Load completed modules from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('plounix-learning-progress')
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        setCompletedModules(parsed)
      } catch (error) {
        console.error('Failed to load learning progress:', error)
      }
    }
    setMounted(true)
  }, [])

  // Fetch financial data from Supabase
  useEffect(() => {
    async function fetchFinancialData() {
      if (!user?.id) return
      
      setLoading(true)
      try {
        const { supabase } = await import('@/lib/supabase')
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

        // Fetch transactions for current month
        const { data, error } = await supabase
          .from('transactions')
          .select('amount, transaction_type, date')
          .eq('user_id', user.id)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth)

        if (!error && data) {
          let spent = 0
          let income = 0
          
          data.forEach((tx: any) => {
            const amount = Number(tx.amount) || 0
            if (tx.transaction_type === 'expense') {
              spent += amount
            } else if (tx.transaction_type === 'income') {
              income += amount
            }
          })

          setMonthlySpent(spent)
          setMonthlyIncome(income)
          setTotalSaved(income - spent)
        }

        // Fetch active goals (top 3 for dashboard)
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (!goalsError && goalsData) {
          setActiveGoalsCount(goalsData.length)
          setTopGoals(goalsData.slice(0, 3)) // Show only top 3 on dashboard
        }

        // Fetch recent transactions (last 5)
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5)

        if (!txError && txData) {
          setRecentTransactions(txData)
        }
      } catch (err) {
        console.error('Error fetching financial data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFinancialData()
  }, [user, refreshTrigger])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="dashboard" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-2xl p-6 border border-primary/20">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'there'}! 
          </h1>
          <p className="text-gray-600 text-lg">Ready to level up your financial game today?</p>
        </div>

        {/* Top Row - Stats + Learning Progress */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? '...' : `₱${totalSaved.toLocaleString()}`}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">This Month Net</p>
                </div>
                <PiggyBank className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? '...' : activeGoalsCount}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Active Goals</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {loading ? '...' : `₱${monthlyIncome.toLocaleString()}`}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Income This Month</p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {loading ? '...' : `₱${monthlySpent.toLocaleString()}`}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Spent</p>
                </div>
                <ArrowDownRight className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          {/* Learning Progress - Integrated into top row */}
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {mounted ? completedModules.length : 0}
                </div>
                <div className="text-xs text-gray-600 mb-2">modules done</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: mounted ? `${Math.max(2, (completedModules.length / totalModules) * 100)}%` : '2%'
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Row */}
        <div className="grid lg:grid-cols-5 gap-6 mb-6">
          {/* Goal Progress - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="bg-white h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-500" />
                    Goal Progress
                  </CardTitle>
                  {activeGoalsCount > 3 && (
                    <Link href="/goals">
                      <Button variant="ghost" size="sm" className="text-xs">
                        View All ({activeGoalsCount})
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="mt-2 text-sm">Loading goals...</p>
                  </div>
                ) : topGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-4">No active goals yet</p>
                    <Link href="/goals">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Your First Goal
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topGoals.map((goal, index) => {
                      const progressPercentage = (goal.current_amount / goal.target_amount) * 100
                      const colors = ['blue', 'green', 'purple', 'orange', 'pink']
                      const color = colors[index % colors.length]
                      
                      return (
                        <div key={goal.id} className={`p-3 bg-gray-50 rounded-lg border-l-4 border-${color}-500`}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 truncate">{goal.title}</h4>
                              <p className="text-sm text-gray-600">
                                ₱{goal.current_amount.toLocaleString()} / ₱{goal.target_amount.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <span className={`text-lg font-semibold text-${color}-600`}>
                                {progressPercentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`} 
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                    {activeGoalsCount > 3 && (
                      <Link href="/goals">
                        <Button variant="outline" className="w-full">
                          View All {activeGoalsCount} Goals →
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Challenges Overview - Takes 3 columns */}
          <div className="lg:col-span-3">
            <Card className="bg-white h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-purple-500" />
                  Challenges Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">7</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">₱3,200</div>
                      <div className="text-xs text-gray-600">Saved</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">2</div>
                      <div className="text-xs text-gray-600">Active</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800">Active Challenges</h4>
                    
                    <div className="p-3 bg-gray-50 rounded-lg border-l-3 border-blue-500">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h5 className="font-medium text-gray-800">₱100 Daily Challenge</h5>
                          <p className="text-sm text-gray-600">4 days remaining</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">Day 3/7</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '43%' }}></div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border-l-3 border-green-500">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h5 className="font-medium text-gray-800">Load Smart Challenge</h5>
                          <p className="text-sm text-gray-600">1 week remaining</p>
                        </div>
                        <span className="text-sm font-semibold text-green-600">Week 1/2</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* AI Assistant Card - Featured */}
          <div className="lg:col-span-3 mb-4">
            <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Globe className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">Need Help Learning? Ask Fili!</h3>
                      <p className="text-blue-100">
                        Get explanations, search for current financial info, and personalized advice!
                      </p>
                    </div>
                  </div>
                  <Link href="/ai-assistant">
                    <Button variant="secondary">
                      <Globe className="w-4 h-4 mr-2" />
                      Chat Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <Link href="/learning">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Financial Learning</CardTitle>
                <CardDescription>
                  Master financial literacy with structured lessons and practical tips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-600 font-medium">7 Topics Available</p>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Start Learning</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/goals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Target className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>My Financial Goals</CardTitle>
                <CardDescription>
                  Track savings goals created manually or by AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-600 font-medium">AI-powered planning</p>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">3 Active</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/challenges">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Trophy className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Financial Challenges</CardTitle>
                <CardDescription>
                  Student and graduate challenges for building money habits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-purple-600 font-medium">Community challenges</p>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">7 Completed</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setShowAddTransactionModal(true)}
          >
            <CardHeader>
              <PlusCircle className="w-12 h-12 text-orange-600 mb-4" />
              <CardTitle>Add Transaction</CardTitle>
              <CardDescription>
                Manually track your income and expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-600 font-medium">Quick expense entry</p>
            </CardContent>
          </Card>

          <Link href="/digital-tools">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Calculator className="w-12 h-12 text-red-600 mb-4" />
                <CardTitle>Financial Tools</CardTitle>
                <CardDescription>
                  Budget calculator, savings tracker, and more tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 font-medium">Philippine peso optimized</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/resource-hub">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Globe className="w-12 h-12 text-teal-600 mb-4" />
                <CardTitle>Resource Hub</CardTitle>
                <CardDescription>
                  Filipino financial educators and trusted resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-teal-600 font-medium">Curated resources</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Cashflow Analysis */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <TrendingUp className="w-6 h-6 mr-3 text-emerald-500" />
                Monthly Cashflow Overview
              </CardTitle>
              <CardDescription className="text-base">Track your income vs expenses and see your financial flow</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading cashflow data...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Total Income */}
                  <div className="text-center p-6 bg-white rounded-xl border border-green-200 shadow-sm">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-3 bg-green-500 rounded-full">
                        <ArrowUpRight className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ₱{monthlyIncome.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700 font-semibold">Income</div>
                    <div className="text-xs text-green-600 mb-2">This Month</div>
                    <div className="text-xs text-gray-500">
                      {monthlyIncome > 0 ? 'Money coming in' : 'No income yet'}
                    </div>
                  </div>

                  {/* Total Expenses */}
                  <div className="text-center p-6 bg-white rounded-xl border border-red-200 shadow-sm">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-3 bg-red-500 rounded-full">
                        <ArrowDownRight className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      ₱{monthlySpent.toLocaleString()}
                    </div>
                    <div className="text-sm text-red-700 font-semibold">Expenses</div>
                    <div className="text-xs text-red-600 mb-2">This Month</div>
                    <div className="text-xs text-gray-500">
                      {monthlySpent > 0 ? 'Money spent' : 'No expenses yet'}
                    </div>
                  </div>

                  {/* Net Cashflow */}
                  <div className="text-center p-6 bg-white rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-3 bg-blue-500 rounded-full">
                        <PiggyBank className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ₱{totalSaved.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700 font-semibold">Net Saved</div>
                    <div className="text-xs text-blue-600 mb-2">This Month</div>
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-3">
                        {monthlyIncome > 0 
                          ? `${((totalSaved / monthlyIncome) * 100).toFixed(1)}% of income saved`
                          : 'Add income to track savings rate'
                        }
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                          style={{ width: monthlyIncome > 0 ? `${Math.min((totalSaved / monthlyIncome) * 100, 100)}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm text-blue-600 font-semibold">
                      {totalSaved > 0 ? (totalSaved / monthlyIncome > 0.3 ? 'Excellent savings rate! 🎯' : 'Good start! Keep saving 💪') : 'Start tracking to see progress 📊'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Recent Activity */}
        <div className="grid lg:grid-cols-1 gap-6">
          {/* Recent Activity - Full width */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest income and expenses</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="mt-2 text-sm">Loading transactions...</p>
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <PiggyBank className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-4">No transactions yet</p>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => setShowAddTransactionModal(true)}
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Your First Transaction
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {recentTransactions.map((tx) => {
                        const isIncome = tx.transaction_type === 'income'
                        const formattedDate = new Date(tx.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })
                        
                        return (
                          <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${isIncome ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                                <span className={`${isIncome ? 'text-green-600' : 'text-red-600'} font-medium text-sm`}>
                                  {isIncome ? '+' : '-'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{tx.merchant}</p>
                                <p className="text-xs text-gray-600 capitalize">
                                  {tx.category} • {formattedDate}
                                </p>
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                              {isIncome ? '+' : '-'}₱{Number(tx.amount).toLocaleString()}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => setShowAddTransactionModal(true)}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add New Transaction
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        onSuccess={() => {
          // Refresh data when a transaction is added
          setRefreshTrigger(prev => prev + 1)
        }}
      />
    </div>
  )
}
