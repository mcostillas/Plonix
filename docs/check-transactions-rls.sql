-- Check if RLS is enabled on transactions table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'transactions';

-- Check RLS policies on transactions table
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  with_check
FROM pg_policies 
WHERE tablename = 'transactions'
ORDER BY policyname;

-- If RLS is blocking, run this to disable it:
-- ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
