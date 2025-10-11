'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { PiggyBank, User, Wallet, Target, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'

// Avatar options
const AVATARS = [
  { id: 'avatar-1', emoji: '👨‍🎓', label: 'Student' },
  { id: 'avatar-2', emoji: '👩‍🎓', label: 'Student' },
  { id: 'avatar-3', emoji: '👨‍💼', label: 'Professional' },
  { id: 'avatar-4', emoji: '👩‍💼', label: 'Professional' },
  { id: 'avatar-5', emoji: '🧑‍💻', label: 'Freelancer' },
  { id: 'avatar-6', emoji: '👨‍🍳', label: 'Worker' },
  { id: 'avatar-7', emoji: '👩‍⚕️', label: 'Healthcare' },
  { id: 'avatar-8', emoji: '🧑‍🏫', label: 'Teacher' },
]

// Financial goals options
const FINANCIAL_GOALS = [
  { id: 'emergency-fund', label: 'Build Emergency Fund', icon: '🛡️' },
  { id: 'save-gadget', label: 'Save for Gadget/Phone', icon: '📱' },
  { id: 'travel', label: 'Travel Fund', icon: '✈️' },
  { id: 'education', label: 'Education/Course', icon: '📚' },
  { id: 'business', label: 'Start a Business', icon: '💼' },
  { id: 'investment', label: 'Learn Investing', icon: '📈' },
  { id: 'debt-free', label: 'Become Debt-Free', icon: '💳' },
  { id: 'house', label: 'Save for House/Condo', icon: '🏠' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    age: '',
    monthlyIncome: '',
    profilePicture: 'avatar-1',
    selectedGoals: [] as string[],
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Check if user already completed onboarding
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('age, monthly_income')
        .eq('user_id', user.id)
        .single()

      if (profile && profile.age && profile.monthly_income) {
        // Already onboarded, redirect to dashboard
        router.push('/dashboard')
      }
    }

    checkUser()
  }, [router])

  const handleNext = () => {
    if (step === 1 && !formData.age) {
      setError('Please enter your age')
      return
    }
    if (step === 2 && !formData.monthlyIncome) {
      setError('Please enter your monthly income')
      return
    }
    setError('')
    setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const toggleGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goalId)
        ? prev.selectedGoals.filter(id => id !== goalId)
        : [...prev.selectedGoals, goalId]
    }))
  }

  const handleComplete = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError('')

    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          age: parseInt(formData.age),
          monthly_income: parseFloat(formData.monthlyIncome),
          profile_picture: formData.profilePicture,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (profileError) throw profileError

      // Update user_context with income
      const { error: contextError } = await supabase
        .from('user_context')
        .update({
          income: parseFloat(formData.monthlyIncome),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (contextError) throw contextError

      // Create goals if selected
      if (formData.selectedGoals.length > 0) {
        const goals = formData.selectedGoals.map(goalId => {
          const goal = FINANCIAL_GOALS.find(g => g.id === goalId)
          return {
            user_id: user.id,
            title: goal?.label || goalId,
            target_amount: goalId === 'emergency-fund' ? parseFloat(formData.monthlyIncome) * 3 : 10000,
            current_amount: 0,
            deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            status: 'active',
            category: goalId,
          }
        })

        const { error: goalsError } = await supabase
          .from('goals')
          .insert(goals)

        if (goalsError) console.error('Error creating goals:', goalsError)
      }

      // Redirect to dashboard
      router.push('/dashboard?onboarding=complete')
    } catch (err: any) {
      console.error('Onboarding error:', err)
      setError(err.message || 'Failed to complete onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50/30 to-green-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <PiggyBank className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold text-primary">Plounix</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Let's Set Up Your Financial Journey! 🚀
          </h1>
          <p className="text-gray-600">
            Just a few quick questions to personalize your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Step 1: Age */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    How old are you?
                  </h2>
                  <p className="text-gray-600">
                    This helps us give you age-appropriate financial advice
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <Input
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="h-14 text-lg text-center"
                    min="13"
                    max="100"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Age must be between 13-100 years
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Monthly Income */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <Wallet className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    What's your monthly income?
                  </h2>
                  <p className="text-gray-600">
                    Include allowance, salary, side hustles, etc. (in PHP)
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">₱</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                      className="h-14 text-lg text-center pl-10"
                      min="0"
                      step="100"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, monthlyIncome: '5000' })}
                    >
                      ₱5,000
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, monthlyIncome: '15000' })}
                    >
                      ₱15,000
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, monthlyIncome: '25000' })}
                    >
                      ₱25,000
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Don't worry, you can update this later!
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Avatar Selection */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Choose your avatar
                  </h2>
                  <p className="text-gray-600">
                    Pick one that represents you best!
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, profilePicture: avatar.id })}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                        ${formData.profilePicture === avatar.id
                          ? 'border-primary bg-primary/5 scale-105'
                          : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span className="text-4xl mb-2">{avatar.emoji}</span>
                      <span className="text-xs text-gray-600">{avatar.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Financial Goals */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                    <Target className="w-8 h-8 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    What are your financial goals?
                  </h2>
                  <p className="text-gray-600">
                    Select all that apply (you can add more later)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                  {FINANCIAL_GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className={`
                        flex items-center space-x-3 p-4 rounded-lg border-2 transition-all text-left
                        ${formData.selectedGoals.includes(goal.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span className="text-2xl">{goal.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{goal.label}</span>
                    </button>
                  ))}
                </div>

                <p className="text-sm text-gray-500 text-center">
                  Selected {formData.selectedGoals.length} goal{formData.selectedGoals.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {step > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto"
                  disabled={isLoading}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleComplete}
                  className="ml-auto"
                  disabled={isLoading}
                >
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skip option (only on goals step) */}
        {step === 4 && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleComplete}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
              disabled={isLoading}
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
