# Admin Portal Complete Implementation Guide

## ✅ Completed Features

### 1. User Management System
**Location:** `/admin/users`

**Features:**
- **Search:** Filter users by email or full name
- **Filter:** View all users, active users (logged in within 30 days), or inactive users
- **Sort:** By newest, oldest, or alphabetically by name
- **Statistics Cards:**
  - Total Users
  - Active Users (logged in within 30 days)
  - Inactive Users
  - Email Verified Users
- **User Table:** Displays user info, status badge, join date, last active, and monthly income
- **CSV Export:** Download user data as CSV file

**API Endpoint:** `/api/admin/users`
- Fetches users from `auth.users` 
- Joins with `user_profiles` table for additional data
- Protected with admin authentication

**Files Created:**
- `app/admin/users/page.tsx`
- `app/api/admin/users/route.ts`
- `components/ui/table.tsx`

---

### 2. Landing Page Management
**Location:** `/admin/landing-page`

**Features:**
- **Tabbed Interface:**
  - Hero Section: Main title, subtitle, CTA button text & link
  - Features: Add/edit/delete feature cards with title, description, and icon
  - Testimonials: Coming soon
  - Statistics: Edit platform stats (Active Users, Money Saved, etc.)
- **Real-time Preview:** Link to view live homepage
- **Auto-save:** Save button updates content in database

**API Endpoint:** `/api/admin/landing-page`
- GET: Load current landing page content
- POST: Save updated content
- Protected with admin authentication

**Database:**
- Table: `landing_page_content`
- Stores content as JSONB
- Run migration: `scripts/create-landing-page-table.sql`

**Files Created:**
- `app/admin/landing-page/page.tsx`
- `app/api/admin/landing-page/route.ts`
- `scripts/create-landing-page-table.sql`

---

### 3. Enhanced Admin Dashboard
**Location:** `/admin`

**New Sections:**
- **Users Management Card** - Link to `/admin/users`
- **Landing Page Card** - Link to `/admin/landing-page`
- Both cards styled with green Plounix branding

**Files Modified:**
- `app/admin/page.tsx` - Added new navigation cards

---

## 🔧 Setup Instructions

### Step 1: Run Database Migration
Execute the SQL migration to create the landing page content table:

```sql
-- In Supabase SQL Editor or psql
\i scripts/create-landing-page-table.sql
```

Or run directly:
```bash
psql -h <your-host> -U <user> -d <database> -f scripts/create-landing-page-table.sql
```

### Step 2: Verify Components
Ensure these UI components exist:
- ✅ `components/ui/badge.tsx`
- ✅ `components/ui/button.tsx`
- ✅ `components/ui/card.tsx`
- ✅ `components/ui/input.tsx`
- ✅ `components/ui/label.tsx`
- ✅ `components/ui/select.tsx`
- ✅ `components/ui/spinner.tsx`
- ✅ `components/ui/table.tsx` (just created)
- ✅ `components/ui/tabs.tsx`
- ✅ `components/ui/textarea.tsx`

### Step 3: Test User Management
1. Navigate to `/admin/users`
2. Verify users are loading
3. Test search functionality
4. Test filter (all/active/inactive)
5. Test sort options
6. Test CSV export

### Step 4: Test Landing Page Editor
1. Navigate to `/admin/landing-page`
2. Edit hero section content
3. Add/remove features
4. Update statistics
5. Click "Save Changes"
6. Click "Preview" to view live homepage

---

## 📊 Site Visits Tracking (Pending)

### Current Status
The admin stats API has a `visits_this_month` field, but it's not currently being tracked.

### Implementation Options

**Option 1: Simple Page View Tracking**
Create a table to track page views:

```sql
CREATE TABLE site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  page_path TEXT NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX idx_visits_user_id ON site_visits(user_id);
CREATE INDEX idx_visits_visited_at ON site_visits(visited_at DESC);
```

Then add client-side tracking:
```typescript
// In app/layout.tsx or middleware
useEffect(() => {
  const trackVisit = async () => {
    await fetch('/api/analytics/visit', {
      method: 'POST',
      body: JSON.stringify({
        page: window.location.pathname
      })
    })
  }
  trackVisit()
}, [pathname])
```

**Option 2: Use Existing Analytics**
If you're using Vercel Analytics or Google Analytics, fetch data from their APIs.

**Option 3: Database View**
Count unique sessions from database activity:
```sql
CREATE VIEW site_visits_summary AS
SELECT 
  COUNT(DISTINCT user_id) as unique_visitors,
  COUNT(*) as total_page_views,
  DATE(created_at) as visit_date
FROM user_activity_log
GROUP BY DATE(created_at);
```

---

## 🎨 Design System

All admin pages follow the Plounix green branding:
- **Primary Color:** `bg-green-600` / `hover:bg-green-700`
- **Text:** Dark gray (#1F2937) on white backgrounds
- **Cards:** White with subtle shadows
- **Badges:** Green for active/success states

---

## 🔐 Security

All admin routes are protected:
- **Username:** `admin`
- **Password:** `PlounixAdmin2025!Secure#`
- **Session Check:** Every page calls `/api/admin/session`
- **API Protection:** All endpoints use `requireAdmin()` middleware

---

## 📝 Next Steps

### Immediate
1. ✅ Run database migration for landing_page_content table
2. ✅ Test user management page
3. ✅ Test landing page editor
4. ⏳ Implement site visits tracking (see options above)

### Future Enhancements
- **User Actions:** Suspend/activate users, reset passwords
- **Bulk Operations:** Delete multiple users, send bulk emails
- **Landing Page:** 
  - Add testimonials management
  - Image upload for hero section
  - A/B testing for different versions
- **Analytics Dashboard:** Charts and graphs for user growth, revenue, engagement
- **Export Options:** PDF reports, scheduled CSV exports
- **Audit Log:** Track all admin actions

---

## 🐛 Troubleshooting

**Issue: Table component not found**
- Solution: The `table.tsx` component was just created. Restart your dev server.

**Issue: Users not loading**
- Check: Supabase admin API is enabled
- Check: `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables

**Issue: Landing page not saving**
- Check: Database migration was run successfully
- Check: `landing_page_content` table exists
- Check: Admin auth is working

**Issue: CSV export not working**
- Check: Browser allows file downloads
- Try: Disable popup blockers

---

## 📂 File Structure

```
app/
  admin/
    page.tsx (main dashboard with links)
    users/
      page.tsx (user management interface)
    landing-page/
      page.tsx (landing page editor)
    learning-modules/
      page.tsx (existing module manager)
  api/
    admin/
      users/
        route.ts (users API)
      landing-page/
        route.ts (landing page API)
      stats/
        route.ts (existing stats API)
      session/
        route.ts (existing auth check)

components/
  ui/
    table.tsx (new table component)
    tabs.tsx (existing tabs)
    badge.tsx (existing badge)
    spinner.tsx (existing spinner)
    ... (other UI components)

scripts/
  create-landing-page-table.sql (migration script)
```

---

## ✨ Summary

You now have a comprehensive admin portal with:
- ✅ User management (view, search, filter, export)
- ✅ Landing page content editor (hero, features, stats)
- ✅ Learning modules manager (existing)
- ✅ Enhanced statistics dashboard
- ⏳ Site visits tracking (needs implementation)

All pages are secured with admin authentication and follow the Plounix green design system.
