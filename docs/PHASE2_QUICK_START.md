# 🚀 Phase 2 Quick Start: 5-Minute Setup

## ✅ What's Ready

All code is written! You just need to:
1. Run SQL in Supabase (2 minutes)
2. Test in your app (3 minutes)

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Click your **Plounix project**
3. Click **SQL Editor** in left sidebar

### Step 2: Run the Schema
1. Click **New Query** button
2. Open the file: `docs/notifications-schema.sql`
3. **Copy the ENTIRE file** (Ctrl+A, Ctrl+C)
4. **Paste** into Supabase SQL Editor
5. Click **Run** button (or press F5)

**Expected Result:**
```
Success. No rows returned
```

### Step 3: Verify Tables Created
1. Click **Table Editor** in left sidebar
2. You should now see these tables:
   - ✅ `notifications`
   - ✅ `user_notification_preferences`

### Step 4: Add Test Notifications

**First, get your user ID:**
```sql
SELECT id, email FROM auth.users LIMIT 5;
```
Copy your `id` (looks like: `abc-123-def-456`)

**Then, insert test notifications:**
```sql
-- Replace 'YOUR_USER_ID' with the ID you just copied
INSERT INTO notifications (user_id, type, title, message, action_url) VALUES
('YOUR_USER_ID', 'bill_reminder', 'Electricity Bill Due Tomorrow', 'Your electricity bill of ₱1,200 is due tomorrow', '/dashboard'),
('YOUR_USER_ID', 'learning', 'New Learning Module', 'Check out "Emergency Fund Basics"', '/learning'),
('YOUR_USER_ID', 'achievement', 'Challenge Complete!', 'You completed the 30-Day Savings Challenge', '/challenges');
```

Click **Run** → You should see: `Success. 3 rows affected`

### Step 5: Test in Your App

1. **Refresh your browser** (or restart dev server)
2. **Log in** to Plounix
3. **Look at the navbar** → You should see:
   ```
   [🏠 Dashboard] [🔔³] [+ Add] [Profile]
                     ↑
              Bell with red badge "3"
   ```

4. **Click the bell** 🔔
   - Dropdown should open
   - 3 test notifications should appear
   - Different colored icons

5. **Test features:**
   - ✅ Click a notification → Should navigate
   - ✅ Click a notification → Badge count goes down
   - ✅ Click "Mark all as read" → Badge disappears
   - ✅ Unread = blue background + dot
   - ✅ Read = white background

---

## 🎉 That's It!

You now have a working notification system!

**TypeScript Errors?**
- They're expected before running the SQL
- They'll disappear after database tables exist
- If they persist, restart VS Code TypeScript server:
  - Press `Ctrl+Shift+P`
  - Type "TypeScript: Restart TS Server"
  - Press Enter

**Bell Not Showing?**
- Hard refresh: `Ctrl+Shift+R`
- Clear cache
- Check browser console for errors

**Need More Help?**
- See full guide: `docs/PHASE2_IMPLEMENTATION_GUIDE.md`
- Check troubleshooting section

---

## 🔜 What's Next?

### Option 1: Start Using It Now
- Create notifications manually as needed
- Example: When user creates a goal, send achievement notification

### Option 2: Build Bill Reminder Job (Phase 2 Final Step)
- Automatically send notifications when bills are due
- Runs daily in background
- ~2 hours of work

### Option 3: Move to Phase 3
- User preferences page
- Smart triggers (budget alerts, learning prompts)
- Motivational modal
- ~8 hours of work

---

## 💡 Quick Reference

### Create Notification (SQL)
```sql
INSERT INTO notifications (user_id, type, title, message, action_url)
VALUES ('user-id', 'achievement', 'Goal Reached!', 'You saved ₱10,000!', '/goals');
```

### Create Notification (Code)
```typescript
const { supabase } = await import('@/lib/supabase')
await supabase.from('notifications').insert({
  user_id: user.id,
  type: 'learning',
  title: 'Time to Learn!',
  message: 'New module available',
  action_url: '/learning'
})
```

### Notification Types
- `bill_reminder` - 📅 Red - Bills
- `learning` - 📚 Blue - Education
- `achievement` - 🏆 Yellow - Milestones
- `budget_alert` - ⚠️ Orange - Warnings
- `system` - ℹ️ Gray - Updates

---

**Ready? Go run that SQL! 🚀**
