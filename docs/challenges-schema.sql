-- ============================================
-- PLOUNIX CHALLENGES SYSTEM - DATABASE SCHEMA
-- Hybrid Tracking with Tiered Failure System
-- ============================================

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS challenge_progress CASCADE;
DROP TABLE IF EXISTS user_challenges CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;

-- Drop existing views if they exist
DROP VIEW IF EXISTS user_active_challenges CASCADE;
DROP VIEW IF EXISTS challenge_leaderboard CASCADE;

-- ============================================
-- TABLE: challenges
-- Defines all available challenges in the system
-- ============================================
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'savings', 'budgeting', 'discipline', 'spending', 'investing'
  icon TEXT, -- Emoji or icon name
  tips TEXT[], -- Array of helpful tips for users
  
  -- Challenge Mechanics
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('flexible', 'streak', 'time_bound')),
  validation_method TEXT NOT NULL CHECK (validation_method IN ('manual', 'automatic', 'hybrid')),
  
  -- Duration & Requirements
  duration_days INTEGER NOT NULL, -- How long to complete
  required_checkins INTEGER, -- For flexible challenges
  required_consecutive_days INTEGER, -- For streak challenges
  specific_days TEXT[], -- For time-bound challenges ['Saturday', 'Sunday']
  
  -- Requirements (JSON for complex rules)
  requirements JSONB DEFAULT '{}', 
  -- Examples:
  -- {"target_amount": 5000, "category": "savings"}
  -- {"spending_limit": 0, "categories": ["food", "shopping"]}
  -- {"min_transactions_per_day": 1}
  
  -- Failure Rules
  grace_period_hours INTEGER DEFAULT 24,
  max_missed_days INTEGER DEFAULT 0, -- 0 = strict (streak), >0 = flexible
  failure_condition TEXT CHECK (failure_condition IN (
    'deadline_passed_without_completion',
    'streak_broken',
    'deadline_passed',
    'manual_abandonment'
  )),
  
  -- Rewards
  points_full INTEGER DEFAULT 100, -- Full completion points
  points_partial_enabled BOOLEAN DEFAULT TRUE, -- Award partial points?
  badge_icon TEXT,
  badge_title TEXT,
  
  -- Difficulty & Engagement
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_time_commitment TEXT, -- "5 min/day", "30 min total"
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  total_participants INTEGER DEFAULT 0, -- Counter for gamification
  success_rate NUMERIC(5,2), -- Calculated: (completed / total_attempts) * 100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for fast queries
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);

-- ============================================
-- TABLE: user_challenges
-- Tracks user participation in challenges
-- ============================================
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  
  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',      -- Currently ongoing
    'completed',   -- Successfully finished
    'failed',      -- Didn't meet requirements
    'abandoned'    -- User manually quit
  )),
  
  -- Progress
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  checkins_completed INTEGER DEFAULT 0,
  checkins_required INTEGER, -- Copied from challenge for reference
  current_streak INTEGER DEFAULT 0, -- For streak challenges
  
  -- Dates
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ, -- When user actually started (can be different from joined_at)
  deadline TIMESTAMPTZ, -- Auto-calculated: joined_at + duration_days
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Failure Handling
  failure_reason TEXT, -- 'deadline_passed', 'streak_broken', 'abandoned', 'inactive'
  partial_completion_percent INTEGER DEFAULT 0,
  can_retry BOOLEAN DEFAULT TRUE,
  retry_count INTEGER DEFAULT 0,
  
  -- Notifications
  last_reminder_sent_at TIMESTAMPTZ,
  reminder_frequency TEXT DEFAULT 'daily', -- 'daily', 'every_2_days', 'weekly'
  
  -- Results
  points_earned INTEGER DEFAULT 0,
  badge_earned TEXT,
  
  -- Progress Data (JSON for flexible storage)
  progress_data JSONB DEFAULT '{}',
  -- Example: {"day_1": true, "day_2": false, "day_3": true, "notes": [...]}
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);
CREATE INDEX IF NOT EXISTS idx_user_challenges_deadline ON user_challenges(deadline);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_status ON user_challenges(user_id, status);

