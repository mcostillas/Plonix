# Challenges System Design

## Problem Statement
How do we track user participation and progress in financial challenges when most challenges are based on user behavior that's hard to verify automatically?

## Solution: Hybrid Tracking System

### Challenge Types

1. **Self-Reported Challenges**
   - User manually confirms completion
   - Honor system based
   - Examples: "No-spend weekend", "Cook at home 5 times"

2. **Transaction-Based Challenges**
   - Automatically validated using transaction data
   - Examples: "Save ₱5000 this month", "Spend less than ₱500 on food"

3. **Streak Challenges**
   - Track consecutive days of behavior
   - Examples: "Log expenses for 7 days", "Save daily for 30 days"

---

## Database Schema

### Table: `challenges`
Defines all available challenges

```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'savings', 'budgeting', 'discipline', etc.
  
  -- Challenge mechanics
  type TEXT NOT NULL, -- 'self_reported' | 'transaction_based' | 'streak'
  validation_method TEXT NOT NULL, -- 'manual' | 'automatic'
  duration_days INTEGER NOT NULL, -- How many days to complete
  difficulty TEXT, -- 'easy', 'medium', 'hard'
  
  -- Requirements (JSON)
  requirements JSONB, -- {target_amount: 5000, frequency: 'daily'}
  
  -- Rewards
  points INTEGER DEFAULT 0,
  badge_icon TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `user_challenges`
Tracks user participation in challenges

```sql
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  challenge_id UUID REFERENCES challenges(id) NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'failed', 'abandoned'
  progress INTEGER DEFAULT 0, -- 0-100 percentage
  
  -- Dates
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ, -- joined_at + duration_days
  
  -- Progress tracking (JSON)
  progress_data JSONB DEFAULT '{}', -- Store daily checkmarks, amounts, etc.
  
  -- Results
  points_earned INTEGER DEFAULT 0,
  
  UNIQUE(user_id, challenge_id, joined_at::date) -- One challenge per day
);
```

### Table: `challenge_progress`
Logs individual check-ins or milestones

```sql
CREATE TABLE challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_challenge_id UUID REFERENCES user_challenges(id) NOT NULL,
  
  -- Progress entry
  progress_type TEXT, -- 'daily_checkin', 'milestone', 'completion'
  completed BOOLEAN DEFAULT FALSE,
  note TEXT, -- User's note about today's progress
  
  -- Data
  value NUMERIC, -- Amount saved, number of meals cooked, etc.
  metadata JSONB, -- Extra data
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Example Challenge Definitions

### 1. No-Spend Weekend (Self-Reported)
```json
{
  "id": "no-spend-weekend",
  "title": "No-Spend Weekend Challenge",
  "description": "Try not to spend any money this Saturday and Sunday!",
  "type": "self_reported",
  "validation_method": "manual",
  "duration_days": 2,
  "difficulty": "medium",
  "requirements": {
    "days": ["Saturday", "Sunday"],
    "spending_limit": 0
  },
  "points": 50
}
```

**User Flow**:
1. User joins challenge on Friday
2. App shows: "Starting tomorrow! Remember: No spending on Sat/Sun"
3. Sunday evening: App asks "Did you complete the challenge?"
4. User clicks "Yes, I did it!" or "No, I spent money"
5. Award points if yes

---

### 2. Save ₱5000 This Month (Transaction-Based)
```json
{
  "id": "save-5k-monthly",
  "title": "Save ₱5,000 This Month",
  "description": "Set aside ₱5,000 from your income this month",
  "type": "transaction_based",
  "validation_method": "automatic",
  "duration_days": 30,
  "difficulty": "hard",
  "requirements": {
    "target_amount": 5000,
    "transaction_category": "savings"
  },
  "points": 100
}
```

**User Flow**:
1. User joins challenge
2. System tracks all transactions marked as "Savings"
3. Progress bar shows: "₱2,300 / ₱5,000 saved (46%)"
4. At end of 30 days: Check if total savings ≥ ₱5000
5. Auto-complete if target reached

---

### 3. Log Expenses for 7 Days (Streak)
```json
{
  "id": "7-day-expense-streak",
  "title": "7-Day Expense Tracking Streak",
  "description": "Log at least one expense every day for 7 days straight",
  "type": "streak",
  "validation_method": "automatic",
  "duration_days": 7,
  "difficulty": "easy",
  "requirements": {
    "consecutive_days": 7,
    "min_transactions_per_day": 1
  },
  "points": 70
}
```

**User Flow**:
1. User joins challenge
2. System checks daily: Did user add transaction today?
3. UI shows: "🔥 4 day streak! Keep going!"
4. If user misses a day: Streak breaks, challenge fails
5. Complete all 7 days: Success!

---

## Implementation Strategy

