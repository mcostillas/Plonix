# Chat Session Persistence Fix

## Problem Summary
User reported that chat sessions were not persisting correctly after page refresh:
1. Only one session was being saved/shown in chat history
2. Messages from different chat sessions were being mixed together
3. The current active chat was not being remembered after refresh

## Root Causes

### 1. **Overly Broad Database Query**
```typescript
// OLD - WRONG: Loads ALL sessions containing userId
.like('session_id', `%${userId}%`)
```
This query was loading both:
- Session-based chats: `chat_1234567890_abc123`
- User-ID-based sessions: `user_uuid_default`

This caused messages from different conversation types to mix together.

### 2. **No Session ID Persistence**
The `currentChatId` state was only stored in React state, which is lost on page refresh. When the page reloaded, it would always default to the first chat session instead of the one the user was viewing.

### 3. **Frontend-Only Session Management**
New chat sessions created with "New Chat" button existed only in frontend state and weren't being tracked in localStorage, so they would disappear on refresh until a message was sent.

## Solutions Implemented

### Fix 1: Filter Only Session-Based Chats
**File:** `app/ai-assistant/page.tsx`

Changed the database query to only load session-based chats:
```typescript
// NEW - CORRECT: Only loads session-based chats
.like('session_id', `chat_%`)
```

This ensures we only load conversations that were started from the AI assistant page with unique session IDs, not mixing in other conversation types.

### Fix 2: Persist Current Chat ID in localStorage
Added localStorage persistence for the active chat:

```typescript
// Save when creating new chat
localStorage.setItem('plounix_current_chat_id', newChat.id)

// Save when switching chats
localStorage.setItem('plounix_current_chat_id', chatId)

// Load on page refresh
const savedChatId = localStorage.getItem('plounix_current_chat_id')
const savedChatExists = savedChatId && loadedChats.find(c => c.id === savedChatId)
const activeChatId = savedChatExists ? savedChatId : loadedChats[0].id
```

### Fix 3: Smart Session Recovery
Now when the page loads:
1. Load all chat sessions from database
2. Check if there's a saved `currentChatId` in localStorage
3. If the saved chat exists in loaded chats, restore it
4. Otherwise, default to the most recent chat
5. Display the correct messages for that specific session

## Technical Details

### Session ID Format
```
chat_1696294800000_abc123def
│    │              │
│    │              └─ Random string (7 chars)
│    └──────────────── Timestamp
└───────────────────── Prefix identifier
```

### Data Flow
```
1. User clicks "New Chat"
   ├─ Generate unique session ID: chat_${timestamp}_${random}
   ├─ Create new chat object in React state
   └─ Save session ID to localStorage

2. User sends message
   ├─ Message sent to /api/ai-chat with sessionId
   ├─ Backend saves to chat_history table with session_id
   └─ Frontend updates local state

3. User refreshes page
   ├─ loadChatHistory() queries database
   ├─ Filters by: .like('session_id', 'chat_%')
   ├─ Groups messages by session_id
   ├─ Loads saved currentChatId from localStorage
   └─ Restores the exact chat the user was viewing
```

### Database Query Strategy
**Before (Incorrect):**
- Query: `SELECT * WHERE session_id LIKE '%user_uuid%'`
- Result: Mixed sessions including user-id-based and chat-based
- Problem: Messages from different conversation contexts mixed together

**After (Correct):**
- Query: `SELECT * WHERE session_id LIKE 'chat_%'`
- Result: Only session-based chats
- Benefit: Clean separation between different chat sessions

## Testing Checklist

✅ Create multiple chat sessions
✅ Send messages in each session
✅ Refresh the page
✅ Verify all sessions appear in sidebar
✅ Verify correct session is active after refresh
✅ Switch between sessions
✅ Refresh and verify switched session is active
✅ Messages stay separated by session

## Files Modified

1. **app/ai-assistant/page.tsx**
   - Updated `loadChatHistory()` database query filter
   - Added localStorage persistence in `createNewChat()`
   - Added localStorage persistence in `switchChat()`
   - Added localStorage loading in `loadChatHistory()`

## Impact

- ✅ Chat sessions now persist correctly across page refreshes
- ✅ Each chat maintains its own conversation history
- ✅ User returns to the exact chat they were viewing
- ✅ No more mixing of messages between different sessions
- ✅ Sidebar shows all chat sessions correctly

## Future Improvements

1. Consider adding a "Clear Old Chats" button for users with many sessions
2. Add session names/titles editable by user
3. Implement server-side session cleanup for old/empty sessions
4. Add export chat history feature
