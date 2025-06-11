'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { Target, Plus, Calendar, DollarSign, Tag, TrendingUp } from 'lucide-react'
import { goalManager, FinancialGoal } from '@/lib/goal-manager'
import { PageHeader } from '@/components/ui/page-header'

export default function GoalsPage() {
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    timeframe: '',
    category: ''
  })

  const handleCreateGoal = () => {
    if (formData.title && formData.targetAmount && formData.timeframe) {
      const newGoal = goalManager.createManualGoal({
        title: formData.title,
        description: formData.description,
        targetAmount: Number(formData.targetAmount),
        timeframe: Number(formData.timeframe),
        category: formData.category
      })
      
      setGoals([...goals, newGoal])
      setFormData({ title: '', description: '', targetAmount: '', timeframe: '', category: '' })
      setShowCreateForm(false)
    }
  }

  const categories = [
    { value: 'phone', label: 'Phone/Gadgets', icon: '📱' },
    { value: 'laptop', label: 'Laptop/Computer', icon: '💻' },
    { value: 'vacation', label: 'Travel/Vacation', icon: '✈️' },
    { value: 'emergency', label: 'Emergency Fund', icon: '🚨' },
    { value: 'education', label: 'Education/Course', icon: '📚' },
    { value: 'custom', label: 'Other', icon: '🎯' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Uniform Header */}
        <PageHeader
          title="My Financial Goals"
          description="Track your savings goals and celebrate milestones. Create goals manually or let AI assistant help you plan."
          badge={{
            text: "AI-Powered Planning",
            icon: Target
          }}
        />

        {/* Create Goal Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Financial Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Goal Title</label>
                  <Input
                    placeholder="e.g., Save for iPhone 15"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Amount (₱)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 65000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  placeholder="Why is this goal important to you?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Timeframe (months)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 12"
                    value={formData.timeframe}
                    onChange={(e) => setFormData({...formData, timeframe: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleCreateGoal} className="flex-1">
                  Create Goal
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first financial goal or chat with our AI assistant to get personalized suggestions!
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Manual Goal
                </Button>
                <Link href="/ai-assistant">
                  <Button variant="outline">
                    💬 Ask AI for Goal Ideas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    </div>
                    <span className="text-2xl">
                      {categories.find(c => c.value === goal.category)?.icon || '🎯'}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">₱{goal.currentAmount.toLocaleString()}</p>
                      <p className="text-xs text-blue-700">Saved</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-lg font-bold text-green-600">₱{goal.targetAmount.toLocaleString()}</p>
                      <p className="text-xs text-green-700">Target</p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>💰 Monthly target: ₱{goal.monthlyTarget.toLocaleString()}</p>
                    <p>📅 Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                    <p>🤖 Created by: {goal.createdBy === 'ai-assistant' ? 'AI Assistant' : 'Manual'}</p>
                  </div>

                  <Button className="w-full" variant="outline">
                    Update Progress
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Tips */}
        <Card className="mt-8 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Goal Setting Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">💡 SMART Goals:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Specific: "iPhone 15" not "new phone"</li>
                  <li>• Measurable: ₱65,000 exact amount</li>
                  <li>• Achievable: Based on your income</li>
                  <li>• Relevant: Important to your life</li>
                  <li>• Time-bound: Clear deadline</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎯 Success Strategies:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Start with small, achievable goals</li>
                  <li>• Automate your savings</li>
                  <li>• Celebrate milestones</li>
                  <li>• Adjust timeline if needed</li>
                  <li>• Use AI assistant for motivation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
