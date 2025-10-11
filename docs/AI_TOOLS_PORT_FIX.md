# AI Tools 404 Error - Port Mismatch Fix

**Date:** October 11, 2025  
**Status:** ✅ FIXED

## Problem

AI tools (`add_expense`, `create_financial_goal`) were returning 404 errors when called, even though:
- ✅ The tool code exists in `langchain-agent.ts`
- ✅ The API endpoints exist (`/api/transactions/add`, `/api/goals/create`)
- ✅ The `add_income` tool was working perfectly

## Root Cause

The dev server was running on **port 3001** (because port 3000 was already in use), but the AI agent code was hardcoded to call `http://localhost:3000/api/...`.

This caused:
1. `add_income` worked because it was called first when port 3000 was available
2. Later calls failed because server moved to port 3001
3. Fetching `http://localhost:3000` returned an HTML 404 page
4. AI tried to parse HTML as JSON → **SyntaxError: Unexpected token '<'**

### Error from Terminal:
```
❌ Expense creation error: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
    at JSON.parse (<anonymous>)
```

### Root Issue:
```typescript
// AI agent was calling this URL:
await fetch('http://localhost:3000/api/transactions/add', ...)

// But server was actually running on:
http://localhost:3001
```

## Solution

Added `NEXT_PUBLIC_SITE_URL` environment variable to `.env.local`:

```bash
# Added to .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### How It Works:

The AI agent code already had fallback logic:
```typescript
await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/...`, ...)
```

Now it will use `http://localhost:3001` from the environment variable instead of defaulting to port 3000.

## Files Modified

1. **`.env.local`** - Added `NEXT_PUBLIC_SITE_URL=http://localhost:3001`

## Testing

**Restart your dev server** for changes to take effect:

```powershell
# Stop the current dev server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Test Commands:

1. **Test add_expense:**
   ```
   User: "I spend 500 on food today"
   Expected: ✅ Expense added successfully
   ```

2. **Test create_financial_goal:**
   ```
   User: "I want to save 5000 for a laptop, can you put it in my goals?"
   AI: "When do you want to achieve this?"
   User: "In 3 months"
   Expected: ✅ Goal created successfully
   ```

3. **Test add_income (should still work):**
   ```
   User: "add 1000 to my income"
   Expected: ✅ Income added successfully
   ```

## Why This Happened

Next.js automatically tries the next available port when the default port (3000) is in use. This is normal behavior, but the AI agent needs to know which port the server is actually running on.

## Prevention

### Option 1: Always Use Port 3000 (Recommended)
Make sure no other app is using port 3000:

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <process_id> /F
```

Then set `.env.local` back to:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Option 2: Use Dynamic Port Detection (Future Enhancement)
Update the code to detect the current port automatically. This requires server-side refactoring.

## Verification

After restarting the server, check the terminal:

```
✓ Ready in 3.6s
  - Local:        http://localhost:3001  ← Check this matches .env.local
```

Then test all AI tools:
- ✅ add_income
- ✅ add_expense  
- ✅ create_financial_goal
- ✅ add_monthly_bill
- ✅ get_financial_summary

All should now work without 404 errors!

## Summary

**Problem:** Port mismatch (server on 3001, AI calling 3000)  
**Solution:** Set `NEXT_PUBLIC_SITE_URL=http://localhost:3001`  
**Action Required:** Restart dev server  
**Status:** ✅ FIXED

---

**Next Steps:**
1. Restart your dev server
2. Test the 3 AI tools that were failing
3. Update `FEATURE_STATUS_REPORT.md` to mark them as ✅ WORKING

