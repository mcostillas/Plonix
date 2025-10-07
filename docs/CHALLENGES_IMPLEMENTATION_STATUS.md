# Challenges System Implementation Guide

## ✅ What's Been Implemented

### 1. Database Schema (`docs/challenges-schema.sql`)
Complete PostgreSQL schema with:
- **3 main tables**: `challenges`, `user_challenges`, `challenge_progress`
- **Automatic triggers**: Calculate deadlines, update progress, auto-complete challenges
- **RLS policies**: User data isolation (users only see their own challenges)
- **Helper views**: `user_active_challenges`, `challenge_leaderboard`
- **5 starter challenges** pre-seeded (3 flexible, 1 streak, 1 time-bound)

### 2. API Endpoints
All routes created in `app/api/challenges/`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/challenges` | GET | List all available challenges (with filters) |
| `/api/challenges/mine` | GET | Get user's active challenges |
| `/api/challenges/[id]/join` | POST | Join a challenge |
| `/api/challenges/[id]/progress` | POST | Log daily check-in |
| `/api/challenges/[id]/abandon` | POST | Abandon challenge (with partial points) |

### 3. TypeScript Types (`types/challenges.ts`)
Complete type definitions for:
- `Challenge`, `UserChallenge`, `ChallengeProgress`
- `ActiveChallengeView`, `ChallengeStats`
- All enums: `ChallengeType`, `ValidationMethod`, etc.

### 4. UI Components
- **`ChallengeCard`** - Display available challenges
- **`ActiveChallengeTracker`** - Track ongoing challenge progress
- **Badge** component - For difficulty/category tags
- **Progress** component - Visual progress bars

---

## 🚀 How to Set Up

### Step 1: Run Database Migration
1. Open **Supabase SQL Editor**
2. Copy contents of `docs/challenges-schema.sql`
3. Run the entire script
4. Verify tables created: `challenges`, `user_challenges`, `challenge_progress`

### Step 2: Install Missing Dependencies
```bash
npm install @radix-ui/react-progress class-variance-authority
```

### Step 3: Test API Endpoints
```bash
# Get all challenges
curl http://localhost:3000/api/challenges

# Get user's challenges (requires auth token)
curl http://localhost:3000/api/challenges/mine \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Next Steps to Complete Integration

### 1. Create Challenges Page (`app/challenges/page.tsx`)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Challenge } from '@/types/challenges'
import { ChallengeCard } from '@/components/challenges/ChallengeCard'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadChallenges()
  }, [])

  async function loadChallenges() {
    try {
      const response = await fetch('/api/challenges')
      const data = await response.json()
      setChallenges(data.challenges || [])
    } catch (error) {
      console.error('Failed to load challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoinChallenge(challengeId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        alert(result.message)
        router.push('/dashboard')
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Failed to join challenge:', error)
      alert('Failed to join challenge')
    }
  }

  if (loading) return <div>Loading challenges...</div>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Money Challenges</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onJoin={handleJoinChallenge}
          />
        ))}
      </div>
    </div>
  )
}
```

### 2. Add Challenges Widget to Dashboard

Update `app/dashboard/page.tsx`:

```typescript
// Add to imports
import { ActiveChallengeTracker } from '@/components/challenges/ActiveChallengeTracker'
import { ActiveChallengeView } from '@/types/challenges'

// Add state
const [activeChallenges, setActiveChallenges] = useState<ActiveChallengeView[]>([])

// Add function to load challenges
async function loadActiveChallenges() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch('/api/challenges/mine', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    const data = await response.json()
    setActiveChallenges(data.challenges || [])
  } catch (error) {
    console.error('Failed to load challenges:', error)
  }
}

// Call in useEffect
useEffect(() => {
  loadActiveChallenges()
}, [])

// Add check-in handler
async function handleCheckIn(challengeId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch(`/api/challenges/${challengeId}/progress`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        completed: true,
        checkin_date: new Date().toISOString().split('T')[0]
      })
    })

    const result = await response.json()
    if (result.success) {
      alert(result.message)
      loadActiveChallenges() // Refresh
    }
  } catch (error) {
    console.error('Check-in failed:', error)
  }
}

// Add to JSX (in dashboard grid)
<div className="col-span-full">
  <h2 className="text-xl font-bold mb-4">🎯 Active Challenges</h2>
  {activeChallenges.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {activeChallenges.map(challenge => (
        <ActiveChallengeTracker
          key={challenge.id}
          challenge={challenge}
          onCheckIn={handleCheckIn}
        />
      ))}
    </div>
  ) : (
    <div className="text-center p-8 bg-gray-50 rounded-lg">
      <p className="text-gray-600 mb-4">No active challenges yet!</p>
      <a href="/challenges" className="text-primary hover:underline">
        Browse challenges →
      </a>
    </div>
  )}
