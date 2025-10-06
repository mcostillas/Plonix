-- Migration: Add profile fields to user_profiles table
-- Date: 2024
-- Purpose: Add name, age, monthly_income, and profile_picture fields to support profile page

-- Add new columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add check constraints
ALTER TABLE user_profiles
ADD CONSTRAINT age_positive CHECK (age > 0 AND age <= 120);

ALTER TABLE user_profiles
ADD CONSTRAINT monthly_income_positive CHECK (monthly_income >= 0);

-- Add comment to document the fields
COMMENT ON COLUMN user_profiles.name IS 'User full name';
COMMENT ON COLUMN user_profiles.age IS 'User age (1-120)';
COMMENT ON COLUMN user_profiles.monthly_income IS 'User monthly income in PHP';
COMMENT ON COLUMN user_profiles.profile_picture IS 'URL to user profile picture in Supabase Storage';

-- Note: Run this migration in Supabase SQL Editor
