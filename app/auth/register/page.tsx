'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PiggyBank, Eye, EyeOff, ArrowLeft, Users, CheckCircle, Star } from 'lucide-react'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

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
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-11 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
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
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <input type="checkbox" className="mt-1" required />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:text-primary/80">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:text-primary/80">
                      Privacy Policy
                    </Link>
                  </span>
                </div>

                <Button className="w-full h-12 text-lg">
                  Create Free Account
                </Button>

                <div className="text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                      Log in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
