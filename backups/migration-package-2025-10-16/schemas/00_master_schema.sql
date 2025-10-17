-- ================================================
-- PLOUNIX DATABASE - MASTER SCHEMA
-- Generated: 2025-10-16T03:17:35.571Z
-- Source: https://ftxvmaurxhatqhzowgkb.supabase.co/
-- ================================================

-- IMPORTANT: Run these commands in order:
-- 1. This master schema file (creates all tables)
-- 2. All data files in the data/ folder

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ================================================
-- FROM: docs/learning-reflections-schema.sql
-- ================================================

-- Learning Reflections Schema
-- This stores user reflections from learning modules for AI to understand user better

CREATE TABLE IF NOT EXISTS learning_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('learn', 'apply', 'reflect')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  module_title TEXT,
  step_number INTEGER,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'concerned', 'motivated', 'confused')),
  extracted_insights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_learning_reflections_user_id ON learning_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_reflections_module_id ON learning_reflections(module_id);
CREATE INDEX IF NOT EXISTS idx_learning_reflections_created_at ON learning_reflections(created_at DESC);

-- Row Level Security
ALTER TABLE learning_reflections ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Allow all operations for now (customize based on your auth)
CREATE POLICY "Allow all operations on learning_reflections" ON learning_reflections FOR ALL USING (true);

-- Comments for documentation
COMMENT ON TABLE learning_reflections IS 'Stores user reflections from learning modules to help AI understand user better';
COMMENT ON COLUMN learning_reflections.module_id IS 'The ID of the learning module (e.g., budgeting-basics, emergency-fund)';
COMMENT ON COLUMN learning_reflections.phase IS 'Which phase of LAR framework: learn, apply, or reflect';
COMMENT ON COLUMN learning_reflections.question IS 'The question or prompt shown to the user';
COMMENT ON COLUMN learning_reflections.answer IS 'The user''s response';
COMMENT ON COLUMN learning_reflections.sentiment IS 'Detected emotional tone of the response';
COMMENT ON COLUMN learning_reflections.extracted_insights IS 'AI-extracted insights like goals, concerns, financial situation';



-- ================================================
-- FROM: docs/learning-content-schema.sql
-- ================================================

-- =====================================================
-- PHASE 2: Learning Module Content Database Schema
-- Purpose: Store learning module content so AI can reference
--          specific concepts, takeaways, and tips
-- Impact: AI knowledge 80% → 90% (+10%)
-- =====================================================

-- Main table: Stores all learning module content
CREATE TABLE IF NOT EXISTS learning_module_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL UNIQUE, -- 'budgeting', 'saving', 'investing', etc.
  module_title TEXT NOT NULL,
  module_description TEXT,
  duration TEXT,
  category TEXT, -- 'core', 'essential', 'advanced'
  
  -- Key learning content (JSONB for flexibility)
  key_concepts JSONB, -- ["50-30-20 rule", "Needs vs Wants", "Envelope method"]
  key_takeaways TEXT[], -- Main lessons learned
  practical_tips TEXT[], -- Actionable advice given in module
  common_mistakes TEXT[], -- What to avoid
  
  -- Module structure
  total_steps INTEGER,
  learn_steps JSONB, -- Array of learning content
  apply_steps JSONB, -- Array of application scenarios
  reflect_questions TEXT[], -- Reflection questions asked
  
  -- Sources and references
  sources JSONB, -- External links and references
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast module lookup
CREATE INDEX IF NOT EXISTS idx_module_id ON learning_module_content(module_id);
CREATE INDEX IF NOT EXISTS idx_category ON learning_module_content(category);

-- Link to user's learning reflections (already exists)
-- This table connects user reflections to module content
-- Schema already exists: learning_reflections
-- We'll join this with learning_module_content to get both
-- the user's answers AND the module content

