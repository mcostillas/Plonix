'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/lib/auth'
import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar, 
  Filter, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Receipt,
  DollarSign,
  Download,
  Eye,
  Edit3
} from 'lucide-react'

export default function TransactionsPage() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Mock data - this would come from your database
  const transactions = [
    { id: 1, type: 'expense', amount: 285, description: 'Jollibee Dinner', category: 'Food & Dining', date: '2025-09-23', time: '19:30' },
    { id: 2, type: 'income', amount: 2500, description: 'Freelance Payment', category: 'Income', date: '2025-09-22', time: '14:15' },
    { id: 3, type: 'expense', amount: 24, description: 'Jeepney Fare', category: 'Transportation', date: '2025-09-22', time: '08:30' },
    { id: 4, type: 'expense', amount: 549, description: 'Netflix Subscription', category: 'Entertainment', date: '2025-09-21', time: '12:00' },
    { id: 5, type: 'income', amount: 15000, description: 'Monthly Salary', category: 'Income', date: '2025-09-15', time: '09:00' },
    { id: 6, type: 'expense', amount: 1200, description: 'Groceries', category: 'Food & Dining', date: '2025-09-20', time: '16:45' },
    { id: 7, type: 'expense', amount: 150, description: 'Coffee Shop', category: 'Food & Dining', date: '2025-09-19', time: '10:20' },
    { id: 8, type: 'expense', amount: 80, description: 'Bus Fare', category: 'Transportation', date: '2025-09-18', time: '07:45' },
    { id: 9, type: 'income', amount: 1250, description: 'Weekly Allowance', category: 'Income', date: '2025-09-17', time: '12:00' },
    { id: 10, type: 'expense', amount: 450, description: 'Phone Bill', category: 'Utilities', date: '2025-09-16', time: '14:30' }
  ]

  const categories = [
    { name: 'Food & Dining', amount: 4200, transactions: 15, color: 'bg-blue-500', percentage: 32.8 },
    { name: 'Transportation', amount: 2800, transactions: 22, color: 'bg-green-500', percentage: 21.9 },
    { name: 'Entertainment', amount: 1950, transactions: 8, color: 'bg-purple-500', percentage: 15.2 },
    { name: 'Utilities', amount: 2100, transactions: 6, color: 'bg-yellow-500', percentage: 16.4 },
    { name: 'Others', amount: 1750, transactions: 12, color: 'bg-orange-500', percentage: 13.7 }
  ]

  const summary = {
    totalIncome: 18750,
    totalExpenses: 12800,
    totalSaved: 8450,
    netCashflow: 5950,
    transactionCount: transactions.length
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedCategory !== 'all' && transaction.category !== selectedCategory) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="transactions" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
              <p className="text-gray-600">Complete view of your income, expenses, and transactions</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Link href="/add-transaction">
                <Button size="sm">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">₱{summary.totalIncome.toLocaleString()}</p>
                  <p className="text-sm text-green-700 font-medium">Total Income</p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">₱{summary.totalExpenses.toLocaleString()}</p>
                  <p className="text-sm text-red-700 font-medium">Total Expenses</p>
                </div>
                <ArrowDownRight className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">₱{summary.netCashflow.toLocaleString()}</p>
                  <p className="text-sm text-blue-700 font-medium">Net Cashflow</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">₱{summary.totalSaved.toLocaleString()}</p>
                  <p className="text-sm text-purple-700 font-medium">Total Saved</p>
                </div>
                <PiggyBank className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Expense Categories */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-500" />
                Expense Categories
              </CardTitle>
              <CardDescription>This month's spending breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${category.color} rounded-full`}></div>
                      <div>
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className="text-xs text-gray-600">{category.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₱{category.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">{category.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Receipt className="w-5 h-5 mr-2 text-green-500" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="all">All Categories</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-gray-600">
                          {transaction.category} • {transaction.date} • {transaction.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₱{transaction.amount.toLocaleString()}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-500" />
              Monthly Financial Breakdown
            </CardTitle>
            <CardDescription>Detailed analysis of your financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Income Sources */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-600">Income Sources</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Monthly Salary</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">₱15,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium">Freelance Work</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">₱2,500</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                      <span className="text-sm font-medium">Allowance</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">₱1,250</span>
                  </div>
                </div>
              </div>

              {/* Top Expenses */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-600">Top Expenses</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Food & Dining</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">₱4,200</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Transportation</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">₱2,800</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Utilities</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">₱2,100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{summary.transactionCount}</p>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {((summary.netCashflow / summary.totalIncome) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Savings Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    ₱{Math.round(summary.totalExpenses / 30).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Daily Avg Spending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    ₱{Math.round(summary.totalIncome / 30).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Daily Avg Income</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
