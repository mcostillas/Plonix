# Phase 3: Smart Notifications & User Preferences - Implementation Guide

## ✅ What's Been Built

### 1. **Notification Preferences Page** 
**File:** `app/notifications/settings/page.tsx`

Beautiful settings page where users can:
- Toggle each notification type on/off
- Choose bill reminder timing (1, 3, or 7 days)
- See their current settings
- Save preferences to database

**How to access:**
- Navigate to `/notifications/settings`
- Or link from profile page

### 2. **Smart Notification Triggers**
**File:** `lib/smart-notification-triggers.ts`

Six intelligent trigger functions:

#### a) **Budget Alerts**
```typescript
SmartTriggers.checkBudgetAlert(user_id, spent, budget, threshold)
```
- Sends alert when user reaches 90% of budget
- Only one per month (no spam)
- Respects user preferences

#### b) **Learning Prompts**
```typescript
SmartTriggers.checkLearningPrompt(user_id, daysSinceLastVisit, threshold)
```
- Reminds users to learn if inactive 5+ days
- Suggests random learning module
- Only one per week

#### c) **Goal Milestones**
```typescript
SmartTriggers.checkGoalMilestone(user_id, goal_name, current, target, goal_id)
```
- Celebrates progress at 50%, 75%, 90%, 100%
- Only sends once per milestone
- Personalized messages

#### d) **Challenge Completions**
```typescript
SmartTriggers.notifyChallengeComplete(user_id, challenge_name, challenge_id, reward_points)
```
- Instant notification when challenge done
- Shows points earned
- Encourages continued participation

#### e) **First Transaction**
```typescript
SmartTriggers.notifyFirstTransaction(user_id)
```
- Celebrates user's first transaction
- Only sent once ever
- Warm welcome message

#### f) **Bill Reminders**
```typescript
SmartTriggers.sendBillReminder(user_id, bill_name, amount, due_day, days_until, bill_id)
```
- Automatic reminders X days before due
- Respects user's preferred timing
- One per bill per month

### 3. **Motivational Modal**
**File:** `components/MotivationalModal.tsx`

Beautiful popup modal that:
- Shows when user inactive 5+ days
- Suggests a learning module
- 30% random chance (not annoying)
- Won't show again for 24 hours
- Respects user preferences
- Links to Learning Hub

**Hook included:**
```typescript
const { showModal, closeModal } = useMotivationalModal(userId, daysSinceLastVisit)
```

---

## 🔧 How to Integrate Smart Triggers

### Example 1: Budget Alert (in Transaction Page)

**File:** `app/transactions/page.tsx`

```typescript
import { SmartTriggers } from '@/lib/smart-notification-triggers'

// After user adds a transaction
async function handleAddTransaction(transaction) {
  // ... save transaction ...
  
  // Calculate monthly spending
  const monthlySpent = await calculateMonthlySpending(user.id)
  const monthlyBudget = 10000 // Get from user settings
  
  // Check if budget alert needed
  await SmartTriggers.checkBudgetAlert(
    user.id,
    monthlySpent,
    monthlyBudget,
    90 // Alert at 90%
  )
}
```

### Example 2: Goal Milestone (in Goals Page)

**File:** `app/goals/page.tsx`

```typescript
import { SmartTriggers } from '@/lib/smart-notification-triggers'

// After user updates goal progress
async function handleUpdateProgress(goalId, amount) {
  // ... update goal ...
  
  const updatedGoal = await fetchGoal(goalId)
  
  // Check for milestone achievements
  await SmartTriggers.checkGoalMilestone(
    user.id,
    updatedGoal.name,
    updatedGoal.current_amount,
    updatedGoal.target_amount,
    goalId
  )
}
```

### Example 3: Challenge Completion (in Challenges Page)

**File:** `app/challenges/page.tsx`

```typescript
import { SmartTriggers } from '@/lib/smart-notification-triggers'

// When user completes a challenge
async function handleCompleteChallenge(challengeId) {
  // ... mark challenge complete ...
  
  const challenge = await fetchChallenge(challengeId)
  
  // Send celebration notification
  await SmartTriggers.notifyChallengeComplete(
    user.id,
    challenge.name,
    challengeId,
    challenge.reward_points
  )
}
```

### Example 4: First Transaction Celebration

**File:** `components/AddTransactionModal.tsx`

```typescript
import { SmartTriggers } from '@/lib/smart-notification-triggers'

// After user adds their first transaction
async function handleAddTransaction(transaction) {
  // ... save transaction ...
  
  // Check if this is first transaction
  const transactionCount = await countUserTransactions(user.id)
  
  if (transactionCount === 1) {
    await SmartTriggers.notifyFirstTransaction(user.id)
  }
}
```

### Example 5: Learning Prompt (in Dashboard)

**File:** `app/dashboard/page.tsx`

```typescript
import { SmartTriggers } from '@/lib/smart-notification-triggers'

// Check on dashboard load
useEffect(() => {
  async function checkLearningPrompt() {
    // Calculate days since last learning visit
    const lastVisit = await getLastLearningVisit(user.id)
    const daysSince = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    
    await SmartTriggers.checkLearningPrompt(user.id, daysSince, 5)
  }
  
  checkLearningPrompt()
}, [user])
```

### Example 6: Motivational Modal (in Dashboard)

**File:** `app/dashboard/page.tsx`

