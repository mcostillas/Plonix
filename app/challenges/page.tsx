'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { Trophy, Calendar, Users, Target, TrendingUp, PiggyBank, Coffee, BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export default function ChallengesPage() {
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
    <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <challenge.icon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <CardDescription className="mt-1">{challenge.description}</CardDescription>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {challenge.difficulty}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{challenge.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{challenge.participants.toLocaleString()} joined</span>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {challenge.category}
            </span>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-semibold text-green-800 text-sm mb-1">Reward:</h4>
            <p className="text-green-700 text-sm">{challenge.reward}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Tips to succeed:</h4>
            <ul className="space-y-1">
              {challenge.tips.slice(0, 2).map((tip: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-1">
                  <span className="text-primary mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button 
            className="w-full" 
            onClick={() => joinChallenge(challenge.id)}
            disabled={isJoined}
            variant={isJoined ? "outline" : "default"}
          >
            {isJoined ? '✓ Joined Challenge' : 'Join Challenge'}
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="text-center pt-6">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold">12</h3>
              <p className="text-gray-600">Challenges Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center pt-6">
              <PiggyBank className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold">₱8,450</h3>
              <p className="text-gray-600">Total Money Saved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center pt-6">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold">1,247</h3>
              <p className="text-gray-600">Community Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Popular Challenges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">🔥 Popular This Week</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {popularChallenges.map((challenge) => 
              renderChallengeCard(challenge, joinedChallenges.includes(challenge.id))
            )}
          </div>
        </div>

        {/* Student Challenges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">🎓 Student Challenges</h2>
          <p className="text-gray-600 mb-6">Perfect for college students managing allowances and building first financial habits.</p>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {studentChallenges.map((challenge) => 
              renderChallengeCard(challenge, joinedChallenges.includes(challenge.id))
            )}
          </div>
        </div>

        {/* Graduate Challenges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">💼 Fresh Graduate Challenges</h2>
          <p className="text-gray-600 mb-6">Level up your financial game with your first salary and career goals.</p>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {graduateChallenges.map((challenge) => 
              renderChallengeCard(challenge, joinedChallenges.includes(challenge.id))
            )}
          </div>
        </div>

        {/* Community Call-to-Action */}
        <Card className="text-center bg-gradient-to-r from-primary to-blue-600 text-white">
          <CardContent className="py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-2xl font-bold mb-2">Create Your Own Challenge</h3>
            <p className="mb-6 text-blue-100">
              Have a unique financial goal? Start a challenge and invite your friends to join!
            </p>
            <Button variant="secondary" size="lg">
              Start Custom Challenge
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
