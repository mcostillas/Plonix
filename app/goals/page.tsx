'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { AuthGuard } from '@/components/AuthGuard'
import { Target, Plus, Calendar, DollarSign, Tag, TrendingUp, Smartphone, Laptop, Plane, Shield, GraduationCap, Trash2, Edit, Check } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { getCurrentUser, type User } from '@/lib/auth'
import type { Goal } from '@/lib/database.types'

export default function GoalsPage() {
  return (
    <AuthGuard>
      <GoalsContent />
    </AuthGuard>
  )
}

function GoalsContent() {
  const [user, setUser] = useState<User | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: '',
    icon: '🎯',
    color: 'blue'
  })

  // Get current user
  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  // Fetch goals
  useEffect(() => {
    fetchGoals()
  }, [user])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const { data, error } = await (supabase as any)
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setGoals(data as Goal[])
      }
    } catch (err) {
      console.error('Error fetching goals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async () => {
    if (!formData.title || !formData.targetAmount) {
      alert('Please fill in required fields: Title and Target Amount')
      return
    }

    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('goals')
        .insert([{
          title: formData.title,
          description: formData.description || null,
          target_amount: parseFloat(formData.targetAmount),
          current_amount: 0,
          category: formData.category || 'custom',
          deadline: formData.deadline || null,
          icon: formData.icon,
          color: formData.color,
          status: 'active',
          user_id: user?.id || null
        }])

      if (error) {
        console.error('Error creating goal:', error)
        alert('Error creating goal: ' + error.message)
      } else {
        alert('Goal created successfully!')
        setFormData({
          title: '',
          description: '',
          targetAmount: '',
          deadline: '',
          category: '',
          icon: '🎯',
          color: 'blue'
        })
        setShowCreateForm(false)
        fetchGoals()
      }
    } catch (err) {
      console.error('Error:', err)
      alert('An error occurred while creating the goal')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProgress = async (goal: Goal, addAmount: number) => {
    const newAmount = goal.current_amount + addAmount
    
    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', goal.id)

      if (error) {
        alert('Error updating progress: ' + error.message)
      } else {
        fetchGoals()
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) {
        alert('Error deleting goal: ' + error.message)
      } else {
        fetchGoals()
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'phone', label: 'Phone/Gadgets', icon: Smartphone, color: 'blue' },
    { value: 'laptop', label: 'Laptop/Computer', icon: Laptop, color: 'purple' },
    { value: 'vacation', label: 'Travel/Vacation', icon: Plane, color: 'green' },
    { value: 'emergency', label: 'Emergency Fund', icon: Shield, color: 'red' },
    { value: 'education', label: 'Education/Course', icon: GraduationCap, color: 'yellow' },
    { value: 'custom', label: 'Other', icon: Target, color: 'gray' }
  ]

  const getCategoryColors = (category: string) => {
    const colorMap: Record<string, {primary: string, light: string}> = {
      technology: { primary: '#3b82f6', light: '#dbeafe' }, // blue
      travel: { primary: '#8b5cf6', light: '#ede9fe' }, // purple  
      education: { primary: '#10b981', light: '#d1fae5' }, // green
      emergency: { primary: '#ef4444', light: '#fee2e2' }, // red
      investment: { primary: '#f59e0b', light: '#fef3c7' }, // yellow
      custom: { primary: '#6b7280', light: '#f3f4f6' } // gray
    }
    return colorMap[category] || colorMap.custom
  }

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
          <Card className="mb-8 border-l-4 border-l-primary shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50">
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-primary" />
                <span>Create New Financial Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Goal Title</label>
                  <Input
                    placeholder="e.g., First Job Emergency Fund"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="border-2 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Target Amount (₱)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 30000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                    className="border-2 focus:border-primary"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                <Input
                  placeholder="Build a safety net for when I start working"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="border-2 focus:border-primary"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Deadline (optional)</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="border-2 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
                  <select 
                    className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button onClick={handleCreateGoal} className="flex-1 h-12 text-base">
                  <Target className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)} className="h-12 px-8">
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
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Ask Fili for Goal Ideas</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progressPercentage = (goal.current_amount / goal.target_amount) * 100;
              const category = categories.find(c => c.value === goal.category);
              const IconComponent = category?.icon || Target;
              const categoryColors = getCategoryColors(goal.category);
              
              return (
                <Card key={goal.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-800">{goal.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      </div>
                      <div 
                        className="p-3 rounded-full flex items-center justify-center ml-3"
                        style={{backgroundColor: categoryColors.light}}
                      >
                        <IconComponent 
                          className="w-5 h-5" 
                          style={{color: categoryColors.primary}}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Enhanced Progress Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Progress</span>
                        <span className="text-sm font-bold text-gray-800">{progressPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-green-400 to-green-600"
                          style={{width: `${Math.min(progressPercentage, 100)}%`}}
                        />
                      </div>
                    </div>

                    {/* Amount Display */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                        <p className="text-lg font-bold text-blue-600">₱{goal.current_amount.toLocaleString()}</p>
                        <p className="text-xs font-medium text-blue-700">Saved</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                        <p className="text-lg font-bold text-green-600">₱{goal.target_amount.toLocaleString()}</p>
                        <p className="text-xs font-medium text-green-700">Target</p>
                      </div>
                    </div>

                    {/* Goal Details */}
                    <div className="space-y-2 text-sm">
                      {goal.deadline && (
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Deadline:
                          </span>
                          <span className="font-medium">{new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center">
                          <Tag className="w-4 h-4 mr-1" />
                          Category:
                        </span>
                        <span className="font-medium capitalize">{goal.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Status:
                        </span>
                        <span className={`font-medium capitalize ${goal.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
                          {goal.status}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 h-10 font-medium"
                        variant="outline"
                        onClick={() => {
                          const amount = prompt('How much do you want to add to this goal?')
                          if (amount && !isNaN(Number(amount))) {
                            handleUpdateProgress(goal, Number(amount))
                          }
                        }}
                        disabled={loading || goal.status === 'completed'}
                        style={{
                          borderColor: categoryColors.primary,
                          color: categoryColors.primary,
                          borderWidth: '2px'
                        }}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Update Progress
                      </Button>
                      <Button 
                        className="h-10"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Quick Tips */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Goal Setting Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <h4 className="font-semibold mb-3 flex items-center text-primary">
                  <Target className="w-4 h-4 mr-2" />
                  SMART Goals Framework
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Specific:</strong> "First job emergency fund" not "save money"</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Measurable:</strong> ₱30,000 (2-3 months expenses)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Achievable:</strong> ₱2,000-3,000 monthly savings</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Relevant:</strong> Financial independence from family</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span><strong>Time-bound:</strong> Build within 12-15 months</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold mb-3 flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Success Strategies
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Start with ₱1,000 emergency fund goal</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Save first before buying wants</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Build good financial habits early</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Track every peso to learn spending patterns</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Use Fili AI for student financial tips</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
