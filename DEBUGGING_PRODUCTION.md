# Debugging Production AI Tools Issue

## Current Status
- Deployment successful (commit b2dec64)
- getApiBaseUrl() function implemented to use VERCEL_URL
- API routes use Supabase service role (bypass RLS)
- Tools still failing on production

## Possible Issues

### 1. VERCEL_URL might not be what we expect
- VERCEL_URL doesn't include https:// protocol
- We added it in getApiBaseUrl()
- Need to verify the actual URL being constructed

### 2. Internal API calls on Vercel
- Serverless functions might not be able to call other serverless functions via HTTP
- Should use direct imports instead

### 3. Logs to Check
Look in Vercel deployment logs for:
- Console.log from getApiBaseUrl()
- Actual URL being constructed
- HTTP response codes from fetch calls

## Better Solution: Direct Function Calls

Instead of:
```typescript
const response = await fetch(`${getApiBaseUrl()}/api/goals/create`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(goalData)
})
```

Use direct imports:
```typescript
import { POST as createGoal } from '@/app/api/goals/create/route'

const request = new NextRequest('http://localhost', {
  method: 'POST',
  body: JSON.stringify(goalData)
})
const response = await createGoal(request)
```

This avoids HTTP calls entirely and uses direct function invocation.

## Quick Debug Test

Add console.logs to langchain-agent.ts:
```typescript
function getApiBaseUrl(): string {
  const url = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  
  console.log('🌐 API Base URL:', url)
  console.log('  VERCEL_URL:', process.env.VERCEL_URL)
  console.log('  NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
  
  return url
}
```

Then check Vercel function logs after testing.
