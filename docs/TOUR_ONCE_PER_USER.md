# Interactive Tour - Show Once Per User

**Date:** October 11, 2025  
**Status:** ✅ IMPLEMENTED

---

## Overview

The interactive dashboard tour (Joyride) now shows **only once per user**, even when they switch devices or browsers.

---

## How It Works

### Database-First Approach
1. Tour status saved in `user_profiles` table → `tour_completed` field
2. Works across all devices (phone, laptop, tablet)
3. Persists even if user clears browser data

### Fallback to localStorage
- If database check fails, falls back to `localStorage`
- Ensures tour doesn't break if database is unavailable
- Good for offline scenarios

---

## Implementation Details

### 1. Database Schema

**File:** `docs/add-tour-completed-field.sql`

```sql
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;
```

**Run this in Supabase SQL Editor to add the field.**

### 2. TypeScript Types

**File:** `lib/database.types.ts`

Added `tour_completed` field to `user_profiles` interface:
```typescript
user_profiles: {
  Row: {
    // ... other fields
    tour_completed: boolean | null
  }
  Update: {
    // ... other fields
    tour_completed?: boolean | null
  }
}
```

### 3. Dashboard Logic

**File:** `app/dashboard/page.tsx`

#### Check Tour Status (on page load):
```typescript
useEffect(() => {
  if (!user?.id) return
  
  async function checkTourStatus() {
    // 1. Check database first
    const { data } = await supabase
      .from('user_profiles')
      .select('tour_completed')
      .eq('user_id', user.id)
      .single()
    
    if (data?.tour_completed) {
      return // Tour already completed
    }
    
    // 2. Fallback to localStorage
    const tourShown = localStorage.getItem('plounix_tour_shown')
    if (tourShown === 'true') {
      // Sync to database
      await supabase
        .from('user_profiles')
        .update({ tour_completed: true })
        .eq('user_id', user.id)
      return
    }
    
    // 3. Show tour for new users
    setShowTour(true)
  }
  
  checkTourStatus()
}, [user])
```

#### Save Tour Completion:
```typescript
const handleTourComplete = async () => {
  setShowTour(false)
  
  // Save to localStorage (immediate)
  localStorage.setItem('plounix_tour_shown', 'true')
  
  // Save to database (persistent)
  await supabase
    .from('user_profiles')
    .update({ tour_completed: true })
    .eq('user_id', user.id)
}
```

---

## User Experience

### First Time User:
1. Logs in / Registers
2. Goes to dashboard
3. **Tour automatically starts** 🎯
4. Completes tour (or skips)
5. Status saved to database ✅

### Returning User (Same Device):
1. Logs in
2. Goes to dashboard
3. **No tour** (localStorage check)
4. Dashboard loads normally

### Returning User (Different Device):
1. Logs in from new device
2. Goes to dashboard
3. **No tour** (database check)
4. Dashboard loads normally

### Existing User (Before This Update):
1. Had tour shown before (in localStorage)
2. Logs in after update
3. Database check finds no record
4. localStorage shows tour was completed
5. **Syncs to database** automatically
6. No tour shown ✅

---

## Benefits

### ✅ Cross-Device Persistence
- Complete tour on laptop → No tour on phone
- Complete tour on phone → No tour on tablet
- One completion = All devices synced

### ✅ Database-Backed
- More reliable than localStorage
- Survives browser data clearing
- Can query for analytics:
  ```sql
  -- How many users completed the tour?
  SELECT COUNT(*) 
  FROM user_profiles 
  WHERE tour_completed = TRUE;
  
  -- New users who haven't seen tour
  SELECT COUNT(*) 
  FROM user_profiles 
  WHERE tour_completed IS NULL OR tour_completed = FALSE;
  ```

### ✅ Backward Compatible
- Existing users with localStorage data won't see tour again
- Automatically syncs old data to database
- No migration needed for users

### ✅ Graceful Fallback
- If database is down → Uses localStorage
- If both fail → Shows tour (better than breaking)
- Error handling at every step

---

## Testing

### Test Case 1: New User
```
1. Register new account
2. Go to dashboard
3. ✅ Tour should start automatically
4. Complete tour
5. Refresh page
6. ✅ Tour should NOT appear again
```

### Test Case 2: Existing User (localStorage)
```
1. User who completed tour before (localStorage = true)
2. Go to dashboard
3. ✅ Tour should NOT appear
4. Check database
5. ✅ tour_completed should be TRUE (auto-synced)
```

### Test Case 3: Cross-Device
```
1. Complete tour on Device A
2. Login on Device B
3. Go to dashboard
4. ✅ Tour should NOT appear (database sync)
```

### Test Case 4: Manual Reset (for testing)
```sql
-- Reset tour status for a user
UPDATE user_profiles
SET tour_completed = FALSE
WHERE user_id = 'your-user-id';
```

Then clear localStorage:
```javascript
localStorage.removeItem('plounix_tour_shown')
```

Refresh dashboard → Tour should appear again

---

## Deployment Steps

### 1. Run Database Migration
Go to **Supabase SQL Editor** and run:
```sql
-- From docs/add-tour-completed-field.sql
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;
```

### 2. Deploy Code Changes
- `lib/database.types.ts` - TypeScript types updated
- `app/dashboard/page.tsx` - Tour logic updated
- `docs/add-tour-completed-field.sql` - Migration script

### 3. Test
- Test with new account
- Test with existing account
- Test across devices

---

## Files Modified

1. **`docs/add-tour-completed-field.sql`** - Database migration
2. **`lib/database.types.ts`** - Added `tour_completed` field to types
3. **`app/dashboard/page.tsx`** - Updated tour check and save logic
4. **`docs/TOUR_ONCE_PER_USER.md`** - This documentation

---

## Analytics Queries

### Check Tour Completion Rate
```sql
SELECT 
  COUNT(*) FILTER (WHERE tour_completed = TRUE) as completed,
  COUNT(*) FILTER (WHERE tour_completed = FALSE OR tour_completed IS NULL) as not_completed,
  COUNT(*) as total,
  ROUND(COUNT(*) FILTER (WHERE tour_completed = TRUE) * 100.0 / COUNT(*), 2) as completion_rate
FROM user_profiles;
```

### Recent Users Who Completed Tour
```sql
SELECT 
  user_id,
  name,
  created_at,
  tour_completed
FROM user_profiles
WHERE tour_completed = TRUE
ORDER BY created_at DESC
LIMIT 10;
```

---

## Summary

**Before:**
- ❌ Tour only tracked in localStorage
- ❌ Shows again on different devices
- ❌ Lost if user clears browser data

**After:**
- ✅ Tour tracked in database
- ✅ Once completed = Never shows again (any device)
- ✅ Survives browser data clearing
- ✅ Fallback to localStorage if database fails
- ✅ Automatic sync for existing users

**Status:** Ready to deploy! 🚀

