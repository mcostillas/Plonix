# Chat History Not Persisting - Fix Guide

## Problem
Chat sessions are not being saved to the database, so when you refresh or restart the server, your chat history disappears.

## Root Cause
The messages need to be saved to the `chat_history` table in Supabase, but the table might not exist or might have the wrong schema.

## Solution

### Step 1: Verify/Create the Database Table

Go to your **Supabase Dashboard** → **SQL Editor** and run this SQL:

```sql
-- Check if chat_history table exists and has correct structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chat_history';
```

If the table doesn't exist or has wrong columns, run this to create/fix it:

```sql
-- Drop old table if it exists (ONLY if you're okay losing old data)
DROP TABLE IF EXISTS chat_history CASCADE;

-- Create the correct chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('human', 'ai')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created ON chat_history(created_at);

-- Enable Row Level Security
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
DROP POLICY IF EXISTS "Enable all operations for chat_history" ON chat_history;
CREATE POLICY "Enable all operations for chat_history" ON chat_history
  FOR ALL USING (true);
```

### Step 2: Test the Fix

1. **Restart your dev server** (if it's running):
   ```powershell
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

2. **Go to AI Assistant** and send a message

3. **Check the server logs** in your terminal - you should see:
   ```
   💾 Attempting to save to database: { session_id: 'chat_...', message_type: 'human', ... }
   ✅ Successfully saved to database: [...]
   ```

4. **Refresh the page** - your chat should still be there!

### Step 3: Verify in Supabase

Go to **Supabase Dashboard** → **Table Editor** → **chat_history**

You should see your messages saved with:
- `session_id`: Something like `chat_1728123456789_abc123`
- `message_type`: Either `'human'` or `'ai'`
- `content`: Your actual message text
- `created_at`: Timestamp

## What Was Changed

1. **Added detailed logging** to `lib/authenticated-memory.ts` to see if messages are being saved
2. **Fixed TypeScript types** using `(supabase as any)` to bypass type issues
3. **Added console logs** to track the save process

## Debugging

If it's still not working, check your terminal logs for:

- ❌ **"Database save error"** - means the table schema is wrong
- ❌ **"Failed to save message"** - means there's a connection issue
- ✅ **"Successfully saved to database"** - means it's working!

## Alternative: Check if RLS is blocking

If you see messages in logs but they're not in the database, RLS might be blocking:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;
```

Then test again. If it works, you need to fix your RLS policies.

---

**Need Help?** Check the terminal logs and Supabase logs to see what error you're getting!
