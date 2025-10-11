'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/lib/auth-hooks'
import { AuthGuard } from '@/components/AuthGuard'
import { AddTransactionModal } from '@/components/AddTransactionModal'
import { PageLoader } from '@/components/ui/page-loader'
import { PlusCircle, Calculator, TrendingUp, PieChart, Target, Trophy, BookOpen, PiggyBank, Search, Globe, MessageCircle, ArrowUpRight, ArrowDownRight, X, Wallet, Sparkles, PartyPopper } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { supabase } from '@/lib/supabase'
import { CheckInSuccessModal, ChallengeCanceledModal } from '@/components/ui/success-modal'
import { AlreadyCheckedInModal } from '@/components/ui/info-modal'
import { CancelChallengeModal } from '@/components/ui/confirmation-modal'
import { AvailableMoneyCard } from '@/components/AvailableMoneyCard'
import { toast } from 'sonner'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [monthlySpent, setMonthlySpent] = useState<number>(0)
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0)
  const [totalSaved, setTotalSaved] = useState<number>(0)
  const [activeGoalsCount, setActiveGoalsCount] = useState<number>(0)
  const [scheduledExpenses, setScheduledExpenses] = useState<number>(0)
  const [availableMoney, setAvailableMoney] = useState<number>(0)
  const [topGoals, setTopGoals] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Challenges state
  const [activeChallenges, setActiveChallenges] = useState<any[]>([])
  const [challengesStats, setChallengesStats] = useState({
    completed: 0,
    totalSaved: 0,
    active: 0
  })
  const [checkInModalOpen, setCheckInModalOpen] = useState(false)
  const [checkedInChallengeTitle, setCheckedInChallengeTitle] = useState('')
  const [alreadyCheckedInModalOpen, setAlreadyCheckedInModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelingChallengeId, setCancelingChallengeId] = useState<string | null>(null)
  const [cancelingChallengeTitle, setCancelingChallengeTitle] = useState('')
  const [canceledModalOpen, setCanceledModalOpen] = useState(false)
  const [partialPointsEarned, setPartialPointsEarned] = useState<number>(0)
  const [isCanceling, setIsCanceling] = useState(false)

  // Total modules count (should match learning page)
  const totalModules = 7 // 3 core + 4 essential modules

  // Check if user needs onboarding
  useEffect(() => {
    async function checkOnboarding() {
      if (!user?.id) return
      
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('age, monthly_income')
          .eq('user_id', user.id)
          .maybeSingle()
        
        console.log('🔍 Dashboard: Checking onboarding status', { profile })
        
        // Redirect to onboarding if profile is incomplete
        if (!profile || !(profile as any).age || !(profile as any).monthly_income) {
          console.log('❌ Dashboard: Profile incomplete, redirecting to onboarding')
          router.push('/onboarding')
        }
      } catch (error) {
        console.error('Error checking onboarding:', error)
      }
    }
    
    checkOnboarding()
  }, [user, router])

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

        let spent = 0
        let income = 0
        
        if (!error && data) {
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

        // Fetch monthly bills to calculate available money
        const { data: monthlyBillsData, error: billsError } = await supabase
          .from('scheduled_payments')
          .select('amount')
          .eq('user_id', user.id)
          .eq('is_active', true)

        console.log('Monthly Bills Debug:', {
          monthlyBillsData,
          billsError,
          income,
          userId: user.id
        })

        if (!billsError && monthlyBillsData) {
          const totalMonthlyBills = monthlyBillsData.reduce((sum: number, bill: any) => sum + bill.amount, 0)
          console.log('Total monthly bills:', totalMonthlyBills)
          setScheduledExpenses(totalMonthlyBills)
          // Available money = Net income (income - already spent) - monthly bills
          const netIncome = income - spent
          setAvailableMoney(netIncome - totalMonthlyBills)
          console.log('Available money:', netIncome - totalMonthlyBills, '(Net:', netIncome, '- Monthly Bills:', totalMonthlyBills, ')')
        } else {
          console.log('No monthly bills found or error occurred:', billsError)
          // If no monthly bills or error (table doesn't exist), available money = net income
          setScheduledExpenses(0)
          const netIncome = income - spent
          setAvailableMoney(netIncome)
        }
      } catch (err) {
        console.error('Error fetching financial data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFinancialData()
  }, [user, refreshTrigger])

  // Check if user just completed onboarding
  useEffect(() => {
    if (searchParams?.get('onboarding') === 'complete') {
      setShowWelcomeMessage(true)
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowWelcomeMessage(false)
      }, 5000)
    }
  }, [searchParams])

  // Fetch challenges data
  useEffect(() => {
    async function fetchChallengesData() {
      if (!user?.id) return

      try {
        // Fetch active challenges
        const { data: activeChallengesData } = await supabase
          .from('user_active_challenges')
          .select('*')
          .eq('user_id', user.id)
          .limit(2) // Show only top 2 on dashboard

        if (activeChallengesData) {
          setActiveChallenges(activeChallengesData)
        }

        // Fetch challenge stats
        const { data: userChallengesData } = await supabase
          .from('user_challenges')
          .select('status, points_earned')
          .eq('user_id', user.id)

        if (userChallengesData) {
          const completed = userChallengesData.filter((uc: any) => uc.status === 'completed').length
          const active = userChallengesData.filter((uc: any) => uc.status === 'active').length
          const totalSaved = userChallengesData.reduce((sum: number, uc: any) => sum + (uc.points_earned || 0), 0) * 10

          setChallengesStats({
            completed,
            active,
            totalSaved
          })
        }
      } catch (error) {
        console.error('Error fetching challenges data:', error)
      }
    }

    fetchChallengesData()
  }, [user, refreshTrigger])

  // Handle check-in
  const handleCheckIn = async (challengeId: string, challengeTitle: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/challenges/${challengeId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed: true,
          checkin_date: new Date().toISOString().split('T')[0]
        })
      })

      if (response.ok) {
        setRefreshTrigger(prev => prev + 1) // Refresh data
        // Show success modal
        setCheckedInChallengeTitle(challengeTitle)
        setCheckInModalOpen(true)
      } else {
        const error = await response.json()
        // Check if already checked in
        if (error.error?.includes('Already checked in')) {
          setAlreadyCheckedInModalOpen(true)
        } else {
          toast.error('Failed to check in', {
            description: error.error || 'Please try again'
          })
        }
      }
    } catch (error) {
      console.error('Error checking in:', error)
      toast.error('Failed to check in')
    }
  }

  const handleCancelChallenge = async () => {
    if (!cancelingChallengeId) return
    
    setIsCanceling(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/challenges/${cancelingChallengeId}/abandon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setPartialPointsEarned(result.partialPoints || 0)
        setCancelModalOpen(false)
        setCanceledModalOpen(true)
        setRefreshTrigger(prev => prev + 1) // Refresh data
      } else {
        const error = await response.json()
        toast.error('Failed to cancel challenge', {
          description: error.error || 'Please try again'
        })
      }
    } catch (error) {
      console.error('Error canceling challenge:', error)
      toast.error('Failed to cancel challenge')
    } finally {
      setIsCanceling(false)
      setCancelingChallengeId(null)
      setCancelingChallengeTitle('')
    }
  }

  if (loading && !mounted) {
    return <PageLoader message="Loading your dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="dashboard" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Message for New Users */}
        {showWelcomeMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-500 relative">
            <button
              onClick={() => setShowWelcomeMessage(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <PartyPopper className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  Welcome to Plounix! <Sparkles className="w-6 h-6 ml-2" />
                </h2>
                <p className="text-white/90 mb-4">
                  Congrats on taking the first step towards financial freedom! Your profile is all set up. 
                  Here's what you can do next:
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <Link href="/ai-assistant">
                    <div className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all cursor-pointer">
                      <MessageCircle className="w-5 h-5 mb-1" />
                      <p className="font-semibold text-sm">Chat with AI</p>
                      <p className="text-xs text-white/70">Get personalized advice</p>
                    </div>
                  </Link>
                  <Link href="/goals">
                    <div className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all cursor-pointer">
                      <Target className="w-5 h-5 mb-1" />
                      <p className="font-semibold text-sm">Set Your Goals</p>
                      <p className="text-xs text-white/70">Track your progress</p>
                    </div>
                  </Link>
                  <Link href="/learning">
                    <div className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all cursor-pointer">
                      <BookOpen className="w-5 h-5 mb-1" />
                      <p className="font-semibold text-sm">Learn Basics</p>
                      <p className="text-xs text-white/70">Financial literacy 101</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

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
          
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? '...' : `₱${availableMoney.toLocaleString()}`}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Available to Spend</p>
                </div>
                <Wallet className="w-8 h-8 text-green-500" />
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {mounted ? completedModules.length : 0}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Modules Done</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Goal Progress - Takes 1 column */}
          <div className="lg:col-span-1">
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
                    <Spinner size="lg" color="primary" className="mx-auto" />
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
                  <div className="space-y-6">
                    {topGoals.map((goal, index) => {
                      const progressPercentage = (goal.current_amount / goal.target_amount) * 100
                      const colors = ['blue', 'green', 'purple', 'orange', 'pink']
                      const color = colors[index % colors.length]
                      
                      return (
                        <Link key={goal.id} href="/goals">
                          <div className={`p-4 bg-gray-50 rounded-lg border-l-4 border-${color}-500 hover:bg-gray-100 transition-colors cursor-pointer mb-4`}>
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
                        </Link>
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

          {/* Challenges Overview - Takes 1 column */}
          <div className="lg:col-span-1">
            <Card className="bg-white h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-purple-500" />
                    Active Challenges
                  </CardTitle>
                  <Link href="/challenges">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {activeChallenges.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-4">No active challenges yet</p>
                    <Link href="/challenges">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Browse Challenges
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeChallenges.map((challenge: any) => {
                      const progressPercent = challenge.progress_percent || 0
                      const daysLeft = challenge.days_left || 0
                      const borderColor = progressPercent >= 75 ? 'border-green-500' : progressPercent >= 50 ? 'border-blue-500' : 'border-yellow-500'
                      const bgColor = progressPercent >= 75 ? 'bg-green-500' : progressPercent >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                      
                      return (
                        <div key={challenge.id} className={`relative p-3 bg-gray-50 rounded-lg border-l-4 ${borderColor} hover:bg-gray-100 transition-colors group`}>
                          <Link href="/challenges" className="block">
                            <div className="flex justify-between items-center mb-2 pr-8">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 truncate group-hover:text-purple-600 transition-colors">{challenge.title}</h4>
                                <p className="text-sm text-gray-600">
                                  {challenge.checkins_completed}/{challenge.checkins_required} check-ins • {daysLeft > 0 ? `${daysLeft} days left` : 'Due today!'}
                                </p>
                              </div>
                              <div className="text-right ml-2">
                                <span className="text-lg font-semibold text-purple-600">
                                  {progressPercent}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={`${bgColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${progressPercent}%` }}></div>
                            </div>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-3 right-3 h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 z-10"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setCancelingChallengeId(challenge.id)
                              setCancelingChallengeTitle(challenge.title)
                              setCancelModalOpen(true)
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (activeChallenges.length > 0) {
                          handleCheckIn(activeChallenges[0].id, activeChallenges[0].title)
                        }
                      }}
                      disabled={activeChallenges.length === 0 || activeChallenges[0]?.progress_percent >= 100}
                    >
                      Check In Today
                    </Button>
                  </div>
                )}
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
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    {challengesStats.completed} Completed
                  </span>
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

      {/* Check-In Success Modal */}
      <CheckInSuccessModal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        challengeTitle={checkedInChallengeTitle}
      />

      {/* Already Checked In Modal */}
      <AlreadyCheckedInModal
        isOpen={alreadyCheckedInModalOpen}
        onClose={() => setAlreadyCheckedInModalOpen(false)}
      />

      {/* Cancel Challenge Confirmation Modal */}
      <CancelChallengeModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false)
          setCancelingChallengeId(null)
          setCancelingChallengeTitle('')
        }}
        onConfirm={handleCancelChallenge}
        challengeTitle={cancelingChallengeTitle}
        isLoading={isCanceling}
      />

      {/* Challenge Canceled Success Modal */}
      <ChallengeCanceledModal
        isOpen={canceledModalOpen}
        onClose={() => setCanceledModalOpen(false)}
        partialPoints={partialPointsEarned}
      />
    </div>
  )
}
