# AI Chat Session Persistence Fix

## Problem 1: Page Navigation (FIXED)
When navigating away from the AI Assistant page and returning, a new chat session was created instead of continuing the existing conversation. This happened because:

1. A new `sessionId` was generated every time the component mounted
2. No persistence mechanism to remember the current active chat
3. Session state was lost on page navigation

## Problem 2: Tab Switching (LATEST FIX - December 2024)
When users clicked "New Chat", sent messages, then switched to another browser tab and returned, the AI would reset to the welcome screen. The chat history sidebar would show "New Chat" but messages would disappear from the main view. Messages were still saved in the database but the UI lost track of the current session.

## Solution Implemented

### 1. Session Persistence Function
Added `getOrCreateSessionId()` function that:
- Checks `sessionStorage` for an existing session ID
- Returns the existing ID if found
- Creates and stores a new ID if not found
- Ensures session persists across page navigations within the same browser tab

```typescript
const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  
  // Check if there's an existing session ID in sessionStorage
  const existingSessionId = sessionStorage.getItem('plounix_current_chat_session')
  if (existingSessionId) {
    return existingSessionId
  }
  
  // Create new session ID and store it
  const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  sessionStorage.setItem('plounix_current_chat_session', newSessionId)
  return newSessionId
}
```

### 2. Sync Effect
Added `useEffect` to automatically sync `currentChatId` to `sessionStorage` whenever it changes:

```typescript
// Sync currentChatId to sessionStorage whenever it changes
useEffect(() => {
  if (typeof window !== 'undefined' && currentChatId) {
    sessionStorage.setItem('plounix_current_chat_session', currentChatId)
  }
}, [currentChatId])
```

### 3. Updated Initial State
Changed from:
```typescript
const defaultSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
const [currentChatId, setCurrentChatId] = useState(defaultSessionId)
```

To:
```typescript
const [currentChatId, setCurrentChatId] = useState(getOrCreateSessionId())
```

## How It Works

### First Visit
1. User opens AI Assistant page
2. `getOrCreateSessionId()` checks sessionStorage → empty
3. Creates new session ID: `chat_1760136819113_i3bybi9`
4. Stores in sessionStorage
5. User starts chatting

### Navigation Away & Return
1. User navigates to Dashboard (or any other page)
2. User clicks back to AI Assistant
3. `getOrCreateSessionId()` checks sessionStorage → finds `chat_1760136819113_i3bybi9`
4. Returns existing session ID
5. Chat continues from where user left off ✅

### Switching Chats
1. User clicks "New Chat" or selects different chat from sidebar
2. `setCurrentChatId(newChatId)` is called
3. useEffect detects change and updates sessionStorage
4. New session ID is now persisted

### Creating New Chat
1. User clicks "New Chat" button
2. `createNewChat()` generates new session ID
3. Sets as current chat with `setCurrentChatId(newChat.id)`
4. useEffect automatically persists to sessionStorage

## Benefits

✅ **Session Continuity**: Chat persists when navigating between pages
✅ **No Data Loss**: Messages remain accessible when returning to AI page  
✅ **Natural UX**: Works like ChatGPT - conversations don't randomly reset
✅ **Tab-Scoped**: Each browser tab maintains its own session (sessionStorage)
✅ **Automatic Sync**: Changes to current chat are automatically persisted
✅ **Database Alignment**: Session ID matches what's stored in database

## Technical Notes

### sessionStorage vs localStorage
- Uses `sessionStorage` (not `localStorage`)
- Session persists within the same browser tab/window
- Cleared when tab is closed
- Doesn't interfere with other tabs
- Perfect for temporary chat sessions

### Edge Cases Handled
- ✅ Server-side rendering check (`typeof window !== 'undefined'`)
- ✅ Initial load with no existing session
- ✅ Switching between multiple chats
- ✅ Creating new chats manually
- ✅ Clearing all history (creates fresh session)

## Testing

To verify the fix works:

1. **Basic Persistence Test:**
   - Go to AI Assistant
   - Start a conversation
   - Navigate to Dashboard
   - Return to AI Assistant
   - ✅ Should see same conversation

