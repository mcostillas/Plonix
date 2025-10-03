'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PiggyBank, ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50/30 to-green-50/30">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link href="/auth/login" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>
        <div className="flex items-center space-x-2">
          <PiggyBank className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-primary">Plounix</span>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {success ? 'Check Your Email' : 'Forgot Password?'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {success 
                ? 'We sent you a password reset link. Check your inbox and spam folder.'
                : 'No worries! Enter your email and we\'ll send you a reset link.'
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {success ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Email sent successfully!</p>
                    <p>Click the link in the email to reset your password. The link will expire in 1 hour.</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={() => setSuccess(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                  <Link href="/auth/login" className="block">
                    <Button className="w-full" variant="default">
                      Return to Login
                    </Button>
                  </Link>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>Didn't receive the email?</p>
                  <p className="mt-1">Check your spam folder or try again with a different email.</p>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    <p className="text-xs text-gray-500 mt-2">
                      Enter the email address associated with your Plounix account
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending Reset Link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Remember your password?{' '}
                    <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                      Back to Login
                    </Link>
                  </p>
                </div>

                <div className="border-t pt-6">
                  <p className="text-xs text-gray-500 text-center">
                    For security reasons, we'll send the reset link to the email on file.
                    If you don't have access to that email, please contact support.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 text-center text-xs text-gray-500 bg-white/50 backdrop-blur-sm border-t">
        <p>
          Need help? Contact{' '}
          <a href="mailto:support@plounix.com" className="text-primary hover:underline">
            support@plounix.com
          </a>
        </p>
      </div>
    </div>
  )
}
