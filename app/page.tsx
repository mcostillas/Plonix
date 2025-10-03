'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, BookOpen, Target, Users, TrendingUp, Calculator, PiggyBank, Search, MessageCircle, ArrowRight, Star, Shield, Zap } from 'lucide-react'
import { PlounixLogo } from '@/components/ui/logo'
import { useAuth } from '@/lib/auth-hooks'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const features = [
    {
      icon: Bot,
      title: 'AI Financial Assistant',
      description: 'Chat with your personal financial kuya/ate. Get advice in Taglish, create savings goals, and access real-time web search for current prices and bank rates.',
      highlight: 'Web Search Enabled'
    },
    {
      icon: BookOpen,
      title: 'Learn-Apply-Reflect Method',
      description: 'Master budgeting, saving, and investing through interactive lessons designed for Filipino students and fresh graduates earning ₱15k-30k monthly.',
      highlight: 'Bite-sized Lessons'
    },
    {
      icon: Target,
      title: 'Smart Goal Creation',
      description: 'Create savings goals manually or let AI help you plan. Track progress with milestones and get motivated with personalized challenges.',
      highlight: 'AI-Generated Goals'
    },
    {
      icon: Calculator,
      title: 'Financial Tools',
      description: 'Budget calculator, savings tracker, investment simulator, and expense categorizer - all optimized for Philippine peso and local financial products.',
      highlight: 'Philippine Context'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <PiggyBank className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Plounix</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-primary transition-colors">
              Pricing
            </Link>
            {!isLoading && (
              <>
                {user ? (
                  <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline">Log In</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button>Get Started</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-primary/5 via-blue-50/30 to-green-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Star className="w-4 h-4" />
                <span>AI-Powered Financial Education</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Your Financial
                <span className="bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent block">
                  Fili AI
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Master budgeting, saving, and investing with AI-powered guidance designed specifically for Filipino students and young professionals. Learn through our proven Learn-Apply-Reflect method.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={user ? "/dashboard" : "/auth/register"}>
                  <Button size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                    <Bot className="w-5 h-5 mr-2" />
                    {user ? "Go to Dashboard" : "Start Your Journey"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                {user ? (
                  <Link href="/ai-assistant">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Chat with Fili AI
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/login">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Login to Chat
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>100% Free</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>Web Search Enabled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Filipino Context</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-green-100/50 rounded-3xl p-8">
                <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Fili AI</p>
                      <p className="text-xs text-gray-500">Online now</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm">
                        Kumusta! I'm Fili, and I can help you create a savings plan for your iPhone 15. 
                        With your ₱25,000 salary, you can save ₱6,500 monthly and buy it in 10 months!
                      </p>
                    </div>
                    
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-sm text-primary">
                        🔍 I searched the web and found current prices: ₱65,000-₱70,000 on Lazada/Shopee
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-xs">Create Goal</Button>
                    <Button size="sm" variant="outline" className="text-xs">Search Prices</Button>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-xl shadow-lg">
                <Calculator className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-xl shadow-lg">
                <Search className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose Plounix?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We understand Filipino financial culture and provide tools that actually work for students and young professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <feature.icon className="w-8 h-8 text-primary" />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                      {feature.highlight}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-green-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <Search className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
          <h3 className="text-3xl lg:text-4xl font-bold mb-6">AI with Real-Time Web Search</h3>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            Our AI doesn't just give generic advice. It searches the web for current prices, bank rates, and financial news to give you the most up-to-date information for your financial decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/ai-assistant">
                <Button variant="secondary" size="lg" className="text-lg w-full sm:w-auto">
                  Try Fili AI Search Now
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button variant="secondary" size="lg" className="text-lg w-full sm:w-auto">
                  Sign Up to Try AI Search
                </Button>
              </Link>
            )}
            <Button variant="outline" size="lg" className="text-lg text-white border-white hover:bg-white hover:text-primary w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-primary mb-2">18-25</h3>
              <p className="text-gray-600">Target Age Group</p>
              <p className="text-sm text-gray-500">Students & Fresh Graduates</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-green-600 mb-2">Learn-Apply</h3>
              <p className="text-gray-600">Teaching Method</p>
              <p className="text-sm text-gray-500">Then Reflect & Grow</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">50-30-20</h3>
              <p className="text-gray-600">Budgeting Rule</p>
              <p className="text-sm text-gray-500">Needs, Wants, Savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="text-center bg-gradient-to-br from-gray-50 to-blue-50/30 border-0 shadow-xl">
            <CardContent className="p-12">
              <Users className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-3xl lg:text-4xl font-bold mb-6">
                Start Your Financial Journey Today
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of Filipino youth building wealth with AI-powered guidance. No complex jargon, just practical advice that works with our culture and lifestyle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register">
                      <Button size="lg" className="w-full sm:w-auto">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Create Free Account
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        <Target className="w-5 h-5 mr-2" />
                        Already Have Account?
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <PiggyBank className="w-6 h-6" />
            <span className="text-xl font-bold">Plounix</span>
          </div>
          <p className="text-gray-400 mb-6">
            Empowering Filipino youth with AI-driven financial literacy
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/learning" className="hover:text-primary">Learn</Link>
            <Link href="/challenges" className="hover:text-primary">Challenges</Link>
            <Link href="/resource-hub" className="hover:text-primary">Resources</Link>
            {user ? (
              <Link href="/ai-assistant" className="hover:text-primary">Fili AI</Link>
            ) : (
              <Link href="/auth/login" className="hover:text-primary">Login for AI</Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
