-- ================================================
-- UPDATE ALL EXISTING USERS TO PREMIUM
-- Run this script in Supabase SQL Editor
-- ================================================

-- Set all existing users to 'premium' membership
UPDATE auth.users
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN '{"membership_type": "premium"}'::jsonb
    ELSE raw_user_meta_data || '{"membership_type": "premium"}'::jsonb
  END
WHERE raw_user_meta_data->>'membership_type' IS NULL;

-- Verify the update
SELECT 
  email,
  created_at,
  COALESCE(raw_user_meta_data->>'membership_type', 'NOT SET') as membership_type
FROM auth.users
ORDER BY created_at DESC;

-- ================================================
-- OPTIONAL: Change specific users to freemium
-- ================================================
-- Uncomment and modify the email to downgrade specific users to freemium

-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"membership_type": "freemium"}'::jsonb
-- WHERE email = 'user@example.com';

-- ================================================
-- View membership distribution
-- ================================================
SELECT 
  COALESCE(raw_user_meta_data->>'membership_type', 'NOT SET') as membership_type,
  COUNT(*) as user_count
FROM auth.users
GROUP BY COALESCE(raw_user_meta_data->>'membership_type', 'NOT SET')
ORDER BY user_count DESC;
