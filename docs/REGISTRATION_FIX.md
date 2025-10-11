# Registration Database Error Fix

## Problem
Users can register (auth.users gets created) but database error occurs when trying to create related profile records.

## Root Cause
The database trigger `handle_new_user()` was looking for `raw_user_meta_data->>'full_name'` but the application is sending `raw_user_meta_data->>'name'`.

## Solution

### Step 1: Run the Fixed SQL Script
Execute the SQL script in Supabase SQL Editor:
```
docs/fix-new-user-trigger.sql
```

This script:
1. ✅ Handles both `name` and `full_name` metadata fields
2. ✅ Uses `ON CONFLICT DO NOTHING` to prevent duplicate errors
3. ✅ Checks if tables exist before inserting
4. ✅ Creates default user_context with Philippine defaults
5. ✅ Properly grants permissions

### Step 2: Verify Tables Exist

Make sure these tables exist in your Supabase database:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_profiles', 'user_context');
```

### Step 3: Test Registration

1. Go to `/auth/register`
2. Fill in the form:
   - First Name: Juan
   - Last Name: Dela Cruz
   - Email: test@example.com
   - Password: TestPass123!
   - Confirm Password: TestPass123!
3. Click "Create Free Account"

Expected Result:
- ✅ User created in `auth.users`
- ✅ Profile created in `user_profiles` with name "Juan Dela Cruz"
- ✅ Default context created in `user_context`
- ✅ Success message shown
- ✅ Redirected to login page after 3 seconds

### Step 4: Verify in Database

```sql
-- Check auth user
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'test@example.com';

-- Check user profile
SELECT user_id, name, email, created_at 
FROM public.user_profiles 
WHERE email = 'test@example.com';

-- Check user context
SELECT user_id, income, expenses, preferences 
FROM public.user_context 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@example.com');
```

## Additional Fixes Applied

### 1. Register Page Fix (app/auth/register/page.tsx)
Changed from:
```typescript
const { user, error: signUpError } = await signUp(...)
```

To:
```typescript
const result = await signUp(...)
if (!result.success || result.error) {
  setError(result.error || 'Registration failed')
}
```

This matches the new auth.ts return format.

## Common Errors and Solutions

### Error: "This email is already registered"
**Solution:** This is the expected behavior when trying to sign up with an existing email.

**What happens:**
- Supabase returns success but with empty `identities[]` array
- This prevents user enumeration attacks (security feature)
- User is shown a clear message to log in instead

**To test:**
```sql
-- Check if email exists
SELECT id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'test@example.com';
```

### Error: "duplicate key value violates unique constraint"
**Solution:** User already exists. Use a different email or delete the existing user.

```sql
-- Delete test user (careful in production!)
DELETE FROM auth.users WHERE email = 'test@example.com';
```

### Error: "null value in column 'name' violates not-null constraint"
**Solution:** The trigger fixed this by using COALESCE to provide fallback values.

### Error: "permission denied for table user_profiles"
**Solution:** Run the permission grants:
```sql
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
```

### Error: "function handle_new_user() does not exist"
**Solution:** Run the fix-new-user-trigger.sql script to create the function.

## Debugging Tips

### 1. Check if trigger is active
```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### 2. Check trigger function
```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

### 3. Test trigger manually
```sql
-- This will simulate what happens during signup
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'manual-test@example.com',
  crypt('password', gen_salt('bf')),
  NOW(),
  '{"name": "Manual Test User"}'::jsonb
);

-- Check if profile was created
SELECT * FROM public.user_profiles 
WHERE email = 'manual-test@example.com';
```

### 4. Check logs in Supabase
1. Go to Supabase Dashboard
2. Click "Database" → "Logs"
3. Look for errors during user creation

## Prevention

To prevent this issue in the future:

1. **Always run database migrations before deploying code changes**
2. **Use consistent field names** between application and database
3. **Add error handling** in triggers with RAISE NOTICE for debugging
4. **Test registration** in staging before production
5. **Monitor Supabase logs** for trigger errors

## Files Modified

1. ✅ `app/auth/register/page.tsx` - Fixed auth result handling
2. ✅ `docs/fix-new-user-trigger.sql` - New trigger function
3. ✅ `docs/REGISTRATION_FIX.md` - This documentation

## Next Steps

After applying the fix:

1. ✅ Test registration with a new email
2. ✅ Verify all tables are populated
3. ✅ Test login with the new account
4. ✅ Check dashboard loads correctly
5. ✅ Commit changes to git

```bash
git add .
git commit -m "fix: registration database error - update handle_new_user trigger"
git push origin main
```

## Success Indicators

Registration is working correctly when:
- ✅ No error messages during signup
- ✅ Success message appears
- ✅ Email verification sent
- ✅ Redirect to login works
- ✅ Can login with new account
- ✅ Dashboard loads with user data
- ✅ AI assistant recognizes user name
