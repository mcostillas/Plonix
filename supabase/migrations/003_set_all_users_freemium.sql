-- ================================================
-- SET ALL USERS TO FREEMIUM
-- Run this script in Supabase SQL Editor
-- ================================================

-- Set ALL existing users to 'freemium' membership
UPDATE auth.users
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN '{"membership_type": "freemium"}'::jsonb
    ELSE raw_user_meta_data || '{"membership_type": "freemium"}'::jsonb
  END;

-- Verify the update
SELECT 
  email,
  created_at,
  raw_user_meta_data->>'membership_type' as membership_type
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- ================================================
-- Count users by membership type
-- ================================================
SELECT 
  COALESCE(raw_user_meta_data->>'membership_type', 'NOT SET') as membership_type,
  COUNT(*) as user_count
FROM auth.users
GROUP BY COALESCE(raw_user_meta_data->>'membership_type', 'NOT SET')
ORDER BY user_count DESC;

-- Expected result: All users should show "freemium"

-- ================================================
-- OPTIONAL: Upgrade specific users to premium
-- ================================================
-- Uncomment and modify to upgrade specific users to premium (unlimited AI)

-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"membership_type": "premium"}'::jsonb
-- WHERE email IN (
--   'admin@yourcompany.com',
--   'vip@yourcompany.com'
-- );
