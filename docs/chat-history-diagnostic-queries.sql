-- Chat History Diagnostic Queries
-- Run these in Supabase SQL Editor to check your chat history

-- 1. VIEW ALL CHAT SESSIONS (grouped by session_id)
SELECT 
  session_id, 
  COUNT(*) as total_messages,
  COUNT(CASE WHEN message_type = 'human' THEN 1 END) as user_messages,
  COUNT(CASE WHEN message_type = 'ai' THEN 1 END) as ai_messages,
  MIN(created_at) as first_message_time,
  MAX(created_at) as last_message_time
FROM chat_history
GROUP BY session_id
ORDER BY MAX(created_at) DESC;

-- 2. VIEW ALL MESSAGES (most recent first)
SELECT 
  id,
  session_id,
  message_type,
  LEFT(content, 100) as message_preview,
  created_at
FROM chat_history
ORDER BY created_at DESC
LIMIT 50;

-- 3. VIEW SPECIFIC SESSION (replace 'YOUR_SESSION_ID' with actual session_id)
SELECT 
  id,
  message_type,
  content,
  created_at
FROM chat_history
WHERE session_id = '1'  -- Change this to your session_id
ORDER BY created_at ASC;

-- 4. COUNT TOTAL MESSAGES
SELECT COUNT(*) as total_messages FROM chat_history;

-- 5. FIND SESSIONS WITH ISSUES (no AI responses)
SELECT 
  session_id,
  COUNT(*) as messages,
  STRING_AGG(message_type, ', ') as types
FROM chat_history
GROUP BY session_id
HAVING COUNT(CASE WHEN message_type = 'ai' THEN 1 END) = 0;

-- 6. RECENT ACTIVITY (last 24 hours)
SELECT 
  session_id,
  message_type,
  LEFT(content, 80) as preview,
  created_at
FROM chat_history
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 7. DELETE A SPECIFIC SESSION (CAREFUL! This is permanent)
-- Uncomment to use:
-- DELETE FROM chat_history WHERE session_id = 'session_id_to_delete';

-- 8. DELETE ALL MESSAGES (VERY CAREFUL! This wipes everything)
-- Uncomment to use:
-- DELETE FROM chat_history;

-- 9. UPDATE OLD SESSION IDs TO NEW FORMAT (if needed)
-- This converts session_id '1' to 'chat_1_migrated', etc.
-- Uncomment to use:
-- UPDATE chat_history 
-- SET session_id = 'chat_' || session_id || '_migrated'
-- WHERE session_id NOT LIKE 'chat_%';

-- 10. CHECK TABLE STRUCTURE
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_history'
ORDER BY ordinal_position;
