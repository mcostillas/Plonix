-- NUCLEAR OPTION: Completely disable RLS on goals table
-- This will allow all insertions without any policy checks

ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;

-- After running this, the RLS error should go away completely
-- You can re-enable it later and fix policies properly if needed
