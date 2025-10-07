'use client'

import { ActiveChallengeView } from '@/types/challenges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Calendar, TrendingUp, Award, AlertCircle } from 'lucide-react'

interface ActiveChallengeTrackerProps {
  challenge: ActiveChallengeView
  onCheckIn?: (challengeId: string) => void
  onAbandon?: (challengeId: string) => void
  isCheckingIn?: boolean
}

export function ActiveChallengeTracker({
  challenge,
  onCheckIn,
  onAbandon,
  isCheckingIn
}: ActiveChallengeTrackerProps) {
  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 1) return 'text-red-600'
    if (daysLeft <= 3) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500'
    if (percent >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{challenge.icon}</span>
            <div>
              <CardTitle className="text-base">{challenge.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-gray-600">
              {challenge.checkins_completed}/{challenge.checkins_required} days
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={challenge.progress_percent} 
              className="h-3"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow">
                {challenge.progress_percent}%
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-gray-500">Days Left</div>
              <div className={`font-bold ${getDaysLeftColor(challenge.days_left)}`}>
                {challenge.days_left} {challenge.days_left === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            <div>
              <div className="text-gray-500">Points</div>
              <div className="font-bold">{challenge.points_full}</div>
            </div>
          </div>

          {challenge.challenge_type === 'streak' && (
            <div className="flex items-center gap-2 col-span-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-gray-500">Current Streak</div>
                <div className="font-bold text-orange-600">
                  🔥 {challenge.current_streak} days
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Warning if deadline is near */}
        {challenge.days_left <= 2 && challenge.progress_percent < 100 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Deadline approaching! Complete your check-ins before it's too late.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onCheckIn?.(challenge.id)}
            disabled={isCheckingIn}
            className="flex-1"
          >
            {isCheckingIn ? 'Checking In...' : '✅ Check In Today'}
          </Button>
          <Button
            onClick={() => onAbandon?.(challenge.id)}
            variant="outline"
            className="text-red-600 hover:bg-red-50"
          >
            Abandon
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
