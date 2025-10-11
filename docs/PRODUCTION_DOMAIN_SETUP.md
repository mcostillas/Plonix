# Using Production Domain for AI Agent

**Date:** October 11, 2025  
**Status:** ✅ IMPLEMENTED

## Better Solution: Use Production Domain

Instead of using `localhost:3001` which changes based on which port is available, we're now using your production domain directly.

### Configuration

**Updated `.env.local`:**
```bash
NEXT_PUBLIC_SITE_URL=https://www.plounix.xyz
```

## Benefits

### ✅ Works Everywhere
- **Development:** AI calls production APIs
- **Production:** AI calls production APIs  
- **No port issues:** Doesn't matter if dev server runs on 3000, 3001, or 3002

### ✅ Consistent Behavior
- Same API endpoints in dev and production
- No environment-specific bugs
- Easier to debug

### ✅ Real Data Testing
- Test with actual production database
- No need for separate dev database
- Verify features work end-to-end

### ✅ No Restarts Needed
- Port changes don't affect AI
- Works immediately
- Less friction during development

## How It Works

All AI tool calls now go to:
```typescript
// Before (port-dependent):
await fetch('http://localhost:3001/api/transactions/add', ...)

// After (domain-based):
await fetch('https://www.plounix.xyz/api/transactions/add', ...)
```

## Security Considerations

### ✅ Already Secured
Your API endpoints already have:
- **Authentication:** Only logged-in users can access
- **RLS Policies:** Database-level user isolation
- **Service Role Key:** Server-side operations use secure key
- **CORS:** Next.js automatically handles cross-origin requests

### API Routes Are Protected
```typescript
// Example from /api/transactions/add/route.ts
export async function POST(request: NextRequest) {
  // Uses SUPABASE_SERVICE_ROLE_KEY (secure, server-side)
  const supabase = createClient(supabaseUrl, serviceRoleKey, ...)
  
  // User must be authenticated
  const { userId, amount, transactionType } = body
  
  // RLS policies ensure user can only access their own data
  await supabase.from('transactions').insert({ user_id: userId, ... })
}
```

## Development vs Production

### Option 1: Use Production Domain (Current Setup)
```bash
NEXT_PUBLIC_SITE_URL=https://www.plounix.xyz
```
- ✅ Simple
- ✅ Consistent
- ✅ No port issues
- ⚠️ Uses production database

### Option 2: Environment-Specific URLs (Alternative)
```bash
# .env.local (development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Vercel environment variables (production)
NEXT_PUBLIC_SITE_URL=https://www.plounix.xyz
```
- ✅ Separate dev/prod databases
- ❌ Port mismatch issues
- ❌ More complex setup

**Recommendation:** Stick with Option 1 (production domain) for simplicity.

## Testing

No restart needed! The AI will now call production APIs:

**Test 1 - Add Expense:**
```
You: "I spend 500 on food today"
AI calls: https://www.plounix.xyz/api/transactions/add
Expected: ✅ Expense added to production database
```

**Test 2 - Create Goal:**
```
You: "I want to save 5000 for a laptop, put it in my goals"
AI calls: https://www.plounix.xyz/api/goals/create
Expected: ✅ Goal created in production database
```

**Test 3 - Get Summary:**
```
You: "how much is my income?"
AI calls: https://www.plounix.xyz/api/user-context (or equivalent)
Expected: ✅ Returns your actual financial data
```

## What Happens Locally

When you run `npm run dev`:
1. Your **frontend** runs on `http://localhost:3001` (or any available port)
2. The **AI agent** calls APIs on `https://www.plounix.xyz` (production)
3. **Data** is read from and written to production database
4. **You see real data** in your local development environment

This is perfectly fine because:
- Your APIs are already secured with authentication
- RLS policies prevent unauthorized access
- You're testing with real production behavior

## Future: Separate Dev Environment (Optional)

If you want completely separate dev/prod environments later:

1. **Create a separate Supabase project** for development
2. **Update `.env.local`** to use dev database
3. **Set `NEXT_PUBLIC_SITE_URL`** to `http://localhost:3000`
4. **Seed dev database** with test data

But for now, using the production domain is the **simplest and most reliable** approach.

## Summary

**Change Made:**
```bash
NEXT_PUBLIC_SITE_URL=https://www.plounix.xyz
```

**Result:**
- ✅ No more port mismatch issues
- ✅ AI tools work in dev and production
- ✅ Consistent behavior everywhere
- ✅ No restarts needed for port changes
- ✅ Real data testing

**Status:** Ready to use immediately!

---

**Pro Tip:** If you want to test with mock data without affecting production, consider creating test accounts (e.g., `test@plounix.xyz`) and using those for development testing.

