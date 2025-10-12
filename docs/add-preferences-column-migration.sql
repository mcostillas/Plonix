-- Migration: Add preferences column to user_profiles table
-- This adds a JSONB column to store user preferences like theme and language

-- Add preferences column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'preferences'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
    
    RAISE NOTICE 'Added preferences column to user_profiles';
  ELSE
    RAISE NOTICE 'preferences column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
AND column_name = 'preferences';
