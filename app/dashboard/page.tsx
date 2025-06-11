'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { PlusCircle, Calculator, TrendingUp, PieChart, Target, Trophy, BookOpen, PiggyBank, Search, Globe, MessageCircle } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="dashboard" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Juan! 👋</h1>
          <p className="text-gray-600">Ready to level up your financial game today?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <PiggyBank className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">₱8,450</p>
                  <p className="text-xs text-gray-600">Total Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-xs text-gray-600">Active Goals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">7</p>
                  <p className="text-xs text-gray-600">Challenges Won</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">65%</p>
                  <p className="text-xs text-gray-600">Learning Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Highlight */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
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

        {/* Main Navigation */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Financial Literacy Basics</CardTitle>
              <CardDescription>
                Learn budgeting, saving, and investing with our Learn-Apply-Reflect method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-600 font-medium">Interactive lessons</p>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">65% Complete</span>
              </div>
            </CardContent>
          </Card>

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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Globe className="w-12 h-12 text-teal-600 mb-4" />
              <CardTitle>Resource Hub</CardTitle>
              <CardDescription>
                Filipino financial educators, banks, and educational content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-teal-600 font-medium">Curated resources</p>
            </CardContent>
          </Card>

          <Link href="/money-missions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
              <CardHeader>
                <Trophy className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Money Missions</CardTitle>
                <CardDescription>
                  Student and graduate missions for building money habits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-purple-600 font-medium">Community missions</p>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">7 Completed</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Search for iPhone 15 price Philippines</p>
                    <p className="text-xs text-gray-600">Created savings goal: ₱65,000</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Search className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Find current CIMB bank rates</p>
                    <p className="text-xs text-gray-600">Got latest 4% interest rate info</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calculator className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Budget analysis for ₱25,000 salary</p>
                    <p className="text-xs text-gray-600">Applied 50-30-20 rule successfully</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Budgeting Mastery</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Smart Saving</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Investment Basics</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
