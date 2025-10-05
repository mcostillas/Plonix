# Quick Migration Guide - Copy & Paste

## ⚡ FAST TRACK: Just Copy & Paste These!

### 🎯 Step 1: Go to Supabase SQL Editor
1. Open: https://supabase.com
2. Sign in
3. Select your project
4. Click **"SQL Editor"** in left sidebar

---

### 📋 Step 2: Copy This SQL (Migration 1)

```sql
-- Migration 1: Add user_id to chat_history
ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

-- Verify
SELECT 'Migration 1: SUCCESS! user_id column added' as status;
```

**Click RUN ▶️** (or press Ctrl+Enter)

---

### 📋 Step 3: Copy This SQL (Migration 2)

```sql
-- Migration 2: Create user_memories table
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

CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_type ON user_memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_user_memories_importance ON user_memories(importance DESC);

ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for user_memories" ON user_memories FOR ALL USING (true);

-- Verify
SELECT 'Migration 2: SUCCESS! user_memories table created' as status;
```

**Click RUN ▶️** again

---

### ✅ Step 4: Verify It Worked

```sql
-- Quick verification query
SELECT 
  'chat_history' as table_name,
  COUNT(*) FILTER (WHERE column_name = 'user_id') as has_user_id
FROM information_schema.columns 
WHERE table_name = 'chat_history'
UNION ALL
SELECT 
  'user_memories' as table_name,
  COUNT(*) as table_exists
FROM information_schema.tables 
WHERE table_name = 'user_memories';
```

**Expected output:**
```
table_name     | count
---------------|------
chat_history   | 1      ← user_id column exists
user_memories  | 1      ← table exists
```

---

### 🎉 Done! Now Test It

1. **Refresh your app:** http://localhost:3001/ai-assistant
2. **Send a message** in a chat
3. **Press F5** to refresh
4. **Chat should appear** in sidebar!
5. **Start new chat** and ask about something from before
6. **AI should remember!** 🧠

---

## 🐛 Troubleshooting

### See "already exists" error?
✅ **Good!** It means it's already there. You're done!

### See permission error?
❌ Make sure you're logged into the correct Supabase project

### Can't find SQL Editor?
📍 Look for `</>` icon on left sidebar

---

## 📱 Console Logs to Watch For

After migration, look for these in browser console (F12):

```
✅ Successfully saved to database with user_id
💾 Saved new memory: item_laptop - Laptop: ₱50,000  
🧠 Retrieved 2 relevant memories for user
```

---

**Total time:** 2 minutes ⏱️  
**Difficulty:** Easy ⭐  
**Risk:** None (safe to run multiple times)

**Go to Supabase SQL Editor and paste the SQL above!** 🚀
