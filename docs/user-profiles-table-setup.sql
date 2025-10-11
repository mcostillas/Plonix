-- Create user_profiles table with all necessary fields
-- Run this in Supabase SQL Editor

-- Drop table if exists (be careful in production!)
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Create the user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  age INTEGER,
  monthly_income DECIMAL(10, 2),
  profile_picture TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add check constraints
ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS age_positive;

ALTER TABLE public.user_profiles
ADD CONSTRAINT age_positive CHECK (age IS NULL OR (age > 0 AND age <= 120));

ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS monthly_income_positive;

ALTER TABLE public.user_profiles
ADD CONSTRAINT monthly_income_positive CHECK (monthly_income IS NULL OR monthly_income >= 0);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;

-- Create RLS Policies
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.user_profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Add comments to document the fields
COMMENT ON TABLE public.user_profiles IS 'User profile information';
COMMENT ON COLUMN public.user_profiles.user_id IS 'Foreign key to auth.users';
COMMENT ON COLUMN public.user_profiles.name IS 'User full name';
COMMENT ON COLUMN public.user_profiles.age IS 'User age (1-120)';
COMMENT ON COLUMN public.user_profiles.monthly_income IS 'User monthly income';
COMMENT ON COLUMN public.user_profiles.profile_picture IS 'Avatar identifier (avatar-{id}) or URL to uploaded image';
COMMENT ON COLUMN public.user_profiles.email IS 'User email address';

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
