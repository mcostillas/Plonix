-- Fix RLS policy for goals table (Version 2)
-- This drops ALL existing INSERT policies and creates a new one with a unique name

-- Drop all existing INSERT policies on the goals table
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.goals;
DROP POLICY IF EXISTS "Allow goal insertions via API" ON public.goals;
DROP POLICY IF EXISTS "Allow authenticated users to insert goals" ON public.goals;

-- Create a new policy with a unique name that allows API insertions
CREATE POLICY "api_goal_insert_policy" 
ON public.goals 
FOR INSERT 
WITH CHECK (true);
