# Chat History Not Showing - Troubleshooting Guide

## Problem
Chat messages are being saved to the database, but they're not showing up in the chat history sidebar.

## Root Causes Identified

### Issue 1: Session ID Mismatch
- **Problem**: Initial `currentChatId` was set to `'1'` (hardcoded string)
- **Impact**: Messages saved with session_id = '1'
- **But**: `loadChatHistory()` was filtering with `.like('session_id', 'chat_%')` 
- **Result**: Messages with session_id '1' were excluded from loading

### Issue 2: Filter Too Restrictive
- The `.like('session_id', 'chat_%')` filter only loaded sessions starting with "chat_"
- Any existing messages with simple IDs like '1', '2', etc. were ignored

## Fixes Applied

### Fix 1: Proper Session ID Generation
**Before:**
```typescript
const [currentChatId, setCurrentChatId] = useState('1')
const defaultSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
```

**After:**
```typescript
const defaultSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
const [currentChatId, setCurrentChatId] = useState(defaultSessionId)
```

Now `currentChatId` starts with a properly formatted session ID from the beginning.

### Fix 2: Remove Restrictive Filter
**Before:**
```typescript
const { data: messages, error } = await (supabase as any)
  .from('chat_history')
  .select('*')
  .like('session_id', `chat_%`) // ❌ Only loads sessions starting with "chat_"
  .order('created_at', { ascending: true })
```

**After:**
```typescript
const { data: messages, error } = await (supabase as any)
  .from('chat_history')
  .select('*')
  .order('created_at', { ascending: true }) // ✅ Loads ALL sessions
```

Now it loads ALL messages from the database, regardless of session ID format.

## How to See Your Existing Chats

### Option 1: Refresh the Page
1. Save any current work
2. Refresh the AI Assistant page (F5)
3. Your chat history should now load in the sidebar
4. Click on any past chat to view it

### Option 2: Check Database Directly
Run this query in Supabase SQL Editor:
```sql
SELECT 
  session_id, 
  COUNT(*) as message_count,
  MIN(created_at) as first_message,
  MAX(created_at) as last_message
FROM chat_history
GROUP BY session_id
ORDER BY MAX(created_at) DESC;
```

This shows all your chat sessions and how many messages each has.

### Option 3: View All Messages
```sql
SELECT 
  session_id,
  message_type,
  LEFT(content, 50) as preview,
  created_at
FROM chat_history
ORDER BY created_at DESC
LIMIT 20;
```

This shows your most recent 20 messages with a preview of the content.

## What Happens Now

### For New Chats:
- ✅ Session IDs are properly formatted: `chat_1728123456_abc123`
- ✅ Messages save correctly to database
- ✅ Chat history loads and displays in sidebar
- ✅ Switching between chats works properly

### For Old Chats (session_id = '1', '2', etc.):
- ✅ Will now load from database
- ✅ Will appear in sidebar with generated titles
- ✅ Can click to view conversation history
- ✅ All messages preserved

## Testing Checklist

After the fix, verify:
- [ ] Refresh page - chat history loads automatically
- [ ] Send a new message - it appears in current chat
- [ ] Refresh again - new message persists in chat history
- [ ] Click on a past chat - messages load correctly
- [ ] Create new chat - gets proper session ID format
- [ ] Send message in new chat - saves correctly
- [ ] Switch between multiple chats - messages stay separated

## Console Logs to Check

Look for these logs in browser console (F12):
```
📥 Loading chat history for user: <user_id>
📚 Loaded X messages from database
✅ Loaded Y past chat sessions
📌 Starting with new chat
```

If you see "No chat history found", check:
1. Are you logged in? (chat history only loads for authenticated users)
2. Is Supabase connected? (check .env.local)
3. Does the table exist? (check Supabase dashboard)

## Database Schema Reminder

The `chat_history` table should have:
```sql
CREATE TABLE chat_history (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('human', 'ai')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_history_session ON chat_history(session_id);
CREATE INDEX idx_chat_history_created ON chat_history(created_at);
```

## Files Modified
- `app/ai-assistant/page.tsx`
  - Line 32: Changed `currentChatId` initialization to use `defaultSessionId`
  - Line 68: Removed `.like('session_id', 'chat_%')` filter from database query

## Status
✅ Fixed and deployed
🧪 Ready for testing - refresh the page to see your chat history!
