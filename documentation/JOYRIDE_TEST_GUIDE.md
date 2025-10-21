# Test Guide: Joyride Tour Persistence

## Quick Test Scenarios

### Test 1: First Time User
1. Create a new account
2. Login to dashboard
3. **Expected:** Tour appears automatically
4. Complete or skip the tour
5. **Expected:** Tour disappears and never shows again

### Test 2: Same Browser, Different Session
1. Complete the tour in Chrome
2. Log out
3. Log back in
4. **Expected:** Tour does NOT appear ✅

### Test 3: Different Browser (Same Device)
1. Complete tour in Chrome
2. Open Firefox/Edge/Safari
3. Login with same account
4. **Expected:** Tour does NOT appear ✅

### Test 4: Different Device
1. Complete tour on your laptop
2. Open phone/tablet browser
3. Login with same account
4. **Expected:** Tour does NOT appear ✅

### Test 5: Incognito Mode
1. Complete tour in normal browser
2. Open incognito/private window
3. Login with same account
4. **Expected:** Tour does NOT appear ✅

### Test 6: Clear Cache & Cookies
1. Complete the tour
2. Clear all browser data (cache, cookies, localStorage)
3. Login again
4. **Expected:** Tour does NOT appear ✅
5. **Why?** Database still has `tour_completed = true`

## How to Reset Tour for Testing

If you want to see the tour again for testing purposes:

### Option 1: SQL Query (Recommended)
```sql
-- Run in Supabase SQL Editor
UPDATE user_profiles
SET tour_completed = FALSE
WHERE user_id = 'YOUR_USER_ID';
```

### Option 2: Browser Console (Temporary)
```javascript
// Only affects current browser
localStorage.removeItem('plounix_tour_shown')
// Then refresh page - but database still marks as completed
```

### Option 3: Create New Account
- Easiest way to test as a "new user"
- Each new account gets fresh tour status

## What to Look For

### Console Logs
Open browser DevTools console and look for:

✅ **Tour Completed (Should NOT Show)**
```
🔍 Database tour status for user [id]: true
✅ Tour already completed in database - will NOT show
```

✅ **New User (Should Show)**
```
🔍 Database tour status for user [id]: false
🆕 Tour not completed in database - showing tour
```

✅ **Tour Just Completed**
```
✅ Tour completed by user - saving permanently
✅ Tour completion saved to database - will persist across devices!
```

### Visual Checks
- [ ] Tour modal appears for new users
- [ ] Tour has "Skip Tour" button
- [ ] Tour has "Next" and "Back" buttons
- [ ] Tour highlights correct UI elements
- [ ] Tour disappears after completion/skip
- [ ] Tour does NOT reappear on refresh
- [ ] Tour does NOT reappear on different browsers

## Common Issues & Fixes

### Issue: Tour keeps showing after completion
**Check:**
1. Open browser console - what do the logs say?
2. Check database: `SELECT tour_completed FROM user_profiles WHERE user_id = 'xxx'`
3. Is it `true` or `false`?

**Fix:**
- If database shows `false`, the save didn't work
- Check network tab for failed requests
- Check console for error messages

### Issue: Tour doesn't show for new users
**Check:**
1. Is `tour_completed` field in database?
2. Run migration: `docs/add-tour-completed-field.sql`
3. Check if field defaults to `FALSE`

### Issue: Tour shows again in incognito
**This is CORRECT if:**
- User hasn't completed tour yet
- Incognito sessions check database, not localStorage

**This is WRONG if:**
- User completed tour on normal browser
- Database should have `tour_completed = true`
- Check database value!

## Database Verification

### Check Tour Status
```sql
SELECT 
  user_id,
  email,
  tour_completed,
  created_at,
  updated_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;
```

### Count Tour Completions
```sql
SELECT 
  COUNT(*) FILTER (WHERE tour_completed = TRUE) as completed,
  COUNT(*) FILTER (WHERE tour_completed = FALSE) as not_completed,
  COUNT(*) as total
FROM user_profiles;
```

### Find Users Who Haven't Completed Tour
```sql
SELECT 
  email,
  created_at,
  tour_completed
FROM user_profiles
WHERE tour_completed = FALSE
ORDER BY created_at DESC;
```

## Success Criteria

✅ Tour appears exactly ONCE per user  
✅ Tour persists across browsers  
✅ Tour persists across devices  
✅ Tour respects incognito mode  
✅ Tour survives cache clearing  
✅ Database is source of truth  
✅ localStorage improves performance  
✅ No errors in console  
✅ Smooth user experience  

---

**Ready to deploy!** The Joyride tour will now provide a consistent, one-time experience for all users across all their devices! 🚀
