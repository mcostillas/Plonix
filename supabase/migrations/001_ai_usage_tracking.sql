-- ================================================
-- AI USAGE TRACKING TABLE
-- Tracks AI message usage for freemium users
-- ================================================

-- Create the table
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: 'YYYY-MM' (e.g., '2025-10')
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one record per user per month
  CONSTRAINT ai_usage_user_month_unique UNIQUE(user_id, month)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_month ON ai_usage_tracking(user_id, month);
CREATE INDEX IF NOT EXISTS idx_ai_usage_month ON ai_usage_tracking(month);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- 1. Users can only read their own usage
DROP POLICY IF EXISTS "Users can view their own AI usage" ON ai_usage_tracking;
CREATE POLICY "Users can view their own AI usage"
  ON ai_usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Service role has full access (for API routes)
DROP POLICY IF EXISTS "Service role has full access" ON ai_usage_tracking;
CREATE POLICY "Service role has full access"
  ON ai_usage_tracking
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE ai_usage_tracking IS 'Tracks AI message usage per user per month for freemium rate limiting';
COMMENT ON COLUMN ai_usage_tracking.month IS 'Month in YYYY-MM format for automatic monthly resets';
COMMENT ON COLUMN ai_usage_tracking.message_count IS 'Number of AI messages sent by user in this month';
