-- Verify RLS policies on goals table
-- Run this in Supabase SQL Editor to see current policies

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'goals'
ORDER BY policyname;
