# 🚨 URGENT: AI Tools Not Working on Production

**Problem:** AI tools failing on www.plounix.xyz  
**Cause:** Missing environment variable in Vercel  
**Solution:** Add `NEXT_PUBLIC_SITE_URL` to Vercel

---

## Quick Fix (5 minutes)

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your **Plounix** project
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar

### Step 2: Add the Missing Variable

Click **Add New** and enter:

```
Name: NEXT_PUBLIC_SITE_URL
Value: https://www.plounix.xyz
Environment: Production, Preview, Development (select all 3)
```

Click **Save**

### Step 3: Redeploy

**Option A: Automatic (Recommended)**
- Just push any change to GitHub
- Vercel will auto-deploy with new variable

**Option B: Manual**
- In Vercel dashboard, go to **Deployments** tab
- Click ⋯ (three dots) on latest deployment
- Click **Redeploy**
- Check "Use existing Build Cache" (faster)
- Click **Redeploy**

### Step 4: Test (Wait 2-3 minutes for deployment)

Go to https://www.plounix.xyz/ai-assistant and test:

```
"add 20000 to my income"
Expected: ✅ Income added successfully

"I spend 500 on Jollibee"
Expected: ✅ Expense added successfully
```

---

## Why This Happened

### Local Development:
- ✅ `.env.local` file has `NEXT_PUBLIC_SITE_URL=https://www.plounix.xyz`
- ✅ AI tools work locally

### Production (Vercel):
- ❌ `.env.local` is not deployed (gitignored for security)
- ❌ Vercel doesn't have `NEXT_PUBLIC_SITE_URL` variable
- ❌ Code falls back to `http://localhost:3000`
- ❌ API calls fail → "technical issue" error

---

## Current Code Behavior

```typescript
// In lib/langchain-agent.ts
const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/transactions/add`

// On production WITHOUT the env var:
// url = "http://localhost:3000/api/transactions/add" ❌ (doesn't exist)

// On production WITH the env var:
// url = "https://www.plounix.xyz/api/transactions/add" ✅ (works!)
```

---

## Alternative: Use Relative URLs (Better Long-term)

Instead of absolute URLs, we could use relative URLs which automatically work in any environment.

**Current approach:**
```typescript
await fetch('https://www.plounix.xyz/api/transactions/add', ...)
```

**Better approach:**
```typescript
await fetch('/api/transactions/add', ...)  // Relative URL
```

But this requires the AI agent to run client-side or use Next.js internal routing. For now, the environment variable approach is simpler.

---

## Verification Checklist

After redeployment:

- [ ] Go to https://www.plounix.xyz/ai-assistant
- [ ] Try: "add 20000 to my income"
- [ ] ✅ Should see success message (not "technical issue")
- [ ] Check /transactions page
- [ ] ✅ Should see the ₱20,000 income entry
- [ ] Try: "I spend 500 on food"
- [ ] ✅ Should see success message
- [ ] ✅ Should see the ₱500 expense entry

---

## Screenshot of Vercel Settings

Add this in **Settings → Environment Variables**:

```
┌─────────────────────────────────────────────────┐
│ Name: NEXT_PUBLIC_SITE_URL                      │
│ Value: https://www.plounix.xyz                  │
│ Environments: ☑ Production                      │
│               ☑ Preview                          │
│               ☑ Development                      │
│                                                  │
│ [Cancel]                              [Save] ←  │
└─────────────────────────────────────────────────┘
```

---

## Other Environment Variables to Check

While you're in Vercel, make sure these are also set:

```
✅ OPENAI_API_KEY=sk-proj-...
✅ TAVILY_API_KEY=tvly-dev-...
✅ NEXT_PUBLIC_SUPABASE_URL=https://ftxvmaurxhatqhzowgkb.supabase.co/
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
✅ SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
➕ NEXT_PUBLIC_SITE_URL=https://www.plounix.xyz (ADD THIS!)
```

---

## Summary

**Problem:** Missing `NEXT_PUBLIC_SITE_URL` in Vercel  
**Impact:** AI tools call wrong URL → All tools fail  
**Fix:** Add environment variable in Vercel  
**Time:** 5 minutes  
**Status:** Needs immediate action 🚨

Once you add the variable and redeploy, all AI tools will work on production! 🚀