-- Prevent duplicate active challenges (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_challenge 
  ON user_challenges(user_id, challenge_id) 
  WHERE status = 'active';

-- ============================================
-- TABLE: challenge_progress
-- Logs individual check-ins and milestones
-- ============================================
CREATE TABLE challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
  
  -- Progress Type
  progress_type TEXT CHECK (progress_type IN (
    'daily_checkin',      -- Daily check-in
    'milestone',          -- Reached a milestone
    'completion',         -- Final completion
    'failure',            -- Challenge failed
    'retroactive_checkin' -- Marked previous day
  )),
  
  -- Check-in Data
  checkin_date DATE NOT NULL, -- Which day this check-in is for
  completed BOOLEAN DEFAULT FALSE,
  note TEXT, -- User's optional note
  
  -- Value Data (for automatic tracking)
  value NUMERIC, -- Amount saved, spent, etc.
  transaction_id UUID, -- Link to transaction if auto-tracked
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  -- Example: {"mood": "happy", "difficulty": 3, "time_saved": "1 hour"}
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_challenge ON challenge_progress(user_challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_date ON challenge_progress(checkin_date);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_type ON challenge_progress(progress_type);

-- ============================================
-- FUNCTION: Calculate deadline
-- Auto-calculate deadline when user joins challenge
-- ============================================
CREATE OR REPLACE FUNCTION calculate_challenge_deadline()
RETURNS TRIGGER AS $$
BEGIN
  -- Get duration from challenge
  SELECT 
    NOW() + (c.duration_days || ' days')::INTERVAL,
    c.required_checkins
  INTO 
    NEW.deadline,
    NEW.checkins_required
  FROM challenges c
  WHERE c.id = NEW.challenge_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_challenge_deadline ON user_challenges;
CREATE TRIGGER set_challenge_deadline
  BEFORE INSERT ON user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION calculate_challenge_deadline();

-- ============================================
-- FUNCTION: Update challenge progress percentage
-- Auto-update progress when check-in is added
-- ============================================
CREATE OR REPLACE FUNCTION update_challenge_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_checkins INTEGER;
  required_checkins INTEGER;
BEGIN
  -- Count completed check-ins
  SELECT COUNT(*) 
  INTO total_checkins
  FROM challenge_progress
  WHERE user_challenge_id = NEW.user_challenge_id
    AND completed = TRUE;
  
  -- Get required check-ins
  SELECT checkins_required
  INTO required_checkins
  FROM user_challenges
  WHERE id = NEW.user_challenge_id;
  
  -- Update progress percentage
  UPDATE user_challenges
  SET 
    checkins_completed = total_checkins,
    progress_percent = LEAST(100, (total_checkins::NUMERIC / NULLIF(required_checkins, 0) * 100)::INTEGER),
    updated_at = NOW()
  WHERE id = NEW.user_challenge_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_progress_on_checkin ON challenge_progress;
CREATE TRIGGER update_progress_on_checkin
  AFTER INSERT ON challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_progress();

-- ============================================
-- FUNCTION: Complete challenge
-- Check if challenge should be auto-completed
-- ============================================
CREATE OR REPLACE FUNCTION check_challenge_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If progress reaches 100%, mark as completed
  IF NEW.progress_percent >= 100 AND NEW.status = 'active' THEN
    NEW.status = 'completed';
    NEW.completed_at = NOW();
    
    -- Award full points
    UPDATE user_challenges
    SET points_earned = (
      SELECT points_full 
      FROM challenges 
      WHERE id = NEW.challenge_id
    )
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS auto_complete_challenge ON user_challenges;
CREATE TRIGGER auto_complete_challenge
  BEFORE UPDATE ON user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION check_challenge_completion();

-- ============================================
-- FUNCTION: Update challenge statistics
-- Update total participants and success rate
-- ============================================
CREATE OR REPLACE FUNCTION update_challenge_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total participants (when user joins)
  IF TG_OP = 'INSERT' THEN
    UPDATE challenges
    SET total_participants = total_participants + 1
    WHERE id = NEW.challenge_id;
  END IF;
  
  -- Update success rate (when challenge completes or fails)
  IF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status IN ('completed', 'failed') THEN
    UPDATE challenges c
    SET success_rate = (
      SELECT 
        ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / 
               COUNT(*)::NUMERIC * 100), 2)
      FROM user_challenges
      WHERE challenge_id = NEW.challenge_id
        AND status IN ('completed', 'failed')
    )
    WHERE c.id = NEW.challenge_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_stats ON user_challenges;
CREATE TRIGGER update_stats
  AFTER INSERT OR UPDATE ON user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_stats();

-- ============================================
-- RLS (Row Level Security) Policies
-- Ensure users can only see their own challenges
-- ============================================

-- Enable RLS
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

-- Challenges table is public (everyone can see available challenges)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active challenges" 
  ON challenges FOR SELECT 
  USING (is_active = TRUE);

-- Users can only see their own challenge participation
CREATE POLICY "Users can view own challenges" 
  ON user_challenges FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" 
  ON user_challenges FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" 
  ON user_challenges FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can only see their own progress
