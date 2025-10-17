# 🚀 Quick Start Guide - Transfer Database to Your Own Supabase

## ✅ What You Have

A **complete migration package** in:
```
C:\Users\LENOVO\Plounix_prototype\backups\migration-package-2025-10-16\
```

Contains:
- ✅ **10 SQL schema files** (all table structures)
- ✅ **730 records of data** (6 tables)
- ✅ **Complete import scripts**
- ✅ **JSON backups** (portable format)

## 🎯 Transfer Steps (5 Minutes)

### Step 1: Create Your New Supabase Project (2 min)

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: Plounix (or whatever you want)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to Philippines (Singapore recommended)
4. Click **"Create new project"**
5. Wait ~2 minutes for setup

### Step 2: Get Your New Credentials (1 min)

1. In your new project dashboard, click **"Settings"** (⚙️ icon)
2. Click **"API"** in the left sidebar
3. Copy these values:

```bash
# You'll need these:
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc... (click "Reveal" to see it)
```

### Step 3: Import Your Database (2 min)

#### Option A: Using SQL Editor (Easiest)

1. In Supabase Dashboard, click **"SQL Editor"** in left sidebar

2. **First - Create Tables:**
   - Click **"New Query"**
   - Open file: `schemas/00_master_schema.sql`
   - Copy ALL contents and paste into SQL Editor
   - Click **"Run"** (▶️ button)
   - Wait for success message ✅

3. **Second - Import Data:**
   - Click **"New Query"** again
   - Open file: `import-all.sql` from the root of migration package
   - Copy and paste into SQL Editor
   - Click **"Run"**
   - Wait for completion ✅

**Done!** 🎉 Your database is now set up!

#### Option B: Using Node.js Script (Programmatic)

1. Update your `.env.local`:
   ```bash
   # Replace with YOUR new project credentials:
   NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
   ```

2. Run schema first (in SQL Editor as above)

3. Then run import script:
   ```bash
   cd backups\migration-package-2025-10-16\scripts
   node import-to-new-database.js
   ```

### Step 4: Verify Import

Check your new Supabase dashboard:

1. Click **"Table Editor"** in left sidebar
2. You should see tables:
   - ✅ transactions (66 records)
   - ✅ goals (26 records)
   - ✅ scheduled_payments (37 records)
   - ✅ learning_reflections (566 records)
   - ✅ challenges (8 records)
   - ✅ user_challenges (27 records)

### Step 5: Update Your App

Update `.env.local` in your Plounix project:

```bash
# Old Supabase (delete these)
# NEXT_PUBLIC_SUPABASE_URL=https://ftxvmaurxhatqhzowgkb.supabase.co/
# SUPABASE_SERVICE_ROLE_KEY=eyJhbG...old-key

# New Supabase (your own project)
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
```

Restart your dev server:
```bash
npm run dev
```

## ✨ You're Done!

Your app is now running on YOUR OWN Supabase project with all your data transferred!

## 📊 What Got Transferred

| Table | Records | What It Contains |
|-------|---------|------------------|
| transactions | 66 | All income/expense records |
| goals | 26 | All financial goals |
| scheduled_payments | 37 | Recurring payments |
| learning_reflections | 566 | User learning reflections |
| challenges | 8 | Challenge definitions |
| user_challenges | 27 | User challenge progress |

## 🔐 Important: Update Auth

If you're using Supabase Auth (login system), you'll need to:

1. **Migrate users** - Users won't automatically transfer
   - Users need to re-register, OR
   - Export users from old project and import to new one

2. **Update auth callbacks** in your app:
   - Check any auth redirect URLs
   - Update in Supabase Dashboard → Authentication → URL Configuration

## 🆘 Troubleshooting

### "Relation does not exist"
**Solution**: Run the schema file first (`schemas/00_master_schema.sql`)

### "Duplicate key value"
**Solution**: Data already imported. You can skip or clear tables first with:
```sql
TRUNCATE TABLE table_name CASCADE;
```

### "Permission denied"
**Solution**: Make sure you're using `service_role` key, not `anon` key

### Can't see my old users
**Solution**: User accounts are stored in Supabase Auth, separate from your tables. You need to export/import users separately or have users re-register.

## 📞 Need Help?

1. Check `README.md` in the migration package for detailed instructions
2. Check `manifest.json` for package details
3. All your data is backed up in both JSON and SQL formats in the `data/` folder

## 💾 Backup Tips

- **Keep this migration package safe** - It's your complete database backup
- **Upload to cloud storage** (Google Drive, Dropbox)
- **Create new backups regularly** using the backup scripts
- **Test imports on a test project first** before using in production

---

**Package Created**: October 16, 2025
**Total Records**: 730
**Total Schema Files**: 10
**Package Location**: `backups\migration-package-2025-10-16\`
