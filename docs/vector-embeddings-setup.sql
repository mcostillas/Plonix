-- Vector Embeddings Setup for Plounix
-- Run this in your Supabase SQL Editor

-- 1. Ensure pgvector extension is enabled (should already be)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Drop existing function if it exists (to handle signature changes)
DROP FUNCTION IF EXISTS match_financial_memories(vector, float, int, text);
DROP FUNCTION IF EXISTS match_financial_memories(vector, double precision, integer, text);

-- 3. Create function to search for similar memories using cosine similarity
CREATE OR REPLACE FUNCTION match_financial_memories(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  user_id_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id text,
  content text,
  metadata jsonb,
  embedding vector(1536),
  similarity float,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fm.id,
    fm.user_id,
    fm.content,
    fm.metadata,
    fm.embedding,
    1 - (fm.embedding <=> query_embedding) AS similarity,
    fm.created_at
  FROM financial_memories fm
  WHERE 
    (user_id_filter IS NULL OR fm.user_id = user_id_filter)
    AND 1 - (fm.embedding <=> query_embedding) > match_threshold
  ORDER BY fm.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Create index for faster vector searches
CREATE INDEX IF NOT EXISTS financial_memories_embedding_idx 
ON financial_memories 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 5. Create index for user_id filtering
CREATE INDEX IF NOT EXISTS financial_memories_user_id_idx 
ON financial_memories (user_id);

-- 6. Grant permissions
ALTER TABLE financial_memories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own memories" ON financial_memories;
DROP POLICY IF EXISTS "Users can insert own memories" ON financial_memories;
DROP POLICY IF EXISTS "Users can update own memories" ON financial_memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON financial_memories;

-- RLS Policy: Users can only see their own memories
CREATE POLICY "Users can view own memories"
ON financial_memories
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- RLS Policy: Users can insert their own memories
CREATE POLICY "Users can insert own memories"
ON financial_memories
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- RLS Policy: Users can update their own memories
CREATE POLICY "Users can update own memories"
ON financial_memories
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

-- RLS Policy: Users can delete their own memories
CREATE POLICY "Users can delete own memories"
ON financial_memories
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- 7. Verify the setup
SELECT 
  'Vector embeddings setup complete!' as status,
  COUNT(*) as existing_memories
FROM financial_memories;
