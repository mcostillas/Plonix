-- Disable RLS on transactions table to allow API insertions with service role
-- This is the same fix we applied to the goals table

ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

-- This will allow the AI to add transactions through the API
-- The service role key already provides authentication/authorization