-- =====================================================
-- Sample Data Structure
-- =====================================================
/*
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps,
  learn_steps,
  sources
) VALUES (
  'budgeting',
  'Budgeting Mastery for Students',
  'Learn to manage your allowance and starting salary like a pro',
  '15 min',
  'core',
  '["50-30-20 rule", "Needs vs Wants classification", "Monthly budget tracking", "Expense categorization"]'::jsonb,
  ARRAY[
    'Budgeting prevents running out of money before next allowance/payday',
    'The 50-30-20 rule adapts to any income level - from ₱5,000 to ₱50,000',
    'Treating savings as a need builds wealth automatically',
    'Track all expenses for one week to see actual spending patterns'
  ],
  ARRAY[
    'Use 50% for NEEDS (food, transport, supplies)',
    'Allocate 30% for WANTS (entertainment, shopping)',
    'Save 20% automatically every payday',
    'Download a budgeting app or create expense tracker',
    'Open separate savings account for 20% allocation'
  ],
  ARRAY[
    'Not tracking expenses - cant improve what you dont measure',
    'Treating wants as needs - leads to overspending',
    'Not having separate savings account - savings gets spent',
    'Budgeting too strictly - leaves no room for life enjoyment'
  ],
  3,
  '[
    {
      "title": "What is Budgeting?",
      "type": "learn",
      "content": "Budgeting is telling your money where to go before you spend it...",
      "keyPoints": [
        "Prevents running out of money",
        "50-30-20 rule for any income",
        "Savings as automatic need"
      ]
    }
  ]'::jsonb,
  '[
    {
      "title": "Khan Academy - Budget Planning",
      "url": "https://www.khanacademy.org/...",
      "type": "Educational"
    }
  ]'::jsonb
);
*/

-- =====================================================
-- Query Examples for AI Context Building
-- =====================================================

-- Get all content for modules user completed
/*
SELECT 
  lmc.module_id,
  lmc.module_title,
  lmc.key_concepts,
  lmc.key_takeaways,
  lmc.practical_tips,
  lr.completion_date,
  lr.reflections_data
FROM learning_module_content lmc
JOIN learning_reflections lr 
  ON lmc.module_id = lr.module_id
WHERE lr.user_id = 'user-uuid-here'
  AND lr.module_completed = true
ORDER BY lr.completion_date DESC;
*/

-- =====================================================
-- Migration Notes
-- =====================================================
-- 1. Run this schema on Supabase
-- 2. Populate with data from data/learning-content-seed.sql
-- 3. Verify with: SELECT * FROM learning_module_content;
-- 4. Test joins with: SELECT * FROM learning_reflections 
--    WHERE user_id = 'test-user-id';



-- ================================================
-- FROM: docs/cross-session-memory-schema.sql
-- ================================================

-- Cross-Session Memory System
-- Stores important facts that should be remembered across different chat sessions
-- Date: October 5, 2025

-- Create the user_memories table for persistent cross-session memory
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('fact', 'preference', 'goal', 'item', 'concern')),
  category TEXT, -- e.g., 'purchase', 'budget', 'savings', 'investment', 'debt'
  key TEXT NOT NULL, -- e.g., 'laptop_price', 'monthly_income', 'savings_goal'
  value TEXT NOT NULL, -- The actual information
  context TEXT, -- Additional context or notes
  source_session_id TEXT, -- Which chat session this came from
  importance INTEGER DEFAULT 5, -- 1-10, how important is this memory
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration for time-sensitive info
  metadata JSONB DEFAULT '{}'
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_type ON user_memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_user_memories_category ON user_memories(category);
CREATE INDEX IF NOT EXISTS idx_user_memories_importance ON user_memories(importance DESC);
CREATE INDEX IF NOT EXISTS idx_user_memories_accessed ON user_memories(last_accessed DESC);

-- Enable Row Level Security
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
DROP POLICY IF EXISTS "Enable all operations for user_memories" ON user_memories;
CREATE POLICY "Enable all operations for user_memories" ON user_memories
  FOR ALL USING (true);

-- Examples of what gets stored:
-- 
-- user_id: 'abc-123-uuid'
-- memory_type: 'item'
-- category: 'purchase'
-- key: 'laptop_inquiry'
-- value: 'Lenovo IdeaPad 3, ₱25,000, interested in buying'
-- source_session_id: 'chat_1728123456_abc'
-- importance: 8
--
-- Later in a NEW chat session:
-- User: "How much was that laptop I asked about?"
-- AI checks user_memories → finds laptop_inquiry → "You asked about Lenovo IdeaPad 3 for ₱25,000"

