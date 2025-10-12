'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, BookOpen, Target, Users, TrendingUp, Calculator, PiggyBank, Search, MessageCircle, ArrowRight, Star, Shield, Zap, CheckCircle, Sparkles, Trophy, Clock, Lock, Heart, Award, ChevronRight } from 'lucide-react'
import { PlounixLogo } from '@/components/ui/logo'
import { useAuth } from '@/lib/auth-hooks'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const features = [
    {
      icon: Bot,
      title: 'AI Financial Coach',
      description: 'Get personalized financial advice anytime. Fili understands your goals and guides you with smart budgeting tips, savings strategies, and financial planning.',
      highlight: '24/7 Available'
    },
    {
      icon: TrendingUp,
      title: 'Expense Tracker',
      description: 'Track every peso in and out. Monitor your income, expenses, and cash flow in real-time. See exactly where your money goes with detailed categorization.',
      highlight: 'Real-time Tracking'
    },
    {
      icon: BookOpen,
      title: 'Interactive Learning',
      description: 'Master money management through bite-sized lessons on budgeting, saving, and investing. Learn at your own pace with real-world examples.',
      highlight: 'Learn by Doing'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and track your financial goals - from emergency funds to dream vacations. Stay motivated with progress milestones and achievements.',
      highlight: 'Visual Progress'
    },
    {
      icon: PiggyBank,
      title: 'Smart Savings',
      description: 'Build healthy saving habits with automated tracking and insights. Watch your savings grow as you work towards financial freedom.',
      highlight: 'Build Wealth'
    }
  ]

  return (
    // TODO: Dark mode under works - will be implemented next time
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="flex items-center justify-between p-3 md:p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-1.5 md:space-x-2">
            <PiggyBank className="w-5 h-5 md:w-8 md:h-8 text-primary" />
            <span className="text-base md:text-2xl font-bold text-primary">Plounix</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-primary transition-colors">
              Features
            </Link>
            {/* <Link href="/pricing" className="text-gray-600 hover:text-primary transition-colors">
              Pricing
            </Link> */}
            <Link href="/auth/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
          <div className="flex md:hidden items-center space-x-2">
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="h-7 text-[10px] px-2">Log In</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="h-7 text-[10px] px-2">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {/* TODO: Dark mode under works */}
      <section className="pt-16 md:pt-24 pb-10 md:pb-20 bg-gradient-to-br from-primary/5 via-blue-50/30 to-green-50/30">
        <div className="max-w-7xl mx-auto px-3 md:px-6">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-8">
              <div className="inline-flex items-center space-x-1.5 md:space-x-2 bg-primary/10 text-primary px-2 md:px-4 py-1 md:py-2 rounded-full text-[10px] md:text-sm font-medium">
                <Star className="w-3 h-3 md:w-4 md:h-4" />
                <span>AI-Powered Financial Education</span>
              </div>
              
              <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Your Financial
                <span className="bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent block">
                  Fili AI
                </span>
              </h1>
              
              <p className="text-sm md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Master budgeting, saving, and investing with AI-powered guidance designed specifically for Filipino students and young professionals. Learn through our proven Learn-Apply-Reflect method.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button size="lg" className="text-xs md:text-base lg:text-lg px-4 md:px-8 py-2.5 md:py-4 w-full h-10 md:h-12">
                    <Bot className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                    Start Your Journey
                    <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5 ml-1.5 md:ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="text-xs md:text-base lg:text-lg px-4 md:px-8 py-2.5 md:py-4 w-full h-10 md:h-12">
                    <MessageCircle className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                    Login to Chat
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-8 text-[10px] md:text-sm text-gray-600">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Shield className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                  <span>100% Free</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Zap className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                  <span>Web Search</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Users className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
                  <span>Filipino Context</span>
                </div>
              </div>
            </div>
            
            <div className="relative hidden md:block">
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
                        Kumusta! I can help you build an emergency fund. With your ₱25,000 salary, 
                        let's save ₱5,000 monthly. In 6 months, you'll have ₱30,000 for emergencies!
                      </p>
                    </div>
                    
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-sm text-primary flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        That's 20% of your income - the perfect savings rate for building financial security
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-xs">Create Savings Goal</Button>
                    <Button size="sm" variant="outline" className="text-xs">Learn Budgeting</Button>
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
      <section id="features" className="py-10 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 md:px-6">
          <div className="text-center mb-6 md:mb-16">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">
              Why Choose Plounix?
            </h2>
            <p className="text-sm md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              We understand Filipino financial culture and provide tools that actually work for students and young professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-2 md:border-l-4 border-l-primary">
                <CardHeader className="p-3 md:p-6 pb-2 md:pb-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                      <feature.icon className="w-5 h-5 md:w-8 md:h-8 text-primary flex-shrink-0" />
                      <CardTitle className="text-sm md:text-lg lg:text-xl truncate">{feature.title}</CardTitle>
                    </div>
                    <span className="bg-primary/10 text-primary text-[8px] md:text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded-full whitespace-nowrap flex-shrink-0">
                      {feature.highlight}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  <CardDescription className="text-[11px] md:text-sm lg:text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 md:px-6">
          <div className="text-center mb-6 md:mb-16">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">
              How Plounix Works
            </h2>
            <p className="text-sm md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Start your financial journey in 3 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 md:mb-6">
                <span className="text-lg md:text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-sm md:text-lg lg:text-xl font-bold mb-1.5 md:mb-3">Sign Up Free</h3>
              <p className="text-[11px] md:text-sm lg:text-base text-gray-600 leading-relaxed px-2">
                Create your account in 30 seconds. No credit card required.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 md:mb-6">
                <span className="text-lg md:text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-sm md:text-lg lg:text-xl font-bold mb-1.5 md:mb-3">Learn & Set Goals</h3>
              <p className="text-[11px] md:text-sm lg:text-base text-gray-600 leading-relaxed px-2">
                Complete lessons and create savings goals with AI guidance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 md:mb-6">
                <span className="text-lg md:text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-sm md:text-lg lg:text-xl font-bold mb-1.5 md:mb-3">Track Progress</h3>
              <p className="text-[11px] md:text-sm lg:text-base text-gray-600 leading-relaxed px-2">
                Monitor your savings and build your financial confidence.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-6 md:mt-12">
            <Link href="/auth/register">
              <Button size="lg" className="text-xs md:text-base lg:text-lg px-4 md:px-8 h-10 md:h-12">
                Get Started Free
                <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5 ml-1.5 md:ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-8 md:py-16 bg-gradient-to-r from-primary to-green-600 relative overflow-hidden">
        {/* Background decoration */} 
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 md:px-6 relative z-10">
          {/* AI Search Content */}
          <div className="text-center text-white mb-6 md:mb-12">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4">
              <Search className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-lg md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3">
              AI with Real-Time Web Search
            </h3>
            <p className="text-xs md:text-base lg:text-lg text-blue-50 leading-relaxed max-w-2xl mx-auto mb-3 md:mb-6 px-2">
              Our AI searches the web for current prices, bank rates, and financial news to give you up-to-date information.
            </p>
            <Link href="/auth/register">
              <Button variant="secondary" size="lg" className="shadow-xl h-9 md:h-12 text-xs md:text-base px-4 md:px-6">
                <Bot className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                Try AI Search Free
              </Button>
            </Link>
          </div>

          {/* Stats Grid - Integrated */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-6 md:mt-12 pt-6 md:pt-12 border-t border-white/20 text-center text-white">
            <div>
              <div className="flex items-center justify-center mb-1.5 md:mb-3">
                <Award className="w-5 h-5 md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">100%</h3>
              <p className="text-[10px] md:text-sm lg:text-base text-blue-100">Free Forever</p>
              <p className="text-[8px] md:text-xs lg:text-sm text-blue-100/80 mt-0.5 md:mt-1">No hidden fees</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1.5 md:mb-3">
                <Users className="w-5 h-5 md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">18-25</h3>
              <p className="text-[10px] md:text-sm lg:text-base text-blue-100">Target Age</p>
              <p className="text-[8px] md:text-xs lg:text-sm text-blue-100/80 mt-0.5 md:mt-1">Students & Graduates</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1.5 md:mb-3">
                <Clock className="w-5 h-5 md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">24/7</h3>
              <p className="text-[10px] md:text-sm lg:text-base text-blue-100">AI Assistant</p>
              <p className="text-[8px] md:text-xs lg:text-sm text-blue-100/80 mt-0.5 md:mt-1">Always available</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1.5 md:mb-3">
                <Trophy className="w-5 h-5 md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">50-30-20</h3>
              <p className="text-[10px] md:text-sm lg:text-base text-blue-100">Budget Rule</p>
              <p className="text-[8px] md:text-xs lg:text-sm text-blue-100/80 mt-0.5 md:mt-1">Proven method</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-10 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 md:px-6">
          <div className="text-center mb-6 md:mb-16">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">
              Your Security is Our Priority
            </h2>
            <p className="text-sm md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              We take your privacy and financial data seriously
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-3 md:gap-8">
            <Card className="text-center border-0 shadow-md">
              <CardContent className="pt-4 pb-4 md:pt-8 md:pb-8 p-3 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <Lock className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                </div>
                <h3 className="text-sm md:text-base lg:text-lg font-bold mb-1 md:mb-2">Secure Data</h3>
                <p className="text-[11px] md:text-sm lg:text-base text-gray-600">
                  Your financial information is encrypted and never shared with third parties
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-md">
              <CardContent className="pt-4 pb-4 md:pt-8 md:pb-8 p-3 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <Shield className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                </div>
                <h3 className="text-sm md:text-base lg:text-lg font-bold mb-1 md:mb-2">Privacy First</h3>
                <p className="text-[11px] md:text-sm lg:text-base text-gray-600">
                  We don't sell your data. Your information is yours alone
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-md">
              <CardContent className="pt-4 pb-4 md:pt-8 md:pb-8 p-3 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <Heart className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                </div>
                <h3 className="text-sm md:text-base lg:text-lg font-bold mb-1 md:mb-2">Made for Filipinos</h3>
                <p className="text-[11px] md:text-sm lg:text-base text-gray-600">
                  Built by Filipinos who understand our unique financial culture
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-3 md:px-6">
          <Card className="text-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 border-0 shadow-2xl overflow-hidden relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
            
            <CardContent className="p-6 md:p-12 relative z-10">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-primary to-green-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-6 shadow-lg">
                <Sparkles className="w-7 h-7 md:w-10 md:h-10 text-white" />
              </div>
              
              <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 md:mb-6">
                Start Your Financial Journey Today
              </h3>
              
              <p className="text-sm md:text-base lg:text-xl text-gray-600 mb-4 md:mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of Filipino youth building wealth with AI-powered guidance. No complex jargon, just practical advice that works with our culture and lifestyle.
              </p>
              
              {/* Benefits list */}
              <div className="grid md:grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-8 max-w-xl mx-auto">
                <div className="flex items-center space-x-2 md:space-x-3 text-left">
                  <CheckCircle className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-[11px] md:text-sm lg:text-base text-gray-700">Free forever, no credit card</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3 text-left">
                  <CheckCircle className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-[11px] md:text-sm lg:text-base text-gray-700">AI assistant with web search</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3 text-left">
                  <CheckCircle className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-[11px] md:text-sm lg:text-base text-gray-700">Interactive learning modules</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3 text-left">
                  <CheckCircle className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-[11px] md:text-sm lg:text-base text-gray-700">Philippine peso optimized</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center">
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-10 md:h-12 text-xs md:text-base shadow-lg hover:shadow-xl transition-shadow">
                    <Bot className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                    Create Free Account
                    <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5 ml-1.5 md:ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full h-10 md:h-12 text-xs md:text-base">
                    I Have an Account
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[10px] md:text-sm text-gray-500 mt-3 md:mt-6">
                <div className="flex items-center gap-1 md:gap-1.5">
                  <Zap className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                  <span>Setup in 30 seconds</span>
                </div>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <div className="flex items-center gap-1 md:gap-1.5">
                  <Lock className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                  <span>Your data is secure</span>
                </div>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <div className="flex items-center gap-1 md:gap-1.5">
                  <Heart className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                  <span>Made for Filipinos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-3 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mb-6 md:mb-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1 space-y-2 md:space-y-4">
              <div className="flex items-center space-x-1.5 md:space-x-2">
                <PiggyBank className="w-5 h-5 md:w-8 md:h-8 text-primary" />
                <span className="text-lg md:text-2xl font-bold">Plounix</span>
              </div>
              <p className="text-[11px] md:text-sm text-gray-400 leading-relaxed">
                Empowering Filipino youth with AI-driven financial literacy education
              </p>
              <div className="flex space-x-3 md:space-x-4">
                <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                  <Shield className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </div>
            </div>
            
            {/* Product Column */}
            <div>
              <h3 className="font-bold mb-2 md:mb-4 text-sm md:text-base lg:text-lg">Product</h3>
              <ul className="space-y-1.5 md:space-y-3">
                <li>
                  <Link href="/ai-assistant" className="text-[11px] md:text-sm text-gray-400 hover:text-primary transition-colors flex items-center">
                    <Bot className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    AI Assistant
                  </Link>
                </li>
                <li>
                  <Link href="/learning" className="text-[11px] md:text-sm text-gray-400 hover:text-primary transition-colors flex items-center">
                    <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    Learning Modules
                  </Link>
                </li>
                <li>
                  <Link href="/goals" className="text-[11px] md:text-sm text-gray-400 hover:text-primary transition-colors flex items-center">
                    <Target className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    Goal Tracker
                  </Link>
                </li>
                <li>
                  <Link href="/challenges" className="text-[11px] md:text-sm text-gray-400 hover:text-primary transition-colors flex items-center">
                    <Trophy className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    Challenges
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Resources Column */}
            <div>
              <h3 className="font-bold mb-2 md:mb-4 text-sm md:text-base lg:text-lg">Resources</h3>
              <ul className="space-y-1.5 md:space-y-3">
                <li>
                  <Link href="/resource-hub" className="text-[11px] md:text-sm text-gray-400 hover:text-primary transition-colors">
                    Resource Hub
                  </Link>
                </li>
                <li>
                  <Link href="/digital-tools" className="text-[11px] md:text-sm text-gray-400 hover:text-primary transition-colors">
                    Digital Tools
                  </Link>
                </li>
                {/* <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li> */}
              </ul>
            </div>
            
            {/* Company Column */}
            <div>
              <h3 className="font-bold mb-2 md:mb-4 text-sm md:text-base lg:text-lg">Company</h3>
              <ul className="space-y-1.5 md:space-y-3">
                <li>
                  <Link href="/privacy" className="text-[11px] md:text-sm text-gray-400 hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-[11px] md:text-sm text-gray-400 hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="text-[11px] md:text-sm text-gray-400 hover:text-primary transition-colors">
                    Sign Up Free
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="text-[11px] md:text-sm text-gray-400 hover:text-primary transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-4 md:pt-8 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-center md:text-left">
            <p className="text-gray-400 text-[10px] md:text-sm">
              © 2025 Plounix. All rights reserved. Made with <Heart className="w-3 h-3 md:w-4 md:h-4 inline text-red-500" /> for Filipino Youth.
            </p>
            <div className="flex items-center space-x-1.5 md:space-x-2 text-[10px] md:text-sm">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
              <span className="text-gray-400">100% Free • No Credit Card Required</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
