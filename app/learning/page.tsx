'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { AuthGuard } from '@/components/AuthGuard'
import { PageLoader } from '@/components/ui/page-loader'
import { useAuth } from '@/lib/auth-hooks'
import { supabase } from '@/lib/supabase'
import { Calculator, PiggyBank, TrendingUp, BookOpen, Users, Target, CheckCircle, ArrowRight, Globe, Shield, CreditCard, Lock, Brain, Award, Trophy } from 'lucide-react'

export default function LearningPage() {
  return (
    <AuthGuard>
      <LearningContent />
    </AuthGuard>
  )
}

function LearningContent() {
  const { user } = useAuth()
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [coreTopics, setCoreTopics] = useState<any[]>([])
  const [essentialModules, setEssentialModules] = useState<any[]>([])
  const [loadingModules, setLoadingModules] = useState(true)

  // Load completed modules from database (with localStorage fallback)
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        // Try to load from database first (user-specific)
        const { data, error } = await supabase
          .from('user_profiles')
          .select('preferences')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!error && data) {
          const prefs = (data as any)?.preferences || {}
          const dbProgress = prefs.learning_progress?.completed_modules || []
          
          if (dbProgress.length > 0) {
            console.log('📚 Loaded learning progress from database for user', user.id, ':', dbProgress)
            setCompletedModules(dbProgress)
            // Sync to user-specific localStorage for offline access
            localStorage.setItem(`plounix-learning-progress-${user.id}`, JSON.stringify(dbProgress))
            
            // Clean up old non-user-specific localStorage key
            if (localStorage.getItem('plounix-learning-progress')) {
              console.log('🧹 Cleaning up old localStorage key')
              localStorage.removeItem('plounix-learning-progress')
            }
            
            setLoading(false)
            setMounted(true)
            return
          }
        }

        // Fallback to user-specific localStorage if database is empty
        const savedProgress = localStorage.getItem(`plounix-learning-progress-${user.id}`)
        if (savedProgress) {
          try {
            const parsed = JSON.parse(savedProgress)
            console.log('📚 Loaded learning progress from localStorage for user', user.id, ':', parsed)
            setCompletedModules(parsed)
            // Migrate to database
            await saveLearningProgress(parsed)
          } catch (error) {
            console.error('Failed to load learning progress from localStorage:', error)
          }
        } else {
          console.log('📚 No learning progress found for user', user.id)
          setCompletedModules([])
        }
      } catch (error) {
        console.error('Failed to load learning progress:', error)
      } finally {
        setLoading(false)
        setMounted(true)
      }
    }

    loadProgress()
  }, [user?.id])

  // Save learning progress to database
  const saveLearningProgress = async (modules: string[]) => {
    if (!user?.id) return

    try {
      // Get current preferences
      const { data: currentData } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle()

      const currentPrefs = (currentData as any)?.preferences || {}

      // Update with new learning progress
      const { error } = await (supabase
        .from('user_profiles')
        .upsert as any)({
        user_id: user.id,
        preferences: {
          ...currentPrefs,
          learning_progress: {
            completed_modules: modules,
            current_level: modules.length >= 3 ? 'intermediate' : 'beginner',
            badges_earned: []
          }
        },
        updated_at: new Date().toISOString()
      })

      if (error) {
        console.error('❌ Error saving learning progress:', error)
      } else {
        console.log('✅ Learning progress saved to database:', modules)
        // Also save to localStorage as backup
        localStorage.setItem('plounix-learning-progress', JSON.stringify(modules))
      }
    } catch (error) {
      console.error('Failed to save learning progress:', error)
    }
  }

  // Save to database whenever completedModules changes
  useEffect(() => {
    if (mounted && user?.id) {
      saveLearningProgress(completedModules)
    }
  }, [completedModules, mounted, user?.id])

  // Fetch learning modules from database
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoadingModules(true)
        const response = await fetch('/api/learning-modules', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch modules')
        }

        const modules = await response.json()
        
        // Separate modules by category
        const core = modules.filter((m: any) => m.category === 'core')
        const essential = modules.filter((m: any) => m.category === 'essential')
        
        // Map icon names to actual icon components
        const iconMap: Record<string, any> = {
          Calculator,
          PiggyBank,
          TrendingUp,
          Shield,
          CreditCard,
          Globe,
          Target,
          Brain,
          BookOpen
        }
        
        // Add icon components to modules
        const mapModules = (mods: any[]) => mods.map(m => ({
          ...m,
          icon: iconMap[m.icon] || BookOpen
        }))
        
        // If database is empty, use hardcoded fallback (until migrations are run)
        if (modules.length === 0) {
          console.warn('⚠️ No modules in database - using hardcoded fallback. Please run migrations 004 and 005!')
          
          const fallbackCore = [
            { id: 'budgeting', title: 'Budgeting', icon: Calculator, color: 'blue', description: 'Master the 50-30-20 rule and create budgets that work with Filipino lifestyle and income levels.' },
            { id: 'saving', title: 'Saving', icon: PiggyBank, color: 'green', description: 'Discover where to save money for maximum growth with digital banks and high-interest accounts.' },
            { id: 'investing', title: 'Investing', icon: TrendingUp, color: 'purple', description: 'Start building wealth with beginner-friendly Philippine investments like mutual funds and stocks.' }
          ]
          
          const fallbackEssential = [
            { id: 'emergency-fund', title: 'Emergency Fund', icon: Shield, color: 'orange', description: 'Build your financial safety net with emergency funds designed for Filipino youth.', features: ['Students: ₱10,000-15,000 target', 'Workers: 3-6 months expenses'] },
            { id: 'credit-debt', title: 'Credit & Debt', icon: CreditCard, color: 'red', description: 'Master credit cards, loans, and debt management to avoid common traps.', features: ['Credit card best practices', 'Understanding interest rates'] },
            { id: 'digital-money', title: 'Digital Money', icon: Globe, color: 'green', description: 'Navigate GCash, PayMaya, and online banking like a pro.', features: ['GCash & PayMaya mastery', 'Online banking security'] },
            { id: 'insurance', title: 'Insurance Basics', icon: Shield, color: 'blue', description: 'Protection strategies for Filipino families - PhilHealth, SSS, and life insurance.', features: ['Health insurance basics', 'Government benefits'] },
            { id: 'financial-goals', title: 'Financial Goals', icon: Target, color: 'purple', description: 'SMART goal setting for laptops, travel, and major life purchases.', features: ['SMART goal framework', 'Progress tracking'] },
            { id: 'money-mindset', title: 'Money Mindset', icon: Brain, color: 'yellow', description: 'Transform your relationship with money and overcome limiting beliefs.', features: ['Mindset transformation', 'Overcoming money blocks'] }
          ]
          
          setCoreTopics(fallbackCore)
          setEssentialModules(fallbackEssential)
        } else {
          setCoreTopics(mapModules(core))
          setEssentialModules(mapModules(essential))
          console.log('📚 Loaded modules from database:', { core: core.length, essential: essential.length })
        }
      } catch (error) {
        console.error('Failed to fetch learning modules:', error)
        // Fallback to empty arrays if fetch fails
        setCoreTopics([])
        setEssentialModules([])
      } finally {
        setLoadingModules(false)
      }
    }

    fetchModules()
  }, [])

  // Function to mark module as completed
  const markModuleCompleted = (moduleId: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId])
    }
  }

  // Function to reset progress (for testing/debugging)
  const resetProgress = async () => {
    setCompletedModules([])
    // Remove user-specific localStorage
    if (user?.id) {
      localStorage.removeItem(`plounix-learning-progress-${user.id}`)
      await saveLearningProgress([])
    }
    // Also remove old non-user-specific key if it exists
    localStorage.removeItem('plounix-learning-progress')
  }

  // Function to check if a module is accessible
  const isModuleAccessible = (moduleId: string, moduleType: 'core' | 'essential') => {
    // Dev mode: unlock all modules for specific user
    if (user?.email === 'costillasmarcmaurice@gmail.com') {
      return true
    }
    
    if (moduleType === 'core') {
      // Sequential unlocking for core modules: budgeting -> saving -> investing
      if (moduleId === 'budgeting') return true
      if (moduleId === 'saving') return completedModules.includes('budgeting')
      if (moduleId === 'investing') return completedModules.includes('saving')
    }
    
    if (moduleType === 'essential') {
      // Essential modules unlock one by one after completing core modules
      const completedCoreModules = completedModules.filter(id => ['budgeting', 'saving', 'investing'].includes(id))
      
      // Need at least 2 core modules to start unlocking essential modules
      if (completedCoreModules.length < 2) return false
      
      // FIX: Match the actual module IDs used in the essentialModules array
      const essentialOrder = ['emergency-fund', 'credit-debt', 'digital-money', 'insurance', 'financial-goals', 'money-mindset']
      const moduleIndex = essentialOrder.indexOf(moduleId)
      
      if (moduleIndex === -1) return false // Module not found
      
      // First essential module unlocks after 2 core modules
      if (moduleIndex === 0) return completedCoreModules.length >= 2
      
      // Subsequent essential modules unlock after completing the previous essential module
      const previousEssentialModule = essentialOrder[moduleIndex - 1]
      return completedModules.includes(previousEssentialModule)
    }
    
    return false
  }

  if (!mounted) {
    return <PageLoader message="Loading learning modules..." />
  }

  // TODO: Dark mode under works
  // Show loading state while fetching progress or modules
  if (loading || loadingModules) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="learning" />

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-7xl">
        {/* Enhanced Progress Bar Section */}
        <div className="mb-4 md:mb-8">
          <Card className="bg-gradient-to-r from-primary/5 to-blue-600/5 border border-primary/20">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="bg-primary/10 p-1.5 md:p-2 rounded-full">
                    <Trophy className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-lg font-semibold text-gray-800">Learning Progress</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      {completedModules.length} of {coreTopics.length + essentialModules.length} modules completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg md:text-2xl font-bold text-primary">
                    {Math.round((completedModules.length / (coreTopics.length + essentialModules.length)) * 100)}%
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">Complete</p>
                </div>
              </div>
              
              <div className="space-y-2 md:space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-3 md:h-4 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-blue-600 h-3 md:h-4 rounded-full transition-all duration-500 relative" 
                    style={{ 
                      width: `${Math.max(2, (completedModules.length / (coreTopics.length + essentialModules.length)) * 100)}%` 
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Achievement badges */}
                {completedModules.length > 0 && (
                  <div className="flex items-center space-x-1.5 md:space-x-2 mt-2 md:mt-4 pt-2 md:pt-4 border-t border-gray-200 flex-wrap gap-1">
                    <span className="text-xs md:text-sm font-medium text-gray-700">Achievements:</span>
                    {completedModules.length >= 1 && (
                      <div className="flex items-center bg-green-100 text-green-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs">
                        <Award className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                        First Step
                      </div>
                    )}
                    {completedModules.length >= 3 && (
                      <div className="flex items-center bg-blue-100 text-blue-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs">
                        <Award className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                        Core Learner
                      </div>
                    )}
                    {completedModules.length >= 5 && (
                      <div className="flex items-center bg-purple-100 text-purple-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs">
                        <Trophy className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                        Advanced
                      </div>
                    )}
                    {completedModules.length === (coreTopics.length + essentialModules.length) && (
                      <div className="flex items-center bg-yellow-100 text-yellow-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs">
                        <Trophy className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                        Master
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Literacy Introduction */}
        <div className="mb-6 md:mb-12">
          <Card className="bg-white border shadow-sm">
            <CardHeader className="text-center pb-3 md:pb-6 pt-4 md:pt-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              
              <CardTitle className="text-lg md:text-2xl font-bold mb-2 md:mb-3 text-gray-900 px-2">
                Your Financial Journey Starts Here
              </CardTitle>
              
              <CardDescription className="text-xs md:text-base leading-relaxed max-w-2xl mx-auto text-gray-600 px-2">
                Financial literacy is your superpower for building wealth and achieving your dreams. Learn to manage money like a pro, make smart investments, and secure your financial future with skills designed specifically for Filipino youth.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center pb-4 md:pb-6">
              <p className="text-primary font-medium text-xs md:text-base">
                Start with Budgeting to unlock the next modules!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Highlight */}
        <div className="mb-4 md:mb-8">
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 md:space-x-4">
                  <div className="bg-white/20 p-2 md:p-3 rounded-full">
                    <Globe className="w-5 h-5 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-xl font-bold mb-0.5 md:mb-1">Need Help Learning? Ask Fili!</h3>
                    <p className="text-blue-100 text-xs md:text-base hidden sm:block">
                      Get explanations, search for current financial info, and personalized advice!
                    </p>
                  </div>
                </div>
                <Link href="/ai-assistant">
                  <Button variant="secondary" className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-4">
                    <Globe className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Chat Now</span>
                    <span className="sm:hidden">Chat</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Learning Modules */}
        <div className="mb-4 md:mb-8">
          <div className="mb-3 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Core Financial Skills</h2>
            <p className="text-gray-600 text-xs md:text-base">Master these three essential topics first - they're the foundation of financial success</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            {coreTopics.map((topic) => {
              const IconComponent = topic.icon
              const isAccessible = isModuleAccessible(topic.id, 'core')
              const isCompleted = completedModules.includes(topic.id)
              
              // Get color classes based on topic color
              const getTopicColorClasses = () => {
                switch (topic.color) {
                  case 'blue':
                    return {
                      border: 'border-l-blue-500',
                      icon: 'text-blue-500',
                      badge: 'bg-blue-100 text-blue-800'
                    }
                  case 'green':
                    return {
                      border: 'border-l-green-500',
                      icon: 'text-green-500',
                      badge: 'bg-green-100 text-green-800'
                    }
                  case 'purple':
                    return {
                      border: 'border-l-purple-500',
                      icon: 'text-purple-500',
                      badge: 'bg-purple-100 text-purple-800'
                    }
                  default:
                    return {
                      border: 'border-l-gray-500',
                      icon: 'text-gray-500',
                      badge: 'bg-gray-100 text-gray-800'
                    }
                }
              }
              
              const colorClasses = getTopicColorClasses()
              
              return (
                <Card key={topic.id} className={`h-full flex flex-col transition-all duration-200 border-l-4 ${
                  !isAccessible 
                    ? 'border-l-gray-300 bg-gray-50 opacity-60' 
                    : isCompleted 
                      ? 'border-l-green-500 bg-green-50/50 hover:shadow-lg' 
                      : `${colorClasses.border} hover:shadow-lg`
                }`}>
                  <CardHeader className="flex-shrink-0 p-3 md:p-6">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="relative">
                        <IconComponent className={`w-6 h-6 md:w-8 md:h-8 ${
                          !isAccessible ? 'text-gray-400' : isCompleted ? 'text-green-600' : colorClasses.icon
                        }`} />
                        {!isAccessible && (
                          <div className="absolute -top-1 -right-1 bg-gray-400 rounded-full p-0.5 md:p-1">
                            <Lock className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                          </div>
                        )}
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 md:p-1">
                            <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className={`text-base md:text-xl ${!isAccessible ? 'text-gray-500' : 'text-gray-900'}`}>
                          {topic.title}
                        </CardTitle>
                        <span className={`text-[10px] md:text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${
                          !isAccessible 
                            ? 'bg-gray-200 text-gray-500' 
                            : isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : colorClasses.badge
                        }`}>
                          {isCompleted ? 'Completed' : !isAccessible ? 'Locked' : 'Core Module'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col p-3 md:p-6 pt-0 md:pt-0">
                    <CardDescription className={`text-xs md:text-sm leading-relaxed mb-3 md:mb-4 flex-grow ${
                      !isAccessible ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {!isAccessible 
                        ? 'Complete the previous module to unlock this content.'
                        : topic.description
                      }
                    </CardDescription>

                    <div className="mt-auto">
                      {isAccessible ? (
                        <Link href={`/learning/${topic.id}`}>
                          <Button 
                            className="w-full h-8 md:h-10 text-xs md:text-sm"
                          >
                            <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            {isCompleted ? 'Review Module' : 'Start Learning'}
                            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled className="w-full h-8 md:h-10 text-xs md:text-sm">
                          <Lock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          Module Locked
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Essential Financial Topics */}
        <div className="mb-6 md:mb-12">
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-lg md:text-3xl font-bold mb-2 md:mb-4 text-gray-900">Essential Financial Modules</h2>
            <p className="text-xs md:text-lg text-gray-600 px-2">
              Master these crucial topics through our Interactive LAR (Learning, Application, Reflection) system.
            </p>
            <div className="mt-2 md:mt-4 p-2 md:p-3 bg-blue-50 rounded-lg mx-2 md:mx-0">
              <p className="text-xs md:text-sm text-blue-800">
                <Lock className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
                Unlock by completing any 2 core modules above
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {essentialModules.map((module) => {
              const IconComponent = module.icon
              const isAccessible = isModuleAccessible(module.id, 'essential')
              const isCompleted = completedModules.includes(module.id)
              
              // Get color classes based on module color
              const getModuleColorClasses = () => {
                switch (module.color) {
                  case 'orange':
                    return {
                      border: 'border-l-orange-500',
                      icon: 'text-orange-500',
                      badge: 'bg-orange-100 text-orange-800'
                    }
                  case 'red':
                    return {
                      border: 'border-l-red-500',
                      icon: 'text-red-500',
                      badge: 'bg-red-100 text-red-800'
                    }
                  case 'green':
                    return {
                      border: 'border-l-green-500',
                      icon: 'text-green-500',
                      badge: 'bg-green-100 text-green-800'
                    }
                  case 'blue':
                    return {
                      border: 'border-l-blue-500',
                      icon: 'text-blue-500',
                      badge: 'bg-blue-100 text-blue-800'
                    }
                  case 'purple':
                    return {
                      border: 'border-l-purple-500',
                      icon: 'text-purple-500',
                      badge: 'bg-purple-100 text-purple-800'
                    }
                  case 'yellow':
                    return {
                      border: 'border-l-yellow-500',
                      icon: 'text-yellow-600',
                      badge: 'bg-yellow-100 text-yellow-800'
                    }
                  default:
                    return {
                      border: 'border-l-gray-500',
                      icon: 'text-gray-500',
                      badge: 'bg-gray-100 text-gray-800'
                    }
                }
              }
              
              const colorClasses = getModuleColorClasses()
              
              return (
                <Card key={module.id} className={`h-full flex flex-col transition-all duration-200 border-l-4 ${
                  !isAccessible 
                    ? 'border-l-gray-300 bg-gray-50 opacity-60' 
                    : isCompleted 
                      ? 'border-l-green-500 bg-green-50/50 hover:shadow-lg' 
                      : `${colorClasses.border} hover:shadow-lg`
                }`}>
                  <CardHeader className="flex-shrink-0 p-3 md:p-6">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="relative">
                        <IconComponent className={`w-6 h-6 md:w-8 md:h-8 ${
                          !isAccessible 
                            ? 'text-gray-400' 
                            : isCompleted 
                              ? 'text-green-600' 
                              : colorClasses.icon
                        }`} />
                        {!isAccessible && (
                          <div className="absolute -top-1 -right-1 bg-gray-400 rounded-full p-0.5 md:p-1">
                            <Lock className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                          </div>
                        )}
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 md:p-1">
                            <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className={`text-base md:text-xl ${!isAccessible ? 'text-gray-500' : 'text-gray-900'}`}>
                          {module.title}
                        </CardTitle>
                        <span className={`text-[10px] md:text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${
                          !isAccessible 
                            ? 'bg-gray-200 text-gray-500' 
                            : isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : colorClasses.badge
                        }`}>
                          {isCompleted ? 'Completed' : !isAccessible ? 'Locked' : 'Essential'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col p-3 md:p-6 pt-0 md:pt-0">
                    <CardDescription className={`text-xs md:text-sm leading-relaxed mb-3 md:mb-4 flex-grow ${
                      !isAccessible ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {!isAccessible 
                        ? 'Complete any 2 core modules to unlock this content.'
                        : module.description
                      }
                    </CardDescription>

                    {isAccessible && module.features && (
                      <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                        {module.features.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center text-[10px] md:text-xs">
                            <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-500 mr-1.5 md:mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto">
                      {isAccessible ? (
                        <Link href={`/learning/${module.id}`}>
                          <Button 
                            className="w-full h-8 md:h-10 text-xs md:text-sm"
                          >
                            <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            {isCompleted ? 'Review Module' : 'Start Module'}
                            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled className="w-full h-8 md:h-10 text-[10px] md:text-sm px-2 md:px-4">
                          <Lock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">Complete 2 Core Modules First</span>
                          <span className="sm:hidden">Locked</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
