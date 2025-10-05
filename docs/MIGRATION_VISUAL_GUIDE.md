# SQL Migration - Visual Walkthrough

## 🎯 Your Mission: Run 2 SQL Scripts

```
┌─────────────────────────────────────────┐
│  Current State (Without Migrations)     │
├─────────────────────────────────────────┤
│  ❌ Chat history shows everyone's chats │
│  ❌ AI forgets info in new chat         │
└─────────────────────────────────────────┘
              ⬇️ RUN MIGRATIONS
┌─────────────────────────────────────────┐
│  After Migrations                       │
├─────────────────────────────────────────┤
│  ✅ Only YOUR chats appear              │
│  ✅ AI remembers across sessions        │
└─────────────────────────────────────────┘
```

---

## 📍 Step-by-Step with Pictures

### Step 1: Open Supabase Dashboard

```
Browser: https://supabase.com
          ⬇️
      [Sign In]
          ⬇️
   Your Projects
          ⬇️
  [Click Your Project]
```

### Step 2: Find SQL Editor

```
Left Sidebar:
┌──────────────────┐
│ 🏠 Home          │
│ 📊 Table Editor  │
│ 🔐 Auth          │
│ 📦 Storage       │
│ </> SQL Editor   │ ← CLICK HERE!
│ 🔧 Database      │
│ ⚙️  Settings     │
└──────────────────┘
```

### Step 3: SQL Editor Interface

```
┌─────────────────────────────────────────────────┐
│ SQL Editor                         [New Query ▼]│
├─────────────────────────────────────────────────┤
│                                      [Run ▶] [X] │
│  1 | -- Paste your SQL here                     │
│  2 | ALTER TABLE chat_history ...               │
│  3 |                                             │
│  4 |                                             │
│  5 |                                             │
│    |                                             │
├─────────────────────────────────────────────────┤
│ Results                                          │
│ ✅ Success | Query returned 1 row               │
└─────────────────────────────────────────────────┘
```

### Step 4: Paste Migration 1

```
1. Copy this:
   ┌──────────────────────────────────────┐
   │ ALTER TABLE chat_history             │
   │ ADD COLUMN IF NOT EXISTS user_id ... │
   └──────────────────────────────────────┘
   
2. Paste into SQL Editor
   
3. Click [Run ▶] button (top right)
   
4. Wait for: ✅ Success
```

### Step 5: Paste Migration 2

```
1. Clear the editor (or create new query)
   
2. Copy this:
   ┌──────────────────────────────────────┐
   │ CREATE TABLE IF NOT EXISTS           │
   │ user_memories (                      │
   │   id UUID PRIMARY KEY ...            │
   └──────────────────────────────────────┘
   
3. Paste into SQL Editor
   
4. Click [Run ▶] button again
   
5. Wait for: ✅ Success
```

### Step 6: Verify

```
Run this query:
┌─────────────────────────────────────────┐
│ SELECT column_name                      │
│ FROM information_schema.columns         │
│ WHERE table_name = 'chat_history';      │
└─────────────────────────────────────────┘

Expected Result:
┌──────────────┐
│ column_name  │
├──────────────┤
│ id           │
│ session_id   │
│ user_id      │ ← THIS IS NEW!
│ message_type │
│ content      │
│ metadata     │
│ created_at   │
└──────────────┘
```

---

## 🔄 Complete Flow Diagram

```
START HERE
    ↓
[Open Supabase.com]
    ↓
[Sign In to Your Account]
    ↓
[Select Your Project]
    ↓
[Click SQL Editor in Sidebar]
    ↓
┌─────────────────────────────────┐
│  MIGRATION 1: User Filtering    │
├─────────────────────────────────┤
│  1. Paste SQL                   │
│  2. Click Run                   │
│  3. See ✅ Success              │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  MIGRATION 2: Cross-Memory      │
├─────────────────────────────────┤
│  1. Paste SQL                   │
│  2. Click Run                   │
│  3. See ✅ Success              │
└─────────────────────────────────┘
    ↓
[Refresh Your App (F5)]
    ↓
[Test: Send Message]
    ↓
[Refresh Again]
    ↓
[Chat Appears in Sidebar? ✅]
    ↓
[Start New Chat]
    ↓
[Ask About Previous Topic]
    ↓
[AI Remembers? ✅]
    ↓
DONE! 🎉
```

