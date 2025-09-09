# 🚀 LangChain Memory Database Setup Guide

## Step-by-Step Instructions

### 📋 **Prerequisites**
- ✅ Supabase project created
- ✅ `@langchain/community` package installed (already done)
- ✅ OpenAI API key configured

---

## 🛠️ **Database Setup Process**

### **Step 1: Access Supabase Dashboard**

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your **Plounix project**
4. Click on **"SQL Editor"** in the left sidebar

### **Step 2: Run the Database Schema**

1. In the SQL Editor, click **"New Query"**
2. Copy the entire contents of `docs/langchain-vector-schema.sql`
3. Paste it into the SQL editor
4. Click **"Run"** (or press Ctrl+Enter)

**Expected Output:**
```
Success. No rows returned.
```

### **Step 3: Verify the Setup**

Run these verification queries one by one:

```sql
-- Check if vector extension is enabled
SELECT 'vector extension' as check, count(*) as installed 
FROM pg_extension WHERE extname = 'vector';
```
**Expected Result:** Should show `installed: 1`

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('chat_history', 'financial_memories');
```
**Expected Result:** Should show both table names

```sql
-- Check if similarity function exists
SELECT 'similarity function' as check, count(*) as exists 
FROM information_schema.routines 
WHERE routine_name = 'match_financial_memories';
```
**Expected Result:** Should show `exists: 1`

### **Step 4: Test with Sample Data (Optional)**

Add test data to verify everything works:

```sql
INSERT INTO financial_memories (user_id, content, metadata) VALUES 
('test_user', 'User prefers envelope budgeting method', '{"type": "preference"}'),
('test_user', 'Successfully saved ₱15,000 using 50-30-20 rule', '{"type": "achievement"}');
```

### **Step 5: Verify Sample Data**

```sql
SELECT user_id, content, metadata 
FROM financial_memories 
WHERE user_id = 'test_user';
```

---

## 🔧 **Troubleshooting Common Issues**

### **Error: "extension 'vector' does not exist"**
**Solution:** Contact Supabase support or enable it manually:
```sql
CREATE EXTENSION vector;
```

### **Error: "permission denied"**
**Solution:** Make sure you're using the SQL Editor as the project owner.

### **Error: "ivfflat access method does not exist"**
**Solution:** The vector extension might not be fully installed. Try:
```sql
DROP INDEX IF EXISTS financial_memories_embedding_idx;
-- Then run the schema again
```

### **Tables already exist error**
**Solution:** This is normal! The `IF NOT EXISTS` clauses prevent errors.

---

## ✅ **Setup Verification Checklist**

- [ ] Vector extension enabled
- [ ] `chat_history` table created
- [ ] `financial_memories` table created  
- [ ] Indexes created successfully
- [ ] `match_financial_memories` function created
- [ ] `clear_user_memory` function created
- [ ] Sample data inserted (optional)

---

## 🎯 **What Each Component Does**

### **Tables Created:**

1. **`chat_history`**
   - Stores LangChain conversation memory
   - Automatically summarizes when conversations get long
   - Used for recent context and conversation flow

2. **`financial_memories`**
   - Stores vector embeddings of important insights
   - Enables semantic search across all past conversations
   - Powers the AI's ability to find relevant memories

### **Functions Created:**

1. **`match_financial_memories()`**
   - Performs vector similarity search
   - Finds relevant past conversations by meaning
   - Used by the AI to retrieve context

2. **`clear_user_memory()`**
   - Allows users to delete their memory data
   - Privacy feature for user control

### **Indexes Created:**
- Performance optimization for searches
- Vector similarity search acceleration
- Faster conversation retrieval

---

## 🚀 **Next Steps After Setup**

### **1. Test the Memory System**
```bash
npm run dev
```
Go to your AI chat and have a conversation about budgeting. Then ask a follow-up question - the AI should remember previous context!

### **2. Monitor Memory Usage**
Check your Supabase dashboard under "Table Editor" to see:
- New conversations in `chat_history`
- Extracted insights in `financial_memories`

### **3. Try Advanced Features**
- Ask about past conversations
- Set financial goals and reference them later
- Test the AI's learning about your preferences

---

## 📊 **Database Schema Visual**

```
Supabase Database
├── chat_history
│   ├── id (UUID)
│   ├── session_id (TEXT) 
│   ├── message_type (human/ai)
│   ├── content (TEXT)
│   ├── metadata (JSONB)
│   └── created_at (TIMESTAMP)
│
├── financial_memories  
│   ├── id (UUID)
│   ├── user_id (TEXT)
│   ├── content (TEXT)
│   ├── metadata (JSONB)
│   ├── embedding (vector[1536])
│   └── created_at (TIMESTAMP)
│
└── Functions
    ├── match_financial_memories()
    └── clear_user_memory()
```

---

## 🎉 **Success Indicators**

You'll know the setup worked when:

1. **No SQL errors** when running the schema
2. **Tables appear** in Supabase Table Editor
3. **AI conversations** start getting stored automatically
4. **Memory context** appears in AI responses
5. **Vector search** finds relevant past conversations

Ready to test your enhanced AI memory system! 🧠✨
