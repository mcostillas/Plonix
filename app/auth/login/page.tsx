'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PiggyBank, Eye, EyeOff, ArrowLeft, Bot, Shield, Loader2, TrendingUp, Target, BookOpen, Search } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { auth } from '@/lib/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('plounix_saved_email')
    const savedPassword = localStorage.getItem('plounix_saved_password')
    const wasRemembered = localStorage.getItem('plounix_remember_me') === 'true'
    
    if (wasRemembered && savedEmail) {
      setEmail(savedEmail)
      setPassword(savedPassword || '')
      setRememberMe(true)
    }
  }, [])

  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'logged-out') {
      setSuccessMessage('You have been successfully logged out. All cached data cleared.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // First, check if this is an admin login attempt
      const adminCheckResponse = await fetch('/api/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const adminCheck = await adminCheckResponse.json()

      if (adminCheck.isAdmin) {
        // Admin login successful - redirect to admin dashboard
        if (rememberMe) {
          localStorage.setItem('plounix_saved_email', email)
          localStorage.setItem('plounix_remember_me', 'true')
        } else {
          localStorage.removeItem('plounix_saved_email')
          localStorage.removeItem('plounix_saved_password')
          localStorage.removeItem('plounix_remember_me')
        }
        
        console.log('✅ Admin login successful, redirecting to /admin')
        router.push('/admin')
        return
      }

      // Not admin, proceed with normal user login
      const result = await auth.signIn(email, password)
      
      if (result.success) {
        // Save or clear credentials based on Remember Me checkbox
        if (rememberMe) {
          localStorage.setItem('plounix_saved_email', email)
          localStorage.setItem('plounix_saved_password', password)
          localStorage.setItem('plounix_remember_me', 'true')
        } else {
          localStorage.removeItem('plounix_saved_email')
          localStorage.removeItem('plounix_saved_password')
          localStorage.removeItem('plounix_remember_me')
        }
        
        // Check if user has completed onboarding
        if (result.user) {
          // Check localStorage first
          const localCompleted = localStorage.getItem('plounix_onboarding_completed')
          if (localCompleted === 'true') {
            console.log('✅ Onboarding complete (localStorage), going to dashboard')
          } else {
            const { supabase } = await import('@/lib/supabase')
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('onboarding_completed')
              .eq('user_id', result.user.id)
              .maybeSingle()
            
            console.log('🔍 Profile check:', { profile, profileError, userId: result.user.id })
            
            // If column doesn't exist, skip onboarding check
            if (profileError && profileError.message?.includes('column')) {
              console.log('⚠️ Column does not exist, skipping onboarding')
            } else if (!profile || !(profile as any).onboarding_completed) {
              // If onboarding not completed, redirect to tour
              console.log('❌ Onboarding incomplete! Redirecting to /onboarding')
              setIsLoading(false) // Stop loading indicator
              router.push('/onboarding')
              return
            }
            
            console.log('✅ Onboarding complete, going to dashboard')
          }
        }
        
        // Get redirect URL from query params or default to dashboard
        const redirectTo = searchParams.get('redirectTo') || '/dashboard'
        router.push(redirectTo)
      } else {
        // Parse error message for more specific feedback
        const errorMessage = result.error || 'Login failed'
        
        if (errorMessage.includes('Invalid login credentials') || 
            errorMessage.includes('invalid login credentials') ||
            errorMessage.includes('Invalid') ||
            errorMessage.includes('credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (errorMessage.includes('Email not confirmed') || 
                   errorMessage.includes('email not confirmed')) {
          setError('Please verify your email address before logging in. Check your inbox for the confirmation link.')
        } else if (errorMessage.includes('User not found') || 
                   errorMessage.includes('not found')) {
          setError('No account found with this email address. Please sign up first.')
        } else if (errorMessage.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a few minutes and try again.')
        } else if (errorMessage.includes('network') || 
                   errorMessage.includes('Network')) {
          setError('Network error. Please check your internet connection and try again.')
        } else {
          setError(errorMessage)
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50/30 to-green-50/30">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-6">
        <Link href="/" className="flex items-center space-x-1.5 md:space-x-2 text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-[11px] md:text-sm">Back to Home</span>
        </Link>
        <div className="flex items-center space-x-1.5 md:space-x-2">
          <PiggyBank className="w-4 h-4 md:w-6 md:h-6 text-primary" />
          <span className="text-sm md:text-xl font-bold text-primary">Plounix</span>
        </div>
      </div>

      <div className="flex items-center justify-center px-3 md:px-6 py-6 md:py-12">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 max-w-6xl w-full">
          {/* Left Side - Login Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-xl border-0">
              <CardHeader className="text-center pb-4 md:pb-8 p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <Bot className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <CardTitle className="text-lg md:text-2xl font-bold">Welcome Back!</CardTitle>
                <p className="text-[11px] md:text-sm text-gray-600 mt-1 md:mt-2">
                  Continue your financial journey with your AI kuya/ate
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-3 md:px-4 py-2 md:py-3 rounded-lg text-[11px] md:text-sm">
                    <p>{error}</p>
                    {error.includes('No account found') && (
                      <Link href="/auth/register" className="inline-flex items-center mt-2 text-primary hover:text-primary/80 font-medium">
                        Create an account →
                      </Link>
                    )}
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-3 md:px-4 py-2 md:py-3 rounded-lg text-[11px] md:text-sm">
                    {successMessage}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="juan@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-9 md:h-12 text-[11px] md:text-base"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-9 md:h-12 pr-10 md:pr-12 text-[11px] md:text-base"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="mr-1.5 md:mr-2 cursor-pointer" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading} 
                      />
                      <span className="text-[11px] md:text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-[11px] md:text-sm text-primary hover:text-primary/80">
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 md:h-12 text-sm md:text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Log In to Plounix'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-[11px] md:text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium">
                      Create free account
                    </Link>
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 md:space-x-2 text-[9px] md:text-xs text-gray-500 justify-center">
                  <Shield className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Secured with industry-standard encryption</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Features */}
          <div className="hidden lg:flex items-center">
            <div className="space-y-6 md:space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                  Your Financial Future Awaits
                </h2>
                <p className="text-base md:text-xl text-gray-600 leading-relaxed">
                  Get back to building your wealth with AI-powered financial guidance designed for Filipino youth.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-gray-900">AI Financial Coach</h3>
                    <p className="text-gray-600 text-xs md:text-sm">Get personalized advice with real-time web search for prices and bank rates</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-gray-900">Expense Tracker</h3>
                    <p className="text-gray-600 text-xs md:text-sm">Track every peso in and out with real-time cash flow monitoring</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-gray-900">Interactive Learning</h3>
                    <p className="text-gray-600 text-xs md:text-sm">Master money management through bite-sized lessons</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-gray-900">Goal Tracking</h3>
                    <p className="text-gray-600 text-xs md:text-sm">Set and track your financial goals with AI-powered insights</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-green-50 p-4 md:p-6 rounded-xl border border-primary/10">
                <p className="text-gray-700 font-medium text-xs md:text-sm mb-1.5 md:mb-2">
                  Secure & Private
                </p>
                <p className="text-gray-600 text-xs md:text-sm">
                  Your financial data is encrypted and secure. Designed for Filipino students and young professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50/30 to-green-50/30 flex items-center justify-center">
        <Spinner size="xl" color="primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
