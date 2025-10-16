# 👥 User Migration Guide - Transfer Users to New Supabase Project

## 🎯 Overview

Supabase stores users in a separate **Auth schema** (not your public schema), so they need special handling.

## ⚠️ Important Understanding

**Two Types of User Data:**

1. **Auth Users** (`auth.users` table)
   - Email, password hashes, metadata
   - Managed by Supabase Auth
   - Need special export/import

2. **Your User Data** (your custom tables)
   - Profile info, preferences, settings
   - In your `public` schema
   - Already backed up in migration package

## 🚀 Method 1: CSV Export/Import (Easiest)

### Step 1: Export Users from Old Project

1. Go to your **old Supabase project** dashboard
2. Click **"Authentication"** in left sidebar
3. Click **"Users"** tab
4. Click **"⋮"** (three dots) at top right
5. Click **"Export users to CSV"**
6. Save the CSV file (e.g., `users_export.csv`)

**What you get:**
```csv
id,email,created_at,last_sign_in_at,confirmed_at,email_confirmed_at,...
```

### Step 2: Prepare CSV for Import

The exported CSV needs some adjustments. Create a cleaned version:

**Keep these columns:**
- `email`
- `email_confirmed_at` (or set to current time)
- `created_at`
- `raw_user_meta_data` (user metadata if any)
- `raw_app_meta_data` (app metadata if any)

