'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PiggyBank, Eye, EyeOff, ArrowLeft, Bot, Shield, Loader2 } from 'lucide-react'
import { auth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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
      const result = await auth.signIn(email, password)
      
      if (result.success) {
        // Redirect to AI assistant or dashboard
        router.push('/ai-assistant')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      setError('An unexpected error occurred')
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

      <div className="flex items-center justify-center px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl w-full">
          {/* Left Side - Login Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-xl border-0">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
                <p className="text-gray-600 mt-2">
                  Continue your financial journey with your AI kuya/ate
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="juan@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
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
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 pr-12"
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
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" disabled={isLoading} />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80">
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Log In to Plounix'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium">
                      Create free account
                    </Link>
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs text-gray-500 justify-center">
                  <Shield className="w-4 h-4" />
                  <span>Secured with industry-standard encryption</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Features */}
          <div className="hidden lg:flex items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Your Financial Future Awaits
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Get back to building your wealth with AI-powered financial guidance designed for Filipino youth.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Assistant with Web Search</h3>
                    <p className="text-gray-600 text-sm">Get real-time prices, bank rates, and financial advice</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PiggyBank className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Smart Goal Creation</h3>
                    <p className="text-gray-600 text-sm">AI helps create personalized savings plans for your dreams</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Philippine Context</h3>
                    <p className="text-gray-600 text-sm">Understands Filipino financial culture and local banks</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-xl">
                <p className="text-primary font-medium text-sm">
                  "Plounix helped me save ₱50,000 for my laptop in just 8 months! The AI made it so easy to track my progress."
                </p>
                <p className="text-gray-600 text-xs mt-2">- Maria, 22, College Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
