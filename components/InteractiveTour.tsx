'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import { supabase } from '@/lib/supabase'

interface InteractiveTourProps {
  onComplete: () => void
}

export function InteractiveTour({ onComplete }: InteractiveTourProps) {
  const [run, setRun] = useState(true)

  useEffect(() => {
    console.log('🎯 InteractiveTour mounted, starting tour...')
  }, [])

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Plounix</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full"></div>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Your AI-powered financial companion designed for Filipino students and young professionals.
          </p>
          <p className="text-base text-gray-600 leading-relaxed">
            Plounix helps you budget, save, invest, and build wealth with personalized guidance from your AI financial assistant.
          </p>
          <div className="bg-gradient-to-br from-primary/5 to-blue-50 border border-primary/20 p-4 rounded-xl">
            <p className="text-sm font-medium text-gray-700">
              Take a quick tour to discover all the powerful features available to you.
            </p>
          </div>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="ai-assistant"]',
      content: (
        <div className="space-y-4 max-w-md">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Meet Fili - Your AI Assistant</h3>
            <div className="w-12 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Fili is your personal AI financial assistant with powerful capabilities designed to help you make smarter money decisions.
          </p>
          <div className="grid gap-2.5">
            <div className="flex gap-3 p-3 bg-gradient-to-br from-primary/5 to-blue-50 rounded-lg border border-primary/20">
              <div className="flex-shrink-0 w-1 bg-gradient-to-b from-primary to-blue-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Smart Conversations</h4>
                <p className="text-xs text-gray-600">Ask anything about budgeting, saving, or investing</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-gradient-to-br from-primary/5 to-blue-50 rounded-lg border border-primary/20">
              <div className="flex-shrink-0 w-1 bg-gradient-to-b from-primary to-blue-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Real-Time Web Search</h4>
                <p className="text-xs text-gray-600">Get current data on Philippine banks and interest rates</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-gradient-to-br from-primary/5 to-blue-50 rounded-lg border border-primary/20">
              <div className="flex-shrink-0 w-1 bg-gradient-to-b from-primary to-blue-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Quick Transactions</h4>
                <p className="text-xs text-gray-600">Add expenses instantly with simple voice commands</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-gradient-to-br from-primary/5 to-blue-50 rounded-lg border border-primary/20">
              <div className="flex-shrink-0 w-1 bg-gradient-to-b from-primary to-blue-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Expense Analysis</h4>
                <p className="text-xs text-gray-600">Analyze spending patterns and get personalized advice</p>
              </div>
            </div>
          </div>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="transactions"]',
      content: (
        <div className="space-y-4 max-w-md">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Track Your Expenses</h3>
            <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Click here to add and view all your financial transactions in one organized place.
          </p>
          <div className="grid gap-2.5">
            <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg border border-orange-200">
              <div className="w-2 h-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-0.5">Log Expenses</p>
                <p className="text-xs text-gray-600">Track purchases including food, transport, and bills</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg border border-orange-200">
              <div className="w-2 h-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-0.5">Record Income</p>
                <p className="text-xs text-gray-600">Monitor salary, allowance, and side income</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg border border-orange-200">
              <div className="w-2 h-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-0.5">Visual Insights</p>
                <p className="text-xs text-gray-600">View charts and reports on spending patterns</p>
              </div>
            </div>
          </div>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="goals"]',
      content: (
        <div className="space-y-4 max-w-md">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Set Financial Goals</h3>
            <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Transform your dreams into actionable plans with goal tracking and progress monitoring.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-3 rounded-lg">
              <p className="font-semibold text-gray-900 text-sm mb-1">Emergency Fund</p>
              <p className="text-xs text-gray-600">Build 3-6 months safety net</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-3 rounded-lg">
              <p className="font-semibold text-gray-900 text-sm mb-1">Save for Gadgets</p>
              <p className="text-xs text-gray-600">Phone, laptop, camera</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-3 rounded-lg">
              <p className="font-semibold text-gray-900 text-sm mb-1">Travel Fund</p>
              <p className="text-xs text-gray-600">Domestic or international</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-3 rounded-lg">
              <p className="font-semibold text-gray-900 text-sm mb-1">Education</p>
              <p className="text-xs text-gray-600">Courses and certifications</p>
            </div>
          </div>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="challenges"]',
      content: (
        <div className="space-y-4 max-w-md">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Join Money Challenges</h3>
            <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Gamify your savings journey with challenges designed to build better financial habits.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 text-sm">No Spend Week</p>
                <p className="text-xs text-gray-600">Skip non-essential purchases</p>
              </div>
              <span className="text-xs font-medium text-purple-700 bg-white px-2 py-1 rounded-full border border-purple-200">Popular</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Coffee Savings</p>
                <p className="text-xs text-gray-600">Save 50 pesos daily</p>
              </div>
              <span className="text-xs font-medium text-purple-700 bg-white px-2 py-1 rounded-full border border-purple-200">Trending</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Lunch Baon</p>
                <p className="text-xs text-gray-600">Pack lunch vs eating out</p>
              </div>
              <span className="text-xs font-medium text-purple-700 bg-white px-2 py-1 rounded-full border border-purple-200">Active</span>
            </div>
          </div>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '[data-tour="learning"]',
      content: (
        <div className="space-y-4 max-w-md">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Learn Financial Literacy</h3>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Access free courses designed to help you master money management from basics to advanced topics.
          </p>
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 p-4 rounded-xl">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-center p-2.5 bg-white rounded-lg shadow-sm border border-blue-100">
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">7</p>
                <p className="text-xs text-gray-600">Modules</p>
              </div>
              <div className="text-center p-2.5 bg-white rounded-lg shadow-sm border border-blue-100">
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">5-10</p>
                <p className="text-xs text-gray-600">Min Lessons</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <span className="text-gray-700">Budgeting fundamentals</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <span className="text-gray-700">Investment strategies</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <span className="text-gray-700">Philippine banking system</span>
              </div>
            </div>
          </div>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="profile"]',
      content: (
        <div className="space-y-4 max-w-sm">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Profile & Settings</h3>
            <div className="w-12 h-1 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Customize your Plounix experience and manage your account preferences.
          </p>
          <div className="grid gap-2">
            <div className="flex items-start gap-3 p-2.5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
              <div className="w-1 h-full bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Personal Info</p>
                <p className="text-xs text-gray-600">Update name, avatar, income</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2.5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
              <div className="w-1 h-full bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Notifications</p>
                <p className="text-xs text-gray-600">Bill reminders & budget alerts</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2.5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
              <div className="w-1 h-full bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Privacy</p>
                <p className="text-xs text-gray-600">Data is encrypted and secure</p>
              </div>
            </div>
          </div>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">You're All Set</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            You now have a complete overview of Plounix's features and capabilities.
          </p>
          <div className="bg-gradient-to-br from-primary/5 via-blue-50 to-green-50 border border-primary/20 p-5 rounded-xl">
            <p className="font-semibold text-gray-900 mb-3">What Fili Can Do For You:</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">Chat about any financial topic</p>
              </div>
              {/* <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">Scan receipts and extract expenses</p>
              </div> */}
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">Add transactions quickly with AI help</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">Search web for Philippine financial info</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">Analyze your spending patterns</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">Give personalized saving advice</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">Help you reach financial goals</p>
              </div>
            </div>
          </div>
          <div className="text-center pt-2">
            <p className="text-base text-gray-600">
              Your AI financial assistant is available 24/7 to help you build wealth and achieve your goals.
            </p>
          </div>
        </div>
      ),
      placement: 'center',
    },
  ]

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data
    
    console.log('🎯 Tour callback:', { status, action, index, type })

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      // Tour finished or skipped
      console.log('✅ Tour completed or skipped')
      setRun(false)
      onComplete()
    }
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      scrollToFirstStep
      disableScrolling={false}
      scrollOffset={100}
      spotlightPadding={8}
      styles={{
        options: {
          primaryColor: '#8B5CF6',
          zIndex: 10000,
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          textColor: '#1f2937',
          width: 380,
        },
        tooltip: {
          borderRadius: 16,
          padding: 0,
          boxShadow: '0 10px 40px rgba(139, 92, 246, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.1)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipContent: {
          padding: '20px 24px',
        },
        tooltipFooter: {
          padding: '12px 24px',
          marginTop: 0,
          borderTop: '1px solid #f3f4f6',
          backgroundColor: '#fafafa',
        },
        buttonNext: {
          background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          borderRadius: 8,
          padding: '12px 28px',
          fontSize: 14,
          fontWeight: 600,
          outline: 'none',
          border: 'none',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          color: '#ffffff',
        },
        buttonBack: {
          color: '#6B7280',
          marginRight: 10,
          fontSize: 14,
          fontWeight: 500,
          background: 'transparent',
          padding: '12px 20px',
        },
        buttonSkip: {
          color: '#9CA3AF',
          fontSize: 14,
          fontWeight: 500,
          padding: '12px 20px',
        },
        spotlight: {
          borderRadius: 12,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Get Started',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  )
}
