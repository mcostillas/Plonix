'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/lib/auth-hooks'
import { Shield, Users, Star, Check, ArrowLeft } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { useEffect, useState } from 'react'

export default function PricingPage() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading state until we know if user is logged in
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <Spinner size="xl" color="primary" />
        </div>
      </div>
    )
  }

  // If user is logged in, show the internal pricing page
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="pricing" />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Upgrade Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hello {user.name || user.email.split('@')[0]}! You're currently on the Free plan. 
              Unlock more features with our premium plans.
            </p>
          </div>

          {/* Current Plan Status */}
          <div className="mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Star className="w-5 h-5 mr-2" />
                  Your Current Plan: Free
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700">
                  You have access to all core learning modules, basic AI assistant (10 queries/day), 
                  and up to 3 goal tracking. Upgrade for unlimited features!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            {/* Premium Tier */}
            <Card className="relative border-2 border-primary shadow-xl">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium">
                  Recommended
                </span>
              </div>
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-2xl mb-2">Premium</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold">₱49</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">Perfect for serious wealth builders</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">AI assistant (100 queries/day)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Unlimited goals & tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">All financial tools</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Mission progress analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Ad-free experience</span>
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  Start 7-Day Free Trial
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Cancel anytime. No commitment.
                </p>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl mb-2">Pro</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold">₱149</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">For professionals and power users</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Everything in Premium</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">GPT-4 full model (stronger AI)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Unlimited AI queries</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Advanced financial planning</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Custom automation workflows</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Export financial reports</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Early access to new features</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" size="lg">
                  Upgrade to Pro
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Billed monthly. Cancel anytime.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Questions About Upgrading?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600 text-sm">Yes! You can cancel your subscription anytime from your profile settings. No hidden fees.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">What happens to my data?</h3>
                <p className="text-gray-600 text-sm">All your progress, goals, and learning data stay with you regardless of your plan.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">How do I upgrade?</h3>
                <p className="text-gray-600 text-sm">Click any upgrade button above and you'll be guided through our secure payment process.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Payment methods?</h3>
                <p className="text-gray-600 text-sm">We accept GCash, PayMaya, credit cards, and bank transfers.</p>
              </div>
            </div>
          </div>

          {/* Back to Dashboard */}
          <div className="text-center">
            <Link href="/dashboard">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Questions? Contact our support team from your profile page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If user is not logged in, show the landing page version
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Log In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Choose Your Financial Growth Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Start free and upgrade as you grow. Designed to be accessible for Filipino students and young professionals. 
            Build wealth without breaking the bank.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Free Tier */}
          <Card className="relative hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Free</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold">₱0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Perfect for students starting their financial journey</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">All Learn-Apply-Reflect modules</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Basic AI assistant (10 queries/day)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Goal tracking (up to 3 goals)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Community challenges</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Basic budget calculator</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Resource hub access</span>
                </div>
              </div>
              <Button className="w-full" variant="outline" size="lg">
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="relative border-2 border-primary shadow-xl scale-105">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl mb-2">Premium</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold">₱49</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">For serious wealth builders ready to level up</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Everything in Free</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">AI assistant (100 queries/day)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Unlimited goals & tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">All financial tools</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Mission progress analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Ad-free experience</span>
                </div>
              </div>
              <Button className="w-full" size="lg">
                Start 7-Day Free Trial
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="relative hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Pro</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold">₱149</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">For professionals and advanced users</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Everything in Premium</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">GPT-4 full model (stronger AI)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Unlimited AI queries</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Advanced financial planning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Custom automation workflows</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Export financial reports</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Early access to new features</span>
                </div>
              </div>
              <Button className="w-full" variant="outline" size="lg">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">Yes! You can cancel your subscription anytime. No hidden fees or long-term commitments.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a student discount?</h3>
              <p className="text-gray-600 text-sm">Our pricing is already student-friendly! Plus, our free tier includes all core educational features.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">We accept GCash, PayMaya, credit cards, and bank transfers for your convenience.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade plans?</h3>
              <p className="text-gray-600 text-sm">Absolutely! You can change your plan anytime. Changes take effect immediately.</p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            All plans include 7-day free trial • Cancel anytime • No setup fees
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Student-friendly pricing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Trusted by Filipino youth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
