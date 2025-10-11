# Critical Fix Checklist for Production AI Tools

## Issues Fixed So Far
1. ✅ Added `getApiBaseUrl()` to use VERCEL_URL
2. ✅ Added `.trim()` to SUPABASE_SERVICE_ROLE_KEY to remove newlines
3. ✅ Added debug logging

## Possible Remaining Issues

### 1. Vercel Environment Variables
**Check in Vercel Dashboard:**
- SUPABASE_SERVICE_ROLE_KEY - should have NO newlines, NO comments
- NEXT_PUBLIC_SUPABASE_URL - should be exact URL from Supabase
- OPENAI_API_KEY - should be valid
- TAVILY_API_KEY - should be valid (for web search)

**How to fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Delete SUPABASE_SERVICE_ROLE_KEY
3. Re-add it with ONLY the key value, no comments, no newlines
4. Redeploy

### 2. Database RLS Policies
The service role should bypass RLS, but check if:
- `goals` table has proper RLS policies
- `transactions` table has proper RLS policies
- Service role has proper permissions

### 3. CORS or Network Issues
Serverless functions calling other serverless functions might have issues.

**Better solution:** Use direct database calls in langchain-agent.ts instead of HTTP fetch

### 4. API Route Issues
Check if the API routes are actually deployed:
- https://www.plounix.xyz/api/transactions/add
- https://www.plounix.xyz/api/goals/create
- https://www.plounix.xyz/api/monthly-bills/add

## Next Steps to Debug

1. **Check Vercel Function Logs** (most important!)
   - Go to Vercel Dashboard
   - Click on latest deployment
   - Click "Functions" tab
   - Look for `/api/ai-chat` logs
   - Share the exact error message

2. **Test API routes directly**
   - Try accessing https://www.plounix.xyz/api/transactions/add with Postman
   - See if they respond at all

3. **Check Environment Variables**
   - Make sure SUPABASE_SERVICE_ROLE_KEY has no extra characters
   - Copy-paste the key directly from Supabase dashboard

## Alternative Solution: Direct Database Calls

Instead of HTTP fetch, use Supabase client directly in langchain-agent.ts:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
)

// Then in tools:
const { data, error } = await supabase
  .from('transactions')
  .insert(transactionData)
  .select()
```

This avoids HTTP calls entirely!
