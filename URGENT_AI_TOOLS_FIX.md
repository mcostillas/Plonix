# 🔴 URGENT: AI Tools Not Working on Production

**Issue:** AI tools failing on deployed website (www.plounix.xyz)  
**Error:** "Technical issue prevents me from adding..."

## Root Cause

The AI agent code is running **server-side** in the `/api/ai-chat` route, and it's trying to call other API endpoints using:

```typescript
await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/transactions/add`, ...)
```

### Why This Fails on Production:

1. **Server-to-Server Calls:** The server is trying to call `http://localhost:3000` (which doesn't exist on Vercel)
2. **NEXT_PUBLIC_* Variables:** These are meant for client-side, not reliable on server-side
3. **Vercel Serverless:** Each function is isolated, so "localhost" refers to the function itself

## Solutions

### Option 1: Use Relative URLs (Recommended) ✅

Change from absolute URLs to relative URLs:

```typescript
// ❌ Current (broken):
await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/transactions/add`, ...)

// ✅ Solution:
const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000'
await fetch(`${baseUrl}/api/transactions/add`, ...)
```

Or better yet, use the request origin:

```typescript
// In the API route handler:
const origin = request.headers.get('origin') || 
               request.headers.get('host') || 
               'https://www.plounix.xyz'
await fetch(`${origin}/api/transactions/add`, ...)
```

### Option 2: Call API Functions Directly (Best) ✅✅

Instead of HTTP calls, import and call the API functions directly:

```typescript
// ❌ Current:
await fetch('/api/transactions/add', { method: 'POST', body: JSON.stringify(data) })

// ✅ Better:
import { POST as addTransaction } from '@/app/api/transactions/add/route'
const result = await addTransaction(new Request('', { 
  method: 'POST', 
  body: JSON.stringify(data) 
}))
```

This is faster, more reliable, and works everywhere.

### Option 3: Use Environment Variable Properly

Set `SITE_URL` (not `NEXT_PUBLIC_SITE_URL`) in Vercel:

```bash
# In Vercel Environment Variables:
SITE_URL=https://www.plounix.xyz
```

Then use:
```typescript
await fetch(`${process.env.SITE_URL || 'http://localhost:3000'}/api/transactions/add`, ...)
```

---

## Quick Fix for Now

Let me implement **Option 1** with proper Vercel URL detection:

### Files to Update:
- `lib/langchain-agent.ts` - All 8 places where `process.env.NEXT_PUBLIC_SITE_URL` is used

### Changes:
Replace:
```typescript
${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
```

With:
```typescript
${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')}
```

This will:
- ✅ Work on Vercel (uses `VERCEL_URL` which is auto-set)
- ✅ Work locally (uses `NEXT_PUBLIC_SITE_URL` from .env.local)
- ✅ Fall back to localhost if neither is set

---

## Let Me Fix This Now

I'll update the code to use the proper URL detection...