CREATE POLICY "Users can view own progress" 
  ON challenge_progress FOR SELECT 
  USING (
    user_challenge_id IN (
      SELECT id FROM user_challenges WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own progress" 
  ON challenge_progress FOR INSERT 
  WITH CHECK (
    user_challenge_id IN (
      SELECT id FROM user_challenges WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- INITIAL SEED DATA
-- 8 Challenges (Student, Graduate, Popular)
-- ============================================

-- STUDENT CHALLENGES (3)

-- Challenge 1: ₱100 Daily Challenge
INSERT INTO challenges (
  title, description, category, icon, challenge_type, validation_method,
  duration_days, required_checkins,
  grace_period_hours, max_missed_days, failure_condition,
  points_full, points_partial_enabled, badge_title, difficulty,
  estimated_time_commitment, total_participants,
  requirements
) VALUES (
  '₱100 Daily Challenge',
  'Survive on ₱100 daily for food and drinks. Perfect for students wanting to stretch their allowance.',
  'budgeting',
  '☕',
  'flexible',
  'manual',
  7,
  7,
  24,
  1,
  'deadline_passed_without_completion',
  100,
  TRUE,
  'Budget Master',
  'easy',
  '7 days',
  1247,
  '{"estimated_savings": 500, "tips": ["Cook rice at home, buy ulam only", "Bring water bottle instead of buying drinks", "Look for student meal deals", "Share food costs with classmates"]}'::jsonb
);

-- Challenge 2: Load Smart Challenge
INSERT INTO challenges (
  title, description, category, icon, challenge_type, validation_method,
  duration_days, required_checkins,
  grace_period_hours, max_missed_days, failure_condition,
  points_full, points_partial_enabled, badge_title, difficulty,
  estimated_time_commitment, total_participants,
  requirements
) VALUES (
  'Load Smart Challenge',
  'Reduce your mobile load expenses by 50% using WiFi, free apps, and smart usage.',
  'savings',
  '🎯',
  'flexible',
  'manual',
  14,
  10,
  24,
  2,
  'deadline_passed_without_completion',
  120,
  TRUE,
  'Data Saver',
  'easy',
  '2 weeks',
  892,
  '{"estimated_savings": 400, "tips": ["Use free WiFi whenever possible", "Switch to messaging apps (Messenger, Viber)", "Download content when on WiFi", "Use data-saving modes"]}'::jsonb
);

-- Challenge 3: Transport Budget Week
INSERT INTO challenges (
  title, description, category, icon, challenge_type, validation_method,
  duration_days, required_checkins,
  grace_period_hours, max_missed_days, failure_condition,
  points_full, points_partial_enabled, badge_title, difficulty,
  estimated_time_commitment, total_participants,
  requirements
) VALUES (
  'Transport Budget Week',
  'Stick to ₱200 weekly transport budget using jeepneys, walking, and carpooling.',
  'budgeting',
  '📈',
  'flexible',
  'manual',
  7,
  7,
  24,
  1,
  'deadline_passed_without_completion',
  90,
  TRUE,
  'Commute Pro',
  'medium',
  '1 week',
  634,
  '{"estimated_savings": 400, "tips": ["Walk for short distances (1-2 stops)", "Use jeepneys instead of Grab", "Organize carpool with classmates", "Combine errands into one trip"]}'::jsonb
);

-- GRADUATE CHALLENGES (3)

-- Challenge 4: First Salary Smart Split
INSERT INTO challenges (
  title, description, category, icon, challenge_type, validation_method,
  duration_days, required_checkins,
  grace_period_hours, max_missed_days, failure_condition,
  points_full, points_partial_enabled, badge_title, difficulty,
  estimated_time_commitment, total_participants,
  requirements
) VALUES (
  'First Salary Smart Split',
  'Apply 50-30-20 rule to your first salary: 50% needs, 30% wants, 20% savings.',
  'budgeting',
  '🐷',
  'flexible',
  'manual',
  30,
  4,
  48,
  1,
  'deadline_passed_without_completion',
  150,
  TRUE,
  'Budget Boss',
  'medium',
  '1 month',
  1456,
  '{"savings_percent": 20, "tips": ["Set up automatic savings transfer", "Track every expense for first month", "Resist lifestyle inflation temptations", "Celebrate small wins"]}'::jsonb
);

-- Challenge 5: ₱30,000 Emergency Fund Race
INSERT INTO challenges (
  title, description, category, icon, challenge_type, validation_method,
  duration_days, required_checkins,
  grace_period_hours, max_missed_days, failure_condition,
  points_full, points_partial_enabled, badge_title, difficulty,
  estimated_time_commitment, total_participants,
  requirements
) VALUES (
  '₱30,000 Emergency Fund Race',
  'Build your first emergency fund (3 months expenses) as fast as possible.',
  'savings',
  '🏆',
  'flexible',
  'manual',
  180,
  24,
  72,
  3,
  'deadline_passed_without_completion',
  300,
  TRUE,
  'Financial Fortress',
  'hard',
  '6 months',
  743,
  '{"target_amount": 30000, "tips": ["Start with ₱5,000 monthly savings", "Use high-yield digital banks (CIMB, Tonik)", "Save bonus/13th month pay", "Side hustle for extra income"]}'::jsonb
);

-- Challenge 6: Investment Starter Challenge
INSERT INTO challenges (
  title, description, category, icon, challenge_type, validation_method,
  duration_days, required_checkins,
  grace_period_hours, max_missed_days, failure_condition,
  points_full, points_partial_enabled, badge_title, difficulty,
  estimated_time_commitment, total_participants,
  requirements
) VALUES (
  'Investment Newbie Challenge',
  'Start investing ₱1,000 monthly in mutual funds for 6 months.',
  'investing',
  '�',
  'flexible',
  'manual',
  180,
  6,
  72,
  1,
  'deadline_passed_without_completion',
  200,
  TRUE,
  'Investor Novice',
  'medium',
  '6 months',
  528,
  '{"monthly_investment": 1000, "total_target": 6000, "tips": ["Start with balanced mutual funds", "Use BPI, BDO, or COL Financial", "Don''t check daily - invest for long term", "Learn about different fund types"]}'::jsonb
);

-- POPULAR CHALLENGES (2)

-- Challenge 7: No-Spend Weekend
INSERT INTO challenges (
  title, description, category, icon, challenge_type, validation_method,
  duration_days, required_checkins, specific_days,
  grace_period_hours, max_missed_days, failure_condition,
  points_full, points_partial_enabled, badge_title, difficulty,
  estimated_time_commitment, total_participants,
  requirements
) VALUES (
  'No-Spend Weekend',
  'Enjoy weekends without spending money on entertainment or food.',
  'savings',
  '🎯',
  'time_bound',
  'manual',
  2,
  2,
  ARRAY['Saturday', 'Sunday'],
  24,
  0,
  'deadline_passed',
  80,
  TRUE,
  'Weekend Warrior',
  'easy',
  '2 days',
  2341,
  '{"estimated_savings": 750, "tips": ["Cook meals at home", "Find free activities (parks, free events)", "Have movie nights at home", "Exercise outdoors instead of gym"]}'::jsonb
);

-- Challenge 8: Lutong Bahay Week
INSERT INTO challenges (
  title, description, category, icon, challenge_type, validation_method,
  duration_days, required_checkins,
  grace_period_hours, max_missed_days, failure_condition,
  points_full, points_partial_enabled, badge_title, difficulty,
  estimated_time_commitment, total_participants,
  requirements
) VALUES (
  'Lutong Bahay Week',
  'Cook all your meals at home for one week. No food delivery or eating out.',
  'budgeting',
  '☕',
  'flexible',
  'manual',
  7,
  7,
  24,
  1,
  'deadline_passed_without_completion',
  120,
  TRUE,
  'Home Chef Master',
  'medium',
  '7 days',
  1876,
  '{"estimated_savings": 1500, "tips": ["Meal prep on Sunday", "Buy groceries in bulk", "Learn 3-4 easy recipes", "Bring packed lunch to work/school"]}'::jsonb
);

-- ============================================
-- HELPER VIEWS
-- For easy querying
-- ============================================

-- View: Active challenges with user progress
CREATE OR REPLACE VIEW user_active_challenges AS
SELECT 
  uc.id,
  uc.user_id,
  c.title,
  c.description,
  c.icon,
  c.category,
  c.challenge_type,
  c.difficulty,
  uc.status,
  uc.progress_percent,
  uc.checkins_completed,
  uc.checkins_required,
  uc.current_streak,
  uc.deadline,
  uc.points_earned,
  c.points_full,
  EXTRACT(DAY FROM (uc.deadline - NOW()))::INTEGER AS days_left,
  uc.joined_at,
  uc.updated_at
FROM user_challenges uc
JOIN challenges c ON c.id = uc.challenge_id
WHERE uc.status = 'active';

-- View: Challenge leaderboard
CREATE OR REPLACE VIEW challenge_leaderboard AS
SELECT 
  u.id AS user_id,
  u.email,
  COUNT(*) FILTER (WHERE uc.status = 'completed') AS challenges_completed,
  SUM(uc.points_earned) AS total_points,
  MAX(uc.completed_at) AS last_completion
FROM auth.users u
LEFT JOIN user_challenges uc ON uc.user_id = u.id
GROUP BY u.id, u.email
ORDER BY total_points DESC, challenges_completed DESC;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant access to authenticated users
GRANT SELECT ON challenges TO authenticated;
GRANT ALL ON user_challenges TO authenticated;
GRANT ALL ON challenge_progress TO authenticated;
GRANT SELECT ON user_active_challenges TO authenticated;
GRANT SELECT ON challenge_leaderboard TO authenticated;

-- ============================================
-- DONE! Run this in Supabase SQL Editor
-- ============================================
