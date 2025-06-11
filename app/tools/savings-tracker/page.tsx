'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { ArrowLeft, TrendingUp, Target } from 'lucide-react'

export default function SavingsTrackerPage() {
  const [goalAmount, setGoalAmount] = useState<number>(0)
  const [currentSavings, setCurrentSavings] = useState<number>(0)
  const [monthlySavings, setMonthlySavings] = useState<number>(0)
  const [calculated, setCalculated] = useState(false)

  const remaining = goalAmount - currentSavings
  const progress = goalAmount > 0 ? (currentSavings / goalAmount) * 100 : 0
  const monthsToGoal = monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : 0

  const handleCalculate = () => {
    if (goalAmount > 0) {
      setCalculated(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="resources" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/resource-hub">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <TrendingUp className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Savings Goal Tracker</h1>
            <p className="text-gray-600">Track your progress towards financial goals</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Set Your Savings Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Amount (₱)</label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={goalAmount || ''}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Savings (₱)</label>
                <Input
                  type="number"
                  placeholder="e.g. 15000"
                  value={currentSavings || ''}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Savings (₱)</label>
                <Input
                  type="number"
                  placeholder="e.g. 3000"
                  value={monthlySavings || ''}
                  onChange={(e) => setMonthlySavings(Number(e.target.value))}
                />
              </div>
              <Button onClick={handleCalculate} className="w-full">
                Track Progress
              </Button>
            </CardContent>
          </Card>

          {calculated && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-primary h-4 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">₱{currentSavings.toLocaleString()}</p>
                    <p className="text-sm text-blue-700">Current</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">₱{goalAmount.toLocaleString()}</p>
                    <p className="text-sm text-green-700">Goal</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Remaining:</span> ₱{remaining.toLocaleString()}
                  </p>
                  {monthsToGoal > 0 && (
                    <p className="text-sm">
                      <span className="font-semibold">Time to goal:</span> {monthsToGoal} months
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-semibold">Target date:</span> {monthsToGoal > 0 ? 
                      new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
                      'Set monthly savings'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
