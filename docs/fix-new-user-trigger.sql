-- Fix handle_new_user trigger to work with 'name' metadata field
-- Run this in Supabase SQL Editor

-- Drop and recreate the function with proper metadata field handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Try to get name from metadata (supports both 'name' and 'full_name')
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );

  -- Insert into profiles table if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, user_name)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Insert into user_profiles table with name
  INSERT INTO public.user_profiles (user_id, name, email)
  VALUES (NEW.id, user_name, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert into user_context table with default values if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_context') THEN
    INSERT INTO public.user_context (user_id, income, expenses, preferences)
    VALUES (
      NEW.id,
      18000.00, -- Default income for Filipino students/young professionals
      jsonb_build_object(
        'food', 5000,
        'transport', 2000,
        'utilities', 1500,
        'entertainment', 1500,
        'other', 1000
      ),
      jsonb_build_object(
        'budgetStyle', '50-30-20',
        'communicationStyle', 'casual',
        'currency', 'PHP'
      )
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile, user_context, and related records when a new user signs up';
