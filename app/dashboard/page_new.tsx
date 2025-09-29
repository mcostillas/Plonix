'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/lib/auth'
import { PlusCircle, Calculator, TrendingUp, PieChart, Target, Trophy, BookOpen, PiggyBank, Search, Globe, MessageCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

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
                  <p className="text-2xl font-bold text-green-600">₱8,450</p>
                  <p className="text-sm text-gray-600 font-medium">Total Saved</p>
                </div>
                <PiggyBank className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">3</p>
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
                  <p className="text-2xl font-bold text-emerald-600">₱15,250</p>
                  <p className="text-sm text-gray-600 font-medium">This Month</p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">₱12,800</p>
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
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-500" />
                  Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg border-l-3 border-blue-500">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">iPhone 15 Pro</h4>
                        <p className="text-sm text-gray-600">₱8,450 / ₱65,000</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-blue-600">13%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '13%' }}></div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg border-l-3 border-green-500">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">Emergency Fund</h4>
                        <p className="text-sm text-gray-600">₱6,200 / ₱15,000</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-green-600">41%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '41%' }}></div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg border-l-3 border-purple-500">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">Graduation Trip</h4>
                        <p className="text-sm text-gray-600">₱12,500 / ₱25,000</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-purple-600">50%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant - Takes 3 columns */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-to-r from-primary to-blue-600 text-white h-full">
              <CardContent className="p-6 flex items-center h-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Search className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">AI Assistant with Web Search</h3>
                      <p className="text-blue-100">
                        Ask me to search for current prices, bank rates, or any financial info!
                      </p>
                    </div>
                  </div>
                  <Link href="/ai-assistant">
                    <Button variant="secondary">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link href="/learning">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 text-center h-full flex flex-col justify-center">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Financial Learning</h3>
                <p className="text-xs text-gray-600 mb-2">Master financial literacy</p>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">7 Topics</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/goals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 text-center h-full flex flex-col justify-center">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">My Goals</h3>
                <p className="text-xs text-gray-600 mb-2">Track savings goals</p>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">3 Active</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/challenges">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 text-center h-full flex flex-col justify-center">
                <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Challenges</h3>
                <p className="text-xs text-gray-600 mb-2">Build money habits</p>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">7 Done</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/digital-tools">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 text-center h-full flex flex-col justify-center">
                <Calculator className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Tools</h3>
                <p className="text-xs text-gray-600 mb-2">Budget & savings tracker</p>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">₱ Ready</span>
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
              <div className="grid md:grid-cols-3 gap-8">
                {/* Total Income */}
                <div className="text-center p-6 bg-white rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-green-500 rounded-full">
                      <ArrowUpRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">₱18,750</div>
                  <div className="text-sm text-green-700 font-semibold mb-4">Total Income</div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Salary</span>
                      <span className="font-medium">₱15,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Freelance</span>
                      <span className="font-medium">₱2,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Allowance</span>
                      <span className="font-medium">₱1,250</span>
                    </div>
                  </div>
                </div>

                {/* Total Expenses */}
                <div className="text-center p-6 bg-white rounded-xl border border-red-200 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-red-500 rounded-full">
                      <ArrowDownRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-red-600 mb-2">₱12,800</div>
                  <div className="text-sm text-red-700 font-semibold mb-4">Total Expenses</div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Food & Dining</span>
                      <span className="font-medium">₱4,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transportation</span>
                      <span className="font-medium">₱2,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Others</span>
                      <span className="font-medium">₱5,800</span>
                    </div>
                  </div>
                </div>

                {/* Net Cashflow */}
                <div className="text-center p-6 bg-white rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-blue-500 rounded-full">
                      <PiggyBank className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">₱5,950</div>
                  <div className="text-sm text-blue-700 font-semibold mb-4">Net Cashflow</div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-3">
                      {((5950 / 18750) * 100).toFixed(1)}% of income saved
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                  <p className="text-sm text-blue-600 font-semibold">Excellent savings rate! 🎯</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Navigation Cards & Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Additional Navigation Cards */}
          <div className="space-y-4">
            <Link href="/add-transaction">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <PlusCircle className="w-8 h-8 text-orange-600" />
                    <div>
                      <h3 className="font-semibold text-sm">Add Transaction</h3>
                      <p className="text-xs text-gray-600">Quick expense entry</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/resource-hub">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-8 h-8 text-teal-600" />
                    <div>
                      <h3 className="font-semibold text-sm">Resource Hub</h3>
                      <p className="text-xs text-gray-600">Curated resources</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Activity - Takes remaining 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-medium text-sm">-</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Jollibee Dinner</p>
                        <p className="text-xs text-gray-600">Food & Dining • Today</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-red-600">-₱285</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium text-sm">+</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Freelance Payment</p>
                        <p className="text-xs text-gray-600">Income • Yesterday</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-600">+₱2,500</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-medium text-sm">-</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Jeepney Fare</p>
                        <p className="text-xs text-gray-600">Transportation • Yesterday</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-red-600">-₱24</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-medium text-sm">-</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Netflix Subscription</p>
                        <p className="text-xs text-gray-600">Entertainment • Aug 27</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-red-600">-₱549</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/add-transaction">
                    <Button className="w-full" variant="outline">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add New Transaction
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
