'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { ArrowLeft, Calculator, PieChart } from 'lucide-react'

export default function BudgetCalculatorPage() {
  const [income, setIncome] = useState<number>(0)
  const [calculated, setCalculated] = useState(false)

  const needs = income * 0.5
  const wants = income * 0.3
  const savings = income * 0.2

  const handleCalculate = () => {
    if (income > 0) {
      setCalculated(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="tools" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/resource-hub">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Calculator className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Peso Budget Calculator</h1>
            <p className="text-gray-600">Calculate your 50-30-20 budget breakdown</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Monthly Income</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Income (₱)</label>
                <Input
                  type="number"
                  placeholder="e.g. 20000"
                  value={income || ''}
                  onChange={(e) => setIncome(Number(e.target.value))}
                />
              </div>
              <Button onClick={handleCalculate} className="w-full">
                Calculate Budget
              </Button>
            </CardContent>
          </Card>

          {calculated && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Your 50-30-20 Budget</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-red-800">Needs (50%)</h4>
                      <p className="text-sm text-red-600">Food, rent, transport, bills</p>
                    </div>
                    <p className="text-xl font-bold text-red-700">₱{needs.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-blue-800">Wants (30%)</h4>
                      <p className="text-sm text-blue-600">Entertainment, shopping, hobbies</p>
                    </div>
                    <p className="text-xl font-bold text-blue-700">₱{wants.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-green-800">Savings (20%)</h4>
                      <p className="text-sm text-green-600">Emergency fund, investments</p>
                    </div>
                    <p className="text-xl font-bold text-green-700">₱{savings.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Annual Projections:</h4>
                  <p className="text-sm text-gray-600">
                    • Yearly savings: ₱{(savings * 12).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    • 5-year savings: ₱{(savings * 12 * 5).toLocaleString()}
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