```typescript
import { MotivationalModal, useMotivationalModal } from '@/components/MotivationalModal'

export default function DashboardPage() {
  const { user } = useAuth()
  
  // Calculate days since last learning visit
  const [daysSinceLastVisit, setDaysSinceLastVisit] = useState(0)
  
  useEffect(() => {
    async function calculateDays() {
      const lastVisit = await getLastLearningVisit(user.id)
      const days = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      setDaysSinceLastVisit(days)
    }
    calculateDays()
  }, [user])
  
  // Use the modal hook
  const { showModal, closeModal } = useMotivationalModal(user?.id, daysSinceLastVisit)
  
  return (
    <div>
      {/* Your dashboard content */}
      
      {/* Motivational Modal */}
      {showModal && (
        <MotivationalModal
          userId={user!.id}
          daysSinceLastVisit={daysSinceLastVisit}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
```

---

## 🎨 Add Link to Settings Page

### In Profile Page

**File:** `app/profile/page.tsx`

Add a button to notification settings:

```typescript
<Link href="/notifications/settings">
  <Button variant="outline" className="w-full">
    <Bell className="w-4 h-4 mr-2" />
    Notification Settings
  </Button>
</Link>
```

### In Navbar Dropdown

**File:** `components/ui/navbar.tsx`

Add menu item:

```typescript
<Link href="/notifications/settings">
  <Button variant="ghost" size="sm" className="w-full justify-start">
    <Bell className="w-4 h-4 mr-2" />
    Notifications
  </Button>
</Link>
```

---

## 📊 Tracking Last Activity

To make smart triggers work, track user activity:

### Track Learning Hub Visits

**File:** `app/learning/page.tsx`

```typescript
useEffect(() => {
  async function trackVisit() {
    const { supabase } = await import('@/lib/supabase')
    
    // Store last visit timestamp
    await supabase
      .from('user_activity')
      .upsert({
        user_id: user.id,
        last_learning_visit: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
  }
  
  trackVisit()
}, [user])
```

### Create user_activity Table (Optional)

```sql
CREATE TABLE user_activity (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_learning_visit TIMESTAMPTZ,
  last_dashboard_visit TIMESTAMPTZ,
  last_transaction_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own activity"
  ON user_activity FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🧪 Testing Phase 3 Features

### Test Notification Preferences Page

1. Navigate to `/notifications/settings`
2. Toggle each notification type
3. Change bill reminder timing
4. Click "Save Preferences"
5. Verify toast confirmation
6. Refresh page → Settings should persist

### Test Smart Triggers

**Budget Alert:**
```typescript
// In browser console or test file
await SmartTriggers.checkBudgetAlert('user-id', 9500, 10000, 90)
// Check notification bell for budget alert
```

**Goal Milestone:**
```typescript
await SmartTriggers.checkGoalMilestone(
  'user-id',
  'Laptop Fund',
  18000,
  20000,
  'goal-id'
)
// Should send "Almost There! 90%" notification
```

**Learning Prompt:**
```typescript
await SmartTriggers.checkLearningPrompt('user-id', 7, 5)
// Should send learning reminder
```

### Test Motivational Modal

1. Set last learning visit to 6+ days ago
2. Visit dashboard
3. Modal should appear (30% chance)
4. Click "Maybe Later" → Won't show for 24 hours
5. Click "Let's Learn" → Navigates to Learning Hub

---

## 🎯 Smart Trigger Best Practices

### 1. **Don't Spam Users**
✅ One budget alert per month
✅ One learning prompt per week
✅ One milestone per goal achievement
❌ Don't send duplicates

### 2. **Respect Preferences**
✅ Always check if notification type is enabled
✅ Use user's preferred timing
❌ Don't send if user disabled that type

### 3. **Personalize Messages**
✅ Use user's name, goal names, amounts
✅ Contextual information
❌ Generic messages

### 4. **Test Thoroughly**
✅ Test each trigger in isolation
✅ Test preference checks
✅ Test duplicate prevention

---

## 🚀 Deployment Checklist

### Phase 2 (Prerequisite)
- [ ] Run `notifications-schema.sql` in Supabase
- [ ] Verify tables exist
- [ ] Test notification bell works

### Phase 3
- [ ] Deploy notification settings page
- [ ] Deploy smart triggers utility
- [ ] Deploy motivational modal
- [ ] Add links to settings page
- [ ] Integrate triggers in relevant pages
- [ ] Test all triggers
- [ ] Monitor notification delivery

---

## 📈 Success Metrics

Track these to measure Phase 3 success:

### User Engagement
- **Settings page visits** - Are users customizing?
- **Preference changes** - What do they enable/disable?
- **Modal click-through** - Do users click "Let's Learn"?

### Notification Effectiveness
- **Budget alerts** - Do they reduce overspending?
- **Learning prompts** - Do they increase Learning Hub visits?
- **Goal milestones** - Do they motivate continued saving?

### User Satisfaction
- **Opt-out rate** - How many disable notifications?
- **Support tickets** - Complaints about notifications?
- **User feedback** - Do they find them helpful?

---

## 🐛 Troubleshooting

### Settings Not Saving
- Check Supabase connection
- Verify RLS policies
- Check browser console for errors
- Verify user is authenticated

### Triggers Not Firing
- Check if preferences are enabled
- Verify trigger conditions met
- Check duplicate prevention logic
- Look for errors in server logs

### Modal Not Showing
- Check localStorage for last shown time
- Verify learning prompts enabled
- Check days since last visit calculation
- Remember: 30% random chance

### TypeScript Errors
- Expected until database tables exist
- Run Phase 2 SQL schema first
- Restart TypeScript server if needed

---

## 🎉 Phase 3 Complete!

You now have:
✅ User-controlled notification preferences
✅ 6 smart notification triggers
✅ Motivational modal for engagement
✅ Respects user preferences
✅ No spam (intelligent timing)
✅ Personalized messages

**Next:** Integrate triggers into your pages and watch engagement soar!

---

**Questions? Need help integrating? Check the examples above!**
