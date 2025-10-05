# 🧠 Cross-Session Memory - Quick Setup

## The Problem You Described
- Chat 1: Ask about laptop price → AI tells you ₱25,000
- Click "New Chat"
- Chat 2: "How much was that laptop?" → AI says "I don't know"

## The Fix: Persistent Memory Across Sessions

### 🚨 Step 1: Run This SQL in Supabase (REQUIRED!)

```sql
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('fact', 'preference', 'goal', 'item', 'concern')),
  category TEXT,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  context TEXT,
  source_session_id TEXT,
  importance INTEGER DEFAULT 5,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX idx_user_memories_type ON user_memories(memory_type);
CREATE INDEX idx_user_memories_importance ON user_memories(importance DESC);

ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for user_memories" ON user_memories FOR ALL USING (true);
```

### ✅ Step 2: Test It!

**Test Scenario:**

1. **Chat Session 1:**
   ```
   You: "How much is a Lenovo IdeaPad 3?"
   AI: *searches* "It's ₱25,000"
   ```
   
2. **Click "New Chat" button**

3. **Chat Session 2:**
   ```
   You: "How much was that laptop?"
   AI: "You asked about Lenovo IdeaPad 3, which was ₱25,000!" ✅
   ```

## How It Works

### What Gets Auto-Remembered:
- 💰 **Prices** - "Soundcore earbuds: ₱725"
- 💵 **Income** - "Monthly income: ₱25,000"
- 🎯 **Goals** - "Savings goal: ₱50,000"
- ⚠️ **Concerns** - "Worried about rent payment"
- ❤️ **Preferences** - "Prefers GCash over banks"

### When You Start a New Chat:
1. System loads relevant memories from database
2. Adds them to AI context: "REMEMBERED FROM PREVIOUS CONVERSATIONS:"
3. AI can reference them naturally

### Console Logs to Watch:
```
💾 Saved new memory: item_lenovo_ideapad_3 - Lenovo IdeaPad 3: ₱25,000
🧠 Retrieved 2 relevant memories for user
🧠 Loaded 2 cross-session memories
```

## Check Your Memories

```sql
-- See all your memories
SELECT memory_type, key, value, importance, created_at
FROM user_memories
WHERE user_id = 'YOUR_UUID'  -- Get from console logs
ORDER BY importance DESC;
```

## Clear Your Memories

```sql
-- Delete all memories
DELETE FROM user_memories WHERE user_id = 'YOUR_UUID';
```

## Files Created
- `lib/cross-session-memory.ts` - Memory manager
- `docs/cross-session-memory-schema.sql` - Full SQL
- `docs/CROSS_SESSION_MEMORY_GUIDE.md` - Complete guide

## Status
✅ Code: Implemented  
⚠️ Database: Run SQL migration!  
🧪 Testing: Ready after migration

## Next Action
**Run the SQL in Supabase NOW, then test with multiple chat sessions!**
