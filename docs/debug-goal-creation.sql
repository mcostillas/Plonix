-- Check if the RLS policy was updated and verify recent goal insertions
-- Run these queries to debug the issue

-- 1. Check current RLS policies on goals table
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'goals' AND cmd = 'INSERT';

-- 2. Check if any goals were created in the last hour
SELECT id, user_id, title, target_amount, created_at 
FROM goals 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 3. Check all goals for your user (replace with your actual user_id)
SELECT id, title, target_amount, current_amount, category, status, created_at
FROM goals 
WHERE user_id = 'a4dd8a83-0a6c-4ce6-b2ff-e20d860fcd80'  -- Your user ID from logs
ORDER BY created_at DESC
LIMIT 10;

-- 4. If no goals found, check if the insert policy exists
SELECT COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'goals' AND cmd = 'INSERT';
