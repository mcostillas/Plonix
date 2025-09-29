"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { Plus, Receipt, DollarSign, Calendar, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddTransactionPage() {
  const [transactionData, setTransactionData] = useState({
    amount: '',
    merchant: '',
    category: '',
    date: '',
    paymentMethod: '',
    notes: ''
  })

  const categories = [
    'Food & Dining',
    'Transportation', 
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Savings/Investment'
  ]

  const paymentMethods = [
    'Cash',
    'GCash',
    'PayMaya',
    'Credit Card',
    'Debit Card',
    'Bank Transfer'
  ]

  const handleSubmit = () => {
    console.log('Transaction added:', transactionData)
    // Here you would typically save to database
    alert('Transaction added successfully!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add Transaction</h1>
            <p className="text-gray-600">Manually track your income and expenses</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200">
              <CardHeader className="text-center pb-3">
                <Plus className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg text-green-600">Add Income</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-red-200">
              <CardHeader className="text-center pb-3">
                <Receipt className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <CardTitle className="text-lg text-red-600">Add Expense</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Transaction Form */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>Fill in the transaction information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Amount (₱)</span>
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Merchant/Description</label>
                <Input
                  placeholder="e.g., Jollibee Ayala, Salary, Freelance"
                  value={transactionData.merchant}
                  onChange={(e) => setTransactionData({...transactionData, merchant: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                  <Tag className="w-4 h-4" />
                  <span>Category</span>
                </label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={transactionData.category}
                  onChange={(e) => setTransactionData({...transactionData, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Date</span>
                </label>
                <Input
                  type="date"
                  value={transactionData.date}
                  onChange={(e) => setTransactionData({...transactionData, date: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={transactionData.paymentMethod}
                  onChange={(e) => setTransactionData({...transactionData, paymentMethod: e.target.value})}
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                <Input
                  placeholder="Additional notes about this transaction"
                  value={transactionData.notes}
                  onChange={(e) => setTransactionData({...transactionData, notes: e.target.value})}
                />
              </div>

              <Button className="w-full" onClick={handleSubmit}>
                Add Transaction
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">Jollibee Ayala</p>
                    <p className="text-xs text-gray-600">Food & Dining • GCash</p>
                  </div>
                  <p className="font-semibold text-red-600">-₱185</p>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">Freelance Project</p>
                    <p className="text-xs text-gray-600">Income • Bank Transfer</p>
                  </div>
                  <p className="font-semibold text-green-600">+₱2,500</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
