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
