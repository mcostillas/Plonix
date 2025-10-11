'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PiggyBank, Eye, EyeOff, ArrowLeft, Users, CheckCircle, Star, Check, X } from 'lucide-react'

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
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    // Validation
    if (!formData.firstName || !formData.lastName) {
      setError('Please fill in all fields')
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
        fullName
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
        
        // Clear saved form data on successful registration
        sessionStorage.removeItem('registerFormData')
        setMessage('Account created successfully! Please check your email to verify your account.')
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login?message=Please verify your email before logging in')
        }, 3000)
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
      <div className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center space-x-2">
          <PiggyBank className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-primary">Plounix</span>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl w-full">
          {/* Left Side - Benefits */}
          <div className="hidden lg:flex items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Star className="w-4 h-4" />
                  <span>100% Free Forever</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Start Your Financial Journey Today
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join thousands of Filipino students and young professionals building wealth with AI guidance.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">AI-powered budget planning in minutes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Web search for real-time financial data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Personalized savings goals and challenges</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Philippine banks and financial products</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-green-100/50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-gray-900">Join 10,000+ Users</span>
                </div>
                <p className="text-gray-700 text-sm">
                  Filipino students and graduates using Plounix to master their finances and build wealth.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-xl border-0">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                <p className="text-gray-600 mt-2">
                  Start your financial journey with your AI kuya/ate
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                {message && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-700">{message}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        placeholder="Juan"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="h-11"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        placeholder="Dela Cruz"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="h-11"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="juan@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-11"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
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
                          }
                        }}
                        onFocus={() => setShowRequirements(true)}
                        className="h-11 pr-12"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {showRequirements && formData.password && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Password strength:</span>
                          <span className={`font-medium ${getPasswordStrength(passwordRequirements).color}`}>
                            {getPasswordStrength(passwordRequirements).label}
                          </span>
                        </div>
                        
                        {/* Strength Bar */}
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              getPasswordStrength(passwordRequirements).label === 'Strong' ? 'bg-green-500' :
                              getPasswordStrength(passwordRequirements).label === 'Medium' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${getPasswordStrength(passwordRequirements).percentage}%` }}
                          />
                        </div>

                        {/* Requirements Checklist */}
                        <div className="space-y-1.5 pt-1">
                          {passwordRequirements.map((req, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              {req.met ? (
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                                {req.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="h-11"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <input type="checkbox" className="mt-1" required disabled={isLoading} />
                    <span className="text-sm text-gray-600">
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

                  <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Free Account'}
                  </Button>

                  <div className="text-center">
                    <p className="text-gray-600">
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