---

## 📊 What Each Migration Does

### Migration 1: User Filtering

```
BEFORE:
chat_history table:
┌────────────┬──────────────┬─────────┐
│ session_id │ message_type │ content │
├────────────┼──────────────┼─────────┤
│ chat_123   │ human        │ "Hi"    │ ← Whose?
│ chat_456   │ ai           │ "Hello" │ ← Whose?
└────────────┴──────────────┴─────────┘

AFTER:
chat_history table:
┌────────────┬─────────────┬──────────────┬─────────┐
│ session_id │ user_id     │ message_type │ content │
├────────────┼─────────────┼──────────────┼─────────┤
│ chat_123   │ user_abc    │ human        │ "Hi"    │ ← Your message
│ chat_456   │ user_xyz    │ ai           │ "Hello" │ ← Someone else
└────────────┴─────────────┴──────────────┴─────────┘
                    ↑
         Now we can filter by YOUR user_id!
```

### Migration 2: Cross-Session Memory

```
BEFORE:
- Session 1: "Laptop costs ₱50,000"
- Session 2: "How much was laptop?" → AI: "I don't know" ❌

AFTER:
user_memories table:
┌─────────┬──────────────┬─────────────────────────┐
│ user_id │ memory_type  │ value                   │
├─────────┼──────────────┼─────────────────────────┤
│ you     │ item         │ "Laptop: ₱50,000"       │
│ you     │ goal         │ "Save ₱100,000"         │
└─────────┴──────────────┴─────────────────────────┘
                ↓
- Session 1: "Laptop costs ₱50,000" → Saved to memories
- Session 2: "How much was laptop?" → AI: "₱50,000!" ✅
```

---

## 🎮 Interactive Checklist

```
[ ] 1. Opened Supabase Dashboard
[ ] 2. Found SQL Editor
[ ] 3. Pasted Migration 1 SQL
[ ] 4. Clicked Run ▶ 
[ ] 5. Saw ✅ Success
[ ] 6. Pasted Migration 2 SQL
[ ] 7. Clicked Run ▶ again
[ ] 8. Saw ✅ Success again
[ ] 9. Refreshed app (F5)
[ ] 10. Tested chat history
[ ] 11. Tested cross-session memory
[ ] 12. Everything works! 🎉
```

---

## 💡 Pro Tips

### Tip 1: Save Queries
```
After running successfully:
1. Click "Save" button (floppy disk icon)
2. Name it: "User Filtering Migration"
3. Can re-run anytime from "Saved Queries"
```

### Tip 2: Use Keyboard Shortcuts
```
Ctrl+Enter (Cmd+Enter on Mac) = Run Query
Ctrl+S = Save Query
Ctrl+N = New Query
```

### Tip 3: Check History
```
SQL Editor → History tab (clock icon)
- See all queries you've run
- Re-run previous queries
```

---

## 🆘 Common Errors & Fixes

### Error: "relation does not exist"
```
Problem: chat_history table doesn't exist
Fix: Check you're in the right project
     Go to Table Editor and create it first
```

### Error: "permission denied"
```
Problem: Not enough permissions
Fix: Make sure you're the project owner
     Or ask owner to give you permissions
```

### Error: "column already exists"
```
Problem: N/A - this is actually GOOD!
Status: ✅ Migration already ran before
Action: You're done! Move to next step
```

---

## 📞 Need More Help?

1. **Read Full Guide:** `docs/HOW_TO_RUN_MIGRATIONS.md`
2. **Quick Reference:** `docs/QUICK_MIGRATION_GUIDE.md`
3. **Supabase Docs:** https://supabase.com/docs/guides/database

---

**You Got This! Just 2 Copy-Pastes Away!** 🚀
