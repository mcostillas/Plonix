-- Migration: Add user_id to chat_history table
-- This allows filtering chat history by user
-- Date: October 5, 2025

-- Step 1: Add user_id column (nullable at first)
ALTER TABLE chat_history 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

-- Step 3: (Optional) Update existing records with a placeholder user_id
-- Uncomment the line below if you want to assign existing messages to a specific user
-- UPDATE chat_history SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;

-- Step 4: View current data structure
SELECT 
  session_id,
  user_id,
  message_type,
  LEFT(content, 50) as content_preview,
  created_at
FROM chat_history
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_history'
ORDER BY ordinal_position;
