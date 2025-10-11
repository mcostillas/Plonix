'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  PiggyBank, 
  MessageCircle, 
  Target, 
  TrendingUp, 
  BookOpen,
  Sparkles,
  ArrowRight,
  Check,
  Brain,
  Receipt,
  Coins,
  Trophy,
  X
} from 'lucide-react'

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  highlight: string
  image?: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to Plounix! 🎉",
    description: "Your personal AI-powered financial companion for Filipino students and young professionals. We're here to help you master your money and build wealth!",
    icon: <PiggyBank className="w-12 h-12 text-primary" />,
    highlight: "Let's take a quick tour of what you can do!"
  },
  {
    id: 2,
    title: "Chat with Your AI Financial Assistant",
    description: "Ask anything about budgeting, saving, investing, or Filipino banks. Our AI can analyze your expenses, scan receipts, and even search the web for real-time financial data!",
    icon: <MessageCircle className="w-12 h-12 text-blue-600" />,
    highlight: "💡 Try: 'Help me create a budget' or 'Scan my grocery receipt'"
  },
  {
    id: 3,
    title: "Set & Track Your Financial Goals",
    description: "Whether it's building an emergency fund, saving for a gadget, or planning a trip - set goals and watch your progress grow!",
    icon: <Target className="w-12 h-12 text-green-600" />,
    highlight: "🎯 Track multiple goals at once with visual progress bars"
  },
  {
    id: 4,
    title: "Smart Expense Tracking",
    description: "Log your transactions manually or use our AI to scan receipts. See where your money goes with beautiful charts and insights.",
    icon: <Receipt className="w-12 h-12 text-purple-600" />,
    highlight: "📊 Automatic categorization and monthly summaries"
  },
  {
    id: 5,
    title: "Join Money Challenges",
    description: "Gamify your savings! Join challenges like 'No Spend Week' or 'Coffee Fund Challenge' and earn points while building better habits.",
    icon: <Trophy className="w-12 h-12 text-yellow-600" />,
    highlight: "🏆 Compete with others and earn achievements"
  },
  {
    id: 6,
    title: "Learn Financial Literacy",
    description: "Access free courses on budgeting, investing, digital banking, and more. Perfect for beginners looking to master money management!",
    icon: <BookOpen className="w-12 h-12 text-orange-600" />,
    highlight: "📚 7 comprehensive modules from basics to advanced"
  },
  {
    id: 7,
    title: "You're All Set! 🚀",
    description: "That's it! You now know what Plounix can do. Ready to start your financial journey?",
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    highlight: "Your AI kuya/ate is ready to help you anytime!"
  }
]

export default function OnboardingTourPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
    }

    checkUser()
  }, [router])

  const currentStepData = ONBOARDING_STEPS[currentStep - 1]
  const progress = (currentStep / ONBOARDING_STEPS.length) * 100
  const isLastStep = currentStep === ONBOARDING_STEPS.length

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = async () => {
    await completeOnboarding()
  }

  const completeOnboarding = async () => {
    if (!user) return
    
    setIsCompleting(true)
    try {
      // Try to mark onboarding as complete in user_profiles
      const { error } = await (supabase
        .from('user_profiles')
        .update as any)({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.log('⚠️ Column might not exist yet, storing in localStorage', error)
        // Fallback: Store in localStorage if column doesn't exist
        localStorage.setItem('plounix_onboarding_completed', 'true')
      } else {
        console.log('✅ Onboarding marked complete in database')
      }

      // Also store in localStorage as backup
      localStorage.setItem('plounix_onboarding_completed', 'true')

      // Redirect to dashboard with welcome message
      router.push('/dashboard?onboarding=complete')
    } catch (err) {
      console.error('Onboarding completion error:', err)
      // Fallback to localStorage
      localStorage.setItem('plounix_onboarding_completed', 'true')
      // Redirect anyway
      router.push('/dashboard')
    } finally {
      setIsCompleting(false)
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
      <div className="w-full max-w-3xl">
        {/* Skip Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={isCompleting}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip Tour
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 to-blue-50 p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg mb-6">
              {currentStepData.icon}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {currentStepData.title}
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          <div className="p-8">
            {/* Highlight Box */}
            <div className="bg-gradient-to-r from-primary/5 to-blue-50/50 rounded-xl p-6 mb-8 border-l-4 border-primary">
              <p className="text-gray-800 font-medium text-center">
                {currentStepData.highlight}
              </p>
            </div>

            {/* Feature Preview Cards */}
            {currentStep === 2 && (
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">Smart AI</p>
                  <p className="text-xs text-gray-600">Understands context</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Receipt className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">Scan Receipts</p>
                  <p className="text-xs text-gray-600">Auto-categorize</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">Web Search</p>
                  <p className="text-xs text-gray-600">Real-time data</p>
                </div>
              </div>
            )}

            {/* Dots Indicator */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              {ONBOARDING_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index + 1)}
                  className={`transition-all ${
                    index + 1 === currentStep
                      ? 'w-8 h-2 bg-primary'
                      : index + 1 < currentStep
                      ? 'w-2 h-2 bg-green-500'
                      : 'w-2 h-2 bg-gray-300'
                  } rounded-full`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isCompleting}
                className={currentStep === 1 ? 'invisible' : ''}
              >
                Back
              </Button>

              {!isLastStep ? (
                <Button
                  onClick={handleNext}
                  className="min-w-[120px]"
                  disabled={isCompleting}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={completeOnboarding}
                  className="min-w-[120px] bg-green-600 hover:bg-green-700"
                  disabled={isCompleting}
                >
                  {isCompleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Starting...
                    </>
                  ) : (
                    <>
                      Get Started
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
            <p className="text-2xl font-bold text-primary">100%</p>
            <p className="text-xs text-gray-600">Free Forever</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
            <p className="text-2xl font-bold text-green-600">24/7</p>
            <p className="text-xs text-gray-600">AI Available</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-600">10k+</p>
            <p className="text-xs text-gray-600">Users</p>
          </div>
        </div>
      </div>
    </div>
  )
}
