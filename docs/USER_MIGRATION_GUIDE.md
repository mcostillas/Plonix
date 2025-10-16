# 👥 Complete User Migration Guide

## 🎯 Overview

This guide shows you **3 methods** to migrate users from your current Supabase project to your new one.

---

## 📋 Understanding User Data

### Two Separate Systems:

1. **Authentication (Auth Schema)**
   - Stores in `auth.users` table
   - Emails, password hashes, metadata
   - Managed by Supabase Auth
   - **Need special migration**

2. **Your Data (Public Schema)**
   - Your custom tables (transactions, goals, etc.)
   - References users by `user_id`
   - Already backed up in migration package
   - **Already covered** ✅

---

## 🚀 Method 1: Programmatic Migration (Recommended)

**Best for**: Technical users, large user bases, need user ID mapping

### Step 1: Configure Environment

Add to your `.env.local`:

```bash
# OLD PROJECT (current)
OLD_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NEW PROJECT (yours)
NEW_SUPABASE_URL=https://your-new-project.supabase.co
NEW_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Run Migration Script

```powershell
# Migrate users
node scripts/migrate-users.js
```

**What happens:**
1. ✅ Exports all users from old project
2. ✅ Creates users in new project (new IDs)
3. ✅ Saves user ID mapping (old ID → new ID)
4. ✅ Sends password reset emails to all users
5. ✅ Creates backup files

**Output:**
```
backups/user-migration-1234567890/
  ├── users_backup.json           (all user data)
  ├── user_id_mapping.json        (old ID → new ID)
  └── migration_log.json          (success/failure log)
```

### Step 3: Update User References

Your data tables (transactions, goals, etc.) still reference old user IDs. Update them:

```powershell
node scripts/update-user-references.js backups/user-migration-1234567890/user_id_mapping.json
```

**What happens:**
1. ✅ Reads user ID mapping
2. ✅ Updates `user_id` in all tables:
   - transactions
   - goals
   - scheduled_payments
   - learning_reflections
   - user_challenges
   - notifications
   - chat_sessions
   - chat_messages
3. ✅ Creates update log

### Step 4: Notify Users

Send email to your users:

```
Subject: Password Reset Required - Plounix Account Migration

Hi there!

We've migrated to a new database system to improve your experience.

Your account has been transferred, but you'll need to reset your 
password for security:

1. Go to: https://yourapp.com/auth/reset-password
2. Enter your email
3. Check your email for reset link
4. Create a new password

All your data (transactions, goals, progress) has been preserved!

Questions? Reply to this email.

- Plounix Team
```

---

## 📊 Method 2: CSV Export/Import (Simpler)

**Best for**: Small user bases, quick migration, okay with manual process

### Step 1: Export Users

1. Go to **old Supabase project** dashboard
2. Click **"Authentication"** → **"Users"**
3. Click **"⋮"** (three dots menu)
4. Click **"Export users to CSV"**
5. Save file: `users_export.csv`

### Step 2: Clean CSV Data

Open CSV in Excel/Google Sheets, keep only:
- `email`
- `email_confirmed_at`
- `created_at`

Remove:
- `id` (new IDs will be generated)
- `encrypted_password` (can't migrate passwords)
- Any sensitive data

### Step 3: Bulk Invite

1. Go to **new Supabase project** dashboard
2. Click **"Authentication"** → **"Users"**
3. Click **"Add user"** → **"Bulk invite users"**
4. Upload your cleaned CSV
5. Users receive invitation emails

### Step 4: Manual User ID Update

**Problem**: User IDs changed, but your data still references old IDs.

**Solution**: 
- Either: Users re-create their data (if acceptable)
- Or: Manually map old IDs to new IDs and update tables

---

## 🛠️ Method 3: Let Users Re-register (Easiest)

**Best for**: Small user base, fresh start, development/testing

### What to Do:

1. **Don't migrate users at all**
2. **Import only the database schema** (not user data)
3. **Let users create new accounts**

### Notify Users:

```
Subject: Plounix - Please Re-register Your Account

Hi!

We've upgraded to a new system. Please create a new account:

1. Go to: https://yourapp.com/signup
2. Use the same email as before
3. Create a new password

Note: Your old account data won't transfer. This is a fresh start!

