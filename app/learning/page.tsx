'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { AuthGuard } from '@/components/AuthGuard'
import { PageLoader } from '@/components/ui/page-loader'
import { Calculator, PiggyBank, TrendingUp, BookOpen, Users, Target, CheckCircle, ArrowRight, Globe, Shield, CreditCard, Lock, Brain, Award, Trophy } from 'lucide-react'

export default function LearningPage() {
  return (
    <AuthGuard>
      <LearningContent />
    </AuthGuard>
  )
}

function LearningContent() {
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Load completed modules from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('plounix-learning-progress')
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        setCompletedModules(parsed)
      } catch (error) {
        console.error('Failed to load learning progress:', error)
      }
    }
    setMounted(true)
  }, [])

  // Save to localStorage whenever completedModules changes
  useEffect(() => {
    if (mounted && completedModules.length > 0) {
      localStorage.setItem('plounix-learning-progress', JSON.stringify(completedModules))
    }
  }, [completedModules, mounted])

  // Function to mark module as completed
  const markModuleCompleted = (moduleId: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId])
    }
  }

  // Function to reset progress (for testing/debugging)
  const resetProgress = () => {
    setCompletedModules([])
    localStorage.removeItem('plounix-learning-progress')
  }

  // Function to check if a module is accessible
  const isModuleAccessible = (moduleId: string, moduleType: 'core' | 'essential') => {
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

  // Core learning topics
  const coreTopics = [
    {
      id: 'budgeting',
      title: 'Budgeting',
      icon: Calculator,
      color: 'blue',
      description: 'Master the 50-30-20 rule and create budgets that work with Filipino lifestyle and income levels.',
    },
    {
      id: 'saving', 
      title: 'Saving',
      icon: PiggyBank,
      color: 'green',
      description: 'Discover where to save money for maximum growth with digital banks and high-interest accounts.',
    },
    {
      id: 'investing',
      title: 'Investing',
      icon: TrendingUp,
      color: 'purple',
      description: 'Start building wealth with beginner-friendly Philippine investments like mutual funds and stocks.',
    }
  ]

  // Essential modules that unlock after core modules
  const essentialModules = [
    {
      id: 'emergency-fund',
      title: 'Emergency Fund',
      icon: Shield,
      color: 'orange',
      description: 'Build your financial safety net with emergency funds designed for Filipino youth.',
      features: ['Students: ₱10,000-15,000 target', 'Workers: 3-6 months expenses']
    },
    {
      id: 'credit-debt',
      title: 'Credit & Debt', 
      icon: CreditCard,
      color: 'red',
      description: 'Master credit cards, loans, and debt management to avoid common traps.',
      features: ['Credit card best practices', 'Understanding interest rates']
    },
    {
      id: 'digital-money',
      title: 'Digital Money',
      icon: Globe,
      color: 'green', 
      description: 'Navigate GCash, PayMaya, and online banking like a pro.',
      features: ['GCash & PayMaya mastery', 'Online banking security']
    },
    {
      id: 'insurance',
      title: 'Insurance Basics',
      icon: Shield,
      color: 'blue',
      description: 'Protection strategies for Filipino families - PhilHealth, SSS, and life insurance.',
      features: ['Health insurance basics', 'Government benefits']
    },
    {
      id: 'financial-goals', 
      title: 'Financial Goals',
      icon: Target,
      color: 'purple',
      description: 'SMART goal setting for laptops, travel, and major life purchases.',
      features: ['SMART goal framework', 'Progress tracking']
    },
    {
      id: 'money-mindset',
      title: 'Money Mindset',
      icon: Brain,
      color: 'yellow',
      description: 'Transform your relationship with money and overcome limiting beliefs.',
      features: ['Mindset transformation', 'Overcoming money blocks']
    }
  ]

  if (!mounted) {
    return <PageLoader message="Loading learning modules..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="learning" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Progress Bar Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/5 to-blue-600/5 border border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Learning Progress</h3>
                    <p className="text-sm text-gray-600">
                      {completedModules.length} of {coreTopics.length + essentialModules.length} modules completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((completedModules.length / (coreTopics.length + essentialModules.length)) * 100)}%
                  </div>
                  <p className="text-sm text-gray-500">Complete</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-blue-600 h-4 rounded-full transition-all duration-500 relative" 
                    style={{ 
                      width: `${Math.max(2, (completedModules.length / (coreTopics.length + essentialModules.length)) * 100)}%` 
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Achievement badges */}
                {completedModules.length > 0 && (
                  <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Achievements:</span>
                    {completedModules.length >= 1 && (
                      <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        First Step
                      </div>
                    )}
                    {completedModules.length >= 3 && (
                      <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Core Learner
                      </div>
                    )}
                    {completedModules.length >= 5 && (
                      <div className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        <Trophy className="w-3 h-3 mr-1" />
                        Advanced
                      </div>
                    )}
                    {completedModules.length === (coreTopics.length + essentialModules.length) && (
                      <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        <Trophy className="w-3 h-3 mr-1" />
                        Master
                      </div>
                    )}
                  </div>
                )}
                
                {/* Debug reset button - only show in development */}
                {process.env.NODE_ENV === 'development' && completedModules.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetProgress}
                      className="text-xs"
                    >
                      Reset Progress (Dev Only)
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Literacy Introduction */}
        <div className="mb-12">
          <Card className="bg-white border shadow-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              
              <CardTitle className="text-2xl font-bold mb-3 text-gray-900">
                Your Financial Journey Starts Here
              </CardTitle>
              
              <CardDescription className="text-base leading-relaxed max-w-2xl mx-auto text-gray-600">
                Financial literacy is your superpower for building wealth and achieving your dreams. Learn to manage money like a pro, make smart investments, and secure your financial future with skills designed specifically for Filipino youth.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center pb-6">
              <p className="text-primary font-medium">
                Start with Budgeting to unlock the next modules!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Highlight */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Globe className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Need Help Learning? Ask Fili!</h3>
                    <p className="text-blue-100">
                      Get explanations, search for current financial info, and personalized advice!
                    </p>
                  </div>
                </div>
                <Link href="/ai-assistant">
                  <Button variant="secondary">
                    <Globe className="w-4 h-4 mr-2" />
                    Chat Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Learning Modules */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Core Financial Skills</h2>
            <p className="text-gray-600">Master these three essential topics first - they're the foundation of financial success</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
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
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <IconComponent className={`w-8 h-8 ${
                          !isAccessible ? 'text-gray-400' : isCompleted ? 'text-green-600' : colorClasses.icon
                        }`} />
                        {!isAccessible && (
                          <div className="absolute -top-1 -right-1 bg-gray-400 rounded-full p-1">
                            <Lock className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className={`text-xl ${!isAccessible ? 'text-gray-500' : 'text-gray-900'}`}>
                          {topic.title}
                        </CardTitle>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
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
                  <CardContent className="flex-grow flex flex-col">
                    <CardDescription className={`text-sm leading-relaxed mb-4 flex-grow ${
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
                            className="w-full" 
                            onClick={() => {
                              if (!isCompleted) {
                                markModuleCompleted(topic.id)
                                // Add confetti or celebration effect here if desired
                              }
                            }}
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            {isCompleted ? 'Review Module' : 'Start Learning'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled className="w-full">
                          <Lock className="w-4 h-4 mr-2" />
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
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Essential Financial Modules</h2>
            <p className="text-lg text-gray-600">
              Master these crucial topics through our Interactive LAR (Learning, Application, Reflection) system.
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Lock className="w-4 h-4 inline mr-1" />
                Unlock by completing any 2 core modules above
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <IconComponent className={`w-8 h-8 ${
                          !isAccessible 
                            ? 'text-gray-400' 
                            : isCompleted 
                              ? 'text-green-600' 
                              : colorClasses.icon
                        }`} />
                        {!isAccessible && (
                          <div className="absolute -top-1 -right-1 bg-gray-400 rounded-full p-1">
                            <Lock className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className={`text-xl ${!isAccessible ? 'text-gray-500' : 'text-gray-900'}`}>
                          {module.title}
                        </CardTitle>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
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
                  <CardContent className="flex-grow flex flex-col">
                    <CardDescription className={`text-sm leading-relaxed mb-4 flex-grow ${
                      !isAccessible ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {!isAccessible 
                        ? 'Complete any 2 core modules to unlock this content.'
                        : module.description
                      }
                    </CardDescription>

                    {isAccessible && (
                      <div className="space-y-2 mb-4">
                        {module.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-xs">
                            <CheckCircle className="w-3 h-3 text-gray-500 mr-2" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto">
                      {isAccessible ? (
                        <Link href={`/learning/${module.id}`}>
                          <Button 
                            className="w-full" 
                            onClick={() => {
                              if (!isCompleted) {
                                markModuleCompleted(module.id)
                              }
                            }}
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            {isCompleted ? 'Review Module' : 'Start Module'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled className="w-full">
                          <Lock className="w-4 h-4 mr-2" />
                          Complete 2 Core Modules First
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
