-- Clean up all test users from the database
-- ⚠️ WARNING: This will delete ALL users - only use in development!
-- Run this in Supabase SQL Editor

-- Step 1: Delete from user_profiles (if exists)
DELETE FROM public.user_profiles;

-- Step 2: Delete from profiles (if exists)
DELETE FROM public.profiles;

-- Step 3: Delete from user_context (if exists)
DELETE FROM public.user_context;

-- Step 4: Delete from goals (if exists)
DELETE FROM public.goals;

-- Step 5: Delete from challenges (if exists)
DELETE FROM public.challenges;

-- Step 6: Delete from chat_history (if exists)
DELETE FROM public.chat_history;

-- Step 7: Delete from chat_sessions (if exists)
DELETE FROM public.chat_sessions;

-- Step 8: Delete from ai_memory (if exists)
DELETE FROM public.ai_memory;

-- Step 9: Delete from transactions (if exists)
DELETE FROM public.transactions;

-- Step 10: Delete from notifications (if exists)
DELETE FROM public.notifications;

-- Step 11: Finally, delete all auth users
-- This is in the auth schema, not public
DELETE FROM auth.users;

-- Verify everything is clean
SELECT 'auth.users' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM public.user_profiles
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
UNION ALL
SELECT 'user_context', COUNT(*) FROM public.user_context WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_context');

-- Success message
SELECT '✅ All users deleted! Database is clean for fresh testing.' as status;