-- Helper function to clean up old low-importance memories
CREATE OR REPLACE FUNCTION cleanup_old_memories()
RETURNS void AS $$
BEGIN
  -- Delete expired memories
  DELETE FROM user_memories 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  -- Delete old low-importance memories (keep only recent 50 per user)
  DELETE FROM user_memories
  WHERE id IN (
    SELECT id FROM (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY importance DESC, last_accessed DESC) as rn
      FROM user_memories
    ) sub
    WHERE rn > 50
  );
END;
$$ LANGUAGE plpgsql;

-- View to see all memories for a user
CREATE OR REPLACE VIEW user_memories_summary AS
SELECT 
  user_id,
  memory_type,
  category,
  COUNT(*) as memory_count,
  MAX(last_accessed) as most_recent_access,
  AVG(importance) as avg_importance
FROM user_memories
GROUP BY user_id, memory_type, category
ORDER BY user_id, avg_importance DESC;

-- Sample queries:

-- Get all memories for a user
-- SELECT * FROM user_memories WHERE user_id = 'your-uuid' ORDER BY importance DESC, last_accessed DESC;

-- Get specific type of memories
-- SELECT * FROM user_memories WHERE user_id = 'your-uuid' AND memory_type = 'item' ORDER BY importance DESC;

-- Search memories by keyword
-- SELECT * FROM user_memories WHERE user_id = 'your-uuid' AND (value ILIKE '%laptop%' OR context ILIKE '%laptop%');

-- Update last_accessed when memory is used
-- UPDATE user_memories SET last_accessed = NOW() WHERE id = 'memory-id';



-- ================================================
-- FROM: docs/admin-dashboard-schema.sql
-- ================================================

-- =====================================================
-- PLOUNIX ADMIN DASHBOARD - DATABASE SCHEMA
-- =====================================================
-- Run this in Supabase SQL Editor
-- Date: October 13, 2025

-- =====================================================
-- 1. ADMIN CREDENTIALS TABLE
-- =====================================================
-- Store admin login credentials (hashed passwords)
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Bcrypt hashed password
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- No RLS - admins access this only through protected API routes
COMMENT ON TABLE admin_credentials IS 'Admin login credentials - access via API only';

-- =====================================================
-- 2. BUG REPORTS TABLE
-- =====================================================
-- User-submitted bug reports and issues
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'issue', 'suggestion', 'feature_request')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT, -- Page where bug occurred: 'dashboard', 'transactions', 'ai-chat', etc.
  screenshot_url TEXT, -- Supabase Storage URL
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'in_progress', 'fixed', 'closed', 'wont_fix')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  admin_notes TEXT,
  browser_info JSONB, -- User agent, browser version, OS, screen size
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);

-- RLS: Users can view their own reports, admins access via API
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bug reports" ON bug_reports;
CREATE POLICY "Users can view own bug reports"
  ON bug_reports FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create bug reports" ON bug_reports;
CREATE POLICY "Users can create bug reports"
  ON bug_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bug reports" ON bug_reports;
CREATE POLICY "Users can update own bug reports"
  ON bug_reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE bug_reports IS 'User-submitted bug reports, issues, and suggestions';

-- =====================================================
-- 3. PAGE VIEWS TABLE
-- =====================================================
-- Track site visits and page views
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous users
  session_id TEXT NOT NULL, -- Browser session ID (generate on frontend)
  page_path TEXT NOT NULL, -- '/dashboard', '/ai-assistant', '/challenges', etc.
  page_title TEXT,
  referrer TEXT, -- Previous page or external referrer
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  country TEXT, -- Optional: from IP geolocation
  duration_seconds INTEGER, -- Time spent on page (if tracked)
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);

-- No RLS - analytics table, accessed via admin API only

COMMENT ON TABLE page_views IS 'Track page views for site analytics';

-- =====================================================
-- 4. ANNOUNCEMENTS TABLE
-- =====================================================
-- Platform-wide announcements sent by admin
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'update')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'active', 'inactive')),
  sent_to_count INTEGER DEFAULT 0, -- Number of users who received it
  send_email BOOLEAN DEFAULT false, -- Also send as email
  is_published BOOLEAN DEFAULT true,
  scheduled_for TIMESTAMP, -- Optional: schedule for future
  sent_at TIMESTAMP,
  expires_at TIMESTAMP, -- Optional: when announcement should disappear
  created_by TEXT, -- Admin username
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

