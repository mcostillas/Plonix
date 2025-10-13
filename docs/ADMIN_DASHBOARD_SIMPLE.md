# Simple Admin Dashboard - Focused Specification

## 🎯 Vision: Minimal, Essential Admin Panel

A clean, straightforward admin dashboard for **one admin** to monitor the platform and handle user reports. No complexity, just the data you need.

---

## 📊 Main Dashboard (Single Page)

### **Top Stats Cards** (4 Key Metrics)

```
┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐
│   👥 Total Users    │  🟢 Active Users    │  ⚠️ Inactive Users  │  👀 Site Visits     │
│       1,247         │       856           │       391           │     12,450          │
│    +23 this week    │   logged in today   │  inactive >30 days  │   this month        │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```

**Card Details:**
1. **Total Users**: Count of all registered users
2. **Active Users**: Users who logged in within last 30 days
3. **Inactive Users**: Users who haven't logged in for >30 days
4. **Site Visits**: Total page views/sessions this month (tracked via analytics)

---

## 👥 Users Section

### **User Overview Table**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search: [____________]  Status: [All ▼]  Activity: [All ▼]  [Export CSV] │
├─────────────────────────────────────────────────────────────────────────────┤
│ Avatar | Name              | Email                    | Status   | Last Login │
├─────────────────────────────────────────────────────────────────────────────┤
│   👤   | Marc Costillas    | costillas@gmail.com      | 🟢 Active | 2 hours ago│
│   👤   | Juan Dela Cruz    | juan@email.com           | 🟢 Active | 1 day ago  │
│   👤   | Maria Santos      | maria@email.com          | ⚠️ Inactive| 45 days ago│
│   👤   | Pedro Reyes       | pedro@email.com          | 🟢 Active | 3 hours ago│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Columns:**
- **Avatar**: Profile picture or default icon
- **Name**: User's full name
- **Email**: User's email address
- **Status**: 
  - 🟢 Active (logged in within 30 days)
  - ⚠️ Inactive (>30 days)
  - 🔴 Suspended (if you suspend accounts)
- **Last Login**: Human-readable time ("2 hours ago", "3 days ago")

**Filters:**
- **Status**: All | Active | Inactive
- **Activity Level**: All | Logged in today | This week | This month
- **Search**: By name or email

**Actions:**
- Click on user row → View user details modal
- Export CSV button → Download all users data

### **User Detail Modal** (Click on user)

```
┌─────────────────────────────────────────────┐
│           User Details                      │
├─────────────────────────────────────────────┤
│  👤 Marc Costillas                          │
│  📧 costillas@gmail.com                     │
│  📅 Joined: January 15, 2025                │
│  🕐 Last Active: 2 hours ago                │
│                                             │
│  Quick Stats:                               │
│  💰 Transactions: 45                        │
│  🎯 Goals Created: 3                        │
│  🏆 Challenges Joined: 2                    │
│  💬 AI Chats: 12 sessions                   │
│                                             │
│  [ View Full Activity ]  [ Close ]          │
└─────────────────────────────────────────────┘
```

---

## 🐛 Bug Reports Section

### **User Bug Report Submission** (New Feature for Users)

Add a "Report a Bug" button in the main app (maybe in profile menu or help section).

**User Form:**
```
┌─────────────────────────────────────────────┐
│        🐛 Report a Bug                      │
├─────────────────────────────────────────────┤
│  What happened?                             │
│  [________________________________]          │
│  [________________________________]          │
│  [________________________________]          │
│                                             │
│  Where did this happen?                     │
│  [ Dashboard ▼ ]                            │
│                                             │
│  📷 Attach Screenshot (optional)            │
│  [ Choose File ]                            │
│                                             │
│  [ Submit Report ]  [ Cancel ]              │
└─────────────────────────────────────────────┘
```

