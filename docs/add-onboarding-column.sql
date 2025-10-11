-- Add onboarding_completed column to user_profiles
-- Run this in Supabase SQL Editor

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding ON public.user_profiles(onboarding_completed);

-- Comment
COMMENT ON COLUMN public.user_profiles.onboarding_completed IS 'Whether user has completed the product tour';
COMMENT ON COLUMN public.user_profiles.onboarding_completed_at IS 'When user completed onboarding tour';

-- For existing users (Marc Maurice), mark as not onboarded
UPDATE public.user_profiles 
SET onboarding_completed = FALSE
WHERE onboarding_completed IS NULL;

SELECT '✅ Onboarding columns added successfully!' as status;
