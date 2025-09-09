-- LangChain Memory Database Schema for Plounix AI
-- Step-by-Step Setup Guide: Follow the instructions below

-- ===========================================
-- STEP 1: Enable Vector Extension
-- ===========================================
-- This enables vector similarity search for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ===========================================
-- STEP 2: Create Chat History Table
-- ===========================================
-- This stores LangChain conversation memory
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('human', 'ai')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- STEP 3: Create Financial Memories Table
-- ===========================================
-- This stores vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS financial_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- STEP 4: Create Performance Indexes
-- ===========================================
-- Chat history indexes
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created ON chat_history(created_at);

-- Financial memories indexes
CREATE INDEX IF NOT EXISTS idx_financial_memories_user ON financial_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_memories_created ON financial_memories(created_at);

-- Vector similarity search index (this might take a moment)
CREATE INDEX IF NOT EXISTS financial_memories_embedding_idx 
ON financial_memories 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ===========================================
-- STEP 5: Enable Row Level Security
-- ===========================================
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_memories ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 6: Create Security Policies
-- ===========================================
-- Chat history policies
CREATE POLICY "Enable all operations for chat_history" ON chat_history
  FOR ALL USING (true); -- Simplified for development

-- Financial memories policies  
CREATE POLICY "Enable all operations for financial_memories" ON financial_memories
  FOR ALL USING (true); -- Simplified for development

-- ===========================================
-- STEP 7: Create Helper Functions
-- ===========================================
-- Function for similarity search
CREATE OR REPLACE FUNCTION match_financial_memories(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5,
  filter_user_id text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id text,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    financial_memories.id,
    financial_memories.user_id,
    financial_memories.content,
    financial_memories.metadata,
    1 - (financial_memories.embedding <=> query_embedding) AS similarity
  FROM financial_memories
  WHERE 
    (filter_user_id IS NULL OR financial_memories.user_id = filter_user_id)
    AND 1 - (financial_memories.embedding <=> query_embedding) > match_threshold
  ORDER BY financial_memories.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to clear user memory
CREATE OR REPLACE FUNCTION clear_user_memory(target_user_id text)
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM chat_history WHERE session_id LIKE target_user_id || '%';
  DELETE FROM financial_memories WHERE user_id = target_user_id;
$$;

-- ===========================================
-- STEP 8: Verification Queries (Optional)
-- ===========================================
-- Run these to verify everything is set up correctly:

-- SELECT 'vector extension' as check, count(*) as installed FROM pg_extension WHERE extname = 'vector';
-- SELECT 'chat_history table' as check, count(*) as exists FROM information_schema.tables WHERE table_name = 'chat_history';
-- SELECT 'financial_memories table' as check, count(*) as exists FROM information_schema.tables WHERE table_name = 'financial_memories';
-- SELECT 'similarity function' as check, count(*) as exists FROM information_schema.routines WHERE routine_name = 'match_financial_memories';

-- ===========================================
-- STEP 9: Test Data (Optional)
-- ===========================================
-- Insert sample data to test the system
-- Uncomment these lines if you want to add test data:

-- INSERT INTO financial_memories (user_id, content, metadata) VALUES 
-- ('test_user', 'User prefers envelope budgeting method and finds it very effective', '{"type": "preference", "importance": "high", "category": "budgeting"}'),
-- ('test_user', 'Successfully saved ₱15,000 using 50-30-20 rule over 3 months', '{"type": "achievement", "importance": "high", "category": "savings", "amount": 15000}'),
-- ('test_user', 'Struggles with impulse buying especially on gadgets and tech items', '{"type": "challenge", "importance": "medium", "category": "spending"}'),
-- ('test_user', 'Monthly income is ₱25,000 as a college student with part-time work', '{"type": "context", "importance": "high", "category": "income", "amount": 25000}'),
-- ('test_user', 'Goal to build emergency fund of ₱50,000 by end of year', '{"type": "goal", "importance": "high", "category": "emergency_fund", "target_amount": 50000}');

-- ===========================================
-- Setup Complete! 🎉
-- ===========================================
