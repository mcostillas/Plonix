'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { AuthGuard } from '@/components/AuthGuard'
import { Trophy, Calendar, Users, Target, TrendingUp, PiggyBank, Coffee, BookOpen, Flame, GraduationCap, Briefcase, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export default function ChallengesPage() {
  return (
    <AuthGuard>
      <ChallengesContent />
    </AuthGuard>
  )
}

function ChallengesContent() {
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([])

  const joinChallenge = (challengeId: string) => {
    if (!joinedChallenges.includes(challengeId)) {
      setJoinedChallenges([...joinedChallenges, challengeId])
    }
  }

  const studentChallenges = [
    {
      id: 'allowance-stretch',
      title: '₱100 Daily Challenge',
      description: 'Survive on ₱100 daily for food and drinks. Perfect for students wanting to stretch their allowance.',
      duration: '7 days',
      participants: 1247,
      difficulty: 'Easy',
      category: 'Budgeting',
      icon: Coffee,
      reward: '₱500 saved + budgeting confidence',
      tips: [
        'Cook rice at home, buy ulam only',
        'Bring water bottle instead of buying drinks',
        'Look for student meal deals',
        'Share food costs with classmates'
      ]
    },
    {
      id: 'load-saver',
      title: 'Load Smart Challenge',
      description: 'Reduce your mobile load expenses by 50% using WiFi, free apps, and smart usage.',
      duration: '2 weeks',
      participants: 892,
      difficulty: 'Easy',
      category: 'Savings',
      icon: Target,
      reward: '₱300-500 monthly savings',
      tips: [
        'Use free WiFi whenever possible',
        'Switch to messaging apps (Messenger, Viber)',
        'Download content when on WiFi',
        'Use data-saving modes'
      ]
    },
    {
      id: 'jeepney-budget',
      title: 'Transport Budget Week',
      description: 'Stick to ₱200 weekly transport budget using jeepneys, walking, and carpooling.',
      duration: '1 week',
      participants: 634,
      difficulty: 'Medium',
      category: 'Budgeting',
      icon: TrendingUp,
      reward: '₱400+ monthly transport savings',
      tips: [
        'Walk for short distances (1-2 stops)',
        'Use jeepneys instead of Grab',
        'Organize carpool with classmates',
        'Combine errands into one trip'
      ]
    }
  ]

  const graduateChallenges = [
    {
      id: 'salary-split',
      title: 'First Salary Smart Split',
      description: 'Apply 50-30-20 rule to your first salary: 50% needs, 30% wants, 20% savings.',
      duration: '1 month',
      participants: 1456,
      difficulty: 'Medium',
      category: 'Budgeting',
      icon: PiggyBank,
      reward: '20% of salary saved automatically',
      tips: [
        'Set up automatic savings transfer',
        'Track every expense for first month',
        'Resist lifestyle inflation temptations',
        'Celebrate small wins'
      ]
    },
    {
      id: 'emergency-fund-race',
      title: '₱30,000 Emergency Fund Race',
      description: 'Build your first emergency fund (3 months expenses) as fast as possible.',
      duration: '6 months',
      participants: 743,
      difficulty: 'Hard',
      category: 'Savings',
      icon: Trophy,
      reward: 'Financial security + peace of mind',
      tips: [
        'Start with ₱5,000 monthly savings',
        'Use high-yield digital banks (CIMB, Tonik)',
        'Save bonus/13th month pay',
        'Side hustle for extra income'
      ]
    },
    {
      id: 'investment-starter',
      title: 'Investment Newbie Challenge',
      description: 'Start investing ₱1,000 monthly in mutual funds for 6 months.',
      duration: '6 months',
      participants: 528,
      difficulty: 'Medium',
      category: 'Investing',
      icon: BookOpen,
      reward: '₱6,000+ invested + investment knowledge',
      tips: [
        'Start with balanced mutual funds',
        'Use BPI, BDO, or COL Financial',
        'Don\'t check daily - invest for long term',
        'Learn about different fund types'
      ]
    }
  ]

  const popularChallenges = [
    {
      id: 'no-spend-weekend',
      title: 'No-Spend Weekend',
      description: 'Enjoy weekends without spending money on entertainment or food.',
      duration: '2 days',
      participants: 2341,
      difficulty: 'Easy',
      category: 'Savings',
      icon: Target,
      reward: '₱500-1,000 weekend savings',
      tips: [
        'Cook meals at home',
        'Find free activities (parks, free events)',
        'Have movie nights at home',
        'Exercise outdoors instead of gym'
      ]
    },
    {
      id: 'lutong-bahay-week',
      title: 'Lutong Bahay Week',
      description: 'Cook all your meals at home for one week. No food delivery or eating out.',
      duration: '7 days',
      participants: 1876,
      difficulty: 'Medium',
      category: 'Budgeting',
      icon: Coffee,
      reward: '₱1,000-2,000 food savings',
      tips: [
        'Meal prep on Sunday',
        'Buy groceries in bulk',
        'Learn 3-4 easy recipes',
        'Bring packed lunch to work/school'
      ]
    }
  ]

  const renderChallengeCard = (challenge: any, isJoined: boolean) => (
    <Card key={challenge.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <challenge.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900">{challenge.title}</CardTitle>
              <CardDescription className="mt-1 text-gray-600">{challenge.description}</CardDescription>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border border-green-200' :
            challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
            'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {challenge.difficulty}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{challenge.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{challenge.participants.toLocaleString()} joined</span>
              </div>
            </div>
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md font-medium">
              {challenge.category}
            </span>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-start space-x-2">
              <Trophy className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800 text-sm">Reward</h4>
                <p className="text-green-700 text-sm mt-1">{challenge.reward}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-900 flex items-center space-x-2">
              <Target className="w-4 h-4 text-primary" />
              <span>Success Tips</span>
            </h4>
            <ul className="space-y-2">
              {challenge.tips.slice(0, 2).map((tip: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <CheckCircle className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button 
            className="w-full h-11 font-medium transition-all duration-200" 
            onClick={() => joinChallenge(challenge.id)}
            disabled={isJoined}
            variant={isJoined ? "outline" : "default"}
          >
            {isJoined ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Challenge Joined
              </>
            ) : (
              'Join Challenge'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="challenges" />

      <div className="container mx-auto px-4 py-8">
        {/* Uniform Header */}
        <PageHeader
          title="Financial Challenges"
          description="Join fun, practical challenges designed for Filipino students and young professionals. Build better money habits while connecting with peers on the same journey."
          badge={{
            text: "Community Challenges",
            icon: Trophy
          }}
        />

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="text-center pt-6">
              <div className="p-3 bg-yellow-500 rounded-full w-fit mx-auto mb-3">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">12</h3>
              <p className="text-gray-600 font-medium">Challenges Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="text-center pt-6">
              <div className="p-3 bg-green-500 rounded-full w-fit mx-auto mb-3">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">₱8,450</h3>
              <p className="text-gray-600 font-medium">Total Money Saved</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="text-center pt-6">
              <div className="p-3 bg-blue-500 rounded-full w-fit mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">1,247</h3>
              <p className="text-gray-600 font-medium">Community Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Popular Challenges */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Popular This Week</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {popularChallenges.map((challenge) => 
              renderChallengeCard(challenge, joinedChallenges.includes(challenge.id))
            )}
          </div>
        </div>

        {/* Student Challenges */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Student Challenges</h2>
          </div>
          <p className="text-gray-600 mb-6 text-lg">Perfect for college students managing allowances and building first financial habits.</p>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {studentChallenges.map((challenge) => 
              renderChallengeCard(challenge, joinedChallenges.includes(challenge.id))
            )}
          </div>
        </div>

        {/* Graduate Challenges */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Fresh Graduate Challenges</h2>
          </div>
          <p className="text-gray-600 mb-6 text-lg">Level up your financial game with your first salary and career goals.</p>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {graduateChallenges.map((challenge) => 
              renderChallengeCard(challenge, joinedChallenges.includes(challenge.id))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
