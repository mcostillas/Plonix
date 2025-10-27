'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp, auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PiggyBank, Eye, EyeOff, ArrowLeft, Users, CheckCircle, Star, Check, X, Bot, TrendingUp, Target, BookOpen, Loader2 } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Google icon component - circular with logo only
const GoogleIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
)

interface PasswordRequirement {
  label: string
  met: boolean
}

const validatePassword = (password: string): PasswordRequirement[] => {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /\d/.test(password) },
    { label: 'Contains special character (e.g., @, #, $, !, ,)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ]
}

const getPasswordStrength = (requirements: PasswordRequirement[]): { label: string; color: string; percentage: number } => {
  const metCount = requirements.filter(r => r.met).length
  const percentage = (metCount / requirements.length) * 100

  if (metCount === requirements.length) return { label: 'Strong', color: 'text-green-600', percentage }
  if (metCount >= 3) return { label: 'Medium', color: 'text-yellow-600', percentage }
  return { label: 'Weak', color: 'text-red-600', percentage }
}

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    password: '',
    confirmPassword: ''
  })
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>(validatePassword(''))
  const [showRequirements, setShowRequirements] = useState(false)

  // Load form data from sessionStorage on mount
  useEffect(() => {
    const savedFormData = sessionStorage.getItem('registerFormData')
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData)
        setFormData(parsedData)
        if (parsedData.password) {
          setPasswordRequirements(validatePassword(parsedData.password))
          setShowRequirements(true)
        }
      } catch (error) {
        console.error('Error loading saved form data:', error)
      }
    }
  }, [])

  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    if (formData.firstName || formData.lastName || formData.email || formData.password || formData.confirmPassword) {
      sessionStorage.setItem('registerFormData', JSON.stringify(formData))
    }
  }, [formData])

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setError('')
    
    try {
      const result = await auth.signInWithGoogle()
      
      if (!result.success) {
        setError(result.error || 'Google sign-up failed. Please try again.')
        setIsGoogleLoading(false)
      }
      // If successful, the user will be redirected to Google's OAuth page
      // and then back to /auth/callback
    } catch (error) {
      setError('An unexpected error occurred with Google sign-up.')
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.age) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    // Validate age
    const ageNum = parseInt(formData.age)
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
      setError('Please enter a valid age (13-100)')
      setIsLoading(false)
      return
    }

    // Check password strength
    const requirements = validatePassword(formData.password)
    const allRequirementsMet = requirements.every(req => req.met)
    
    if (!allRequirementsMet) {
      setError('Password does not meet all requirements')
      setShowRequirements(true)
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`
      const result = await signUp(
        formData.email,
        formData.password,
        fullName,
        parseInt(formData.age)
      )

      if (!result.success || result.error) {
        // Check for specific error messages
        const errorMessage = result.error || 'Registration failed. Please try again.'
        
        if (errorMessage.includes('already registered') || 
            errorMessage.includes('already exists') ||
            errorMessage.includes('User already registered')) {
          setError('This email is already registered. Please log in instead.')
        } else {
          setError(errorMessage)
        }
      } else if (result.user) {
        // Check if user was actually created (not a duplicate)
        // Supabase returns user even for duplicates when email confirmation is on
        if (!result.user.identities || result.user.identities.length === 0) {
          setError('This email is already registered. Please log in or reset your password if you forgot it.')
          setIsLoading(false)
          return
        }
        
        // Send welcome email to new user
        try {
          const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'welcome',
              to: formData.email,
              userName: fullName
            })
          })
          
          const emailResult = await emailResponse.json()
          if (emailResult.success) {
            console.log('✅ Welcome email sent successfully')
          } else {
            console.error('⚠️ Failed to send welcome email:', emailResult.error)
            // Don't block registration if email fails
          }
        } catch (emailError) {
          console.error('⚠️ Error sending welcome email:', emailError)
          // Don't block registration if email fails
        }
        
        // Clear saved form data on successful registration
        sessionStorage.removeItem('registerFormData')
        
        // Check if email confirmation is required
        if (result.session) {
          // User is logged in, go to dashboard immediately
          setMessage('Account created successfully! Check your email for a welcome message. Redirecting to your dashboard...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
        } else {
          // Email confirmation required
          setMessage('Account created! Please check your email to verify your account, then log in to continue setup.')
          setTimeout(() => {
            router.push('/auth/login?message=Please verify your email before logging in')
          }, 3000)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Registration error:', err)
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

      <div className="flex items-center justify-center px-3 md:px-6 py-4 md:py-8">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 max-w-6xl w-full">
          {/* Left Side - Benefits */}
          <div className="hidden lg:flex items-center">
            <div className="space-y-6 md:space-y-8">
              <div>
                <div className="inline-flex items-center space-x-1.5 md:space-x-2 bg-primary/10 text-primary px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
                  <Star className="w-3 h-3 md:w-4 md:h-4" />
                  <span>AI-Powered Financial Education</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                  Start Your Financial Journey Today
                </h2>
                <p className="text-base md:text-xl text-gray-600 leading-relaxed">
                  Join Filipino students and young professionals building wealth with AI-powered guidance.
                </p>
              </div>

              <div className="space-y-4 md:space-y-5">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1">AI Financial Coach</h3>
                    <p className="text-gray-600 text-xs md:text-sm">Get personalized advice with real-time web search</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1">Expense Tracker</h3>
                    <p className="text-gray-600 text-xs md:text-sm">Monitor your cash flow and track every peso</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1">Interactive Learning</h3>
                    <p className="text-gray-600 text-xs md:text-sm">Master money management through bite-sized lessons</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1">Goal Tracking</h3>
                    <p className="text-gray-600 text-xs md:text-sm">Set and track your financial goals with AI insights</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-green-50 p-4 md:p-6 rounded-xl border border-primary/10">
                <div className="flex items-center space-x-2 md:space-x-3 mb-1.5 md:mb-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span className="font-semibold text-sm md:text-base text-gray-900">No Credit Card Required</span>
                </div>
                <p className="text-gray-600 text-xs md:text-sm">
                  Full access to all features. Designed specifically for Filipino youth aged 18-25.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-xl border-0">
              <CardHeader className="text-center pb-4 md:pb-6 p-4 md:p-6">
                <CardTitle className="text-lg md:text-2xl font-bold">Create Your Account</CardTitle>
                <p className="text-[11px] md:text-sm text-gray-600 mt-1.5 md:mt-2">
                  Start your financial journey with your AI kuya/ate
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 md:p-4">
                    <div className="text-[11px] md:text-sm text-red-700">{error}</div>
                  </div>
                )}

                {message && (
                  <div className="rounded-md bg-green-50 p-3 md:p-4">
                    <div className="text-[11px] md:text-sm text-green-700">{message}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-2 gap-2.5 md:gap-4">
                    <div>
                      <label className="block text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        First Name
                      </label>
                      <Input
                        placeholder="Juan"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="h-9 md:h-11 text-[11px] md:text-base"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Last Name
                      </label>
                      <Input
                        placeholder="Dela Cruz"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="h-9 md:h-11 text-[11px] md:text-base"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                        placeholder="juan@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="h-9 md:h-11 text-[11px] md:text-base"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                  </div>

                  <div>
                    <label className="block text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                      Age
                    </label>
                    <Input
                      type="number"
                      placeholder="18"
                      min="13"
                      max="100"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="h-9 md:h-11 text-[11px] md:text-base"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">You must be at least 13 years old to register</p>
                  </div>

                  <div>
                    <label className="block text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Popover open={showRequirements}>
                        <PopoverTrigger asChild>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={(e) => {
                              const newPassword = e.target.value
                              setFormData({...formData, password: newPassword})
                              setPasswordRequirements(validatePassword(newPassword))
                              if (newPassword.length > 0) {
                                setShowRequirements(true)
                              } else {
                                setShowRequirements(false)
                              }
                            }}
                            onFocus={() => {
                              if (formData.password.length > 0) {
                                setShowRequirements(true)
                              }
                            }}
                            onBlur={() => {
                              // Delay closing to allow interaction with popover
                              setTimeout(() => setShowRequirements(false), 200)
                            }}
                            className="h-9 md:h-11 pr-10 md:pr-12 text-[11px] md:text-base"
                            required
                            disabled={isLoading || isGoogleLoading}
                          />
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-72 md:w-80 p-3 md:p-4" 
                          align="start" 
                          side="right"
                          onOpenAutoFocus={(e) => e.preventDefault()}
                        >
                          <div className="space-y-2.5 md:space-y-3">
                            <div>
                              <h4 className="font-semibold text-xs md:text-sm mb-0.5 md:mb-1">Password Requirements</h4>
                              <p className="text-[10px] md:text-xs text-gray-500">Create a strong password that meets all requirements</p>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                              <div className="space-y-1.5 md:space-y-2">
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                  <span className="text-gray-600 text-[10px] md:text-xs">Strength:</span>
                                  <span className={`font-semibold text-[10px] md:text-xs ${getPasswordStrength(passwordRequirements).color}`}>
                                    {getPasswordStrength(passwordRequirements).label}
                                  </span>
                                </div>
                                
                                {/* Strength Bar */}
                                <div className="h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-300 ${
                                      getPasswordStrength(passwordRequirements).label === 'Strong' ? 'bg-green-500' :
                                      getPasswordStrength(passwordRequirements).label === 'Medium' ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${getPasswordStrength(passwordRequirements).percentage}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Requirements Checklist */}
                            <div className="space-y-1.5 md:space-y-2">
                              {passwordRequirements.map((req, index) => (
                                <div key={index} className="flex items-center space-x-1.5 md:space-x-2">
                                  <div className={`flex-shrink-0 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center ${
                                    req.met ? 'bg-green-100' : 'bg-gray-100'
                                  }`}>
                                    {req.met ? (
                                      <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-green-600" />
                                    ) : (
                                      <X className="w-2 h-2 md:w-2.5 md:h-2.5 text-gray-400" />
                                    )}
                                  </div>
                                  <span className={`text-[10px] md:text-xs ${req.met ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                                    {req.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={isLoading || isGoogleLoading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="h-9 md:h-11 text-[11px] md:text-base"
                      required
                      disabled={isLoading || isGoogleLoading}
                    />
                  </div>

                  <div className="flex items-start space-x-1.5 md:space-x-2">
                    <input type="checkbox" className="mt-0.5 md:mt-1" required disabled={isLoading || isGoogleLoading} />
                    <span className="text-[11px] md:text-sm text-gray-600">
                      I agree to the{' '}
                      <Link href="/terms" target="_blank" className="text-primary hover:text-primary/80">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" target="_blank" className="text-primary hover:text-primary/80">
                        Privacy Policy
                      </Link>
                    </span>
                  </div>

                  <Button type="submit" className="w-full h-10 md:h-12 text-sm md:text-lg" disabled={isLoading || isGoogleLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Free Account'
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                    </div>
                  </div>

                  {/* Google Sign Up Button */}
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-10 md:h-12 text-sm md:text-base border-2 hover:bg-gray-50 flex items-center justify-center gap-3"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                          <GoogleIcon />
                        </div>
                        <span>Sign up with Google</span>
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-[11px] md:text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                        Log in here
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
