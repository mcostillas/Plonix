# AI Assistant User Memory Isolation

## Yes, Each User Has Their Own Separate Memory! 🔒

The Plounix AI Assistant implements **complete user memory isolation** - meaning each user has their own private conversation history and financial memories that no other user can access.

## How It Works

### 1. User Identification

When you interact with the AI Assistant:

```typescript
// Your browser sends your authentication token
const authHeader = request.headers.get('Authorization')
// Example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Server validates the token and extracts YOUR user ID
const { data: { user } } = await supabase.auth.getUser(token)
// Result: { id: "8f5dc03d-5efd-4d6e-b106-c365275ea00d", email: "marcxcouzin@gmail.com" }
```

### 2. Database Storage with User ID

Every chat message is saved with **your unique user ID**:

```sql
-- chat_history table structure
CREATE TABLE chat_history (
  id UUID PRIMARY KEY,
  session_id TEXT NOT NULL,      -- Your chat session
  user_id UUID,                  -- YOUR unique user ID
  message_type TEXT,             -- 'human' or 'ai'
  content TEXT,                  -- The actual message
  created_at TIMESTAMP
);

-- Example of your data:
INSERT INTO chat_history VALUES (
  'abc-123...',
  'chat_1759777476059_xyciqsh',
  '8f5dc03d-5efd-4d6e-b106-c365275ea00d',  -- Your user ID
  'human',
  'I want to save ₱50,000',
  NOW()
);
```

### 3. Memory Retrieval (User-Specific)

When you ask a question, the AI **only** loads YOUR memories:

```typescript
// Load memories for a specific user
const { data: messages } = await supabase
  .from('chat_history')
  .select('*')
  .eq('session_id', userId)         // Your session
  .eq('user_id', actualUserId)      // YOUR user ID only!
  .order('created_at', { ascending: false })
  .limit(10)

// Result: Only YOUR messages are returned
```

### 4. Cross-Session Memory (Also Isolated)

The AI can remember things across different chat sessions using `financial_memories`:

```sql
-- financial_memories table
CREATE TABLE financial_memories (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,           -- YOUR unique user ID
  content TEXT,                    -- "User wants to save ₱50,000"
  metadata JSONB,
  embedding vector(1536),          -- For semantic search
  created_at TIMESTAMP
);
```

**Semantic Search Example:**
```typescript
// When you ask: "What's my savings goal?"
// AI searches ONLY your memories:
SELECT * FROM financial_memories
WHERE user_id = '8f5dc03d-5efd-4d6e-b106-c365275ea00d'  -- YOUR ID
AND similarity(embedding, query_embedding) > 0.78
ORDER BY similarity DESC
LIMIT 5;

// Result: Only memories related to YOUR conversations
```

## Security Features

### 1. Row Level Security (RLS)

Supabase enforces database-level security:

```sql
-- RLS Policy: Users can only see their own data
CREATE POLICY "Users can view own chat history" 
ON chat_history
FOR SELECT 
USING (auth.uid() = user_id);

-- This means even if someone tries to hack the query,
-- the database will REFUSE to return data from other users
```

### 2. Session Isolation

Each chat session has a unique ID:
- Your Session: `chat_1759777476059_xyciqsh`
- Another User's Session: `chat_1759888888888_abcdefg`

Even within the same user account, different chat sessions are separate!

### 3. Authentication Required

Anonymous users can't access personalized memory:

```typescript
if (!user || !user.id) {
  throw new Error('Valid user object required for personalized memory')
}
```

## What This Means for You

### ✅ Your Data is Private
- **Your conversations** → Only you can see them
- **Your financial goals** → Only stored under your user ID
- **Your savings patterns** → Never shared with others
- **Your spending habits** → Completely isolated

### ✅ No Data Mixing
- You'll never see another user's data
- Another user will never see your data
- Each person's AI experience is completely personalized

### ✅ Multiple Chat Sessions
You can have multiple conversations:
- "Emergency Fund Planning" (Session A)
- "Phone Budget Discussion" (Session B)
- "Investment Questions" (Session C)

**All stored separately** but all belong to YOU.

## Example: How Two Users See Different Things

### User A (Marc - you):
```
Question: "What was my savings goal?"
AI Response: "You mentioned wanting to save ₱50,000 for emergencies."

Database Query:
SELECT * FROM financial_memories 
WHERE user_id = '8f5dc03d-5efd-4d6e-b106-c365275ea00d'
-- Returns: "User wants to save ₱50,000"
```