### Phase 1: Self-Reported Challenges (MVP)
**Why start here?**
- Easiest to implement
- Works without transaction system
- Teaches users about challenges
- Builds habit of checking in

**Examples to implement first**:
- "No-Spend Weekend"
- "Cook at Home 5 Times This Week"
- "Skip Coffee Shop for 5 Days"
- "Pack Lunch for Work 3 Days"

**UI Flow**:
```
1. Challenges Page → Browse challenges
2. Click "Join Challenge" → Challenge starts
3. Daily: Open app → See reminder
4. Check-in: "Did you do it today?" → Mark yes/no
5. Complete all check-ins → Earn points + badge
```

---

### Phase 2: Transaction-Based Challenges
**Prerequisites**:
- Users must be logging transactions regularly
- Need transaction categorization
- Need savings tracking

**Examples**:
- "Save ₱5000 This Month"
- "Spend Less Than ₱3000 on Food"
- "Reduce Shopping by 20%"

---

### Phase 3: Streak Challenges
**Prerequisites**:
- User activity tracking
- Daily engagement features

**Examples**:
- "Log Expenses 7 Days Straight"
- "Check Budget Daily for 14 Days"
- "Save Something Every Day for 30 Days"

---

## API Endpoints Needed

### 1. Get Available Challenges
```typescript
GET /api/challenges
Response: Challenge[]
```

### 2. Join Challenge
```typescript
POST /api/challenges/:id/join
Response: UserChallenge
```

### 3. Get My Active Challenges
```typescript
GET /api/challenges/mine
Response: UserChallenge[]
```

### 4. Update Challenge Progress (Self-Reported)
```typescript
POST /api/challenges/:userChallengeId/progress
Body: {
  completed: boolean,
  note: string,
  value?: number
}
Response: ChallengeProgress
```

### 5. Complete Challenge
```typescript
POST /api/challenges/:userChallengeId/complete
Response: {
  success: boolean,
  points_earned: number,
  badge_earned?: Badge
}
```

---

## UI Components Needed

### 1. Challenge Card
```tsx
<ChallengeCard
  title="No-Spend Weekend"
  description="Try not to spend..."
  difficulty="medium"
  points={50}
  duration="2 days"
  participants={234}
  onJoin={() => joinChallenge(id)}
/>
```

### 2. Active Challenge Tracker
```tsx
<ActiveChallengeTracker
  title="No-Spend Weekend"
  progress={50} // 1 out of 2 days
  daysLeft={1}
  checkIns={[
    { day: 'Saturday', completed: true, note: 'Stayed home!' }
  ]}
  onCheckIn={() => markDayComplete()}
/>
```

### 3. Challenge Progress Modal
```tsx
<ChallengeCheckInModal
  challenge={challenge}
  today="Sunday"
  question="Did you avoid spending money today?"
  onSubmit={(completed, note) => submitProgress(completed, note)}
/>
```

---

## Dashboard Integration

### Challenges Widget
Show on main dashboard:

```tsx
<div className="challenges-summary">
  <h3>Active Challenges</h3>
  <div className="active-challenges">
    {activeChallenges.map(challenge => (
      <ChallengeProgressBar
        key={challenge.id}
        title={challenge.title}
        progress={challenge.progress}
        daysLeft={challenge.daysLeft}
      />
    ))}
  </div>
  <Button href="/challenges">View All Challenges</Button>
</div>
```

**Display**:
- 🔥 2 Active Challenges
- "No-Spend Weekend" - Day 1/2 complete
- "7-Day Expense Streak" - 🔥 4 days

---

## Gamification Elements

### Points System
- Easy challenges: 25-50 points
- Medium challenges: 50-100 points
- Hard challenges: 100-200 points

### Badges
- **First Challenge** - Complete any challenge
- **Weekend Warrior** - Complete 5 no-spend weekends
- **Savings Master** - Save ₱50,000 total through challenges
- **Streak King** - 30-day streak in any challenge

### Leaderboard (Optional)
Show top challenge completers:
1. Marc - 1,250 points (12 challenges)
2. Shayne - 980 points (9 challenges)
3. ...

---

## Answering Your Concerns

### "How do we track if users actually do the challenge?"

**For MVP (Phase 1): We don't strictly verify**
- Use honor system
- Trust users to self-report
- Focus on building the HABIT of checking in
- **Why it's OK**: Users who cheat are only cheating themselves

**For Later (Phase 2): Automatic validation**
- Use transaction data for financial challenges
- Use app activity for engagement challenges
- Use banking API integrations (future) for savings validation

### "Won't users just lie?"

**Honest answer: Yes, some will**

But consider:
1. **Most users won't** - They're using Plounix to improve, not to fake it
2. **Fake progress = fake learning** - They gain nothing
3. **Real motivation** - Points/badges are just nudges, not the main goal
4. **Community pressure** - If you add social features later, peer accountability helps