COMMENT ON TABLE announcements IS 'Platform announcements sent by admins to users';

-- =====================================================
-- 5. USER NOTIFICATIONS TABLE
-- =====================================================
-- Individual notifications for users (from announcements or system)
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'update')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- RLS: Users can only see their own notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON user_notifications;
CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON user_notifications;
CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE user_notifications IS 'Individual user notifications';

-- =====================================================
-- 6. ADMIN ACTIVITY LOG (AUDIT TRAIL)
-- =====================================================
-- Track all admin actions for security and accountability
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL, -- 'sent_announcement', 'updated_bug_report', 'exported_users', etc.
  action_type TEXT CHECK (action_type IN ('read', 'create', 'update', 'delete', 'export')),
  target_type TEXT, -- 'user', 'bug_report', 'announcement', 'system', etc.
  target_id UUID, -- ID of affected entity
  details JSONB, -- Additional details about the action
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin ON admin_activity_log(admin_username);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);

COMMENT ON TABLE admin_activity_log IS 'Audit trail of all admin actions';

-- =====================================================
-- 7. FEATURE USAGE STATS TABLE
-- =====================================================
-- Track feature usage for analytics
CREATE TABLE IF NOT EXISTS feature_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL, -- 'transactions', 'ai_chat', 'goals', 'challenges', etc.
  action TEXT, -- 'view', 'create', 'update', 'delete'
  session_id TEXT,
  duration_seconds INTEGER,
  metadata JSONB, -- Additional context
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_stats_user_id ON feature_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_stats_feature ON feature_usage_stats(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_stats_created_at ON feature_usage_stats(created_at DESC);

COMMENT ON TABLE feature_usage_stats IS 'Track which features users are using';

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get active users count (logged in last 30 days)
CREATE OR REPLACE FUNCTION get_active_users_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM user_profiles
    WHERE updated_at > NOW() - INTERVAL '30 days'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get inactive users count (>30 days)
CREATE OR REPLACE FUNCTION get_inactive_users_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_profiles
    WHERE updated_at < NOW() - INTERVAL '30 days'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get new signups today
CREATE OR REPLACE FUNCTION get_signups_today_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_profiles
    WHERE created_at > CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get site visits this month
CREATE OR REPLACE FUNCTION get_site_visits_this_month()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM page_views
    WHERE viewed_at >= DATE_TRUNC('month', NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get most visited pages
CREATE OR REPLACE FUNCTION get_most_visited_pages(days INTEGER DEFAULT 30)
RETURNS TABLE(page_path TEXT, visit_count BIGINT) AS $$
BEGIN
  RETURN QUERY
    SELECT pv.page_path, COUNT(*) as visit_count
    FROM page_views pv
    WHERE pv.viewed_at > NOW() - (days || ' days')::INTERVAL
    GROUP BY pv.page_path
    ORDER BY visit_count DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create default admin account (username: admin, password: admin123)
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO admin_credentials (username, password_hash, email)
VALUES (
  'admin',
  '$2b$10$9lzzgUycdsjWFmbjspY2aeC47kju1S.UiNYe6if2l1FhgFiKT0sjm', -- bcrypt hash of 'admin123'
  'admin@plounix.com'
)
ON CONFLICT (username) DO NOTHING;

-- Note: You'll need to hash 'admin123' using bcrypt in your app and update this

COMMENT ON TABLE admin_credentials IS 'Default admin: username=admin, password=admin123 (CHANGE THIS!)';

-- =====================================================
-- VIEWS FOR ADMIN DASHBOARD
-- =====================================================

-- View: Dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM user_profiles) as total_users,
  (SELECT get_active_users_count()) as active_users,
  (SELECT get_inactive_users_count()) as inactive_users,
  (SELECT get_signups_today_count()) as signups_today,
  (SELECT COUNT(*) FROM user_profiles WHERE created_at >= DATE_TRUNC('week', NOW())) as signups_this_week,
  (SELECT COUNT(*) FROM user_profiles WHERE created_at >= DATE_TRUNC('month', NOW())) as signups_this_month,
  (SELECT get_site_visits_this_month()) as visits_this_month,
  (SELECT COUNT(*) FROM bug_reports WHERE status = 'new') as new_bug_reports,
  (SELECT COUNT(*) FROM bug_reports WHERE status IN ('under_review', 'in_progress')) as active_bug_reports;

-- View: Recent activity (last 24 hours)
CREATE OR REPLACE VIEW recent_user_activity AS
SELECT
  'signup' as activity_type,
  up.user_id,
  up.name as user_name,
  'Registered a new account' as description,
  up.created_at as activity_time
FROM user_profiles up
WHERE up.created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT
  'transaction' as activity_type,
  t.user_id,
  up.name as user_name,
  'Added transaction: ₱' || t.amount::TEXT as description,
  t.created_at as activity_time
FROM transactions t
JOIN user_profiles up ON t.user_id = up.user_id
WHERE t.created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT
  'goal_completed' as activity_type,
  g.user_id,
  up.name as user_name,
  'Completed goal: ' || g.title as description,
  g.updated_at as activity_time
FROM goals g
JOIN user_profiles up ON g.user_id = up.user_id
WHERE g.status = 'completed'
  AND g.updated_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT
  'challenge_joined' as activity_type,
  uc.user_id,
  up.name as user_name,
  'Joined challenge: ' || c.title as description,
  uc.started_at as activity_time
FROM user_challenges uc
JOIN user_profiles up ON uc.user_id = up.user_id
JOIN challenges c ON uc.challenge_id = c.id
WHERE uc.started_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT
  'bug_report' as activity_type,
  br.user_id,
  up.name as user_name,
  'Reported a bug: ' || br.title as description,
  br.created_at as activity_time
FROM bug_reports br
JOIN user_profiles up ON br.user_id = up.user_id
WHERE br.created_at > NOW() - INTERVAL '24 hours'
ORDER BY activity_time DESC
LIMIT 50;

-- =====================================================
-- GRANT PERMISSIONS (if needed)
-- =====================================================
-- These tables are accessed via API routes with admin auth
-- No direct database access needed for users

-- =====================================================
-- NOTES FOR IMPLEMENTATION
-- =====================================================
/*
1. Admin password needs to be hashed with bcrypt (rounds: 10)
   Example in Node.js:
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('admin123', 10);

2. Admin login flow:
   - POST /api/admin/login with username/password
   - Verify password with bcrypt.compare()
   - Set secure HTTP-only cookie with admin session
   - Middleware checks cookie on all /admin routes

3. Page tracking:
   - Add tracking to _app.tsx or layout.tsx
   - Log page view on route change
   - Include session ID (localStorage)

4. Feature usage tracking:
   - Track when users interact with major features
   - Call /api/track-feature on action

5. Bug report screenshot upload:
   - Upload to Supabase Storage: bucket 'bug-reports'
   - Store public URL in screenshot_url column
*/

-- =====================================================
-- CLEANUP (if you need to start fresh)
-- =====================================================
/*
-- Run these ONLY if you want to delete everything and start over:
DROP TABLE IF EXISTS admin_activity_log CASCADE;
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS feature_usage_stats CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS bug_reports CASCADE;
DROP TABLE IF EXISTS admin_credentials CASCADE;
DROP VIEW IF EXISTS admin_dashboard_stats;
DROP VIEW IF EXISTS recent_user_activity;
DROP FUNCTION IF EXISTS get_active_users_count();
DROP FUNCTION IF EXISTS get_inactive_users_count();
DROP FUNCTION IF EXISTS get_signups_today_count();
DROP FUNCTION IF EXISTS get_site_visits_this_month();
DROP FUNCTION IF EXISTS get_most_visited_pages(INTEGER);
*/



-- ================================================
-- FROM: docs/add-theme-language-preferences.sql
-- ================================================

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



-- ================================================
-- FROM: docs/add-onboarding-column.sql
-- ================================================

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



-- ================================================
-- FROM: docs/add-tour-completed-field.sql
-- ================================================

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


-- ================================================
-- FROM: docs/add-preferences-column-migration.sql
-- ================================================

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



-- ================================================
-- FROM: docs/add-user-id-migration.sql
-- ================================================

-- Migration: Add user_id to chat_history table
-- This allows filtering chat history by user
-- Date: October 5, 2025

-- Step 1: Add user_id column (nullable at first)
ALTER TABLE chat_history 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

-- Step 3: (Optional) Update existing records with a placeholder user_id
-- Uncomment the line below if you want to assign existing messages to a specific user
-- UPDATE chat_history SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;

-- Step 4: View current data structure
SELECT 
  session_id,
  user_id,
  message_type,
  LEFT(content, 50) as content_preview,
  created_at
FROM chat_history
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_history'
ORDER BY ordinal_position;



-- ================================================
-- FROM: data/learning-content-seed.sql
-- ================================================

-- =====================================================
-- LEARNING MODULE CONTENT - SEED DATA
-- Extracted from app/learning/[topicId]/page.tsx
-- Purpose: Populate learning_module_content table
-- =====================================================

-- 1. BUDGETING MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps,
  reflect_questions,
  sources
) VALUES (
  'budgeting',
  'Budgeting Mastery for Students',
  'Learn to manage your allowance and starting salary like a pro',
  '15 min',
  'core',
  '["50-30-20 rule", "Needs vs Wants classification", "Budget allocation strategy", "Monthly expense tracking", "Zero-based budgeting"]'::jsonb,
  ARRAY[
    'Budgeting prevents you from running out of money before next allowance/payday',
    'The 50-30-20 rule adapts to any income level - from ₱5,000 to ₱50,000',
    'Treating savings as a "need" builds wealth automatically',
    '50% for NEEDS: Food, transportation, school supplies, load',
    '30% for WANTS: Movies, coffee dates, new clothes, games',
    '20% for SAVINGS: Emergency fund, future goals'
  ],
  ARRAY[
    'Apply 50-30-20 rule to your monthly allowance/salary',
    'Track all expenses for one week to see actual spending patterns',
    'Download a budgeting app or create a simple expense tracker',
    'Open a separate savings account for your 20% allocation',
    'Calculate your monthly income first, then allocate percentages',
    'For ₱12,000 monthly: ₱6,000 needs, ₱3,600 wants, ₱2,400 savings'
  ],
  ARRAY[
    'Not tracking expenses - you cant improve what you dont measure',
    'Treating wants as needs - leads to overspending on non-essentials',
    'Not having separate savings account - savings money gets spent',
    'Budgeting too strictly - leaves no room for enjoying life',
    'Forgetting irregular expenses like birthdays, school events'
  ],
  3,
  ARRAY[
    'Based on your current allowance/salary, how would you apply the 50-30-20 rule?',
    'What spending habits would you need to change to fit this budget?',
    'What financial goal would motivate you to stick to saving 20%?'
  ],
  '[
    {
      "title": "Khan Academy - Budget Planning",
      "url": "https://www.khanacademy.org/college-careers-more/financial-literacy/xa6995ea67a8e9fdd:budgeting-and-saving/xa6995ea67a8e9fdd:budgeting/a/planning-a-budget-start",
      "type": "Educational"
    }
  ]'::jsonb
);

