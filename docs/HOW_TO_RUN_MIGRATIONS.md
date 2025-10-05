# How to Run SQL Migrations in Supabase - Step by Step

## You Have 2 Pending Migrations

1. **User Filtering** - Add `user_id` to `chat_history` table
2. **Cross-Session Memory** - Create `user_memories` table

---

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to: **https://supabase.com**
2. Click **"Sign in"** (top right)
3. Log in with your account
4. You'll see your **project dashboard**

### Step 2: Navigate to SQL Editor

1. On the left sidebar, find and click: **"SQL Editor"** (icon looks like `</>`)
2. You'll see a blank SQL editor window

### Step 3: Run Migration 1 - Add user_id to chat_history

**Copy this SQL and paste it into the editor:**

```sql
-- Migration 1: Add user_id column to chat_history table
-- This allows filtering chat messages by user

-- Add the column
ALTER TABLE chat_history 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id 
ON chat_history(user_id);

-- Verify it worked
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_history'
ORDER BY ordinal_position;
```

**Then:**
1. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait for it to finish (green checkmark ✅)
3. You should see the table structure in the results

### Step 4: Run Migration 2 - Create user_memories table

**Copy this SQL and paste it into the editor:**

```sql
-- Migration 2: Create user_memories table for cross-session memory
-- This allows AI to remember information across different chat sessions

-- Create the table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id 
ON user_memories(user_id);

CREATE INDEX IF NOT EXISTS idx_user_memories_type 
ON user_memories(memory_type);

CREATE INDEX IF NOT EXISTS idx_user_memories_category 
ON user_memories(category);

CREATE INDEX IF NOT EXISTS idx_user_memories_importance 
ON user_memories(importance DESC);

CREATE INDEX IF NOT EXISTS idx_user_memories_accessed 
ON user_memories(last_accessed DESC);

-- Enable Row Level Security
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production)
DROP POLICY IF EXISTS "Enable all operations for user_memories" ON user_memories;
CREATE POLICY "Enable all operations for user_memories" 
ON user_memories
FOR ALL 
USING (true);

-- Verify it worked
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_memories'
ORDER BY ordinal_position;
```

**Then:**
1. Click the **"Run"** button again
2. Wait for it to finish (green checkmark ✅)
3. You should see the new table structure in the results

---

## Visual Guide with Screenshots

### Finding SQL Editor:
```
Supabase Dashboard
├─ 🏠 Home
├─ 📊 Table Editor
├─ 🔐 Authentication
├─ 📦 Storage
├─ </> SQL Editor    ← Click here!
├─ 🔧 Database
└─ ⚙️ Settings
```

### SQL Editor Interface:
```
┌─────────────────────────────────────────────┐
│  SQL Editor                          [Run ▶] │
├─────────────────────────────────────────────┤
│                                              │
│  -- Paste your SQL here                     │
│  ALTER TABLE chat_history ...               │
│                                              │
│                                              │
└─────────────────────────────────────────────┘
Results: ✅ Success | Query returned X rows
```

---

## Verify Migrations Worked

### Check Migration 1:
```sql
-- See the chat_history table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chat_history';
```

**Expected columns:**
- `id`
- `session_id`
- `user_id` ← **NEW!**
- `message_type`
- `content`
- `metadata`
- `created_at`

### Check Migration 2:
```sql
-- See if user_memories table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_memories';
```

**Expected result:** One row showing `user_memories`

---

## Troubleshooting

### Error: "relation already exists"
✅ **This is OK!** It means the table already exists. The migration uses `IF NOT EXISTS` so it's safe to run multiple times.

### Error: "permission denied"
❌ **Problem:** You don't have permissions
**Fix:** Make sure you're the project owner or have admin access

### Error: "column already exists"
✅ **This is OK!** The column was added before. The migration uses `IF NOT EXISTS`.

### No errors but want to double-check?
Run verification queries (see above) to confirm tables and columns exist.

---

## After Running Migrations

### 1. Refresh Your App
- Go to: http://localhost:3001/ai-assistant
- Press `F5` or `Ctrl+R` to refresh

### 2. Check Browser Console (F12)
Look for these logs:
```
📥 Loading chat history for user: <your-uuid>
📚 Loaded X TOTAL messages from database
🔑 Found Y unique session IDs
✅ Loaded Y chat sessions
```

### 3. Test User Filtering
1. Send a message in a chat
2. Refresh the page
3. Your chat should appear in the sidebar
4. Other users' chats should NOT appear

### 4. Test Cross-Session Memory
1. **Chat 1:** "I have a Lenovo Legion 5 laptop worth ₱50,000"
2. Click "New Chat"
3. **Chat 2:** "How much was my laptop?"
4. AI should remember: "You mentioned Lenovo Legion 5 for ₱50,000"

Look for these console logs:
```
💾 Saved new memory: item_lenovo_legion_5 - Lenovo Legion 5: ₱50,000
🧠 Retrieved 1 relevant memories for user
🧠 Loaded 1 cross-session memories
```

---

## Alternative: Use Supabase CLI (Advanced)

If you prefer command line:

### 1. Install Supabase CLI
```powershell
# Using Scoop (recommended for Windows)
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases
```

### 2. Login
```powershell
supabase login
```

### 3. Link Project
```powershell
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Run Migrations
```powershell
# Create migration file
supabase migration new add_user_filtering

# Edit the file in: supabase/migrations/

# Apply migrations
supabase db push
```

---

## Quick Reference

### Migration 1: User Filtering
**Purpose:** Filter chat history by user  
**What it does:** Adds `user_id` column to `chat_history`  
**Why needed:** So you only see YOUR chats, not everyone's

### Migration 2: Cross-Session Memory
**Purpose:** Remember info across different chat sessions  
**What it does:** Creates `user_memories` table  
**Why needed:** So AI remembers "laptop is ₱50,000" in new chats

---

## Files with Full SQL

If you need the complete SQL scripts:

1. **Migration 1:** `docs/add-user-id-migration.sql`
2. **Migration 2:** `docs/cross-session-memory-schema.sql`

You can also find them in the docs folder of your project.

---

## Summary Checklist

- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Run Migration 1 (add user_id)
- [ ] Run Migration 2 (create user_memories)
- [ ] Verify both migrations succeeded
- [ ] Refresh your app (F5)
- [ ] Test chat history loading
- [ ] Test cross-session memory
- [ ] Check console logs for success messages

---

## Need Help?

### Check Supabase Logs
1. Dashboard → **Logs** → **Postgres Logs**
2. Look for errors or warnings

### Check Table Editor
1. Dashboard → **Table Editor**
2. Look for `chat_history` table → verify `user_id` column exists
3. Look for `user_memories` table → verify it exists

### Still stuck?
- Check the Supabase docs: https://supabase.com/docs
- Join Supabase Discord: https://discord.supabase.com

---

**Ready to run the migrations? Follow Step 1-4 above!** 🚀

**Estimated time:** 2-3 minutes total

**Risk level:** Low (migrations use `IF NOT EXISTS` - safe to run multiple times)
