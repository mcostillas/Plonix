'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { Calculator, PiggyBank, TrendingUp, BookOpen, Users, Target, CheckCircle, ArrowRight, Globe, Shield, CreditCard, Lock, Brain } from 'lucide-react'

export default function LearningPage() {
  const [completedModules, setCompletedModules] = useState<string[]>([])

  // Function to mark module as completed
  const markModuleCompleted = (moduleId: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId])
    }
  }

  // Function to check if a module is accessible
  const isModuleAccessible = (moduleId: string, moduleType: 'core' | 'essential') => {
    if (moduleType === 'core') {
      // Sequential unlocking for core modules: budgeting -> saving -> investing
      if (moduleId === 'budgeting') return true
      if (moduleId === 'saving') return completedModules.includes('budgeting')
      if (moduleId === 'investing') return completedModules.includes('saving')
    }
    
    // Essential modules unlock after completing at least 2 core modules
    const completedCoreModules = completedModules.filter(id => ['budgeting', 'saving', 'investing'].includes(id))
    return completedCoreModules.length >= 2
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="learning" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Learning Progress</h3>
            <span className="text-sm text-gray-600">
              {completedModules.length} of {coreTopics.length + essentialModules.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300" 
              style={{ 
                width: `${(completedModules.length / (coreTopics.length + essentialModules.length)) * 100}%` 
              }}
            ></div>
          </div>
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

        {/* Learning Path Disclaimer */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <Target className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-amber-800">📚 How Learning Works</h3>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    <strong>Core Modules:</strong> Complete in order (Budgeting → Saving → Investing) • 
                    <strong>Essential Modules:</strong> Unlock after finishing any 2 core modules • 
                    <strong>Progress saves automatically</strong> as you complete each module
                  </p>
                </div>
              </div>
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
                    <h3 className="text-xl font-bold mb-1">Need Help Learning? Ask Our AI!</h3>
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
                          <Button className="w-full" onClick={() => markModuleCompleted(topic.id)}>
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
                          <Button className="w-full" onClick={() => markModuleCompleted(module.id)}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            {isCompleted ? 'Review Module' : 'Start Module'}
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

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-br from-gray-50 to-primary/10 border-0 shadow-xl">
          <CardContent className="p-12">
            <Users className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Master Your Finances?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Start with Budgeting to unlock your financial journey. Our AI is here to help every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/learning/budgeting">
                <Button size="lg" className="w-full sm:w-auto">
                  <Calculator className="w-5 h-5 mr-2" />
                  Start with Budgeting
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Globe className="w-5 h-5 mr-2" />
                  Get AI Help
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
