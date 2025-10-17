-- ================================================
-- COMPLETE DATABASE IMPORT
-- Run this file in Supabase SQL Editor
-- ================================================

-- Step 1: Create all tables and schemas
\i schemas/00_master_schema.sql

-- Step 2: Import all data
\i data/transactions.sql
\i data/goals.sql
\i data/scheduled_payments.sql
\i data/learning_reflections.sql
\i data/challenges.sql
\i data/user_challenges.sql

-- Done! Your database is ready.