-- 2. SAVING MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps,
  reflect_questions,
  sources
) VALUES (
  'saving',
  'Smart Saving for Filipino Youth',
  'Discover where and how to save money for maximum growth',
  '15 min',
  'core',
  '["Digital banks vs traditional banks", "High-yield savings accounts", "PDIC insurance", "Interest rate comparison", "Emergency fund placement"]'::jsonb,
  ARRAY[
    'Digital banks offer 10-20x higher interest than traditional banks',
    'All mentioned banks are PDIC-insured (safe up to ₱500,000)',
    'Start with digital wallets for convenience, upgrade to banks for higher amounts',
    'CIMB Bank: Up to 4% annually, ₱100 minimum',
    'GCash GSave: 2.6% annually, instant access, no minimum',
    'Tonik Bank: Up to 6% annually, ₱1,000 minimum',
    '₱10,000 saved at 6% earns ₱600 vs ₱25 at traditional banks'
  ],
  ARRAY[
    'Open GCash GSave account for instant access to emergency funds',
    'Open Tonik Bank or CIMB for higher interest on main savings',
    'Split savings: ₱2,000 in GCash for emergencies, rest in high-yield bank',
    'Set up automatic transfers to savings account every payday',
    'Research digital banks: CIMB, ING, or Tonik this week',
    'Compare interest rates: Traditional (0.25%) vs Digital (4-6%)'
  ],
  ARRAY[
    'Keeping all money in traditional bank - losing to inflation',
    'Not comparing interest rates - missing 10x higher earnings',
    'Using only one savings account - no separation of emergency vs goals',
    'Not setting up automatic transfers - savings happen by chance',
    'Choosing convenience over growth for all savings'
  ],
  3,
  ARRAY[
    'Which digital bank or wallet appeals most to you and why?',
    'How would you split your savings between convenience and growth?',
    'What savings milestone would you celebrate first?'
  ],
  '[
    {
      "title": "BSP List of Digital Banks",
      "url": "https://www.bsp.gov.ph/SitePages/Default.aspx",
      "type": "Government"
    }
  ]'::jsonb
);