</div>
```

### 3. Add Navigation Link

Update your navbar to include:
```tsx
<Link href="/challenges">Challenges</Link>
```

---

## 🔄 Hybrid Tracking Implementation

### Manual Tracking (Self-Reported)
Already implemented! Users click "Check In Today" button.

### Automatic Tracking (Transaction-Based)
To implement later, add this logic in the API:

```typescript
// In app/api/challenges/[id]/progress/route.ts
// After user adds a transaction, check if they have active challenges

export async function checkTransactionChallenges(userId: string, transactionDate: string) {
  const { data: activeChallenges } = await supabase
    .from('user_challenges')
    .select('*, challenges(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .eq('challenges.validation_method', 'automatic')
  
  for (const challenge of activeChallenges || []) {
    // Auto-check if transaction exists for today
    const { data: transaction } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .gte('date', transactionDate)
      .single()
    
    if (transaction) {
      // Auto-create progress entry
      await supabase.from('challenge_progress').insert({
        user_challenge_id: challenge.id,
        progress_type: 'daily_checkin',
        checkin_date: transactionDate,
        completed: true,
        transaction_id: transaction.id
      })
    }
  }
}
```

---

## 🎮 Tiered Failure System

Already implemented in database triggers! Here's how it works:

### Flexible Challenges
- Duration: 7 days
- Required: 5 check-ins (any 5 days)
- **Failure**: Only if deadline passes without 5 check-ins
- **Grace period**: 24 hours to mark yesterday
- **Partial points**: Yes (60% for 3/5 days)

### Streak Challenges
- Required: 7 consecutive days
- **Failure**: Miss 1 day = streak broken
- **Grace period**: 6 hours (can mark earlier today)
- **Partial points**: No (defeats the purpose of streaks)

### Time-Bound Challenges
- Specific days: e.g., Saturday-Sunday
- **Failure**: End of last day without all check-ins
- **Grace period**: 24 hours after last day
- **Partial points**: Yes (50% for 1/2 days)

---

## 📊 Testing the System

### Test Scenario 1: Join and Complete Challenge
1. Go to `/challenges`
2. Join "Cook at Home 5 Times This Week"
3. Go to `/dashboard` - see it in active challenges
4. Click "Check In Today" - see progress update (1/5 = 20%)
5. Repeat for 5 days
6. On 5th check-in - see "Challenge Complete! 100 points earned"

### Test Scenario 2: Missed Check-In (Grace Period)
1. Join "No-Spend Weekend" on Friday
2. Saturday: Don't check in
3. Sunday: App allows marking Saturday retroactively
4. Mark both days → Challenge complete!

### Test Scenario 3: Partial Completion
1. Join "Cook at Home 5 Times"
2. Check in 3 times
3. Let deadline pass
4. Check database: `partial_completion_percent = 60%`
5. Points earned: 60 points (60% of 100)

### Test Scenario 4: Streak Break
1. Join "Log Expenses 7 Days in a Row"
2. Check in Days 1-4 ✅✅✅✅
3. Miss Day 5 ❌
4. After midnight: Status auto-changes to "failed"
5. Can immediately rejoin and start fresh

---

## 🔔 Future Enhancements

### 1. Push Notifications
```typescript
// Send reminder at 8pm
// "Did you complete today's challenge? 🎯"

// Send warning if missed yesterday
// "You forgot to check in! Mark it before midnight"
```

### 2. Social Features
- Share challenge completions
- Challenge friends
- Group challenges

### 3. Smarter Challenges
- AI-generated personalized challenges
- Based on user's spending patterns
- Adaptive difficulty

### 4. Gamification
- Achievement badges
- Leaderboards
- Challenge streaks across different challenges
- Seasonal/special event challenges

---

## 📝 Summary

**What's Done**:
✅ Database schema with triggers
✅ API endpoints (list, join, progress, abandon)
✅ TypeScript types
✅ UI components (ChallengeCard, ActiveChallengeTracker)
✅ 5 starter challenges seeded
✅ Hybrid tracking architecture
✅ Tiered failure system

**What's Left**:
⏳ Create `/challenges` page
⏳ Add widget to dashboard
⏳ Install missing dependencies
⏳ Run database migration in Supabase
⏳ Test the full flow

**Estimated Time to Complete**: 1-2 hours

**Priority**: High (core gamification feature)

---

Let me know when you're ready to complete the integration!
