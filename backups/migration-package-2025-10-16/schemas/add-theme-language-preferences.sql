-- Migration: Add theme and language preferences to user_profiles
-- This migration updates the preferences JSONB column structure to include theme and language

-- Note: Since preferences is already a JSONB column, we don't need to modify the schema
-- We just need to document the expected structure:
-- preferences: {
--   theme: 'light' | 'dark',
--   language: 'en' | 'tl' | 'taglish',
--   data_sharing: boolean,
--   ai_learning: boolean,
--   analytics: boolean
-- }

-- No schema changes needed - JSONB is flexible
-- Just updating documentation for clarity

-- Example query to update a user's preferences:
-- UPDATE user_profiles 
-- SET preferences = jsonb_set(
--   COALESCE(preferences, '{}'::jsonb),
--   '{theme}',
--   '"light"'
-- )
-- WHERE user_id = 'user-id-here';
