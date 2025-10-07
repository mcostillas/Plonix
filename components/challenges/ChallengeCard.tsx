'use client'

import { Challenge } from '@/types/challenges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, Award } from 'lucide-react'
import { useState } from 'react'

interface ChallengeCardProps {
  challenge: Challenge
  onJoin?: (challengeId: string) => void
  isJoining?: boolean
}

export function ChallengeCard({ challenge, onJoin, isJoining }: ChallengeCardProps) {
  const [joining, setJoining] = useState(false)

  const handleJoin = async () => {
    if (!onJoin) return
    setJoining(true)
    try {
      await onJoin(challenge.id)
    } finally {
      setJoining(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'savings':
        return 'bg-blue-100 text-blue-800'
      case 'budgeting':
        return 'bg-purple-100 text-purple-800'
      case 'discipline':
        return 'bg-orange-100 text-orange-800'
      case 'spending':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{challenge.icon}</span>
            <div>
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
                <Badge className={getCategoryColor(challenge.category)}>
                  {challenge.category}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <CardDescription className="mt-2">
          {challenge.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{challenge.duration_days} days</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4" />
            <span>{challenge.points_full} points</span>
          </div>
        </div>
        
        {challenge.estimated_time_commitment && (
          <div className="text-sm text-gray-500">
            ⏱️ Time commitment: {challenge.estimated_time_commitment}
          </div>
        )}
        
        {challenge.total_participants > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{challenge.total_participants} participants</span>
            {challenge.success_rate && (
              <span className="text-green-600">
                ({challenge.success_rate}% success rate)
              </span>
            )}
          </div>
        )}
        
        {challenge.requirements?.estimated_savings && (
          <div className="bg-green-50 p-2 rounded text-sm text-green-700">
            💰 Potential savings: ₱{challenge.requirements.estimated_savings}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleJoin}
          disabled={joining || isJoining}
          className="w-full"
        >
          {joining || isJoining ? 'Joining...' : 'Join Challenge'}
        </Button>
      </CardFooter>
    </Card>
  )
}
