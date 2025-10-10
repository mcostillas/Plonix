# Phase 2 Implementation: Notification Bell & History Center

## ✅ What We've Built

### 1. Database Schema
**File:** `docs/notifications-schema.sql`

**Tables Created:**
- `notifications` - Stores all notification history
- `user_notification_preferences` - User settings for notifications

**Features:**
- Row Level Security (RLS) policies
- Indexes for performance
- Helper functions (get_unread_count, mark_all_read)
- Auto-create default preferences for new users
- Analytics views
- Cleanup function for old notifications

### 2. UI Components

**File:** `components/ui/notification-bell.tsx`
- Bell icon with unread badge
- Shows count of unread notifications
- Opens/closes notification center
- Auto-refreshes every 30 seconds

**File:** `components/ui/notification-center.tsx`
- Dropdown panel with notification list
- Shows last 10 notifications
- Mark individual as read
- Mark all as read
- Relative timestamps ("2 hours ago")
- Different icons for different types
- Colored backgrounds for notification types
- Empty state when no notifications
- Loading state
- Click notification to navigate and mark as read

### 3. Navbar Integration

**File:** `components/ui/navbar.tsx`
- Added notification bell to desktop navbar (between logo and "Add" button)
- Added notification bell to mobile menu
- Seamlessly integrated with existing design

### 4. API Routes

**File:** `app/api/notifications/route.ts`
- `GET` - Fetch user's notifications (with pagination, filter by unread)
- `POST` - Create new notification (for system/background jobs)

**File:** `app/api/notifications/read/route.ts`
- `POST` - Mark a single notification as read

**File:** `app/api/notifications/read-all/route.ts`
- `POST` - Mark all user notifications as read

---

## 🎨 Visual Design

### Notification Bell
```
Desktop: [🏠 Dashboard] [🔔³] [+ Add] [Profile]
                        ↑
                  Red badge with count
```

### Notification Center Dropdown
```
┌─────────────────────────────────────────────┐
│ 🔔 Notifications    Mark all as read    ✕  │
├─────────────────────────────────────────────┤
│                                             │
│ [📅] Electricity Bill Due Tomorrow      ●   │
│      Your bill of ₱1,200 is due tomorrow    │
│      2 hours ago                            │
│                                             │
│ [📚] New Learning Module Available          │
│      Check out "Emergency Fund Basics"      │
│      Yesterday                              │
│                                             │
│ [🏆] Challenge Complete!                    │
│      You completed 30-Day Savings           │
│      2 days ago                             │
│                                             │
├─────────────────────────────────────────────┤
│           View all notifications            │
└─────────────────────────────────────────────┘
```

### Notification Types & Colors

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `bill_reminder` | 📅 Calendar | Red | Bills due soon |
| `learning` | 📚 BookOpen | Blue | Learning prompts |
| `achievement` | 🏆 Trophy | Yellow | Milestones reached |
| `budget_alert` | ⚠️ AlertCircle | Orange | Budget warnings |
| `system` | ℹ️ Info | Gray | General updates |

---

## 📝 Next Steps: Installation

### Step 1: Create Database Tables

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Open `docs/notifications-schema.sql`
4. **Copy ALL the SQL** (entire file)
5. Paste into Supabase SQL Editor
6. Click **Run** (or press F5)

**Expected Output:**
```
Success. No rows returned.
```

**Verify Tables Created:**
- Go to **Table Editor**
- You should see:
  - `notifications` table
  - `user_notification_preferences` table

### Step 2: Test with Sample Notifications

**Get your User ID:**
```sql
-- Run this in SQL Editor
SELECT id, email FROM auth.users LIMIT 5;
```

**Insert test notifications:**
```sql
-- Replace 'YOUR_USER_ID' with actual ID from above
INSERT INTO notifications (user_id, type, title, message, action_url, metadata) VALUES
(
  'YOUR_USER_ID',
  'bill_reminder',
  'Electricity Bill Due Tomorrow',
  'Your electricity bill of ₱1,200 is due tomorrow',
  '/dashboard#bills',
  '{"bill_id": "test-123", "amount": 1200}'
),
(
  'YOUR_USER_ID',
  'learning',
  'New Learning Module Available',
  'Check out "Emergency Fund Basics" - Just 5 minutes',
  '/learning',
  '{"lesson_id": "emergency-fund-basics"}'
),
(
  'YOUR_USER_ID',
  'achievement',
  'Challenge Complete!',
  'You completed the 30-Day Savings Challenge!',
  '/challenges',
  '{"challenge_id": "30-day-savings"}'
);
```

### Step 3: Test in Your App

1. **Start dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Log in to your app**

3. **Check navbar** - You should see:
   - Bell icon with red badge showing "3"
   - Click bell → dropdown opens with 3 test notifications

4. **Test features:**
   - Click a notification → Should navigate to the URL
   - Click a notification → Badge count decreases
   - Click "Mark all as read" → Badge disappears
   - Unread notifications have blue background + dot
   - Read notifications have white background

### Step 4: Verify API Routes

**Test GET notifications:**
```bash
# In terminal (replace TOKEN with your actual token)
curl http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test mark as read:**
```bash
curl -X POST http://localhost:3000/api/notifications/read \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notification_id": "YOUR_NOTIFICATION_ID"}'
```

---

## 🔧 How It Works

### Notification Flow

```
1. Something happens (bill due, goal reached, etc.)
   ↓
2. System creates notification in database
   INSERT INTO notifications (user_id, type, title, message)
   ↓
3. User sees red badge on bell icon (unread count)
   ↓
4. User clicks bell → Dropdown opens
   ↓
5. User clicks notification
   ↓
