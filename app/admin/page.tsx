'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  Activity, 
  AlertCircle, 
  Eye, 
  TrendingUp,
  LogOut,
  Bug,
  Bell,
  BarChart3,
  Shield,
  BookOpen,
  Target,
  CreditCard,
  Trophy,
  Zap,
  Globe
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface DashboardStats {
  total_users: number
  active_users: number
  inactive_users: number
  signups_today: number
  signups_this_week: number
  signups_this_month: number
  visits_this_month: number
  new_bug_reports: number
  active_bug_reports: number
  // Learning modules
  total_modules: number
  core_modules: number
  essential_modules: number
  // Transactions
  total_transactions: number
  transactions_this_month: number
  // Goals
  total_goals: number
  active_goals: number
  completed_goals: number
  // Challenges
  total_challenges: number
  active_challenges_count: number
}

interface ChartData {
  signups: Array<{ date: string; users: number }>
  transactions: Array<{ date: string; income: number; expense: number }>
  membership: Array<{ name: string; value: number }>
  goals: Array<{ name: string; value: number }>
  modules: Array<{ name: string; completion: number }>
  ages: Array<{ age: string; users: number }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [adminUsername, setAdminUsername] = useState('')

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6']

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/admin/session')
      const data = await response.json()

      if (!data.authenticated) {
        router.push('/auth/login')
        return
      }

      setAdminUsername(data.username)
      await Promise.all([loadStats(), loadChartData()])
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login')
    }
  }

  async function loadStats() {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  async function loadChartData() {
    try {
      const response = await fetch('/api/admin/charts')
      const data = await response.json()
      setChartData(data)
    } catch (error) {
      console.error('Failed to load chart data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="xl" color="primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Simplified Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Plounix Admin
                </h1>
                <p className="text-xs text-gray-500">Dashboard Overview</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_users || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats?.active_users || 0} active</p>
                  </div>
                  <Users className="w-10 h-10 text-green-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Modules</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_modules || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats?.core_modules || 0} core • {stats?.essential_modules || 0} essential</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-blue-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Goals</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_goals || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats?.active_goals || 0} active • {stats?.completed_goals || 0} done</p>
                  </div>
                  <Target className="w-10 h-10 text-purple-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_transactions || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <CreditCard className="w-10 h-10 text-orange-600 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-base flex items-center text-gray-800 group-hover:text-green-600 transition-colors">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learning Modules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Create and manage educational content with AI</p>
                <Link href="/admin/learning-modules">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Manage Modules
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-base flex items-center text-gray-800 group-hover:text-blue-600 transition-colors">
                  <Users className="w-5 h-5 mr-2" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">View and manage registered users</p>
                <Link href="/admin/users">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Users
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-base flex items-center text-gray-800 group-hover:text-purple-600 transition-colors">
                  <Globe className="w-5 h-5 mr-2" />
                  Resource Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Manage educational resources and links</p>
                <Link href="/admin/resources">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Manage Resources
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-base flex items-center text-gray-800 group-hover:text-green-600 transition-colors">
                  <Eye className="w-5 h-5 mr-2" />
                  Landing Page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Edit homepage content and features</p>
                <Link href="/admin/landing-page">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Edit Landing
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-base flex items-center text-gray-800 group-hover:text-red-600 transition-colors">
                  <Bug className="w-5 h-5 mr-2" />
                  Bug Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Review user-reported issues</p>
                <Button className="w-full" variant="outline">
                  View Reports
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-base flex items-center text-gray-800 group-hover:text-orange-600 transition-colors">
                  <Bell className="w-5 h-5 mr-2" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Send platform-wide messages</p>
                <Button className="w-full" variant="outline">
                  Create Announcement
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Analytics Charts */}
        {chartData && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Signups Trend */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    User Signups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      signups: {
                        label: "Signups",
                        color: "#10B981",
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <LineChart data={chartData.signups}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="signups" 
                        stroke="var(--color-signups)" 
                        strokeWidth={2}
                        dot={{ fill: "var(--color-signups)", r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Transactions */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      income: {
                        label: "Income",
                        color: "#10B981",
                      },
                      expense: {
                        label: "Expense",
                        color: "#EF4444",
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <BarChart data={chartData.transactions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Module Completion */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    Learning Module Completion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      completion: {
                        label: "Completion %",
                        color: "#3B82F6",
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <BarChart data={chartData.modules}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="completion" fill="var(--color-completion)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Age Distribution */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center">
                    <Users className="w-5 h-5 mr-2 text-cyan-600" />
                    User Age Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      users: {
                        label: "Users",
                        color: "#06b6d4",
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <BarChart data={chartData.ages}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
