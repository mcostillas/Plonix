# Quick Setup Guide - AI Membership System

## 🚀 Setup Steps (Run in Order)

### Step 1: Create Database Table
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and run: `supabase/migrations/001_ai_usage_tracking.sql`
3. Verify table created: Check **Table Editor** for `ai_usage_tracking`

### Step 2: Update Existing Users to Premium
1. In **SQL Editor**, copy and run: `supabase/migrations/002_set_users_to_premium.sql`
2. This sets ALL existing users (including your 59 users) to **premium** (unlimited AI)
3. Verify: Check the output - should show all users with `membership_type: premium`

### Step 3: Deploy Code Changes
```bash
# The code is already updated, just commit and push
git add .
git commit -m "Add freemium/premium AI membership system"
git push origin main
```

That's it! ✅

## 📊 Current State After Setup

- **All 59+ existing users**: Premium (unlimited AI) ✓
- **All new signups**: Premium (unlimited AI) ✓
- **System ready**: You can now downgrade specific users to freemium via Supabase Dashboard

## 🔧 How to Test

### Test 1: Verify Current Users Are Premium
```sql
-- Run in Supabase SQL Editor
SELECT 
  email,
  raw_user_meta_data->>'membership_type' as membership
FROM auth.users
LIMIT 10;
```
Expected: All show "premium"

### Test 2: Downgrade a Test User to Freemium
1. Go to **Authentication** → **Users**
2. Pick a test user
3. Edit their metadata:
   ```json
   {
     "membership_type": "freemium"
   }
   ```
4. Save

### Test 3: Test Freemium Limits
1. Login as the freemium user
2. Send AI messages
3. Check usage in SQL Editor:
   ```sql
   SELECT * FROM ai_usage_tracking
   WHERE user_id = '<test_user_id>'
     AND month = TO_CHAR(NOW(), 'YYYY-MM');
   ```
4. Try sending 51+ messages - should be blocked

## 🎯 Managing Users Going Forward

### Downgrade User to Freemium
**Supabase Dashboard:**
1. Authentication → Users → Select user
2. Edit user metadata
3. Set: `"membership_type": "freemium"`

**Or SQL:**
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"membership_type": "freemium"}'::jsonb
WHERE email = 'user@example.com';
```

### Upgrade User Back to Premium
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"membership_type": "premium"}'::jsonb
WHERE email = 'user@example.com';
```

## 📈 Monitoring

### See Who's Using AI
```sql
SELECT 
  u.email,
  u.raw_user_meta_data->>'membership_type' as type,
  aut.message_count,
  aut.last_message_at
FROM ai_usage_tracking aut
JOIN auth.users u ON u.id = aut.user_id
WHERE aut.month = TO_CHAR(NOW(), 'YYYY-MM')
ORDER BY aut.message_count DESC;
```

### Count by Membership Type
```sql
SELECT 
  COALESCE(raw_user_meta_data->>'membership_type', 'premium') as type,
  COUNT(*) as count
FROM auth.users
GROUP BY COALESCE(raw_user_meta_data->>'membership_type', 'premium');
```

## ⚠️ Important Notes

1. **Premium users are NOT tracked** in `ai_usage_tracking` table (performance optimization)
2. **Freemium users** are tracked and limited to 50 messages/month
3. **Limits reset automatically** each month (no manual reset needed)
4. **Changes take effect immediately** when you update user metadata

## 🆘 Troubleshooting

**User says they're blocked but should have access:**
1. Check their membership type in Dashboard
2. If premium, check logs for errors
3. If freemium, check their usage count
4. Can manually reset if needed:
   ```sql
   DELETE FROM ai_usage_tracking
   WHERE user_id = '<user_id>'
     AND month = TO_CHAR(NOW(), 'YYYY-MM');
   ```

**Can't find user in Dashboard:**
Search by email in Authentication → Users

**Need to bulk change users:**
Use SQL queries (see examples above)

## 📚 Full Documentation

See: `docs/AI_MEMBERSHIP_SYSTEM.md` for complete details
