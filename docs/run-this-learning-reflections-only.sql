-- ================================
-- LEARNING REFLECTIONS TABLE ONLY
-- ================================
-- Run this SQL in your Supabase SQL Editor
-- (Goals table already exists, no need to recreate)

-- Create learning_reflections table
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

-- ================================
-- SETUP COMPLETE
-- ================================

-- You can now test by:
-- 1. Complete a learning module while logged in
-- 2. Check this table for saved reflections:
SELECT * FROM learning_reflections ORDER BY created_at DESC LIMIT 5;