### **Admin Bug Reports Table**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Status: [All ▼]  Type: [All ▼]                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ ID  | User          | Type  | Description              | Date      | Status  │
├─────────────────────────────────────────────────────────────────────────────┤
│ #42 | Marc          | Bug   | "Can't edit transaction" | 2 hrs ago | 🔴 New  │
│ #41 | Juan          | Bug   | "AI not responding"      | 1 day ago | 🟡 Review│
│ #40 | Maria         | Issue | "Page loads slowly"      | 2 days ago| 🟢 Fixed │
│ #39 | Pedro         | Bug   | "Goal not updating"      | 3 days ago| 🔴 New  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Columns:**
- **ID**: Report number
- **User**: Who reported it
- **Type**: Bug | Issue | Suggestion
- **Description**: Short summary (click to see full)
- **Date**: When reported
- **Status**: 
  - 🔴 New (just reported)
  - 🟡 Under Review (you're looking at it)
  - 🟢 Fixed (resolved)
  - ⚪ Closed (not a bug / won't fix)

**Filters:**
- **Status**: All | New | Under Review | Fixed | Closed
- **Type**: All | Bug | Issue | Suggestion

**Click on Report → View Full Report Modal:**

```
┌─────────────────────────────────────────────┐
│        Bug Report #42                       │
├─────────────────────────────────────────────┤
│  Reported by: Marc Costillas                │
│  Email: costillas@gmail.com                 │
│  Date: Oct 13, 2025 - 2:15 PM               │
│                                             │
│  Type: 🐛 Bug                               │
│  Location: Transactions Page                │
│                                             │
│  Description:                               │
│  "I tried to edit my transaction from      │
│   yesterday but the edit button doesn't    │
│   work. It just shows a loading spinner    │
│   and nothing happens."                    │
│                                             │
│  Screenshot: [View Image]                   │
│                                             │
│  Browser: Chrome 118                        │
│  Device: Desktop                            │
│                                             │
│  Current Status: 🔴 New                     │
│  Change Status: [Under Review ▼] [Update]  │
│                                             │
│  Admin Notes:                               │
│  [______________________________]           │
│  [______________________________]           │
│                                             │
│  [ Save Notes ]  [ Close ]                  │
└─────────────────────────────────────────────┘
```

---

## � Additional Useful Admin Features

### **1. User Notifications / Announcements**

**Send Platform-Wide Announcement:**
```
┌─────────────────────────────────────────────┐
│        📢 Send Announcement                 │
├─────────────────────────────────────────────┤
│  Title:                                     │
│  [________________________________]          │
│                                             │
│  Message:                                   │
│  [________________________________]          │
│  [________________________________]          │
│  [________________________________]          │
│                                             │
│  Send to:                                   │
│  ( ) All Users                              │
│  ( ) Active Users Only                      │
│  ( ) Inactive Users Only                    │
│                                             │
│  [ Send Now ]  [ Schedule ]  [ Cancel ]     │
└─────────────────────────────────────────────┘
```

**Use Cases:**
- Announce new features
- Notify about scheduled maintenance
- Share important updates
- Remind inactive users to come back

**How it works:**
- Creates notification in database
- Shows in user's notification bell icon
- Optional: Send email to users

---

### **2. Recent User Activity Feed**

**Live Activity Stream (Last 24 Hours):**
```
┌─────────────────────────────────────────────────────────────────┐
│                  📊 Recent Activity                             │
├─────────────────────────────────────────────────────────────────┤
│  🆕  Marc Costillas registered                 | 2 minutes ago  │
│  💰  Juan added transaction: ₱500              | 5 minutes ago  │
│  🎯  Maria completed goal "Emergency Fund"     | 15 minutes ago │
│  🏆  Pedro joined "30-Day Savings Challenge"   | 1 hour ago     │
│  💬  Anna started AI chat session              | 2 hours ago    │
│  📚  Carlos completed learning module          | 3 hours ago    │
│  🐛  Lisa reported a bug                       | 4 hours ago    │
│  ✅  Mark completed "Budgeting Basics"         | 5 hours ago    │
└─────────────────────────────────────────────────────────────────┘
```

**Why it's useful:**
- See what users are doing RIGHT NOW
- Spot patterns (e.g., everyone struggling with same feature → bug?)
- Feel the pulse of your platform
- Celebrate user wins (goals completed!)

---

### **3. Quick Actions Panel**

**One-Click Admin Tasks:**
```
┌─────────────────────────────────────────────┐
│            ⚡ Quick Actions                  │
├─────────────────────────────────────────────┤
│  📧  Send Email to All Users                │
│  🔄  Refresh User Stats                     │
│  📥  Download All Data (Backup)             │
│  🗑️  Clear Old Notifications (>30 days)     │
│  📊  Generate Monthly Report                │
│  🔍  View Error Logs (Last 24h)             │
└─────────────────────────────────────────────┘
```

---

### **4. Platform Health Indicators**

**Simple Health Check:**
```
┌─────────────────────────────────────────────┐
│          🏥 Platform Health                 │
├─────────────────────────────────────────────┤
│  Database:        🟢 Healthy                │
│  API Response:    🟢 Fast (120ms avg)       │
│  AI Service:      🟢 Online                 │
│  Email Service:   🟢 Working                │
│  Last Error:      2 hours ago               │
└─────────────────────────────────────────────┘
```

**Why it matters:**
- Quickly see if something is broken
- Check if users are experiencing issues
- Peace of mind that everything is running

---

### **5. User Search with Filters**

**Advanced User Search:**
```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Advanced User Search                                    │
├─────────────────────────────────────────────────────────────┤
│  Search by email or name: [_____________]                   │
│                                                             │
│  Filters:                                                   │
│  Age Range:     [18] to [65]                               │
│  Joined Date:   [From: _____] [To: _____]                  │
│  Has Goals:     [✓] Yes  [ ] No  [ ] Any                   │
│  In Challenge:  [✓] Yes  [ ] No  [ ] Any                   │
│  AI Usage:      [ ] Never  [✓] Active  [ ] Any             │
│                                                             │
│  [ Search ]  [ Clear Filters ]                              │
└─────────────────────────────────────────────────────────────┘
```

**Use Cases:**
- "Show me users age 18-25 who never used AI" → Target for tutorial
- "Show me active users with goals" → Feature testimonials
- "Show me users who joined but never came back" → Re-engagement

---

### **6. Email Specific Users**

**Send Email to Individual User:**
```
┌─────────────────────────────────────────────┐
│      ✉️ Send Email to Marc Costillas        │
├─────────────────────────────────────────────┤
│  To: costillas@gmail.com                    │
│                                             │
│  Subject:                                   │
│  [________________________________]          │
│                                             │
│  Message:                                   │
│  [________________________________]          │
│  [________________________________]          │
│  [________________________________]          │
│                                             │
│  [ Send ]  [ Cancel ]                       │
└─────────────────────────────────────────────┘
```

**Use Cases:**
- Respond to bug reports directly
- Thank power users personally
- Offer help to confused users
- Ask for feedback from specific users

---

### **7. Most Active Users (Leaderboard)**

**Top Users This Month:**
```
┌─────────────────────────────────────────────────────────────┐
│          🏆 Most Active Users (October 2025)                │
├─────────────────────────────────────────────────────────────┤
│  Rank | User              | Transactions | Goals | Challenges│
├─────────────────────────────────────────────────────────────┤
│  🥇   | Marc Costillas    |     124      |   5   |     3     │
│  🥈   | Juan Dela Cruz    |     98       |   4   |     2     │
│  🥉   | Maria Santos      |     87       |   6   |     4     │
│   4   | Pedro Reyes       |     76       |   3   |     2     │
│   5   | Anna Garcia       |     65       |   2   |     1     │
└─────────────────────────────────────────────────────────────┘
```

**Why it's useful:**
- Identify your power users
- Potential candidates for testimonials
- Understand what engaged users look like
- Reach out to thank them!

---

### **8. Inactive Users Alert**

**Users at Risk of Churning:**
```
┌─────────────────────────────────────────────────────────────┐
│        ⚠️ Users Inactive for 30+ Days                       │
├─────────────────────────────────────────────────────────────┤
│  Name              | Last Login  | Days Inactive | Action   │
├─────────────────────────────────────────────────────────────┤
│  John Smith        | Sep 10      |     33       | [Email]  │
│  Lisa Brown        | Sep 5       |     38       | [Email]  │
│  Mike Wilson       | Aug 28      |     46       | [Email]  │
└─────────────────────────────────────────────────────────────┘
│                                                             │
│  [ Send "We Miss You" Email to All ]                        │
└─────────────────────────────────────────────────────────────┘
```

**Use Cases:**
- Re-engage inactive users
- Send "We miss you" campaigns
- Offer incentives to return
- Understand why users leave

---

### **9. Feature Usage Statistics**

**Which Features Are Users Actually Using?**
```
┌─────────────────────────────────────────────────────────────┐
│              📊 Feature Usage (Last 30 Days)                │
├─────────────────────────────────────────────────────────────┤
│  Feature             | Users | Usage Count | Avg Time       │
├─────────────────────────────────────────────────────────────┤
│  Transactions        |  856  |   12,450    | 2.3 min       │
│  AI Assistant        |  654  |    8,234    | 5.7 min       │
│  Goals               |  543  |    3,210    | 3.1 min       │
│  Challenges          |  432  |    2,105    | 4.2 min       │
│  Learning Modules    |  321  |    1,543    | 8.5 min       │
│  Monthly Bills       |  287  |    1,234    | 2.1 min       │
│  Receipt Scanner     |  156  |      456    | 1.2 min       │
└─────────────────────────────────────────────────────────────┘
```

**Why it's useful:**
- Know which features are popular
- Identify underused features (maybe they need improvement?)
- Focus development on what users actually use
- Justify building new features

---

### **10. Export & Backup Tools**

**Data Export Options:**
```
┌─────────────────────────────────────────────┐
│          💾 Export Data                     │
├─────────────────────────────────────────────┤
│  Export Format: [CSV ▼] [JSON] [Excel]     │
│                                             │
│  What to export:                            │
│  [✓] All Users                              │
│  [✓] Bug Reports                            │
│  [ ] Transactions (privacy concern)         │
│  [ ] Chat Logs (privacy concern)            │
│  [✓] Platform Statistics                    │
│                                             │
│  Date Range: [Last 30 days ▼]              │
│                                             │
│  [ Generate Export ]                        │
└─────────────────────────────────────────────┘
```

**Use Cases:**
- Regular data backups
- Analyze data in Excel/Google Sheets
- Compliance (GDPR data export requests)
- Share stats with stakeholders

---

### **11. Bulk User Management**

**Manage Multiple Users at Once:**
```
┌─────────────────────────────────────────────────────────────┐
│  Selected Users: 5                                          │
├─────────────────────────────────────────────────────────────┤
│  Bulk Actions:                                              │
│  [ Send Email to Selected ]                                 │
│  [ Export Selected to CSV ]                                 │
│  [ Mark as VIP Users ]                                      │
│  [ Send In-App Notification ]                               │
└─────────────────────────────────────────────────────────────┘
```

---

### **12. New User Signups Tracker**

**Today's New Users:**
```
┌─────────────────────────────────────────────────────────────┐
│          🎉 New Signups Today (Oct 13, 2025)                │
├─────────────────────────────────────────────────────────────┤
│  Time     | Name            | Email                 | Age   │
├─────────────────────────────────────────────────────────────┤
│  10:30 AM | Carlos Reyes    | carlos@gmail.com      | 24    │
│  02:15 PM | Ana Lopez       | ana@yahoo.com         | 19    │
│  03:45 PM | Miguel Santos   | miguel@email.com      | 28    │
├─────────────────────────────────────────────────────────────┤
│  Total Today: 3 users                                       │
│  Total This Week: 23 users                                  │
│  Total This Month: 87 users                                 │
└─────────────────────────────────────────────────────────────┘
```

**Why track this:**
- See real-time growth
- Welcome new users personally
- Track marketing campaign success
- Understand signup patterns (which days/times are busiest)

---

### **13. Error Log Viewer**

**Recent Errors (Last 24 Hours):**
```
┌─────────────────────────────────────────────────────────────┐
│            🚨 Recent Errors                                 │
├─────────────────────────────────────────────────────────────┤
│  Time     | Error                    | User    | Page       │
├─────────────────────────────────────────────────────────────┤
│  10:23 AM | Transaction save failed  | Marc    | Dashboard  │
│  02:45 PM | AI timeout               | Juan    | AI Chat    │
│  04:12 PM | Image upload error       | Maria   | Profile    │
└─────────────────────────────────────────────────────────────┘
│  [ View Full Error Details ]                                │
└─────────────────────────────────────────────────────────────┘
```

**Use Cases:**
- Quickly spot when something breaks
- See which errors affect users most
- Prioritize bug fixes
- Track error frequency

---

### **14. Delete/Suspend User Account**

**User Management Actions:**
```
┌─────────────────────────────────────────────┐
│      ⚠️ Manage User: Marc Costillas         │
├─────────────────────────────────────────────┤
│  Current Status: 🟢 Active                  │
│                                             │
│  Actions:                                   │
│  [ Suspend Account ]  (temporary)           │
│  [ Delete Account ]   (permanent)           │
│                                             │
│  Reason (required):                         │
│  [________________________________]          │
│                                             │
│  ⚠️ Warning: Deletion is permanent          │
│              and cannot be undone!          │
│                                             │
│  [ Confirm ]  [ Cancel ]                    │
└─────────────────────────────────────────────┘
```

**Use Cases:**
- Suspend spam accounts
- Delete accounts on user request (GDPR compliance)
- Handle ToS violations
- Remove test accounts

---

### **15. System Activity Log (Audit Trail)**

**Track All Admin Actions:**
```
┌─────────────────────────────────────────────────────────────┐
│              📜 Admin Activity Log                          │
├─────────────────────────────────────────────────────────────┤
│  Date/Time          | Admin  | Action              | Target │
├─────────────────────────────────────────────────────────────┤
│  Oct 13, 2:30 PM    | You    | Sent announcement   | All    │
│  Oct 13, 10:15 AM   | You    | Updated bug status  | #42    │
│  Oct 12, 4:20 PM    | You    | Exported user data  | CSV    │
│  Oct 12, 11:05 AM   | You    | Suspended user      | John   │
└─────────────────────────────────────────────────────────────┘
```

**Why it's important:**
- Track what you've done (memory aid!)
- Accountability if multiple admins later
- Security (detect unauthorized access)
- Compliance requirements

---

## 📋 Simple Analytics (Optional Section)

### **User Growth Chart**

```
┌─────────────────────────────────────────────┐
│     User Registrations (Last 30 Days)       │
├─────────────────────────────────────────────┤
│                                             │
│   50│         ╭─╮                           │
│   40│      ╭──╯ ╰╮     ╭─╮                  │
│   30│   ╭──╯     ╰─────╯ ╰╮                 │
│   20│ ╭─╯                 ╰─╮               │
│   10│─╯                     ╰───            │
│     └─────────────────────────────          │
│     1   7   14  21  28  Days                │
└─────────────────────────────────────────────┘
```

### **Activity Overview (Last 7 Days)**

```
┌─────────────────────────────────────────────┐
│              Daily Active Users             │
├─────────────────────────────────────────────┤
│  Monday      ████████████████  320 users    │
│  Tuesday     ████████████████  310 users    │
│  Wednesday   ██████████████    280 users    │
│  Thursday    ████████████████  305 users    │
│  Friday      ███████████████   295 users    │
│  Saturday    ██████████        200 users    │
│  Sunday      █████████         180 users    │
└─────────────────────────────────────────────┘
```

---

## 📊 Site Visits Tracking

### **How to Track Visits:**

**Option 1: Simple Database Tracking**
- Track every page view in a `page_views` table
- Count unique sessions per month

**Option 2: Google Analytics Integration** (Recommended)
- Already have GA4 set up
- Show GA metrics in admin dashboard
- Displays: Page views, unique visitors, sessions

**Metrics to Show:**
- **Total Visits This Month**: Overall page views
- **Unique Visitors**: Distinct users/devices
- **Most Visited Pages**: Dashboard, AI Chat, Challenges, etc.
- **Average Session Duration**: How long users spend

---

## 🔐 Admin Authentication

**Simple Admin Check:**

```typescript
// In middleware or admin route
const ADMIN_EMAIL = process.env.ADMIN_EMAIL // Your email

export async function isAdmin(userId: string) {
  const { data: user } = await supabase
    .from('user_profiles')
    .select('email')
    .eq('user_id', userId)
    .single();
    
  return user?.email === ADMIN_EMAIL;
}
```

**Or slightly more flexible:**

```typescript
// Environment variable
ADMIN_EMAILS=costillasmarcmaurice@gmail.com,other@admin.com

// Check function
const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
return adminEmails.includes(user?.email);
```

**Admin Route Protection:**
```typescript
// app/admin/page.tsx
export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !await isAdmin(user.id)) {
    redirect('/dashboard'); // Redirect non-admins
  }
  
  // Show admin dashboard
  return <AdminDashboard />;
}
```

---

## 🎨 Simple UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Plounix Admin              [Logout]                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │👥 1,247 │ │🟢  856  │ │⚠️  391  │ │👀 12,450│          │
│  │ Users   │ │ Active  │ │Inactive │ │ Visits  │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👥 All Users (1,247)                                │   │
│  │ ────────────────────────────────────────────────   │   │
│  │  [Search] [Filter] [Export]                        │   │
│  │  📋 User table here...                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🐛 Bug Reports (4 New)                             │   │
│  │ ────────────────────────────────────────────────   │   │
│  │  [Filter] [Status]                                 │   │
│  │  📋 Reports table here...                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema (New Tables)

### **Bug Reports Table**

```sql
-- Create bug_reports table
CREATE TABLE bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'issue', 'suggestion')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT, -- Which page: 'dashboard', 'transactions', 'ai-chat', etc.
  screenshot_url TEXT, -- Supabase Storage URL
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'fixed', 'closed')),
  admin_notes TEXT,
  browser_info JSONB, -- User agent, browser, device info
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS: Users can only see their own reports
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON bug_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports"
  ON bug_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can see all (check in API route)
```

### **Page Views Table** (Optional - if not using Google Analytics)

```sql
-- Track page views
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous
  session_id TEXT NOT NULL, -- Browser session ID
  page_path TEXT NOT NULL, -- '/dashboard', '/ai-assistant', etc.
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX idx_page_views_user_id ON page_views(user_id);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);

-- No RLS needed (admin only reads this)
```

### **Useful Queries**

```sql
-- Total users
SELECT COUNT(*) FROM user_profiles;

-- Active users (logged in last 30 days)
SELECT COUNT(DISTINCT user_id) 
FROM auth.sessions 
WHERE created_at > NOW() - INTERVAL '30 days';

-- Inactive users
SELECT COUNT(*) 
FROM user_profiles 
WHERE updated_at < NOW() - INTERVAL '30 days';

-- Site visits this month (if using page_views table)
SELECT COUNT(*) 
FROM page_views 
WHERE viewed_at > DATE_TRUNC('month', NOW());

-- Unique visitors this month
SELECT COUNT(DISTINCT session_id) 
FROM page_views 
WHERE viewed_at > DATE_TRUNC('month', NOW());

-- New bug reports
SELECT COUNT(*) 
FROM bug_reports 
WHERE status = 'new';

-- Most visited pages
SELECT page_path, COUNT(*) as visits
FROM page_views
WHERE viewed_at > NOW() - INTERVAL '30 days'
GROUP BY page_path
ORDER BY visits DESC
LIMIT 10;
```

---

## 🚀 Implementation Steps

### **Phase 1: Setup (30 min)**
1. ✅ Create `bug_reports` table in Supabase
2. ✅ Create `page_views` table (or set up Google Analytics)
3. ✅ Set `ADMIN_EMAIL` in environment variables

### **Phase 2: Bug Report Feature (1-2 hours)**
4. ✅ Add "Report Bug" button in app (profile menu or help section)
5. ✅ Create bug report form modal for users
6. ✅ Create API route: `POST /api/bug-reports`
7. ✅ Add screenshot upload to Supabase Storage

### **Phase 3: Admin Dashboard (2-3 hours)**
8. ✅ Create `/app/admin/page.tsx`
9. ✅ Add admin authentication check
10. ✅ Build stats cards (total users, active, inactive, visits)
11. ✅ Build users table with search/filter
12. ✅ Build bug reports table
13. ✅ Add API routes: 
    - `GET /api/admin/users` - Fetch all users
    - `GET /api/admin/stats` - Fetch dashboard stats
    - `GET /api/admin/bug-reports` - Fetch all reports
    - `PATCH /api/admin/bug-reports/[id]` - Update report status

### **Phase 4: Analytics (Optional - 1 hour)**
14. ✅ Add user growth chart
15. ✅ Add daily active users chart
16. ✅ Add most visited pages list

---

## 🎯 Features Summary

### **What Admin Can See:**
✅ Total registered users
✅ Active users (logged in last 30 days)
✅ Inactive users (>30 days no login)
✅ Site visits this month
✅ List of all users with search/filter
✅ User details (transactions, goals, challenges, AI usage)
✅ All bug reports from users
✅ Bug report details with screenshots
✅ Simple growth charts

### **What Admin Can Do:**
✅ Search and filter users
✅ Export user list to CSV
✅ View detailed user activity
✅ Read bug reports
✅ Change bug report status (new → under review → fixed)
✅ Add admin notes to reports
✅ Track platform usage over time

### **What You DON'T Need:**
❌ Complex permissions system
❌ Multiple admin roles
❌ Advanced analytics
❌ Content management
❌ Email campaigns
❌ AI configuration
❌ System health monitoring (use Vercel/Supabase dashboards for that)

---

## 📱 Mobile-Friendly

The admin dashboard should be responsive so you can check it on your phone:
- Stack cards vertically on mobile
- Make tables scrollable horizontally
- Easy touch targets for filters

---

## 🎨 Color Scheme

```css
/* Admin theme - Dark & Professional */
Background: #0f172a (dark blue)
Cards: #1e293b (slightly lighter)
Text: #e2e8f0 (light gray)
Active: #10b981 (green)
Inactive: #f59e0b (orange/yellow)
New Reports: #ef4444 (red)
Fixed: #10b981 (green)
```

---

## 💡 Quick Access

Add admin link in your profile dropdown (only visible if you're admin):

```tsx
{isAdmin && (
  <DropdownMenuItem onClick={() => router.push('/admin')}>
    <Shield className="mr-2 h-4 w-4" />
    Admin Dashboard
  </DropdownMenuItem>
)}
```

---

## 🔒 Security Reminders

- ✅ Never commit `ADMIN_EMAIL` to git (use `.env.local`)
- ✅ Check admin status on server-side (not just UI)
- ✅ Validate all API requests with admin check
- ✅ Use Supabase RLS for all database queries
- ✅ Sanitize bug report content to prevent XSS

---

## 📊 Sample Data for Testing

```sql
-- Insert test bug reports
INSERT INTO bug_reports (user_id, type, title, description, location, status)
VALUES
  ((SELECT id FROM auth.users LIMIT 1), 'bug', 'Edit button not working', 'Cannot edit transactions', 'transactions', 'new'),
  ((SELECT id FROM auth.users LIMIT 1), 'issue', 'Slow loading', 'Dashboard takes too long to load', 'dashboard', 'under_review'),
  ((SELECT id FROM auth.users LIMIT 1), 'suggestion', 'Add dark mode', 'Would love a dark theme option', 'settings', 'closed');
```

---

## ✅ Final Checklist

Before launching admin dashboard:
- [ ] `bug_reports` table created
- [ ] `page_views` table created (or GA set up)
- [ ] `ADMIN_EMAIL` set in environment
- [ ] Bug report form works for users
- [ ] Admin can see all users
- [ ] Admin can see bug reports
- [ ] Admin route protected (only you can access)
- [ ] Export CSV works
- [ ] Mobile responsive
- [ ] Tested on production

---

**That's it! A simple, focused admin dashboard that gives you exactly what you need without overwhelming complexity.** 🚀

Want me to start building this now?