-- 3. INVESTING MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps,
  reflect_questions,
  sources
) VALUES (
  'investing',
  'Investment Basics for Beginners',
  'Start building wealth with beginner-friendly investments',
  '18 min',
  'core',
  '["Investing vs Saving", "Risk and reward tradeoff", "Mutual funds", "Stock market basics", "Compound growth", "Investment timeline", "Diversification"]'::jsonb,
  ARRAY[
    'Investing puts money to work to earn more money over time',
    'Philippines inflation 3-4% yearly - savings accounts lose purchasing power',
    'Start investing early to harness compound growth',
    'Mutual funds offer professional management for beginners',
    'Invest money you wont need for at least 3-5 years',
    'BPI Investment Funds: ₱1,000 minimum, professional management',
    'COL Financial: ₱1,000 minimum, trade Philippine stocks',
    'Start with ₱1,000 monthly in balanced mutual fund'
  ],
  ARRAY[
    'Start with ₱10,000 in BPI Balanced Fund to learn',
    'Invest ₱2,000 monthly after building emergency fund',
    'Visit investment platform websites: BPI, BDO, COL Financial',
    'Calculate your potential investment using 20% of income rule',
    'Set up separate "investment fund" savings account',
    'Learn for 6 months before exploring individual stocks',
    'Only invest money you can afford not to touch for 5+ years'
  ],
  ARRAY[
    'Investing before building emergency fund - forced to withdraw at loss',
    'Investing money needed in next 3 years - not enough time to recover from losses',
    'Putting all money in one investment - no diversification',
    'Day trading as beginner - 90% of day traders lose money',
    'Following "hot tips" without research - gambling not investing'
  ],
  3,
  ARRAY[
    'What long-term financial goal would motivate you to start investing?',
    'How comfortable are you with risk that investment might lose value short-term?',
    'What investment platform (BPI, BDO, COL) seems most suitable for you?'
  ],
  '[
    {
      "title": "SEC Investor Education",
      "url": "https://www.sec.gov.ph/#gsc.tab=0",
      "type": "Government"
    }
  ]'::jsonb
);

