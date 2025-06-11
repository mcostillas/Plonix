'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Star, Check, ArrowLeft } from 'lucide-react'

export default function PricingPage() {
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
                  <span className="text-sm">Community money missions</span>
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
