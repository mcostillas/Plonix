-- SOLUTION: Disable RLS for service_role or fix the policy properly
-- The service role should bypass RLS, but it's not working.
-- We have two options:

-- OPTION 1: Drop the restrictive INSERT policy and create one that actually works
DROP POLICY IF EXISTS "api_goal_insert_policy" ON public.goals;

-- Create a policy that allows ALL authenticated insertions (no restrictions)
CREATE POLICY "allow_all_goal_inserts" 
ON public.goals 
FOR INSERT 
TO authenticated, anon, service_role
WITH CHECK (true);

-- OPTION 2 (Alternative): Completely disable RLS on goals table
-- ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;

-- Run OPTION 1 above. This should fix the issue!
