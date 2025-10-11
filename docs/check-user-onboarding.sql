-- Check if Marc Maurice completed onboarding
-- Run this in Supabase SQL Editor

SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'name' as name,
  u.email_confirmed_at,
  u.created_at,
  up.age,
  up.monthly_income,
  up.profile_picture,
  CASE 
    WHEN up.age IS NULL OR up.monthly_income IS NULL THEN '❌ Needs Onboarding'
    ELSE '✅ Onboarding Complete'
  END as onboarding_status
FROM auth.users u
LEFT JOIN public.user_profiles up ON up.user_id = u.id
WHERE u.raw_user_meta_data->>'name' ILIKE '%Marc%'
   OR u.email ILIKE '%marc%'
ORDER BY u.created_at DESC
LIMIT 5;

-- If Marc Maurice needs onboarding, you can:
-- 1. Log in with his account
-- 2. It will automatically redirect to /onboarding
-- 3. Complete the 4-step setup

-- Or manually trigger onboarding by going to: http://localhost:3000/onboarding
