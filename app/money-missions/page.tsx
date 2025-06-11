'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { PageHeader } from '@/components/ui/page-header'
import { Trophy, Calendar, Users, Target, TrendingUp, PiggyBank, Coffee, BookOpen } from 'lucide-react'

export default function MoneyMissionsPage() {
  const [joinedMissions, setJoinedMissions] = useState<string[]>([])

  const joinMission = (missionId: string) => {
    if (!joinedMissions.includes(missionId)) {
      setJoinedMissions([...joinedMissions, missionId])
    }
  }

  const studentMissions = [
    {
      id: 'allowance-stretch',
      title: '₱100 Daily Mission',
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
      title: 'Load Smart Mission',
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

  const graduateMissions = [
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
      title: 'Investment Newbie Mission',
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

  const popularMissions = [
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

  const renderMissionCard = (mission: any, isJoined: boolean) => (
    <Card key={mission.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <mission.icon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-lg">{mission.title}</CardTitle>
              <CardDescription className="mt-1">{mission.description}</CardDescription>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            mission.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            mission.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {mission.difficulty}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{mission.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{mission.participants.toLocaleString()} joined</span>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {mission.category}
            </span>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-semibold text-green-800 text-sm mb-1">Reward:</h4>
            <p className="text-green-700 text-sm">{mission.reward}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Tips to succeed:</h4>
            <ul className="space-y-1">
              {mission.tips.slice(0, 2).map((tip: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-1">
                  <span className="text-primary mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-blue-800 text-sm mb-1">How to track:</h4>
            <p className="text-blue-700 text-sm">
              💬 Chat with AI Assistant about your daily spending and activities - it will automatically track your mission progress!
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={() => joinMission(mission.id)}
            variant={isJoined ? "outline" : "default"}
          >
            {isJoined ? '✓ Mission Joined - Chat with AI to Track' : 'Join Mission'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="money-missions" />

      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Money Missions"
          description="Join fun, practical missions designed for Filipino students and young professionals. Build better money habits while connecting with peers on the same journey."
          badge={{
            text: "Community Missions",
            icon: Trophy
          }}
        />

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="text-center pt-6">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold">12</h3>
              <p className="text-gray-600">Missions Completed</p>
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

        {/* Popular Missions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">🔥 Popular This Week</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {popularMissions.map((mission) => 
              renderMissionCard(mission, joinedMissions.includes(mission.id))
            )}
          </div>
        </div>

        {/* Student Missions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">🎓 Student Missions</h2>
          <p className="text-gray-600 mb-6">Perfect for college students managing allowances and building first financial habits.</p>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {studentMissions.map((mission) => 
              renderMissionCard(mission, joinedMissions.includes(mission.id))
            )}
          </div>
        </div>

        {/* Graduate Missions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">💼 Fresh Graduate Missions</h2>
          <p className="text-gray-600 mb-6">Level up your financial game with your first salary and career goals.</p>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {graduateMissions.map((mission) => 
              renderMissionCard(mission, joinedMissions.includes(mission.id))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}