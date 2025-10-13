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

CREATE POLICY "Users can view own bug reports"
  ON bug_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bug reports"
  ON bug_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

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
