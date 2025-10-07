# Challenge Cancellation Feature

## Overview
Added the ability for users to cancel/abandon active challenges with partial points rewards based on progress.

## Implementation Date
October 7, 2025

## Features Added

### 1. Cancel Challenge Functionality
- Users can cancel any active challenge they've joined
- Partial points are awarded based on progress percentage (if enabled)
- Confirmation modal prevents accidental cancellations
- Success modal shows points earned from partial completion

### 2. User Interface Changes

#### Dashboard Page (`app/dashboard/page.tsx`)
- **Cancel Button**: Added small X button next to each active challenge progress percentage
- **Hover Effect**: Button becomes red on hover to indicate destructive action
- **Modal Integration**: Cancel confirmation and success modals integrated

#### Challenges Page (`app/challenges/page.tsx`)
- **Button Layout**: "Challenge Joined" button now shares space with "Cancel" button
- **Visual Design**: Two-button layout with joined status and cancel option
- **Modal Integration**: Cancel confirmation and success modals integrated

### 3. New Modal Components

#### `CancelChallengeModal` (in `confirmation-modal.tsx`)
- Orange warning theme (less severe than delete)
- Shows challenge title
- Warning: "This action cannot be undone"
- Info: "You may earn partial points based on your current progress"
- Loading state during cancellation
- Buttons: "Keep Challenge" | "Yes, Cancel It"

#### `ChallengeCanceledModal` (in `success-modal.tsx`)
- Green success theme
- Shows partial points earned (if any)
- Messages:
  - With points: "You earned X points for your progress! Try again when you're ready."
  - Without points: "Challenge canceled. Try again when you're ready!"

## API Integration

### Endpoint Used
- `POST /api/challenges/[user_challenge_id]/abandon`
- Returns: `{ success, partialPoints, message }`

### Backend Logic
1. Verifies user owns the challenge
2. Calculates partial points based on `progress_percent` and `points_partial_enabled`
3. Updates challenge status to 'abandoned'
4. Records `failed_at`, `failure_reason: 'manual_abandonment'`, `partial_completion_percent`
5. Awards `points_earned` based on partial completion

## State Management

### Dashboard Page
```typescript
const [cancelModalOpen, setCancelModalOpen] = useState(false)
const [cancelingChallengeId, setCancelingChallengeId] = useState<string | null>(null)
const [cancelingChallengeTitle, setCancelingChallengeTitle] = useState('')
const [canceledModalOpen, setCanceledModalOpen] = useState(false)
const [partialPointsEarned, setPartialPointsEarned] = useState<number>(0)
const [isCanceling, setIsCanceling] = useState(false)
```

### Challenges Page
```typescript
const [userChallengeMap, setUserChallengeMap] = useState<{[key: string]: string}>({})
const [cancelModalOpen, setCancelModalOpen] = useState(false)
const [cancelingChallengeId, setCancelingChallengeId] = useState<string | null>(null)
const [cancelingChallengeTitle, setCancelingChallengeTitle] = useState('')
const [canceledModalOpen, setCanceledModalOpen] = useState(false)
const [partialPointsEarned, setPartialPointsEarned] = useState<number>(0)
const [isCanceling, setIsCanceling] = useState(false)
```

## User Flow

### From Dashboard
1. User sees active challenge with X button
2. Click X button → Cancel Confirmation Modal appears
3. Modal shows challenge title and warning about partial points
4. User clicks "Yes, Cancel It"
5. Button shows "Canceling..." loading state
6. API call to abandon endpoint
7. Success Modal appears showing points earned
8. Challenge removed from active challenges list
9. Stats automatically refresh

### From Challenges Page
1. User sees joined challenge with "Challenge Joined" + "Cancel" buttons
2. Click "Cancel" → Cancel Confirmation Modal appears
3. Modal shows challenge title and warning
4. User clicks "Yes, Cancel It"
5. Loading state during cancellation
6. Success Modal appears
7. Button changes back to "Join Challenge"
8. Stats automatically refresh

## Database Impact

### `user_challenges` Table Updates
When a challenge is canceled:
```sql
UPDATE user_challenges SET
  status = 'abandoned',
  failed_at = NOW(),
  failure_reason = 'manual_abandonment',
  partial_completion_percent = [current progress_percent],
  points_earned = [calculated partial points]
WHERE id = [user_challenge_id]
```

## Points Calculation Logic
```javascript
if (challenge.points_partial_enabled && progress_percent > 0) {
  partialPoints = Math.floor((challenge.points_full * progress_percent) / 100)
} else {
  partialPoints = 0
}
```

## Visual Design

### Cancel Button (Dashboard)
- Size: 28x28px (h-7 w-7)
- Default: Ghost button with gray-400 text
- Hover: Red-600 text with red-50 background
- Icon: X (lucide-react)
- Position: Top-right of challenge card, next to progress percentage

### Button Layout (Challenges Page)
- "Challenge Joined" button: Flex-1, outline variant, disabled
- "Cancel" button: Fixed padding, outline variant, active
- Gap: 8px (gap-2)
- Both buttons: 44px height (h-11)

### Modal Colors
- **Confirmation**: Orange theme (bg-orange-100, text-orange-600, border-orange-200)
- **Success**: Green theme (bg-green-100, text-green-600, border-green-200)

## Error Handling
- API errors show alert with error message
- Loading states prevent duplicate submissions
- Modal closes automatically on success
- Failed cancellations keep modal open for retry

## Testing Checklist
- [ ] Cancel challenge from dashboard → Challenge removed, points awarded
- [ ] Cancel challenge from challenges page → Button changes to "Join Challenge"
- [ ] Cancel with 0% progress → No partial points
- [ ] Cancel with 50% progress → Receive partial points (if enabled)
- [ ] Cancel with 100% progress → Should be disabled/not shown
- [ ] Click cancel then "Keep Challenge" → No changes made
- [ ] Refresh page after cancel → Challenge stays canceled
- [ ] Stats update correctly after cancellation (completed count, total saved)
- [ ] Multiple challenges can be canceled in sequence

## Related Files Modified
1. `app/dashboard/page.tsx` - Added cancel button and functionality
2. `app/challenges/page.tsx` - Added cancel button and functionality
3. `components/ui/confirmation-modal.tsx` - Added CancelChallengeModal
4. `components/ui/success-modal.tsx` - Added ChallengeCanceledModal

## Benefits
- **User Control**: Users can quit challenges that don't fit their lifestyle
- **Encouragement**: Partial points reward progress and encourage trying again
- **No Penalty**: Unlike "failed" challenges, manual abandonment is neutral
- **Flexibility**: Users can experiment with different challenges without commitment anxiety
- **Transparency**: Clear warnings and feedback about partial points

## Future Enhancements
- Add "Are you sure?" text input for high-progress challenges (>75%)
- Show reason selection (too hard, no time, changed mind, etc.)
- Add "Pause" option instead of full cancellation
- Track abandonment reasons for challenge difficulty tuning
- Show "Try Again" button in success modal to rejoin immediately