### User B (Another student):
```
Question: "What was my savings goal?"
AI Response: "You mentioned wanting to save ₱20,000 for a new laptop."

Database Query:
SELECT * FROM financial_memories 
WHERE user_id = 'different-user-id-here-9999'
-- Returns: "User wants to save ₱20,000 for laptop"
```

**Same question, different answers** - because each user has their own memory!

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      YOUR BROWSER                            │
│  (Authenticated as: marcxcouzin@gmail.com)                   │
└────────────────────┬────────────────────────────────────────┘
                     │ Sends: Auth Token + Message
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   PLOUNIX AI SERVER                          │
│  1. Validates token → Gets your user_id                      │
│  2. Loads ONLY YOUR memories from database                   │
│  3. Sends to OpenAI with YOUR context                        │
│  4. Saves response with YOUR user_id                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
│                                                              │
│  chat_history table:                                         │
│  ┌────────────────────────────────────────────────┐         │
│  │ user_id: 8f5dc03d... (YOU)  │ content: "..."  │         │
│  │ user_id: 8f5dc03d... (YOU)  │ content: "..."  │         │
│  │ user_id: different-user...  │ content: "..."  │ ← Other user
│  │ user_id: different-user...  │ content: "..."  │ ← Other user
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  Your Data ↑  |  Other User's Data ↑                         │
│  (Isolated)   |  (You can't access this!)                    │
└─────────────────────────────────────────────────────────────┘
```

## Memory Types

### 1. **Session Memory** (Temporary)
- Lasts for the current chat session
- Stored in server memory (RAM)
- Lost when server restarts
- **Still user-specific**: Each user has separate RAM memory

### 2. **Database Memory** (Permanent)
- Saved to Supabase database
- Persists forever (until you delete it)
- Survives server restarts
- **User-isolated**: Uses your user_id as filter

### 3. **Cross-Session Memory** (Long-term Learning)
- AI extracts important facts from conversations
- Stored in `financial_memories` table
- Used across all your future chats
- **Semantic search**: AI finds relevant memories using AI embeddings

## Privacy Controls

### You Can Clear Your Memory

From the AI Assistant interface:
- "Clear This Chat" → Deletes current session (from UI)
- "Clear All History" → Deletes ALL your chats (from database)

**Important**: Clearing your memory does NOT affect other users!

### Data Deletion

When you clear your history:
```sql
-- Only YOUR data is deleted
DELETE FROM chat_history 
WHERE user_id = '8f5dc03d-5efd-4d6e-b106-c365275ea00d';

DELETE FROM financial_memories 
WHERE user_id = '8f5dc03d-5efd-4d6e-b106-c365275ea00d';

-- Other users' data remains untouched
```

## Technical Implementation

### Files Responsible for Memory Isolation:

1. **`lib/authenticated-memory.ts`**
   - Manages user-specific memory
   - Validates user authentication
   - Loads only user's own messages

2. **`lib/cross-session-memory.ts`**
   - Stores long-term memories per user
   - Uses vector embeddings for semantic search
   - Filters by user_id in all queries

3. **`app/api/ai-chat/route.ts`**
   - Validates authentication token
   - Extracts user ID from token
   - Passes user ID to memory functions

4. **Database RLS Policies** (Supabase)
   - Enforces user_id filtering at database level
   - Prevents unauthorized data access
   - Automatic security (can't be bypassed)

## Compliance & Best Practices

### GDPR Compliant
- ✅ Each user owns their data
- ✅ Users can delete their data
- ✅ Data is isolated and encrypted
- ✅ No cross-user data exposure

### Security Best Practices
- ✅ Authentication required for personalized features
- ✅ Database-level security (RLS)
- ✅ User ID validation on every request
- ✅ Encrypted data transmission (HTTPS)

## Summary

**Your memory is 100% yours!**

- 🔒 **Private**: Only you can access your conversations
- 🚫 **Isolated**: Other users can't see your data
- 💾 **Persistent**: Your memories are saved permanently
- 🧠 **Smart**: AI remembers context across sessions
- 🔐 **Secure**: Database-level security enforced

Every piece of data - from your chat messages to your financial goals - is tagged with YOUR unique user ID and protected by multiple layers of security.

---

**Last Updated**: October 7, 2025  
**Feature Status**: ✅ Fully Implemented & Tested  
**Privacy Level**: Maximum (User-Isolated)
