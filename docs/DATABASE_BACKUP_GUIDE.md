# 📦 Database Backup Guide

This guide will help you create complete backups of your Plounix database, even if you're not the Supabase owner.

## 🎯 Quick Start

### Method 1: JSON Backup (Recommended for Easy Restore)

```bash
# Install dependencies first
npm install @supabase/supabase-js dotenv

# Run the backup
node scripts/backup-database.js
```

**What you get:**
- ✅ Complete JSON files for each table
- ✅ Automatic restore script included
- ✅ Backup summary with stats
- ✅ Easy to restore to any Supabase instance

**Output:**
```
backups/backup-2025-10-16-14-30-00/
  ├── users.json
  ├── transactions.json
  ├── goals.json
  ├── monthly_bills.json
  ├── scheduled_payments.json
  ├── ai_chat_sessions.json
  ├── ai_chat_messages.json
  ├── learning_progress.json
  ├── learning_reflections.json
  ├── challenges.json
  ├── user_challenges.json
  ├── notifications.json
  ├── admin_users.json
  ├── admin_activity_logs.json
  ├── _backup_summary.json
  └── restore.js
```

### Method 2: SQL Export (For Database Migration)

```bash
# Run the SQL export
node scripts/export-sql.js
```

**What you get:**
- ✅ Complete SQL dump file
- ✅ Can be imported to ANY PostgreSQL database
- ✅ Includes INSERT statements for all data
- ✅ Ready for Supabase SQL Editor

**Output:**
```
backups/sql-export-2025-10-16/
  └── database.sql (contains all INSERT statements)
```

## 📋 Tables Backed Up

The scripts backup these 14 tables:
- `users` - All user accounts
- `transactions` - Income/expense records
- `goals` - Financial goals
- `monthly_bills` - Recurring bills
- `scheduled_payments` - Scheduled transactions
- `ai_chat_sessions` - Chat session metadata
- `ai_chat_messages` - All AI conversations
- `learning_progress` - Module completion
- `learning_reflections` - User reflections
- `challenges` - Challenge definitions
- `user_challenges` - User challenge progress
- `notifications` - User notifications
- `admin_users` - Admin accounts
- `admin_activity_logs` - Admin activity

## 🔄 How to Restore

### From JSON Backup:

```bash
# Navigate to your backup folder
cd backups/backup-2025-10-16-14-30-00

# Run the restore script
node restore.js
```

**⚠️ Warning:** This will INSERT data into your database. Make sure you're restoring to the correct environment!

### From SQL Export:

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Open `backups/sql-export-2025-10-16/database.sql`
5. Copy and paste the entire contents
6. Click "Run"

## 🛡️ Best Practices

### Regular Backups
Create a backup before:
- Major updates or deployments
- Database schema changes
- Bulk data operations
- Testing new features

### Automation
Add to your package.json:
```json
{
  "scripts": {
    "backup": "node scripts/backup-database.js",
    "backup:sql": "node scripts/export-sql.js"
  }
}
```

Then run:
```bash
npm run backup
# or
npm run backup:sql
```

### Storage Recommendations
1. **Local Storage** - Keep recent backups on your computer
2. **Cloud Storage** - Upload to Google Drive / Dropbox / OneDrive
3. **Git (Small DBs only)** - Add to `.gitignore` if large, or commit if small

## 📊 Backup Schedule Suggestions

- **Daily**: During active development
- **Weekly**: For stable production
- **Before deploys**: Always!
- **Before schema changes**: Mandatory!

## 🔐 Security Notes

1. **Never commit backups with sensitive data to public repos**
2. **Encrypt backups if they contain PII (Personal Identifiable Information)**
3. **Store backup files securely**
4. **Don't share `.env.local` with credentials**

## 💾 Storage Tips

### For Small Databases (< 100MB)
- Store in project folder: `backups/`
- Commit to private git repo
- Sync to cloud storage

### For Large Databases (> 100MB)
- Add `backups/` to `.gitignore`
- Use external storage (Google Drive, Dropbox)
- Use compression: `tar -czf backup.tar.gz backups/backup-2025-10-16/`

## 🆘 Troubleshooting

### "Missing Supabase credentials"
Make sure `.env.local` exists with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### "Table not found" errors
The table might not exist yet. This is normal for new projects.

### "Permission denied" errors
You need the `SUPABASE_SERVICE_ROLE_KEY` (not just the anon key) to backup all data.

### Large file sizes
If SQL files are huge:
1. Use JSON backup instead (more efficient)
2. Compress the backup folder
3. Backup specific tables only

## 🎓 Advanced Usage

### Backup Specific Tables Only

Edit `scripts/backup-database.js` and modify the TABLES array:
```javascript
const TABLES = [
  'users',
  'transactions',
  'goals'
  // Remove tables you don't need
]
```

### Automated Backups (Windows Task Scheduler)

1. Create a batch file `backup.bat`:
```batch
@echo off
cd C:\Users\LENOVO\Plounix_prototype
node scripts\backup-database.js
```

2. Open Task Scheduler
3. Create new task: Run `backup.bat` daily at 2 AM

### Backup to Cloud Storage

Add this to your backup script:
```javascript
// After backup completes
const { exec } = require('child_process')
exec(`rclone copy "${backupDir}" remote:plounix-backups/`, (err) => {
  if (err) console.error('Cloud sync failed:', err)
  else console.log('✅ Backup synced to cloud')
})
```

## 📞 Need Help?

If you encounter issues:
1. Check that Node.js is installed: `node --version`
2. Verify dependencies: `npm install`
3. Check `.env.local` has correct credentials
4. Try running with verbose output: `node scripts/backup-database.js --verbose`

## 📝 Changelog

- **2025-10-16**: Initial backup scripts created
  - JSON backup with restore functionality
  - SQL export for database migration
  - Comprehensive error handling
