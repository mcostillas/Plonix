# 🎯 Fix AI Tools on Production - Step by Step

## The Problem

Your AI says: *"Marc, it seems there's a technical issue that prevents me from adding your ₱500 expense..."*

**Why?** The production site doesn't know its own URL!

---

## The Solution (5 Steps)

### 📍 Step 1: Open Vercel
Go to: **https://vercel.com**
- Click on your **Plounix** project

### ⚙️ Step 2: Go to Settings
- Click the **Settings** tab at the top
- In the left sidebar, click **Environment Variables**

### ➕ Step 3: Add Variable
Click the **Add New** button, then enter:

```
Name (left box):  NEXT_PUBLIC_SITE_URL
Value (right box): https://www.plounix.xyz
```

**Important:** Check ALL THREE boxes:
- ☑️ Production
- ☑️ Preview  
- ☑️ Development

Then click **Save**

### 🚀 Step 4: Redeploy
Two options:

**Option A - Easiest:**
1. Make any small change to your code (add a space somewhere)
2. Commit and push to GitHub
3. Vercel auto-deploys

**Option B - Faster:**
1. In Vercel, go to **Deployments** tab
2. Find the latest deployment
3. Click the **...** (three dots)
4. Click **Redeploy**
5. Click **Redeploy** again to confirm

### ✅ Step 5: Test (wait 2-3 minutes)
Go to: **https://www.plounix.xyz/ai-assistant**

Type: **"add 20000 to my income"**

✅ Should work now! (No more "technical issue" error)

---

## Why This Fixed It

### Before (Broken):
```
AI tries to call: http://localhost:3000/api/transactions/add
❌ localhost doesn't exist on production server
❌ API call fails
❌ AI says "technical issue"
```

### After (Fixed):
```
AI calls: https://www.plounix.xyz/api/transactions/add
✅ Correct production URL
✅ API works
✅ Transaction saved!
```

---

## Quick Test Commands

After fixing, test these in the AI:

1. **Add Income:**
   ```
   "add 20000 to my income"
   ```
   ✅ Should see success message

2. **Add Expense:**
   ```
   "I spend 500 on Jollibee"
   ```
   ✅ Should see success message

3. **Create Goal:**
   ```
   "I want to save 5000 for a laptop, put it in my goals"
   ```
   ✅ AI asks when, you answer, goal created

---

## Still Not Working?

### Check these:

1. **Did you save the variable?**
   - Go back to Vercel Settings → Environment Variables
   - Should see: `NEXT_PUBLIC_SITE_URL` with value `https://www.plounix.xyz`

2. **Did you redeploy?**
   - Check Deployments tab
   - Latest deployment should be AFTER you added the variable

3. **Did you wait?**
   - Deployment takes 2-3 minutes
   - Check status shows "Ready"

4. **Hard refresh the page:**
   - Press `Ctrl + Shift + R` (Windows)
   - Or `Cmd + Shift + R` (Mac)

---

## What If It Still Fails?

Check browser console (F12):
- Look for error messages
- Check if API calls are going to the right URL
- Share the error with me

---

## Summary

| Step | Action | Time |
|------|--------|------|
| 1 | Open Vercel | 10 sec |
| 2 | Go to Settings → Environment Variables | 10 sec |
| 3 | Add `NEXT_PUBLIC_SITE_URL` | 30 sec |
| 4 | Redeploy | 2-3 min |
| 5 | Test | 30 sec |
| **Total** | **~4 minutes** | ✅ |

**Status:** Once done, all AI tools will work! 🎉