**Remove or ignore:**
- `encrypted_password` (can't migrate passwords)
- `id` (new IDs will be generated)

### Step 3: Import to New Project

1. Go to your **new Supabase project** dashboard
2. Click **"Authentication"** → **"Users"**
3. Click **"Add user"** → **"Bulk invite users"**
4. Upload your cleaned CSV
5. Users will receive invitation emails

**Limitation**: Users need to **reset passwords** (Supabase security)

## 🔧 Method 2: Using Supabase CLI (Advanced)

### Setup

```powershell
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### Export from Old Project

```powershell
# Set old project reference
supabase link --project-ref ftxvmaurxhatqhzowgkb

# Export auth schema
supabase db dump --schema auth --file auth_backup.sql
```

### Import to New Project

```powershell
# Switch to new project
supabase link --project-ref YOUR-NEW-PROJECT-REF

# Import auth schema
supabase db push --file auth_backup.sql
```

**Note**: This is complex and may require adjustments for RLS policies.

## 💻 Method 3: Programmatic Migration (Most Control)

I'll create a script for you:

<function_calls>
<invoke name="create_file">
<parameter name="content">/**
 * User Migration Script
 * 
 * Migrates users from old Supabase project to new one
 * 
 * IMPORTANT: This script:
 * 1. Exports user data from old project
 * 2. Creates users in new project
 * 3. Sends password reset emails
 * 
 * Prerequisites:
 * - Service role keys for BOTH old and new projects
 * 
 * Usage: node scripts/migrate-users.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

// CONFIGURATION
const OLD_PROJECT_URL = 'https://ftxvmaurxhatqhzowgkb.supabase.co'
const OLD_SERVICE_KEY = process.env.OLD_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const NEW_PROJECT_URL = process.env.NEW_SUPABASE_URL || ''
const NEW_SERVICE_KEY = process.env.NEW_SUPABASE_SERVICE_KEY || ''

if (!OLD_SERVICE_KEY || !NEW_PROJECT_URL || !NEW_SERVICE_KEY) {
  console.error(`
❌ Missing configuration!

You need to provide:
1. OLD_SUPABASE_SERVICE_KEY (current project)
2. NEW_SUPABASE_URL (your new project)
3. NEW_SUPABASE_SERVICE_KEY (your new project)

Set them in .env.local or as environment variables:

OLD_SUPABASE_SERVICE_KEY=your-old-service-key
NEW_SUPABASE_URL=https://your-new-project.supabase.co
NEW_SUPABASE_SERVICE_KEY=your-new-service-key
`)
  process.exit(1)
}

const oldSupabase = createClient(OLD_PROJECT_URL, OLD_SERVICE_KEY)
const newSupabase = createClient(NEW_PROJECT_URL, NEW_SERVICE_KEY)

async function migrateUsers() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           USER MIGRATION TOOL                              ║
╚════════════════════════════════════════════════════════════╝

📤 Source: ${OLD_PROJECT_URL}
📥 Target: ${NEW_PROJECT_URL}

⚠️  IMPORTANT NOTES:
1. User passwords CANNOT be migrated (Supabase security)
2. Users will receive password reset emails
3. User IDs will change (new UUIDs generated)
4. Email addresses must be unique

`)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const answer = await new Promise(resolve => {
    rl.question('Continue with user migration? (yes/no): ', resolve)
  })
  rl.close()

  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Migration cancelled')
    process.exit(0)
  }

  console.log('\n🔍 Step 1: Fetching users from old project...\n')

  // Note: Supabase doesn't expose auth.users via REST API directly
  // We need to use the admin API
  const { data: users, error: fetchError } = await oldSupabase.auth.admin.listUsers()

  if (fetchError) {
    console.error('❌ Error fetching users:', fetchError.message)
    process.exit(1)
  }

  console.log(`✅ Found ${users.users.length} users\n`)

  // Save user data for reference
  const backupDir = path.join(__dirname, '..', 'backups', `user-migration-${Date.now()}`)
  fs.mkdirSync(backupDir, { recursive: true })
  
  const usersBackupPath = path.join(backupDir, 'users_backup.json')
  fs.writeFileSync(usersBackupPath, JSON.stringify(users.users, null, 2))
  console.log(`💾 User data backed up to: ${usersBackupPath}\n`)

  // Create user mapping file (old ID -> new ID)
  const userMapping = {}
  const migrationLog = []

  console.log('📝 Step 2: Creating users in new project...\n')

  for (const user of users.users) {
    try {
      console.log(`⏳ Migrating: ${user.email}`)

      // Create user in new project
      const { data: newUser, error: createError } = await newSupabase.auth.admin.createUser({
        email: user.email,
        email_confirm: true, // Auto-confirm email
        user_metadata: user.user_metadata || {},
        app_metadata: user.app_metadata || {}
      })

      if (createError) {
        console.error(`   ❌ Error: ${createError.message}`)
        migrationLog.push({
          email: user.email,
          oldId: user.id,
          status: 'failed',
          error: createError.message
        })
        continue
      }

      console.log(`   ✅ Created (new ID: ${newUser.user.id})`)

      // Store mapping
      userMapping[user.id] = newUser.user.id

      migrationLog.push({
        email: user.email,
        oldId: user.id,
        newId: newUser.user.id,
        status: 'success'
      })

      // Send password reset email
      const { error: resetError } = await newSupabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${NEW_PROJECT_URL}/auth/reset-password`
      })

      if (resetError) {
        console.log(`   ⚠️  Could not send reset email: ${resetError.message}`)
      } else {
        console.log(`   📧 Password reset email sent`)
      }

    } catch (err) {
      console.error(`   ❌ Exception: ${err.message}`)
      migrationLog.push({
        email: user.email,
        oldId: user.id,
        status: 'error',
        error: err.message
      })
    }
  }

  // Save mapping and log
  const mappingPath = path.join(backupDir, 'user_id_mapping.json')
  fs.writeFileSync(mappingPath, JSON.stringify(userMapping, null, 2))

  const logPath = path.join(backupDir, 'migration_log.json')
  fs.writeFileSync(logPath, JSON.stringify(migrationLog, null, 2))

  // Summary
  const successful = migrationLog.filter(u => u.status === 'success').length
  const failed = migrationLog.filter(u => u.status !== 'success').length

  console.log(`
╔════════════════════════════════════════════════════════════╗
║           MIGRATION SUMMARY                                ║
╚════════════════════════════════════════════════════════════╝

✅ Successful: ${successful}
❌ Failed: ${failed}
📊 Total: ${users.users.length}

📁 Files created:
   - ${usersBackupPath}
   - ${mappingPath}
   - ${logPath}

⚠️  IMPORTANT NEXT STEPS:

1. Users have been created in new project
2. Password reset emails sent to all users
3. Users must reset their passwords to login

4. UPDATE USER IDs in your data:
   - Transactions, goals, etc. reference user_id
   - Use user_id_mapping.json to update references
   - Run: node scripts/update-user-references.js

5. Test with a test account before notifying all users

`)
}

migrateUsers().catch(console.error)