2. **Multiple Navigation Test:**
   - Chat with AI
   - Go to Goals page
   - Go to Transactions page  
   - Go back to AI Assistant
   - ✅ Conversation should still be there

3. **New Chat Test:**
   - Click "New Chat" button
   - Start new conversation
   - Navigate away and back
   - ✅ Should continue the NEW chat (not old one)

4. **Tab Independence Test:**
   - Open AI Assistant in Tab 1
   - Start chat A
   - Open AI Assistant in Tab 2
   - Start chat B
   - Switch between tabs
   - ✅ Each tab maintains its own session

## Latest Fix: Tab Switching Restoration (December 2024)

### Root Cause
The `visibilitychange` event listener only refreshed the profile picture when the user returned to the tab. It did **not** restore the current chat session from sessionStorage. When the browser tab became inactive and then active again, the component state would sometimes be cleared, but there was no handler to restore the session.

### The Solution
Modified the `visibilitychange` event handler in `app/ai-assistant/page.tsx` (lines 478-508) to:

1. **Check for persisted session ID** in sessionStorage when page becomes visible
2. **Compare with current session** to see if restoration is needed
3. **Restore from memory** if the chat exists in the `chats` array
4. **Reload from database** if the chat is not in memory
5. **Update useEffect dependencies** to include `currentChatId` and `chats`

### Code Changes

```typescript
// BEFORE
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden && user?.id) {
      console.log('👁️ Page visible, refreshing profile picture')
      fetchProfilePicture(user.id)
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [user?.id])

// AFTER
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden && user?.id) {
      console.log('👁️ Page visible again')
      
      // Refresh profile picture
      fetchProfilePicture(user.id)
      
      // Restore chat session from sessionStorage
      const persistedSessionId = sessionStorage.getItem('plounix_current_chat_session')
      console.log('🔍 Checking for persisted session:', persistedSessionId)
      
      if (persistedSessionId && persistedSessionId !== currentChatId) {
        console.log('🔄 Restoring chat session:', persistedSessionId)
        
        // Find the chat in the current chats array
        const persistedChat = chats.find(c => c.id === persistedSessionId)
        
        if (persistedChat) {
          // Chat exists in memory, restore it
          console.log('✅ Chat found in memory, restoring')
          setCurrentChatId(persistedChat.id)
          setMessages(persistedChat.messages)
        } else {
          // Chat not in memory, reload from database
          console.log('📥 Chat not in memory, reloading from database')
          loadChatHistory(user.id)
        }
      }
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [user?.id, currentChatId, chats]) // ← Added currentChatId and chats dependencies
```

### How Tab Restoration Works

1. **User starts new chat**: `createNewChat()` generates session ID, saves to sessionStorage via useEffect
2. **User sends message**: Message is saved to database with session ID
3. **User switches tab**: Browser fires `visibilitychange` event (document.hidden = true)
4. **User returns to tab**: Browser fires `visibilitychange` event again (document.hidden = false)
5. **Restoration kicks in**:
   - Reads persisted session ID from sessionStorage
   - Checks if it differs from current session
   - Finds chat in memory or reloads from database
   - Restores `currentChatId` and `messages` state

### Testing Tab Restoration

**Before Fix:**
1. Click "New Chat"
2. Send a message (e.g., "Hello")
3. Switch to another browser tab (Gmail, YouTube, etc.)
4. Return to Plounix tab
5. ❌ **BUG**: AI shows welcome screen, message disappears
6. Chat history shows "New Chat" but clicking it shows the message was saved

**After Fix:**
1. Click "New Chat"
2. Send a message (e.g., "Hello")
3. Switch to another browser tab
4. Return to Plounix tab
5. ✅ **FIXED**: Chat session is automatically restored with your message visible

## Related Files Modified

- `app/ai-assistant/page.tsx` - Main AI chat interface (lines 478-508 for tab restoration fix)

## No Database Changes Required

These fixes are entirely client-side and don't require:
- Database schema changes
- API modifications
- Migration scripts

The session IDs are already being stored in the database correctly. These fixes ensure the client remembers which session to use and restores it properly when switching tabs.
