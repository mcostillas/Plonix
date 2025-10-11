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
