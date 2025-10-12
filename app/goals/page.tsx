'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/components/ui/navbar'
import { AuthGuard } from '@/components/AuthGuard'
import { PageLoader } from '@/components/ui/page-loader'
import { Target, Plus, Calendar, DollarSign, Tag, TrendingUp, Smartphone, Laptop, Plane, Shield, GraduationCap, Trash2, Edit, Check } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { getCurrentUser, type User } from '@/lib/auth'
import type { Goal } from '@/lib/database.types'
import { DeleteGoalModal } from '@/components/ui/confirmation-modal'
import { GoalCreatedModal } from '@/components/ui/success-modal'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

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
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: '',
    targetAmount: ''
  })
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null)
  const [deletingGoalTitle, setDeletingGoalTitle] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [createdGoalTitle, setCreatedGoalTitle] = useState('')
  const [addAmountModalOpen, setAddAmountModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [amountToAdd, setAmountToAdd] = useState('')
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
      toast.error('Missing required fields', {
        description: 'Please fill in Title and Target Amount'
      })
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
        toast.error('Failed to create goal', {
          description: error.message
        })
      } else {
        // Show success modal
        setCreatedGoalTitle(formData.title)
        setSuccessModalOpen(true)
        
        // Reset form
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
      toast.error('An error occurred while creating the goal')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProgress = async (goal: Goal, addAmount: number) => {
    const newAmount = goal.current_amount + addAmount
    
    setLoading(true)
    try {
      // Update goal progress
      const { error: goalError } = await (supabase as any)
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', goal.id)

      if (goalError) {
        toast.error('Failed to update progress', {
          description: goalError.message
        })
        return
      }

      // Create a savings transaction record
      const { error: transactionError } = await (supabase as any)
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount: addAmount,
          merchant: `Savings: ${goal.title}`,
          category: 'Savings',
          date: new Date().toISOString().split('T')[0],
          payment_method: 'Transfer',
          notes: `Added ₱${addAmount.toLocaleString()} to goal: ${goal.title}`,
          transaction_type: 'expense' // Treating savings as an expense since money is allocated
        })

      if (transactionError) {
        console.error('Error creating savings transaction:', transactionError)
        // Don't show error to user since goal was updated successfully
      }

      toast.success('Progress updated', {
        description: `Added ₱${addAmount.toLocaleString()} to ${goal.title}`
      })
      fetchGoals()
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGoal = async () => {
    if (!deletingGoalId) return

    setIsDeleting(true)
    try {
      const { error } = await (supabase as any)
        .from('goals')
        .delete()
        .eq('id', deletingGoalId)

      if (error) {
        toast.error('Failed to delete goal', {
          description: error.message
        })
      } else {
        toast.success('Goal deleted successfully')
        setDeleteModalOpen(false)
        fetchGoals()
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('An error occurred while deleting the goal')
    } finally {
      setIsDeleting(false)
      setDeletingGoalId(null)
      setDeletingGoalTitle('')
    }
  }

  const handleEditGoal = async () => {
    if (!editingGoal || !editFormData.title || !editFormData.targetAmount) {
      toast.error('Missing required fields')
      return
    }

    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('goals')
        .update({
          title: editFormData.title,
          target_amount: parseFloat(editFormData.targetAmount),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingGoal.id)

      if (error) {
        toast.error('Failed to update goal', {
          description: error.message
        })
      } else {
        toast.success('Goal updated successfully')
        setEditModalOpen(false)
        setEditingGoal(null)
        fetchGoals()
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('An error occurred while updating the goal')
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal)
    setEditFormData({
      title: goal.title,
      targetAmount: goal.target_amount.toString()
    })
    setEditModalOpen(true)
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

  if (loading && goals.length === 0) {
    return <PageLoader message="Loading your goals..." />
  }

  // TODO: Dark mode under works
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-2 md:px-6 py-4 md:py-10 max-w-7xl">
        {/* Uniform Header */}
        <PageHeader
          title="My Financial Goals"
          description="Track your savings goals and celebrate milestones. Create goals manually or let AI assistant help you plan."
          badge={{
            text: "AI-Powered Planning",
            icon: Target
          }}
        />

        {/* Create Goal Button - Always visible */}
        {!showCreateForm && goals.length > 0 && (
          <div className="mb-4 md:mb-6 flex gap-2 md:gap-3">
            <Button onClick={() => setShowCreateForm(true)} size="sm" className="shadow-lg h-8 md:h-11 text-[10px] md:text-base px-2 md:px-4">
              <Plus className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2" />
              Create New Goal
            </Button>
            <Link href="/ai-assistant">
              <Button variant="outline" size="sm" className="shadow-sm h-8 md:h-11 text-[10px] md:text-base px-2 md:px-4">
                <Target className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2" />
                Ask Fili for Goal Ideas
              </Button>
            </Link>
          </div>
        )}

        {/* Create Goal Form */}
        {showCreateForm && (
          <Card className="mb-4 md:mb-8 border-l-2 md:border-l-4 border-l-primary shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50 p-2 md:p-6">
              <CardTitle className="flex items-center space-x-1 md:space-x-2 text-sm md:text-lg">
                <Plus className="w-3 h-3 md:w-5 md:h-5 text-primary" />
                <span>Create New Financial Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-6 p-2 md:p-6">
              <div className="grid md:grid-cols-2 gap-2 md:gap-6">
                <div>
                  <label className="block text-[10px] md:text-sm font-semibold mb-1 md:mb-2 text-gray-700">Goal Title</label>
                  <Input
                    placeholder="e.g., First Job Emergency Fund"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="border-2 focus:border-primary h-8 md:h-10 text-xs md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-sm font-semibold mb-1 md:mb-2 text-gray-700">Target Amount (₱)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 30000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                    className="border-2 focus:border-primary h-8 md:h-10 text-xs md:text-base"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] md:text-sm font-semibold mb-1 md:mb-2 text-gray-700">Description</label>
                <Input
                  placeholder="Build a safety net for when I start working"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="border-2 focus:border-primary h-8 md:h-10 text-xs md:text-base"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-2 md:gap-6">
                <div>
                  <label className="block text-[10px] md:text-sm font-semibold mb-1 md:mb-2 text-gray-700">Deadline (optional)</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="border-2 focus:border-primary h-8 md:h-10 text-xs md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-sm font-semibold mb-1 md:mb-2 text-gray-700">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className="w-full h-8 md:h-10 text-xs md:text-base">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-2 md:space-x-3 pt-2 md:pt-4">
                <Button onClick={handleCreateGoal} className="flex-1 h-8 md:h-12 text-[10px] md:text-base">
                  <Target className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Create Goal
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)} className="h-8 md:h-12 px-3 md:px-8 text-[10px] md:text-base">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <Card className="text-center py-6 md:py-12">
            <CardContent>
              <Target className="w-8 h-8 md:w-16 md:h-16 text-gray-400 mx-auto mb-2 md:mb-4" />
              <h3 className="text-base md:text-xl font-semibold mb-1 md:mb-2">No Goals Yet</h3>
              <p className="text-xs md:text-base text-gray-600 mb-3 md:mb-6">
                Create your first financial goal or chat with our AI assistant to get personalized suggestions!
              </p>
              <div className="flex justify-center space-x-2 md:space-x-4">
                <Button onClick={() => setShowCreateForm(true)} className="h-8 md:h-10 text-[10px] md:text-base">
                  <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Create Manual Goal
                </Button>
                <Link href="/ai-assistant">
                  <Button variant="outline" className="flex items-center space-x-1 md:space-x-2 h-8 md:h-10 text-[10px] md:text-base">
                    <Target className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Ask Fili for Goal Ideas</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4">
            {goals.map((goal) => {
              const progressPercentage = (goal.current_amount / goal.target_amount) * 100;
              const remaining = goal.target_amount - goal.current_amount;
              
              return (
                <Card key={goal.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-1.5 md:p-6">
                    {/* Title & Edit on one line */}
                    <div className="flex items-center justify-between mb-1 md:mb-3">
                      <h3 className="text-[10px] md:text-lg font-semibold text-gray-900 line-clamp-1 flex-1">{goal.title}</h3>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(goal)}
                        className="text-gray-400 hover:text-primary h-5 w-5 md:h-8 md:w-8 p-0 flex-shrink-0"
                      >
                        <Edit className="w-2 h-2 md:w-4 md:h-4" />
                      </Button>
                    </div>

                    {/* Description - Hide on mobile */}
                    {goal.description && (
                      <p className="hidden md:block text-sm text-gray-500 mb-3 line-clamp-2">{goal.description}</p>
                    )}

                    {/* Details in One Row - Hide on mobile */}
                    <div className="hidden md:flex gap-6 text-sm mb-4">
                      {goal.deadline && (
                        <div>
                          <span className="text-gray-500">Deadline: </span>
                          <span className="font-medium text-gray-900">
                            {new Date(goal.deadline).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Category: </span>
                        <span className="font-medium text-gray-900 capitalize">{goal.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status: </span>
                        <span className={`font-medium ${
                          goal.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                    </div>

                    {/* Mobile: Cards stacked, Desktop: Everything in one row */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1 md:gap-3">
                      {/* Amount Cards Container - Side by Side on Mobile */}
                      <div className="flex gap-1 md:gap-3 flex-1">
                        {/* Saved */}
                        <div className="flex-1 text-center px-1 py-0.5 md:px-5 md:py-3 bg-blue-50 rounded border border-blue-100">
                          <div className="text-[9px] md:text-xl font-bold text-blue-600">₱{goal.current_amount.toLocaleString()}</div>
                          <div className="text-[7px] md:text-xs text-gray-600">Saved</div>
                        </div>

                        {/* Target */}
                        <div className="flex-1 text-center px-1 py-0.5 md:px-5 md:py-3 bg-green-50 rounded border border-green-100">
                          <div className="text-[9px] md:text-xl font-bold text-green-600">₱{goal.target_amount.toLocaleString()}</div>
                          <div className="text-[7px] md:text-xs text-gray-600">Target</div>
                        </div>
                      </div>

                      {/* Remaining */}
                      {remaining > 0 && (
                        <div className="text-center px-1 py-0.5 md:px-5 md:py-3 bg-amber-50 rounded border border-amber-200 lg:w-auto">
                          <div className="text-[9px] md:text-base font-semibold text-amber-700">
                            ₱{remaining.toLocaleString()} left
                          </div>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex gap-1 md:gap-2 lg:flex-shrink-0">
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white px-1.5 md:px-5 h-6 md:h-10 text-[8px] md:text-sm"
                          onClick={() => {
                            setSelectedGoal(goal)
                            setAmountToAdd('')
                            setAddAmountModalOpen(true)
                          }}
                          disabled={loading || goal.status === 'completed'}
                        >
                          <TrendingUp className="w-2 h-2 md:w-4 md:h-4 mr-0.5 md:mr-1.5" />
                          Update
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setDeletingGoalId(goal.id)
                            setDeletingGoalTitle(goal.title)
                            setDeleteModalOpen(true)
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 h-6 w-6 md:h-10 md:w-10"
                        >
                          <Trash2 className="w-2 h-2 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Quick Tips */}
        <Card className="mt-4 md:mt-8 bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20">
          <CardHeader className="p-2 md:p-6">
            <CardTitle className="flex items-center space-x-1 md:space-x-2 text-xs md:text-lg">
              <TrendingUp className="w-3 h-3 md:w-5 md:h-5 text-primary" />
              <span>Goal Setting Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="grid md:grid-cols-2 gap-3 md:gap-6 text-[9px] md:text-sm">
              <div className="space-y-1.5 md:space-y-3">
                <h4 className="font-semibold mb-1.5 md:mb-3 flex items-center text-primary text-[10px] md:text-base">
                  <Target className="w-2.5 h-2.5 md:w-4 md:h-4 mr-1 md:mr-2" />
                  SMART Goals Framework
                </h4>
                <ul className="space-y-1 md:space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-primary rounded-full mt-1 md:mt-2 mr-1.5 md:mr-3 flex-shrink-0"></div>
                    <span><strong>Specific:</strong> "First job emergency fund" not "save money"</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-primary rounded-full mt-1 md:mt-2 mr-1.5 md:mr-3 flex-shrink-0"></div>
                    <span><strong>Measurable:</strong> ₱30,000 (2-3 months expenses)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-primary rounded-full mt-1 md:mt-2 mr-1.5 md:mr-3 flex-shrink-0"></div>
                    <span><strong>Achievable:</strong> ₱2,000-3,000 monthly savings</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-primary rounded-full mt-1 md:mt-2 mr-1.5 md:mr-3 flex-shrink-0"></div>
                    <span><strong>Relevant:</strong> Financial independence from family</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-primary rounded-full mt-1 md:mt-2 mr-1.5 md:mr-3 flex-shrink-0"></div>
                    <span><strong>Time-bound:</strong> Build within 12-15 months</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-1.5 md:space-y-3">
                <h4 className="font-semibold mb-1.5 md:mb-3 flex items-center text-green-600 text-[10px] md:text-base">
                  <TrendingUp className="w-2.5 h-2.5 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Success Strategies
                </h4>
                <ul className="space-y-1 md:space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-green-500 rounded-full mt-1 md:mt-2 mr-1.5 md:mr-3 flex-shrink-0"></div>
                    <span>Start with ₱1,000 emergency fund goal</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-green-500 rounded-full mt-1 md:mt-2 mr-1.5 md:mr-3 flex-shrink-0"></div>
                    <span>Save first before buying wants</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-green-500 rounded-full mt-1 md:mt-2 mr-1.5 md:mr-3 flex-shrink-0"></div>
                    <span>Build good financial habits early</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-green-500 rounded-full mt-1 md:mt-2 mr-1.5 md:mr-3 flex-shrink-0"></div>
                    <span>Track every peso to learn spending patterns</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-green-500 rounded-full mt-1 md:mt-2 mr-1.5 md:mr-3 flex-shrink-0"></div>
                    <span>Use Fili AI for student financial tips</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Goal Confirmation Modal */}
      <DeleteGoalModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingGoalId(null)
          setDeletingGoalTitle('')
        }}
        onConfirm={handleDeleteGoal}
        goalTitle={deletingGoalTitle}
        isLoading={isDeleting}
      />

      {/* Goal Created Success Modal */}
      <GoalCreatedModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        goalTitle={createdGoalTitle}
      />

      {/* Add Amount Modal */}
      <Dialog open={addAmountModalOpen} onOpenChange={setAddAmountModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-xl">Add to Goal</DialogTitle>
            </div>
            <DialogDescription>
              {selectedGoal && `Add progress to "${selectedGoal.title}"`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedGoal && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">Current Progress</span>
                  <span className="text-sm text-green-600">
                    {Math.round((selectedGoal.current_amount / selectedGoal.target_amount) * 100)}%
                  </span>
                </div>
                <div className="text-lg font-bold text-green-900">
                  ₱{selectedGoal.current_amount.toLocaleString()} / ₱{selectedGoal.target_amount.toLocaleString()}
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((selectedGoal.current_amount / selectedGoal.target_amount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Add
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                <Input
                  type="number"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the amount you want to add to this goal
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setAddAmountModalOpen(false)
                setSelectedGoal(null)
                setAmountToAdd('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedGoal && amountToAdd && !isNaN(Number(amountToAdd)) && Number(amountToAdd) > 0) {
                  handleUpdateProgress(selectedGoal, Number(amountToAdd))
                  setAddAmountModalOpen(false)
                  setSelectedGoal(null)
                  setAmountToAdd('')
                }
              }}
              disabled={!amountToAdd || isNaN(Number(amountToAdd)) || Number(amountToAdd) <= 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Add Amount
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-xl">Edit Goal</DialogTitle>
            </div>
            <DialogDescription>
              Update your goal title and target amount
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Title
              </label>
              <Input
                type="text"
                value={editFormData.title}
                onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                placeholder="e.g., First Emergency Fund"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                <Input
                  type="number"
                  value={editFormData.targetAmount}
                  onChange={(e) => setEditFormData({...editFormData, targetAmount: e.target.value})}
                  placeholder="0.00"
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {editingGoal && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-sm text-blue-800">
                  <strong>Current saved:</strong> ₱{editingGoal.current_amount.toLocaleString()}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Make sure the new target amount is reasonable based on your current progress
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false)
                setEditingGoal(null)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditGoal}
              disabled={loading || !editFormData.title || !editFormData.targetAmount}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <span className="mr-2">Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