-- 4. EMERGENCY FUND MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps,
  reflect_questions,
  sources
) VALUES (
  'emergency-fund',
  'Emergency Fund Essentials',
  'Build your financial safety net with smart emergency fund strategies',
  '15 min',
  'essential',
  '["Emergency fund definition", "3-6 months expenses rule", "Emergency vs savings distinction", "Accessible savings placement", "Emergency fund targets by life stage"]'::jsonb,
  ARRAY[
    'Emergency fund is money for unexpected expenses only',
    'Students need ₱10,000-15,000 minimum emergency fund',
    'Working professionals need 3-6 months of expenses',
    'Emergency funds prevent borrowing money or going into debt',
    'Keep emergency money separate from regular savings',
    'Emergency funds should be accessible within 24 hours',
    'Common emergencies: Medical (₱5k-15k), laptop/phone repairs (₱10k-40k), job loss'
  ],
  ARRAY[
    'Calculate your monthly expenses first',
    'Students: Target ₱10,000-15,000 minimum',
    'Fresh graduates: Target 3 months expenses (₱30k-60k)',
    'Working professionals: Target 6 months expenses',
    'Keep in GCash GSave for instant access (2.6% interest)',
    'Or CIMB Bank for higher interest (4%) with quick withdrawal',
    'Build gradually: Save ₱500-1,000 monthly if starting',
    'Celebrate milestones: ₱5,000, ₱10,000, ₱20,000 achieved'
  ],
  ARRAY[
    'Mixing emergency fund with regular savings - gets spent',
    'Not having emergency fund - forced to borrow when crisis hits',
    'Investing emergency fund - cant access quickly without losses',
    'Target too high initially - discouragement leads to not starting',
    'Using emergency fund for non-emergencies - depletes safety net'
  ],
  3,
  ARRAY[
    'What emergencies worry you most and how much would they cost?',
    'Based on your monthly expenses, what is your emergency fund target?',
    'How long would it take you to build your target emergency fund?'
  ],
  '[
    {
      "title": "BSP Financial Education",
      "url": "https://www.bsp.gov.ph/SitePages/Default.aspx",
      "type": "Government"
    }
  ]'::jsonb
);

