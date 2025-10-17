-- Add tour_completed field to user_profiles table
-- This ensures the tour only shows once per user (across all devices)

-- Add the column
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;

-- Add a comment
COMMENT ON COLUMN public.user_profiles.tour_completed IS 'Whether the user has completed the interactive dashboard tour';

-- Backfill existing users (set to false so they can see the tour)
UPDATE public.user_profiles
SET tour_completed = FALSE
WHERE tour_completed IS NULL;

```