- Plounix Team
```

**Pros**:
- ✅ Super simple
- ✅ No technical complexity
- ✅ Clean fresh start

**Cons**:
- ❌ Users lose their data
- ❌ Need to re-onboard users
- ❌ Potential user drop-off

---

## 🔐 Important Security Notes

### 1. Passwords Cannot Be Migrated

Supabase uses one-way encryption. You **cannot** transfer passwords.

**Solutions**:
- Send password reset emails (Method 1 does this)
- Use bulk invite (Method 2)
- Let users create new passwords

### 2. User IDs Will Change

New Supabase project = new UUIDs for users

**Impact**:
- Your tables reference `user_id`
- Need to update these references
- Use `update-user-references.js` script

### 3. Service Role Keys

**Never expose service role keys!**
- Use `.env.local` (not committed to git)
- Don't share keys in chat/email
- Rotate keys after migration

---

## 📋 Complete Migration Checklist

### Before Migration

- [ ] Backup current database (already done! ✅)
- [ ] Create new Supabase project
- [ ] Get new project credentials
- [ ] Test with 1-2 test users first

### During Migration

- [ ] Run user migration script
- [ ] Verify users created in new project
- [ ] Update user ID references in data
- [ ] Test login with a test account

### After Migration

- [ ] Update .env.local with new credentials
- [ ] Deploy updated app
- [ ] Send password reset emails to users
- [ ] Monitor for issues
- [ ] Support users who have trouble logging in

---

## 🆘 Troubleshooting

### "User already exists"
**Problem**: Email already registered in new project  
**Solution**: Delete user first or skip (they can reset password)

### "Invalid credentials" after migration
**Problem**: User trying old password  
**Solution**: They need to use password reset link

### User can't find reset email
**Solutions**:
1. Check spam folder
2. Resend: `supabase.auth.resetPasswordForEmail(email)`
3. Manually create password in dashboard

### Data shows wrong user
**Problem**: User IDs not updated in data tables  
**Solution**: Run `update-user-references.js` script

### Some users missing
**Problem**: Migration script failed for some users  
**Solution**: Check `migration_log.json`, retry failed users manually

---

## 💻 Quick Command Reference

```powershell
# 1. Migrate users
node scripts/migrate-users.js

# 2. Update user references
node scripts/update-user-references.js backups/user-migration-XXX/user_id_mapping.json

# 3. Send password reset (if needed)
node -e "const {createClient}=require('@supabase/supabase-js');require('dotenv').config({path:'.env.local'});const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);s.auth.resetPasswordForEmail('user@email.com').then(console.log)"
```

---

## 📊 Migration Comparison

| Method | Difficulty | Time | Pros | Cons |
|--------|-----------|------|------|------|
| **Programmatic** | ⭐⭐⭐ Hard | 15 min | Complete, automated, ID mapping | Technical, needs scripts |
| **CSV Export** | ⭐⭐ Medium | 10 min | Visual, straightforward | Manual ID mapping needed |
| **Re-register** | ⭐ Easy | 5 min | Super simple, clean slate | Users lose data |

---

## 🎯 Recommended Approach

**For Your Plounix Project:**

1. **Use Method 1 (Programmatic)** - You have users with data to preserve
2. **Test with 2-3 test accounts first**
3. **Run full migration during off-hours**
4. **Send notification to users immediately**
5. **Monitor support requests for 24-48 hours**

---

## 📞 Support Template

Save this for user support:

```
Q: I can't login with my old password

A: We migrated to a new system. Please reset your password:
1. Click "Forgot Password" on login page
2. Enter your email
3. Check email for reset link
4. Create new password

Your data (transactions, goals) is safe and transferred!
```

---

## ✅ Success Indicators

Migration successful when:

- ✅ All users show in new project's Auth → Users
- ✅ Test user can reset password and login
- ✅ User data displays correctly after login
- ✅ New transactions/goals work properly
- ✅ No "user not found" errors

---

**Need help?** Check the scripts:
- `scripts/migrate-users.js` - Main migration
- `scripts/update-user-references.js` - Update IDs
- `backups/migration-package-XXX/` - Your data backup

**Ready to migrate?** Start with Method 1 and test with a single user first!
