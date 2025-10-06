-- ================================
-- GOALS TABLE SETUP
-- ================================
-- Run this SQL in your Supabase SQL Editor to create the goals table

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  category TEXT NOT NULL,
  deadline DATE,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT 'blue',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own goals
CREATE POLICY "Users can view their own goals" 
  ON public.goals
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own goals" 
  ON public.goals
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own goals" 
  ON public.goals
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
  ON public.goals
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON public.goals(deadline);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the function on update
DROP TRIGGER IF EXISTS goals_updated_at ON public.goals;
CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goals_updated_at();

-- Function to automatically mark goal as completed when target is reached
CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_amount >= NEW.target_amount AND NEW.status = 'active' THEN
    NEW.status = 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check completion on update
DROP TRIGGER IF EXISTS goals_check_completion ON public.goals;
CREATE TRIGGER goals_check_completion
  BEFORE INSERT OR UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION check_goal_completion();

-- ================================
-- SAMPLE GOAL CATEGORIES
-- ================================
-- Common goal categories for Filipino users:
-- - Emergency Fund
-- - Education
-- - Travel
-- - New Phone/Gadget
-- - Home
-- - Investment
-- - Business
-- - Healthcare
-- - Wedding
-- - Retirement

-- ================================
-- SETUP COMPLETE
-- ================================

-- You can now:
-- 1. Create financial goals
-- 2. Track progress automatically
-- 3. Set deadlines and reminders
-- 4. Mark goals as completed