**Netflix analogy**: Netflix trusts you clicked "I'm still watching". They don't verify. But you're only lying to yourself if you mark episodes watched without watching.

---

## Challenge Failure & Grace Period System

### The Problem
**What happens if a user forgets to check in or doesn't feel like it?**

Options:
1. **Soft Failure** - Challenge stays active, user can catch up
2. **Hard Failure** - Miss check-in = automatic failure
3. **Flexible Window** - Grace period before marking as failed

---

### Recommended: Tiered Failure System

Different challenge types have different rules:

#### Type 1: **Flexible Challenges** (Most Forgiving)
Goal-based challenges where timing is flexible

**Example**: "Cook at Home 5 Times This Week"
- Duration: 7 days
- Required: 5 check-ins (any 5 days)
- **Failure rule**: Only fails if deadline passes without 5 check-ins
- User can miss days and catch up

```typescript
{
  type: "flexible",
  duration_days: 7,
  required_checkins: 5,
  grace_period_hours: 24, // Can mark yesterday
  failure_condition: "deadline_passed_without_completion"
}
```

**Status Flow**:
- Days 1-6: User has 3 check-ins → Status: "active" (⚠️ Behind pace)
- Day 7: User has 3 check-ins → Status: "failed" (didn't reach 5)
- Day 7: User has 5+ check-ins → Status: "completed" ✅

---

#### Type 2: **Streak Challenges** (Strict)
Consecutive day challenges that break if missed

**Example**: "Log Expenses 7 Days in a Row"
- Duration: Until 7 consecutive days achieved
- Required: 1 check-in per day, no gaps
- **Failure rule**: Miss 1 day = streak breaks = challenge fails

```typescript
{
  type: "streak",
  required_consecutive_days: 7,
  max_missed_days: 0,
  grace_period_hours: 6, // Can mark earlier today until 6am next day
  failure_condition: "streak_broken"
}
```

**Status Flow**:
- Days 1-4: Check-ins ✅✅✅✅ → Status: "active" (4-day streak)
- Day 5: No check-in → Status: "failed" (streak broken)
- User can immediately rejoin and restart

---

#### Type 3: **Time-Bound Challenges** (Medium Strict)
Must be done within specific timeframe

**Example**: "No-Spend Weekend"
- Duration: 2 specific days (Sat-Sun)
- Required: 2 check-ins (one per day)
- **Failure rule**: End of Sunday with incomplete check-ins = failed

```typescript
{
  type: "time_bound",
  specific_days: ["Saturday", "Sunday"],
  grace_period_hours: 24, // Can mark yesterday until midnight
  reminder_hours: [20], // Remind at 8pm each day
  failure_condition: "deadline_passed"
}
```

**Status Flow**:
- Saturday 8pm: Reminder "Did you spend money today?"
- Sunday 11pm: Reminder "Last chance to mark Saturday!"
- Monday 12:01am: If incomplete → Status: "failed"

---

### Grace Period Rules

**24-Hour Retroactive Check-In**
Users can mark previous day until midnight next day

**Example**: No-Spend Weekend
- Saturday: User forgets to check in
- Sunday 6pm: App shows "You forgot Saturday! Mark it now?"
- User can click:
  - ✅ "Yes, I did it" → Marks Saturday as complete
  - ❌ "No, I failed" → Marks Saturday as incomplete
  - 🔕 Ignore → Monday at 12am it auto-marks as incomplete

**Why 24 hours?**
- Life happens - people forget
- Reduces frustration
- Still maintains accountability (can't fake it days later)

---

### Notification Strategy

**Reminder Flow**:

1. **Daily Reminder** (Challenge Active)
   - Time: 8pm local time
   - Message: "Did you complete today's challenge? 🎯"
   - Action: Open check-in modal

2. **Missed Check-In Warning** (Next Day)
   - Time: 10am next day (if yesterday not marked)
   - Message: "You forgot to check in yesterday! You have until midnight to mark it."
   - Action: Open retroactive check-in

3. **Final Warning** (Before Failure)
   - Time: 11pm on deadline day
   - Message: "⚠️ Last chance! Mark your challenge before midnight or it will be marked as failed."
   - Action: Emergency check-in

4. **Challenge Failed** (After Deadline)
   - Time: After grace period expires
   - Message: "Challenge ended. You completed 3/5 days. Want to try again?"
   - Action: Rejoin challenge

---

### Auto-Termination Rules

**When challenges automatically fail**:

1. **Deadline Passed** + **Incomplete**
   - Flexible challenge: Didn't meet required check-ins by deadline
   - Time-bound challenge: Specific days passed without all check-ins

2. **Streak Broken**
   - Streak challenge: Missed a consecutive day
   - No grace period for streaks (defeats the purpose)

3. **Manual Abandonment**
   - User clicks "Abandon Challenge"
   - Confirmation modal: "Are you sure? Your progress will be lost."

4. **Inactivity** (Optional - Use with caution)
   - No check-ins for 3+ days beyond deadline
   - Auto-mark as "abandoned"
   - **Note**: Only for challenges user hasn't touched at all

**When challenges DON'T fail**:

1. **Ongoing Streak** (No deadline)
   - User has active streak → Never auto-terminates
   - Only fails if they miss a day

2. **Within Grace Period**
   - Deadline passed but within 24-hour grace
   - User can still save the challenge

3. **Partial Completion** (Optional: Save progress)
   - User completed 4/5 days
   - Option 1: Mark as "incomplete" but save partial points
   - Option 2: Mark as "failed" with 0 points
   - **Recommended**: Option 1 (more encouraging)

---

### Partial Completion Rewards

**Encourage effort, even if not fully complete**

**Example**: "Cook at Home 5 Times This Week"
- Full completion (5/5): 100 points
- Partial completion:
  - 4/5 days: 60 points (60% reward)
  - 3/5 days: 30 points (30% reward)
  - 2/5 days: 10 points (10% reward)
  - 1/5 days: 0 points (too low)

**Benefits**:
- Reduces "all or nothing" frustration
- Encourages users to keep trying
- Progress isn't wasted

**UI**:
```
Challenge Result: Incomplete
You completed 4 out of 5 days - Great effort!
Earned: 60 points (60% of full reward)
Want to try again? [Join Challenge]
```

---

### Database Schema Update

Add failure tracking fields:

```sql
ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS
  failure_reason TEXT, -- 'deadline_passed', 'streak_broken', 'abandoned', 'inactive'
  partial_completion_percent INTEGER DEFAULT 0, -- 0-100
  can_retry BOOLEAN DEFAULT TRUE,
  retry_count INTEGER DEFAULT 0,
  last_reminder_sent_at TIMESTAMPTZ;
```

---

### Example Scenarios

#### Scenario 1: Flexible Challenge with Catch-Up
**Challenge**: "Cook at Home 5 Times This Week"

- **Monday**: Check-in ✅ (1/5)
- **Tuesday**: Forgot ❌
- **Wednesday**: Notification: "You missed yesterday! Catch up today?"
- **Wednesday**: Check-in ✅ for both Tue & Wed (3/5)
- **Thursday**: Check-in ✅ (4/5)
- **Friday**: Check-in ✅ (5/5) → **Complete!** 100 points

**Result**: Success despite missing initial check-in

---

#### Scenario 2: Streak Challenge Break
**Challenge**: "Log Expenses 7 Days in a Row"

- **Days 1-4**: Check-ins ✅✅✅✅ (4-day streak)
- **Day 5**: No check-in ❌
- **Day 5, 11pm**: Notification: "You're about to lose your streak!"
- **Day 6, 12:01am**: Auto-failed → "Streak broken. Challenge failed."

**Options**:
- [Try Again] → Rejoin and start fresh 7-day streak
- [View Other Challenges] → Browse alternatives

**Result**: Failed due to missed day

---

#### Scenario 3: Partial Completion
**Challenge**: "No-Spend Weekend"

- **Saturday**: Check-in ✅ (no spending)
- **Sunday**: Forgot to check in
- **Monday 12:01am**: Grace period expired → Auto-marked as incomplete

**Result**: Partial completion
- Completed: 1/2 days (50%)
- Earned: 25 points (50% of full 50 points)
- Badge: "Weekend Saver Bronze" (partial completion badge)

**Message**: "You did great on Saturday! Try again next weekend?"

---

## Recommendation: Start Simple

### Month 1: Flexible Challenges Only
- Use grace periods
- Award partial completion points
- Send daily reminders
- Allow retroactive check-ins (24 hours)

**Why?**
- Test if users even WANT challenges
- Learn what types they prefer
- Build the habit loop
- Gather feedback
- Reduce early frustration

### Month 2-3: Add Transaction Validation
- Once users are logging transactions regularly
- Add automatic savings challenges
- More accurate progress tracking

### Month 4+: Advanced Features
- Streak challenges
- Social challenges (compete with friends)
- AI-generated personalized challenges
- Banking API integration for real-time verification

---

## Next Steps

1. **Design 5 starter challenges** (self-reported)
2. **Create database tables** (challenges, user_challenges, challenge_progress)
3. **Build API endpoints** (list, join, progress, complete)
4. **Create UI components** (challenge cards, progress tracker)
5. **Add to dashboard** (show active challenges widget)
6. **Test with real users** (you, your classmates)

Would you like me to start implementing the database schema and API endpoints for Phase 1 (self-reported challenges)?
