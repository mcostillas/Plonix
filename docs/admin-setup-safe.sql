-- =====================================================
-- PLOUNIX ADMIN - SAFE TO RUN MULTIPLE TIMES
-- =====================================================
-- This version is idempotent (safe to run multiple times)

-- 1. CREATE ADMIN CREDENTIALS TABLE
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. INSERT DEFAULT ADMIN (only if doesn't exist)
INSERT INTO admin_credentials (username, password_hash, email)
VALUES (
  'admin',
  '$2b$10$9lzzgUycdsjWFmbjspY2aeC47kju1S.UiNYe6if2l1FhgFiKT0sjm',
  'admin@plounix.com'
)
ON CONFLICT (username) DO NOTHING;

-- 3. CREATE OTHER TABLES
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'issue', 'suggestion', 'feature_request')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'in_progress', 'fixed', 'closed', 'wont_fix')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  admin_notes TEXT,
  browser_info JSONB,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  country TEXT,
  duration_seconds INTEGER,
  viewed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'update')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'active', 'inactive')),
  sent_to_count INTEGER DEFAULT 0,
  send_email BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,
  action_type TEXT CHECK (action_type IN ('read', 'create', 'update', 'delete', 'export')),
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  action TEXT,
  session_id TEXT,
  duration_seconds INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin ON admin_activity_log(admin_username);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_usage_stats_user_id ON feature_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_stats_feature ON feature_usage_stats(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_stats_created_at ON feature_usage_stats(created_at DESC);

-- 5. ENABLE RLS
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- 6. CREATE OR REPLACE POLICIES (safe to run multiple times)
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

DROP POLICY IF EXISTS "Users can view own notifications" ON user_notifications;
CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON user_notifications;
CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. CREATE HELPER FUNCTIONS
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

CREATE OR REPLACE FUNCTION get_site_visits_this_month()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(COUNT(*), 0)
    FROM page_views
    WHERE viewed_at >= DATE_TRUNC('month', NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 8. CREATE VIEWS
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM user_profiles) as total_users,
  (SELECT get_active_users_count()) as active_users,
  (SELECT get_inactive_users_count()) as inactive_users,
  (SELECT get_signups_today_count()) as signups_today,
  (SELECT COUNT(*) FROM user_profiles WHERE created_at >= DATE_TRUNC('week', NOW())) as signups_this_week,
  (SELECT COUNT(*) FROM user_profiles WHERE created_at >= DATE_TRUNC('month', NOW())) as signups_this_month,
  (SELECT get_site_visits_this_month()) as visits_this_month,
  (SELECT COALESCE(COUNT(*), 0) FROM bug_reports WHERE status = 'new') as new_bug_reports,
  (SELECT COALESCE(COUNT(*), 0) FROM bug_reports WHERE status IN ('under_review', 'in_progress')) as active_bug_reports;

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
-- DONE! Admin setup complete.
-- Default admin: username='admin', password='admin123'
-- =====================================================
