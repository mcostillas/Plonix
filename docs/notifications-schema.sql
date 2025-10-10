-- ============================================
-- NOTIFICATION SYSTEM DATABASE SCHEMA
-- Phase 2: Notification Bell & History Center
-- ============================================

-- ============================================
-- 1. NOTIFICATIONS TABLE
-- Stores all notification history for users
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Notification classification
  type TEXT NOT NULL CHECK (type IN (
    'bill_reminder',
    'learning',
    'achievement',
    'budget_alert',
    'system'
  )),
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Optional link (e.g., '/dashboard#bills')
  
  -- State management
  is_read BOOLEAN DEFAULT false NOT NULL,
  clicked_at TIMESTAMPTZ, -- Track when user clicked notification
  
  -- Additional data (flexible JSON for type-specific data)
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 2. USER NOTIFICATION PREFERENCES TABLE
-- User control over which notifications to receive
-- ============================================

CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Notification type toggles
  bill_reminders BOOLEAN DEFAULT true NOT NULL,
  budget_alerts BOOLEAN DEFAULT true NOT NULL,
  learning_prompts BOOLEAN DEFAULT true NOT NULL,
  achievements BOOLEAN DEFAULT true NOT NULL,
  
  -- Timing preferences
  reminder_days_before INT DEFAULT 7 NOT NULL CHECK (reminder_days_before IN (1, 3, 7)),
  
  -- Advanced preferences (Phase 4)
  email_enabled BOOLEAN DEFAULT false NOT NULL,
  quiet_hours_start INT CHECK (quiet_hours_start >= 0 AND quiet_hours_start < 24),
  quiet_hours_end INT CHECK (quiet_hours_end >= 0 AND quiet_hours_end < 24),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================

-- Fast lookup of user's notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Quick filtering of unread notifications
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;

-- Sort by creation date efficiently
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Composite index for common query (user's unread notifications)
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC) 
  WHERE is_read = false;

-- Index for notification type analytics
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" 
  ON notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, clicked)
CREATE POLICY "Users can update own notifications" 
  ON notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- System can insert notifications (for background jobs)
CREATE POLICY "System can create notifications" 
  ON notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" 
  ON notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- USER NOTIFICATION PREFERENCES POLICIES
-- ============================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences" 
  ON user_notification_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own preferences (first time setup)
CREATE POLICY "Users can create own preferences" 
  ON user_notification_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" 
  ON user_notification_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to automatically create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. UTILITY FUNCTIONS FOR COMMON QUERIES
-- ============================================

-- Get unread notification count for user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT
  FROM notifications
  WHERE user_id = p_user_id AND is_read = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- Mark all notifications as read for user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
  UPDATE notifications
  SET is_read = true
  WHERE user_id = p_user_id AND is_read = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 7. SAMPLE DATA (FOR TESTING)
-- ============================================

-- Insert sample notifications (replace 'YOUR_USER_ID' with actual user ID)
/*
INSERT INTO notifications (user_id, type, title, message, action_url, metadata) VALUES
(
  'YOUR_USER_ID',
  'bill_reminder',
  'Electricity Bill Due Tomorrow',
  'Your electricity bill of ₱1,200 is due tomorrow',
  '/dashboard#bills',
  '{"bill_id": "abc-123", "amount": 1200, "due_date": "2025-10-12"}'
),
(
  'YOUR_USER_ID',
  'learning',
  'New Learning Module Available',
  'Check out "Emergency Fund Basics" - Just 5 minutes',
  '/learning',
  '{"lesson_id": "emergency-fund-basics"}'
),
(
  'YOUR_USER_ID',
  'achievement',
  'Challenge Complete!',
  'You completed the 30-Day Savings Challenge!',
  '/challenges',
  '{"challenge_id": "30-day-savings", "reward": 50}'
);
*/

-- ============================================
-- 8. CLEANUP POLICY (OPTIONAL)
-- Delete old read notifications after 90 days
-- ============================================

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS VOID AS $$
BEGIN
  DELETE FROM notifications
  WHERE is_read = true 
    AND created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule this to run periodically using pg_cron or external scheduler
-- Example with pg_cron (if installed):
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *', $$SELECT cleanup_old_notifications()$$);

-- ============================================
-- 9. ANALYTICS VIEWS (OPTIONAL)
-- ============================================

-- View: Notification performance by type
CREATE OR REPLACE VIEW notification_analytics AS
SELECT 
  type,
  COUNT(*) as total_sent,
  SUM(CASE WHEN is_read THEN 1 ELSE 0 END) as read_count,
  SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked_count,
  ROUND(
    100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
    2
  ) as click_through_rate,
  ROUND(
    100.0 * SUM(CASE WHEN is_read THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
    2
  ) as read_rate
FROM notifications
GROUP BY type
ORDER BY total_sent DESC;

-- ============================================
-- INSTALLATION INSTRUCTIONS
-- ============================================

/*
1. Copy this entire file
2. Go to Supabase Dashboard → SQL Editor
3. Create new query
4. Paste this SQL
5. Click "Run"
6. Verify tables created in Table Editor

7. To test, insert sample notifications:
   - Replace 'YOUR_USER_ID' with your actual user ID
   - Uncomment the sample data section
   - Run the INSERT statements

8. Check that default preferences were created:
   SELECT * FROM user_notification_preferences WHERE user_id = 'YOUR_USER_ID';

9. Test the utility functions:
   SELECT get_unread_notification_count('YOUR_USER_ID');
*/

-- ============================================
-- SCHEMA VERSION
-- ============================================

-- Track schema version for migrations
CREATE TABLE IF NOT EXISTS schema_versions (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  description TEXT
);

INSERT INTO schema_versions (version, description) VALUES
  ('notification_system_v1', 'Initial notification system schema with notifications and preferences tables');

-- ============================================
-- END OF SCHEMA
-- ============================================
