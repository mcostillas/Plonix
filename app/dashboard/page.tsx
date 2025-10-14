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
import { PlusCircle, Calculator, TrendingUp, PieChart, Target, Trophy, BookOpen, PiggyBank, Search, Globe, MessageCircle, ArrowUpRight, ArrowDownRight, X, Sparkles, PartyPopper } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { supabase } from '@/lib/supabase'
import { CheckInSuccessModal, ChallengeCanceledModal } from '@/components/ui/success-modal'
import { AlreadyCheckedInModal } from '@/components/ui/info-modal'
import { CancelChallengeModal } from '@/components/ui/confirmation-modal'
import { toast } from 'sonner'
import { InteractiveTour } from '@/components/InteractiveTour'

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
  const [showTour, setShowTour] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [tourChecked, setTourChecked] = useState(false) // Prevent duplicate tour checks

  // Total modules count (should match learning page)
  const totalModules = 7 // 3 core + 4 essential modules

  // Check if user needs to see the interactive tour (only once per user, ever)
  useEffect(() => {
    if (!user?.id || tourChecked) return
    
    async function checkTourStatus() {
      try {
        const { supabase } = await import('@/lib/supabase')
        
        // Check database first for cross-device persistence
        const { data, error } = await supabase
          .from('user_profiles')
          .select('tour_completed')
          .eq('user_id', user!.id)
          .single()
        
        if (!error && data) {
          const tourCompleted = (data as any).tour_completed
          console.log('🔍 Database tour status:', tourCompleted)
          
          // If tour is explicitly marked as completed, never show it again
          if (tourCompleted === true) {
            console.log('✅ Tour already completed (from database)')
            setShowTour(false)
            setTourChecked(true)
            // Also sync to localStorage for faster future checks
            localStorage.setItem('plounix_tour_shown', 'true')
            return
          }
        }
        
        // Fallback to localStorage (for existing users before database field was added)
        const tourShown = localStorage.getItem('plounix_tour_shown')
        
        if (tourShown === 'true') {
          console.log('✅ Tour already shown (from localStorage, syncing to database...)')
          // Update database to sync for cross-device support
          await (supabase as any)
            .from('user_profiles')
            .update({ tour_completed: true })
            .eq('user_id', user!.id)
          setShowTour(false)
          setTourChecked(true)
          return
        }
        
        // Show tour for new users (only once, ever)
        console.log('🚀 New user detected, showing interactive tour (ONCE ONLY)')
        setIsNewUser(true)
        setShowTour(true)
        setTourChecked(true)
      } catch (error) {
        console.error('❌ Error checking tour status:', error)
        // Fallback to localStorage only if database fails
        const tourShown = localStorage.getItem('plounix_tour_shown')
        if (tourShown !== 'true') {
          console.log('⚠️ Database error, checking localStorage fallback')
          setShowTour(true)
        } else {
          console.log('✅ Tour already shown (localStorage fallback)')
          setShowTour(false)
        }
        setTourChecked(true)
      }
    }
    
    checkTourStatus()
  }, [user, tourChecked])

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
          .select('amount, transaction_type, date, category')
          .eq('user_id', user.id)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth)

        let spent = 0
        let income = 0
        let savedToGoals = 0
        
        if (!error && data) {
          data.forEach((tx: any) => {
            const amount = Number(tx.amount) || 0
            if (tx.transaction_type === 'expense') {
              // Separate savings from regular expenses
              if (tx.category === 'Savings' || tx.category === 'Savings/Investment') {
                savedToGoals += amount
              } else {
                spent += amount
              }
            } else if (tx.transaction_type === 'income') {
              income += amount
            }
          })

          setMonthlySpent(spent)
          setMonthlyIncome(income)
          // Money Left = Income - Regular Expenses - Savings
          setTotalSaved(income - spent - savedToGoals)
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

  const handleTourComplete = async () => {
    console.log('✅ Tour completed, saving to database')
    setShowTour(false)
    
    // Save to localStorage for immediate effect
    localStorage.setItem('plounix_tour_shown', 'true')
    
    // Save to database for cross-device persistence
    if (user?.id) {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { error } = await (supabase as any)
          .from('user_profiles')
          .update({ tour_completed: true })
          .eq('user_id', user.id)
        
        if (error) {
          console.error('Error saving tour status to database:', error)
        } else {
          console.log('✅ Tour status saved to database')
        }
      } catch (error) {
        console.error('Error updating tour status:', error)
      }
    }
  }

  if (loading && !mounted) {
    return <PageLoader message="Loading your dashboard..." />
  }

  console.log('🎯 Dashboard rendering, showTour:', showTour)

  // TODO: Dark mode under works - will be implemented next time
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="dashboard" />
      
      {/* Interactive Tour */}
      {showTour && <InteractiveTour onComplete={handleTourComplete} />}

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
        <div className="mb-6 md:mb-8 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-xl md:rounded-2xl p-4 md:p-6 border border-primary/20">
          <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 text-gray-900">
            {isNewUser ? (
              <>Welcome to Plounix, {user?.name || user?.email?.split('@')[0] || 'there'}! 🎉</>
            ) : (
              <>Welcome back, {user?.name || user?.email?.split('@')[0] || 'there'}!</>
            )}
          </h1>
          <p className="text-gray-600 text-sm md:text-lg">
            {isNewUser 
              ? "Let's start building your financial future together!" 
              : "Ready to level up your financial game today?"}
          </p>
        </div>

        {/* Top Row - Stats + Learning Progress */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-base md:text-xl lg:text-2xl font-bold text-green-600 truncate">
                    {loading ? '...' : `₱${totalSaved.toLocaleString()}`}
                  </p>
                  <p className="text-[10px] md:text-xs lg:text-sm text-gray-600 font-medium truncate">Money Left</p>
                </div>
                <PiggyBank className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-green-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-base md:text-xl lg:text-2xl font-bold text-emerald-600 truncate">
                    {loading ? '...' : `₱${monthlyIncome.toLocaleString()}`}
                  </p>
                  <p className="text-[10px] md:text-xs lg:text-sm text-gray-600 font-medium truncate">Income This Month</p>
                </div>
                <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-emerald-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-base md:text-xl lg:text-2xl font-bold text-orange-600 truncate">
                    {loading ? '...' : `₱${monthlySpent.toLocaleString()}`}
                  </p>
                  <p className="text-[10px] md:text-xs lg:text-sm text-gray-600 font-medium truncate">Spent</p>
                </div>
                <ArrowDownRight className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-orange-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          {/* Learning Progress - Integrated into top row */}
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-base md:text-xl lg:text-2xl font-bold text-purple-600 truncate">
                    {mounted ? completedModules.length : 0}
                  </p>
                  <p className="text-[10px] md:text-xs lg:text-sm text-gray-600 font-medium truncate">Modules Done</p>
                </div>
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-purple-500 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Row */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Goal Progress - Takes 1 column */}
          <div className="lg:col-span-1">
            <Card className="bg-white h-full">
              <CardHeader className="pb-3 md:pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <Target className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-500" />
                    Goal Progress
                  </CardTitle>
                  {activeGoalsCount > 3 && (
                    <Link href="/goals">
                      <Button variant="ghost" size="sm" className="text-[10px] md:text-xs">
                        View All ({activeGoalsCount})
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <div className="text-center py-4 md:py-6 lg:py-8 text-gray-500">
                    <Spinner size="lg" color="primary" className="mx-auto" />
                    <p className="mt-2 text-[10px] md:text-xs lg:text-sm">Loading goals...</p>
                  </div>
                ) : topGoals.length === 0 ? (
                  <div className="text-center py-4 md:py-6 lg:py-8">
                    <Target className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 mx-auto text-gray-300 mb-1.5 md:mb-2 lg:mb-3" />
                    <p className="text-[10px] md:text-sm lg:text-base text-gray-500 mb-2 md:mb-3 lg:mb-4">No active goals yet</p>
                    <Link href="/goals">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-[9px] md:text-xs lg:text-sm h-6 md:h-9">
                        <PlusCircle className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 mr-1 md:mr-2" />
                        Create Your First Goal
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3 lg:space-y-6">
                    {topGoals.map((goal, index) => {
                      const progressPercentage = (goal.current_amount / goal.target_amount) * 100
                      const colors = ['blue', 'green', 'purple', 'orange', 'pink']
                      const color = colors[index % colors.length]
                      
                      return (
                        <Link key={goal.id} href="/goals">
                          <div className={`p-3 md:p-4 bg-gray-50 rounded-lg border-l-4 border-${color}-500 hover:bg-gray-100 transition-colors cursor-pointer mb-3 md:mb-4`}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm md:text-base text-gray-800 truncate">{goal.title}</h4>
                                <p className="text-xs md:text-sm text-gray-600">
                                  ₱{goal.current_amount.toLocaleString()} / ₱{goal.target_amount.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right ml-2">
                                <span className={`text-base md:text-lg font-semibold text-${color}-600`}>
                                  {progressPercentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                              <div 
                                className={`bg-${color}-500 h-1.5 md:h-2 rounded-full transition-all duration-500`} 
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                    {activeGoalsCount > 3 && (
                      <Link href="/goals">
                        <Button variant="outline" className="w-full text-xs md:text-sm">
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
              <CardHeader className="pb-3 md:pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <Trophy className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-500" />
                    Active Challenges
                  </CardTitle>
                  <Link href="/challenges">
                    <Button variant="ghost" size="sm" className="text-[10px] md:text-xs">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {activeChallenges.length === 0 ? (
                  <div className="text-center py-6 md:py-8">
                    <Trophy className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-300 mb-2 md:mb-3" />
                    <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4">No active challenges yet</p>
                    <Link href="/challenges">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-xs md:text-sm">
                        <PlusCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        Browse Challenges
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {activeChallenges.map((challenge: any) => {
                      const progressPercent = challenge.progress_percent || 0
                      const daysLeft = challenge.days_left || 0
                      const borderColor = progressPercent >= 75 ? 'border-green-500' : progressPercent >= 50 ? 'border-blue-500' : 'border-yellow-500'
                      const bgColor = progressPercent >= 75 ? 'bg-green-500' : progressPercent >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                      
                      return (
                        <div key={challenge.id} className={`relative p-2.5 md:p-3 bg-gray-50 rounded-lg border-l-4 ${borderColor} hover:bg-gray-100 transition-colors group`}>
                          <Link href="/challenges" className="block">
                            <div className="flex justify-between items-center mb-2 pr-8">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm md:text-base text-gray-800 truncate group-hover:text-purple-600 transition-colors">{challenge.title}</h4>
                                <p className="text-xs md:text-sm text-gray-600">
                                  {challenge.checkins_completed}/{challenge.checkins_required} check-ins • {daysLeft > 0 ? `${daysLeft} days left` : 'Due today!'}
                                </p>
                              </div>
                              <div className="text-right ml-2">
                                <span className="text-base md:text-lg font-semibold text-purple-600">
                                  {progressPercent}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                              <div className={`${bgColor} h-1.5 md:h-2 rounded-full transition-all duration-500`} style={{ width: `${progressPercent}%` }}></div>
                            </div>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 md:top-3 right-2 md:right-3 h-6 w-6 md:h-7 md:w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 z-10"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setCancelingChallengeId(challenge.id)
                              setCancelingChallengeTitle(challenge.title)
                              setCancelModalOpen(true)
                            }}
                          >
                            <X className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        </div>
                      )
                    })}
                    <Button 
                      variant="outline" 
                      className="w-full text-xs md:text-sm"
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6 mb-4 md:mb-6">
          {/* AI Assistant Card - Featured */}
          <div className="col-span-2 lg:col-span-3 mb-1 md:mb-2" data-tour="ai-assistant">
            <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
              <CardContent className="p-2 md:p-2.5 lg:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 md:space-x-2 flex-1 min-w-0">
                    <div className="bg-white/20 p-1 md:p-1.5 rounded-full flex-shrink-0">
                      <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[11px] md:text-xs lg:text-base font-bold mb-0 md:mb-0.5 truncate">Ask Fili for Help!</h3>
                      <p className="text-[8px] md:text-[9px] lg:text-xs text-blue-100 hidden sm:block">
                        Get financial advice & info
                      </p>
                    </div>
                  </div>
                  <Link href="/ai-assistant" className="flex-shrink-0">
                    <Button variant="secondary" size="sm" className="text-[9px] md:text-[10px] lg:text-xs h-6 md:h-7 lg:h-8 px-2 md:px-3">
                      <Globe className="w-3 h-3 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1" />
                      Chat
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <Link href="/learning" data-tour="learning">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-1.5 md:pb-2 lg:pb-3 p-3 md:p-4 lg:p-6">
                <BookOpen className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-blue-600 mb-1 md:mb-2" />
                <CardTitle className="text-xs md:text-sm lg:text-base">Financial Learning</CardTitle>
                <CardDescription className="text-[10px] md:text-xs lg:text-sm line-clamp-2">
                  Master financial literacy with structured lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-3 md:pb-4 p-3 md:p-4 lg:p-6">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="text-[10px] md:text-xs lg:text-sm text-blue-600 font-medium">7 Topics</p>
                  <span className="bg-blue-100 text-blue-800 text-[9px] md:text-[10px] lg:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">Start Learning</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/goals" data-tour="goals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-1.5 md:pb-2 lg:pb-3 p-3 md:p-4 lg:p-6">
                <Target className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-green-600 mb-1 md:mb-2" />
                <CardTitle className="text-xs md:text-sm lg:text-base">Financial Goals</CardTitle>
                <CardDescription className="text-[10px] md:text-xs lg:text-sm line-clamp-2">
                  Track savings goals created manually or by AI
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-3 md:pb-4 p-3 md:p-4 lg:p-6">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="text-[10px] md:text-xs lg:text-sm text-green-600 font-medium">AI-powered</p>
                  <span className="bg-green-100 text-green-800 text-[9px] md:text-[10px] lg:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">3 Active</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/challenges" data-tour="challenges">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-1.5 md:pb-2 lg:pb-3 p-3 md:p-4 lg:p-6">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-purple-600 mb-1 md:mb-2" />
                <CardTitle className="text-xs md:text-sm lg:text-base">Challenges</CardTitle>
                <CardDescription className="text-[10px] md:text-xs lg:text-sm line-clamp-2">
                  Student and graduate challenges for building habits
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-3 md:pb-4 p-3 md:p-4 lg:p-6">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="text-[10px] md:text-xs lg:text-sm text-purple-600 font-medium">Community</p>
                  <span className="bg-purple-100 text-purple-800 text-[9px] md:text-[10px] lg:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                    {challengesStats.completed} Done
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer h-full"
            onClick={() => setShowAddTransactionModal(true)}
            data-tour="transactions"
          >
            <CardHeader className="pb-1.5 md:pb-2 lg:pb-3 p-3 md:p-4 lg:p-6">
              <PlusCircle className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-orange-600 mb-1 md:mb-2" />
              <CardTitle className="text-xs md:text-sm lg:text-base">Add Transaction</CardTitle>
              <CardDescription className="text-[10px] md:text-xs lg:text-sm line-clamp-2">
                Manually track your income and expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-3 md:pb-4 p-3 md:p-4 lg:p-6">
              <p className="text-[10px] md:text-xs lg:text-sm text-orange-600 font-medium">Quick entry</p>
            </CardContent>
          </Card>

          <Link href="/resource-hub">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-1.5 md:pb-2 lg:pb-3 p-3 md:p-4 lg:p-6">
                <Globe className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-teal-600 mb-1 md:mb-2" />
                <CardTitle className="text-xs md:text-sm lg:text-base">Resource Hub</CardTitle>
                <CardDescription className="text-[10px] md:text-xs lg:text-sm line-clamp-2">
                  Filipino financial educators and trusted resources
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-3 md:pb-4 p-3 md:p-4 lg:p-6">
                <p className="text-[10px] md:text-xs lg:text-sm text-teal-600 font-medium">Curated resources</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Bottom Row - Recent Activity */}
        <div className="grid lg:grid-cols-1 gap-4 md:gap-6">
          {/* Recent Activity - Full width */}
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-base md:text-lg">Recent Transactions</CardTitle>
              <CardDescription className="text-xs md:text-sm">Your latest income and expenses</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                {loading ? (
                  <div className="text-center py-6 md:py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="mt-2 text-xs md:text-sm">Loading transactions...</p>
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-center py-6 md:py-8">
                    <PiggyBank className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-300 mb-2 md:mb-3" />
                    <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4">No transactions yet</p>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-xs md:text-sm"
                      onClick={() => setShowAddTransactionModal(true)}
                    >
                      <PlusCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                      Add Your First Transaction
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 md:space-y-3">
                      {recentTransactions.map((tx) => {
                        const isIncome = tx.transaction_type === 'income'
                        const formattedDate = new Date(tx.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })
                        
                        return (
                          <div key={tx.id} className="flex items-center justify-between p-2.5 md:p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 md:space-x-3">
                              <div className={`w-8 h-8 md:w-10 md:h-10 ${isIncome ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                                <span className={`${isIncome ? 'text-green-600' : 'text-red-600'} font-medium text-xs md:text-sm`}>
                                  {isIncome ? '+' : '-'}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs md:text-sm font-medium">{tx.merchant}</p>
                                <p className="text-[10px] md:text-xs text-gray-600 capitalize">
                                  {tx.category} • {formattedDate}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs md:text-sm font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                              {isIncome ? '+' : '-'}₱{Number(tx.amount).toLocaleString()}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                      <Button 
                        className="w-full text-xs md:text-sm" 
                        variant="outline"
                        onClick={() => setShowAddTransactionModal(true)}
                      >
                        <PlusCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
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
