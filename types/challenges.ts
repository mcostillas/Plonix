// Challenge Types for Plounix Challenges System

export type ChallengeType = 'flexible' | 'streak' | 'time_bound'
export type ValidationMethod = 'manual' | 'automatic' | 'hybrid'
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard'
export type ChallengeCategory = 'savings' | 'budgeting' | 'discipline' | 'spending' | 'investing'
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'abandoned'
export type ProgressType = 'daily_checkin' | 'milestone' | 'completion' | 'failure' | 'retroactive_checkin'

export interface Challenge {
  id: string
  title: string
  description: string
  category: ChallengeCategory
  icon: string
  tips?: string[]
  
  // Challenge mechanics
  challenge_type: ChallengeType
  validation_method: ValidationMethod
  
  // Duration & requirements
  duration_days: number
  required_checkins?: number
  required_consecutive_days?: number
  specific_days?: string[]
  
  // Requirements (complex rules)
  requirements?: {
    target_amount?: number
    spending_limit?: number
    category?: string
    min_transactions_per_day?: number
    estimated_savings?: number
    [key: string]: any
  }
  
  // Failure rules
  grace_period_hours: number
  max_missed_days: number
  failure_condition: string
  
  // Rewards
  points_full: number
  points_partial_enabled: boolean
  badge_icon?: string
  badge_title?: string
  
  // Difficulty & engagement
  difficulty: ChallengeDifficulty
  estimated_time_commitment: string
  
  // Metadata
  is_active: boolean
  total_participants: number
  success_rate?: number
  created_at: string
  updated_at: string
}

export interface UserChallenge {
  id: string
  user_id: string
  challenge_id: string
  
  // Status
  status: ChallengeStatus
  progress_percent: number
  checkins_completed: number
  checkins_required?: number
  current_streak: number
  
  // Dates
  joined_at: string
  started_at?: string
  deadline: string
  completed_at?: string
  failed_at?: string
  
  // Failure handling
  failure_reason?: string
  partial_completion_percent: number
  can_retry: boolean
  retry_count: number
  
  // Notifications
  last_reminder_sent_at?: string
  reminder_frequency: string
  
  // Results
  points_earned: number
  badge_earned?: string
  
  // Progress data
  progress_data?: {
    [key: string]: any
  }
  
  // Metadata
  created_at: string
  updated_at: string
  
  // Joined data (from API)
  challenges?: Challenge
}

export interface ChallengeProgress {
  id: string
  user_challenge_id: string
  
  // Progress type
  progress_type: ProgressType
  
  // Check-in data
  checkin_date: string
  completed: boolean
  note?: string
  
  // Value data
  value?: number
  transaction_id?: string
  
  // Metadata
  metadata?: {
    [key: string]: any
  }
  
  created_at: string
}

export interface ActiveChallengeView extends UserChallenge {
  title: string
  description: string
  icon: string
  category: ChallengeCategory
  challenge_type: ChallengeType
  difficulty: ChallengeDifficulty
  points_full: number
  days_left: number
}

export interface ChallengeStats {
  total_challenges: number
  active_challenges: number
  completed_challenges: number
  failed_challenges: number
  total_points: number
  success_rate: number
  current_streak: number
}
