-- Fix RLS policy for goals table to allow API insertions
-- The current policy only allows inserts where auth.uid() = user_id
-- But API routes don't have auth.uid() context
-- We need to allow insertions with ANY user_id for API routes

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.goals;

-- Create a more permissive insert policy for API usage
CREATE POLICY "Allow goal insertions via API" 
  ON public.goals
  FOR INSERT 
  WITH CHECK (true);  -- Allow any insert, app logic handles auth

-- Note: SELECT, UPDATE, DELETE policies can still be restrictive
-- Users can still only view/modify their own goals

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'goals';
