# AI Usage Limits Implementation - Freemium & Premium System

## Overview
This document describes the freemium and premium membership system for AI access in Plounix.

## Membership Types

### Premium (Default)
- **AI Limit**: Unlimited
- **Default for**: All new signups and existing users
- **Use Case**: Current state - everyone has full access

### Freemium
- **AI Limit**: 50 messages per month
- **Use Case**: Future implementation for limited access users
- **Managed via**: Supabase Dashboard

## System Architecture

### 1. Database Schema

#### Table: `ai_usage_tracking`
Tracks AI message usage per user per month (only for freemium users).

```sql
CREATE TABLE ai_usage_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  month TEXT, -- Format: 'YYYY-MM'
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);
```

#### User Metadata
Stored in `auth.users.raw_user_meta_data`:
```json
{
  "name": "User Name",
  "age": 25,
  "membership_type": "premium" // or "freemium"
}
```

### 2. Implementation Flow

#### New User Signup
1. User registers via `/auth/signup`
2. System automatically sets `membership_type: "premium"` in user metadata
3. User has unlimited AI access

#### AI Chat Request
1. User sends message to `/api/ai-chat`
2. System authenticates user and retrieves `membership_type`
3. **If Premium**: Process message immediately (no tracking)
4. **If Freemium**:
   - Check `ai_usage_tracking` table for current month
   - If under 50 messages: Process and increment counter
   - If at/over 50 messages: Return "limit reached" error

#### Monthly Reset
- Automatic via month-based tracking (`YYYY-MM` format)
- Each new month starts fresh (no counter reset needed)

### 3. Files Modified

#### Database & Types
- `supabase/migrations/001_ai_usage_tracking.sql` - Creates tracking table
- `supabase/migrations/002_set_users_to_premium.sql` - Updates existing users
- `lib/database.types.ts` - Added `AIUsageTracking` type and `membership_type`

#### Core Logic
- `lib/auth.ts` - Sets `membership_type: "premium"` on signup
- `lib/ai-usage-limits.ts` - Usage limit checking and tracking logic
- `app/api/ai-chat/route.ts` - Integrated usage checks before AI processing

## How to Manage Membership Types

### Method 1: Supabase Dashboard (Recommended)

1. Go to: **Supabase Dashboard → Authentication → Users**
2. Click on a user
3. Click "Edit User" or scroll to "Raw User Meta Data"
4. Modify the JSON:
   ```json
   {
     "name": "User Name",
     "membership_type": "freemium"  // Change this
   }
   ```
5. Save changes

The change takes effect immediately on the next AI request.

### Method 2: SQL Editor

```sql
-- Downgrade single user to freemium
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"membership_type": "freemium"}'::jsonb
WHERE email = 'user@example.com';

-- Upgrade user back to premium
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"membership_type": "premium"}'::jsonb
WHERE email = 'user@example.com';

-- View all users with their membership types
SELECT 
  email,
  created_at,
  raw_user_meta_data->>'membership_type' as membership_type
FROM auth.users
ORDER BY created_at DESC;
```

### Method 3: Bulk Operations

```sql
-- Set multiple users to freemium
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"membership_type": "freemium"}'::jsonb
WHERE email IN (
  'user1@example.com',
  'user2@example.com',
  'user3@example.com'
);

-- Set all users created after a date to freemium
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"membership_type": "freemium"}'::jsonb
WHERE created_at > '2025-10-22'
  AND raw_user_meta_data->>'membership_type' = 'premium';
```

## Usage Limits

| Membership Type | Monthly AI Messages | Cost | Managed Via |
|----------------|---------------------|------|-------------|
| Premium        | Unlimited           | Free (for now) | Supabase Dashboard |
| Freemium       | 50 messages/month   | Free | Supabase Dashboard |

## Testing the System

### Test Freemium Limits

1. **Create a test user** or use existing account
2. **Downgrade to freemium** via Supabase Dashboard
3. **Send AI messages** via the chat interface
4. **Check usage tracking**:
   ```sql
   SELECT * FROM ai_usage_tracking
   WHERE user_id = '<user_id>'
     AND month = TO_CHAR(NOW(), 'YYYY-MM');
   ```
5. **Test limit**: Try sending 51+ messages
6. **Expected**: 51st message should be blocked with error message

### Test Premium Access

1. **Ensure user is premium** (check in Dashboard)
2. **Send unlimited AI messages**
3. **Verify no tracking**:
   ```sql
   -- Should return no rows for premium users
   SELECT * FROM ai_usage_tracking
   WHERE user_id = '<premium_user_id>';
   ```

## Monitoring Queries

### View Current Month Usage
```sql
SELECT 
  u.email,
  u.raw_user_meta_data->>'membership_type' as membership,
  aut.message_count,
  aut.last_message_at
FROM ai_usage_tracking aut
JOIN auth.users u ON u.id = aut.user_id
WHERE aut.month = TO_CHAR(NOW(), 'YYYY-MM')
ORDER BY aut.message_count DESC;
```

### Find Users Who Hit Limit
```sql
SELECT 
  u.email,
  aut.message_count,
  aut.last_message_at
FROM ai_usage_tracking aut
JOIN auth.users u ON u.id = aut.user_id
WHERE aut.month = TO_CHAR(NOW(), 'YYYY-MM')
  AND aut.message_count >= 50;
```

### Membership Distribution
```sql
SELECT 
  COALESCE(raw_user_meta_data->>'membership_type', 'NOT SET') as membership_type,
  COUNT(*) as user_count
FROM auth.users
GROUP BY COALESCE(raw_user_meta_data->>'membership_type', 'NOT SET')
ORDER BY user_count DESC;
```

## User Experience

### Premium User
- Sees no limits
- No counters or warnings
- Unlimited AI conversations

### Freemium User
- Console logs show remaining messages
- Receives limit warning in error response
- Message includes reset date
- Example error: 
  > "You've reached your monthly limit of 50 AI messages. Upgrade to Premium for unlimited access, or wait until November 1, 2025 when your limit resets."

## Security Considerations

1. **Server-side enforcement**: All checks happen in API routes (client can't bypass)
2. **RLS on ai_usage_tracking**: Users can only read their own usage data
3. **Metadata immutability**: Users cannot change their own `membership_type`
4. **Fail-open strategy**: If tracking fails, request is allowed (logged for debugging)

## Future Enhancements

- [ ] Admin dashboard UI for managing memberships
- [ ] User-facing usage dashboard showing remaining messages
- [ ] Email notifications at 80% and 100% usage
- [ ] Payment integration for premium upgrades
- [ ] Different tier levels (Basic, Pro, Enterprise)
- [ ] Usage analytics and reporting

## Deployment Checklist

- [x] Create `ai_usage_tracking` table in Supabase
- [x] Run migration to set all existing users to premium
- [x] Deploy updated code to production
- [ ] Test with a freemium account
- [ ] Monitor logs for any errors
- [ ] Document for team members

## Support

If users report issues:
1. Check their `membership_type` in Supabase Dashboard
2. Check `ai_usage_tracking` table for their current month
3. Review API logs for any errors
4. Can manually reset usage if needed:
   ```sql
   DELETE FROM ai_usage_tracking
   WHERE user_id = '<user_id>'
     AND month = TO_CHAR(NOW(), 'YYYY-MM');
   ```

---

**Last Updated**: October 22, 2025
