# Admin Dashboard Setup Guide

## 🎉 What's Been Implemented

✅ **Admin Authentication System**
- Reuses the existing login page at `/auth/login`
- Automatically detects admin credentials and redirects to `/admin`
- Secure session management with HTTP-only cookies (24-hour expiration)
- Audit logging for all admin actions

✅ **Admin Dashboard Page** (`/admin`)
- Overview stats cards (total users, active, inactive, site visits)
- Quick stats (bug reports, signups)
- Placeholders for features (users, bug reports, activity, announcements)
- Secure logout functionality

✅ **API Routes**
- `POST /api/admin/check` - Check if credentials are admin
- `GET /api/admin/session` - Get current admin session
- `GET /api/admin/stats` - Get dashboard statistics
- `POST /api/admin/logout` - Logout admin

✅ **Database Schema** (in `docs/admin-dashboard-schema.sql`)
- `admin_credentials` - Admin login info
- `bug_reports` - User bug submissions
- `page_views` - Site analytics
- `announcements` - Platform announcements
- `user_notifications` - Individual user notifications
- `admin_activity_log` - Audit trail
- `feature_usage_stats` - Feature usage tracking
- Helper functions and views for statistics

---

## 🚀 Setup Instructions

### Step 1: Run the SQL Schema in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the entire content from `docs/admin-dashboard-schema.sql`
5. Click **Run** to execute

This will create:
- 7 database tables
- 5 helper functions
- 2 views for analytics
- 1 default admin account

### Step 2: Set Environment Variable

Add this to your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find your service role key:**
1. Supabase Dashboard → Settings → API
2. Look for "service_role" key (keep this secret!)
3. Copy and paste into `.env.local`

### Step 3: Test Admin Login

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to login page:**
   ```
   http://localhost:3000/auth/login
   ```

3. **Login with admin credentials:**
   - **Username:** `admin` (enter this in the "Email Address" field)
   - **Password:** `admin123`

4. **You should be redirected to:**
   ```
   http://localhost:3000/admin
   ```

---

## 🔑 Default Admin Credentials

```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT: Change this password after first login!**

To change the admin password:
1. Update it in the `admin_credentials` table in Supabase
2. Hash your new password using bcrypt:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_new_password', 10).then(hash => console.log(hash));"
   ```
3. Copy the hash and update in Supabase:
   ```sql
   UPDATE admin_credentials 
   SET password_hash = 'your_new_hash_here'
   WHERE username = 'admin';
   ```

---

## 📋 How It Works

### Login Flow:

1. User enters credentials on `/auth/login`
2. System checks if username matches admin credentials
3. **If admin:** 
   - Verifies password with bcrypt
   - Sets admin session cookie
   - Logs admin activity
   - Redirects to `/admin`
4. **If not admin:** 
   - Proceeds with normal Supabase auth
   - Redirects to `/dashboard`

### Admin Session:

- Stored in HTTP-only cookie (secure, can't be accessed by JavaScript)
- Expires after 24 hours
- Includes: username, email, login time

### Security:

- All admin API routes protected with `requireAdmin()` middleware
- Service role key (bypasses RLS) only used on server-side
- Admin actions logged in `admin_activity_log` table
- Passwords hashed with bcrypt (10 rounds)

---

## 🎨 Current Admin Dashboard Features

### Stats Cards (Working Now):
- ✅ **Total Users** - All registered users
- ✅ **Active Users** - Logged in within 30 days
- ✅ **Inactive Users** - No login for >30 days
- ✅ **Site Visits** - Total page views this month
- ✅ **New Bug Reports** - Unread bug reports
- ✅ **Signups Today** - Users who registered today
- ✅ **Active Bug Reports** - Bug reports under review

### Placeholder Sections (Coming Next):
- 🔲 **Users Management** - View all users, search, filter, export
- 🔲 **Bug Reports** - View user-submitted bugs, update status
- 🔲 **Recent Activity** - Live feed of user actions
- 🔲 **Announcements** - Send platform-wide messages

---

## 🔧 What's Next?

### Priority 1: User Management Table
```typescript
Features:
- List all users with pagination
- Search by name/email
- Filter by status (active/inactive)
- View user details (transactions, goals, challenges, AI usage)
- Export to CSV
```

### Priority 2: Bug Reports System
```typescript
Features:
- Bug report form for users (modal with screenshot upload)
- Admin table to view all reports
- Update report status (new → under review → fixed)
- Add admin notes
- Filter by status/priority
```

### Priority 3: Activity Feed
```typescript
Features:
- Real-time stream of user actions (last 24 hours)
- Signups, transactions, goals completed, challenges joined, bugs reported
- Refresh every 30 seconds
```

---

## 📂 File Structure

```
app/
├── admin/
│   └── page.tsx                    # Admin dashboard (created ✅)
├── api/
│   └── admin/
│       ├── check/route.ts          # Check admin credentials (created ✅)
│       ├── session/route.ts        # Get session (created ✅)
│       ├── stats/route.ts          # Get stats (created ✅)
│       └── logout/route.ts         # Logout (created ✅)
├── auth/
│   └── login/page.tsx              # Updated to detect admin (modified ✅)
lib/
└── admin-auth.ts                   # Admin auth helpers (created ✅)
docs/
└── admin-dashboard-schema.sql      # Database schema (created ✅)
```

---

## 🐛 Troubleshooting

### Can't login as admin?

1. Check if SQL schema was run in Supabase
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`
3. Check username is exactly `admin` (lowercase)
4. Check password is exactly `admin123`

### Stats showing 0?

This is normal if:
- Tables are empty (no users yet)
- SQL views haven't been created (run the schema again)

### "Unauthorized" error?

- Clear cookies and try logging in again
- Check that service role key is correct
- Make sure you're using `admin` as username, not an email

---

## 🔐 Security Best Practices

1. **Change default password immediately**
2. **Never commit `.env.local` to git** (already in `.gitignore`)
3. **Use strong password** (16+ characters, mixed case, numbers, symbols)
4. **Keep service role key secret** (don't share, don't expose client-side)
5. **Review admin activity log regularly** (check `admin_activity_log` table)

---

## 📊 Database Queries (Useful for Testing)

```sql
-- View all admin accounts
SELECT username, email, is_active, last_login FROM admin_credentials;

-- Check dashboard stats
SELECT * FROM admin_dashboard_stats;

-- View recent admin activity
SELECT admin_username, action, created_at 
FROM admin_activity_log 
ORDER BY created_at DESC 
LIMIT 10;

-- Count total users
SELECT COUNT(*) FROM user_profiles;

-- Count active users (last 30 days)
SELECT get_active_users_count();

-- View recent user activity
SELECT * FROM recent_user_activity;
```

---

## ✅ Testing Checklist

- [ ] SQL schema runs without errors in Supabase
- [ ] Service role key added to `.env.local`
- [ ] Can login with admin credentials (`admin` / `admin123`)
- [ ] Redirected to `/admin` after login
- [ ] Dashboard shows stats (even if 0)
- [ ] Logout button works
- [ ] Can't access `/admin` without logging in
- [ ] Normal user login still works (redirects to `/dashboard`)

---

## 🎯 Next Steps

1. **Test the current implementation**
2. **Change admin password**
3. **Let me know when ready to build:**
   - Users management table
   - Bug reports system
   - Activity feed
   - Announcements feature

---

**You're all set!** 🎉

Login with `admin` / `admin123` to see your admin dashboard!