-- 5. CREDIT AND DEBT MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps,
  reflect_questions
) VALUES (
  'credit-debt',
  'Credit and Debt Management',
  'Master credit cards, loans, and debt payoff strategies for Filipino youth',
  '20 min',
  'essential',
  '["Good debt vs bad debt", "Credit score basics", "Credit card management", "Debt avalanche method", "Debt snowball method", "Interest rate impact"]'::jsonb,
  ARRAY[
    'Good debt: Education, business, real estate (appreciating assets)',
    'Bad debt: Credit card debt, consumer loans for wants',
    'Credit cards charge 3-3.5% monthly interest (42% annually)',
    'Always pay credit card in full to avoid interest charges',
    'Credit score affects future loan approvals and interest rates',
    'Debt avalanche: Pay highest interest rate first',
    'Debt snowball: Pay smallest balance first for motivation'
  ],
  ARRAY[
    'Pay credit card in full every month to avoid interest',
    'Use credit cards for rewards only if you can pay in full',
    'If in debt: List all debts with interest rates and balances',
    'Prioritize highest interest rate debt first (avalanche method)',
    'Or pay smallest debt first for quick wins (snowball method)',
    'Avoid new debt while paying off existing debt',
    'Consider balance transfer to lower interest if possible',
    'Track debt payoff progress monthly to stay motivated'
  ],
  ARRAY[
    'Paying only minimum on credit cards - decades to payoff',
    'Using credit card for wants without payoff plan',
    'Not knowing interest rates on existing debts',
    'Taking on new debt while paying off old debt',
    'Ignoring credit score - affects future financial opportunities'
  ],
  3,
  ARRAY[
    'Do you currently have any debts and what are the interest rates?',
    'Which debt payoff method (avalanche or snowball) appeals to you?',
    'What strategies will you use to avoid bad debt in the future?'
  ]
);

-- 6. DIGITAL MONEY MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes
) VALUES (
  'digital-money',
  'Digital Money and Financial Tech',
  'Navigate GCash, PayMaya, and digital banking safely and effectively',
  '15 min',
  'essential',
  '["E-wallet security", "Digital banking features", "Online payment safety", "QR code payments", "Digital money management"]'::jsonb,
  ARRAY[
    'E-wallets (GCash, PayMaya) provide convenience and higher interest',
    'Digital banks (CIMB, Tonik, ING) offer better rates than traditional banks',
    'All legitimate banks are PDIC-insured up to ₱500,000',
    'Enable two-factor authentication for all financial apps',
    'Never share OTP codes with anyone',
    'Use strong unique passwords for each financial app'
  ],
  ARRAY[
    'Enable 2FA (two-factor authentication) on all apps',
    'Use biometric login (fingerprint/face) when available',
    'Check transaction history weekly for unauthorized charges',
    'Link multiple funding sources for flexibility',
    'Keep small amount in e-wallet, larger in digital bank',
    'Never click suspicious links claiming to be from banks',
    'Verify recipient details before sending money'
  ],
  ARRAY[
    'Using same password for all financial apps - one breach compromises all',
    'Sharing OTP codes - enables unauthorized access',
    'Not checking transaction history - miss fraudulent charges',
    'Keeping large amounts in e-wallets - use banks for larger sums',
    'Clicking phishing links - fake bank websites steal credentials'
  ]
);

-- =====================================================
-- Verification Query
-- =====================================================
-- After running this seed file, verify with:
-- SELECT module_id, module_title, array_length(key_takeaways, 1) as takeaway_count 
-- FROM learning_module_content 
-- ORDER BY module_id;