6. Marked as read + Navigate to action_url
```

### Auto-Refresh

- Notification bell polls every **30 seconds** for new notifications
- Updates badge count automatically
- No page refresh needed

### Database Queries

**Fetch notifications:**
```sql
SELECT * FROM notifications
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC
LIMIT 10;
```

**Get unread count:**
```sql
SELECT COUNT(*) FROM notifications
WHERE user_id = 'USER_ID' AND is_read = false;
```

**Mark as read:**
```sql
UPDATE notifications
SET is_read = true
WHERE id = 'NOTIFICATION_ID' AND user_id = 'USER_ID';
```

---

## 🎯 What's NOT Built Yet

These are for **future phases**:

### Phase 2 Remaining:
- [ ] Bill reminder background job (sends notifications when bills due)
- [ ] Full notifications history page (`/notifications`)

### Phase 3 (Later):
- [ ] Notification preferences page
- [ ] Smart triggers (budget alerts, learning prompts)
- [ ] Motivational modal
- [ ] Analytics tracking

### Phase 4 (Optional):
- [ ] Email notifications
- [ ] Push notifications
- [ ] Notification grouping
- [ ] Quiet hours

---

## 🚀 Creating Notifications Manually

For now, you can create notifications manually for testing:

### Method 1: SQL (Easiest)
```sql
INSERT INTO notifications (user_id, type, title, message, action_url)
VALUES (
  'user-id-here',
  'bill_reminder',
  'Water Bill Due in 3 Days',
  'Your water bill of ₱300 is due on October 14',
  '/dashboard#bills'
);
```

### Method 2: API (Programmatic)
```typescript
// In your code
await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: user.id,
    type: 'achievement',
    title: 'Goal Reached!',
    message: 'You saved ₱10,000 in your Emergency Fund',
    action_url: '/goals',
    metadata: { goal_id: 'goal-123', amount: 10000 }
  })
})
```

### Method 3: Supabase Client (In App)
```typescript
const { supabase } = await import('@/lib/supabase')
await supabase.from('notifications').insert({
  user_id: user.id,
  type: 'learning',
  title: 'Time to Learn!',
  message: 'You haven\'t visited the Learning Hub in 5 days',
  action_url: '/learning'
})
```

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Bell icon appears in navbar (desktop & mobile)
- [ ] Badge shows correct unread count
- [ ] Click bell opens dropdown
- [ ] Click outside closes dropdown
- [ ] Notifications appear in list
- [ ] Icons show correct colors
- [ ] Timestamps are relative ("2 hours ago")

### Interaction
- [ ] Click notification marks it as read
- [ ] Badge count decreases after reading
- [ ] Unread notifications have blue background
- [ ] Read notifications have white background
- [ ] Blue dot appears on unread notifications
- [ ] "Mark all as read" button works
- [ ] Badge disappears when all read

### Navigation
- [ ] Click notification navigates to action_url
- [ ] Dropdown closes after clicking notification
- [ ] "View all notifications" link works (will 404 for now)

### Edge Cases
- [ ] Empty state shows when no notifications
- [ ] Loading state shows while fetching
- [ ] Works with 1, 10, 100+ notifications
- [ ] Badge shows "9+" when > 9 unread
- [ ] Auto-refresh works (wait 30 seconds)

### Mobile
- [ ] Bell shows in mobile menu
- [ ] Dropdown works on mobile
- [ ] Touch interactions work
- [ ] Scrolling works in notification list

---

## 🐛 Troubleshooting

### "Table notifications does not exist"
- **Solution:** Run the SQL schema in Supabase Dashboard
- Go to SQL Editor → New Query → Paste schema → Run

### Bell icon not showing
- **Solution:** Check navbar.tsx has `<NotificationBell />` imported and used
- Clear browser cache and refresh

### Badge shows "0" but notifications exist
- **Solution:** Check RLS policies
- Verify user is logged in
- Check browser console for errors

### Dropdown doesn't close
- **Solution:** Check click-outside logic
- Verify panelRef is working
- Check z-index conflicts

### Notifications not fetching
- **Solution:** Check API route `/api/notifications`
- Verify Supabase connection
- Check auth token is being sent
- Look for errors in Network tab

### TypeScript errors
- **Solution:** These are expected until tables exist in Supabase
- They will disappear after running the schema
- If persistent, restart TypeScript server

---

## 📊 Analytics Queries

Once you have real data, run these:

### Most common notification types
```sql
SELECT type, COUNT(*) as count
FROM notifications
GROUP BY type
ORDER BY count DESC;
```

### Click-through rates
```sql
SELECT 
  type,
  COUNT(*) as total,
  SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked,
  ROUND(100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as ctr
FROM notifications
GROUP BY type;
```

### Unread notifications per user
```sql
SELECT 
  user_id,
  COUNT(*) as unread_count
FROM notifications
WHERE is_read = false
GROUP BY user_id
ORDER BY unread_count DESC
LIMIT 10;
```

---

## 🎉 Success!

**You now have:**
✅ Notification bell in navbar
✅ Notification center dropdown
✅ Database tables with RLS
✅ API routes for CRUD operations
✅ Beautiful, clean design matching Plounix style
✅ Mobile-responsive
✅ Real-time badge updates

**Next up (optional):**
- Bill reminder background job
- Notification preferences page
- Smart notification triggers

---

## 💡 Tips for Production

1. **Indexes** - Already created for performance
2. **Cleanup** - Run cleanup function monthly to delete old read notifications
3. **Rate Limiting** - Add limits to prevent notification spam
4. **Batch Operations** - When creating many notifications, use batch insert
5. **Monitoring** - Track notification delivery and click rates
6. **User Feedback** - Ask users if notifications are helpful

---

**Questions? Issues? Check the troubleshooting section or review the code comments!**
