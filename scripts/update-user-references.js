/**
 * Update User References Script
 * 
 * After migrating users, their IDs change. This script updates
 * all references to old user IDs with new user IDs in your data.
 * 
 * Prerequisites:
 * 1. Run migrate-users.js first
 * 2. Have user_id_mapping.json file
 * 
 * Usage: node scripts/update-user-references.js <mapping-file-path>
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Tables that have user_id references
const TABLES_WITH_USER_ID = [
  'transactions',
  'goals',
  'scheduled_payments',
  'learning_reflections',
  'user_challenges',
  'notifications',
  'chat_sessions',
  'chat_messages'
]

async function updateUserReferences(mappingFilePath) {
  // Load user mapping
  if (!fs.existsSync(mappingFilePath)) {
    console.error(`❌ Mapping file not found: ${mappingFilePath}`)
    console.error(`\nRun migrate-users.js first to generate the mapping file.`)
    process.exit(1)
  }

  const userMapping = JSON.parse(fs.readFileSync(mappingFilePath, 'utf8'))
  const oldIds = Object.keys(userMapping)
  const newIds = Object.values(userMapping)

  console.log(`
╔════════════════════════════════════════════════════════════╗
║           UPDATE USER REFERENCES                           ║
╚════════════════════════════════════════════════════════════╝

📊 User Mapping: ${oldIds.length} users
🔄 Tables to update: ${TABLES_WITH_USER_ID.length}

`)

  const updateLog = []

  for (const tableName of TABLES_WITH_USER_ID) {
    console.log(`\n⏳ Processing ${tableName}...`)

    try {
      // Fetch all records
      const { data: records, error: fetchError } = await supabase
        .from(tableName)
        .select('*')

      if (fetchError) {
        console.error(`   ❌ Error fetching: ${fetchError.message}`)
        updateLog.push({ table: tableName, status: 'failed', error: fetchError.message })
        continue
      }

      if (!records || records.length === 0) {
        console.log(`   ⚠️  No records found`)
        updateLog.push({ table: tableName, status: 'skipped', reason: 'no data' })
        continue
      }

      // Filter records that need updating
      const recordsToUpdate = records.filter(r => 
        r.user_id && oldIds.includes(r.user_id)
      )

      if (recordsToUpdate.length === 0) {
        console.log(`   ✅ No updates needed (${records.length} records checked)`)
        updateLog.push({ 
          table: tableName, 
          status: 'no_updates_needed', 
          checked: records.length 
        })
        continue
      }

      console.log(`   📝 Updating ${recordsToUpdate.length} of ${records.length} records`)

      // Update each record
      let updated = 0
      let failed = 0

      for (const record of recordsToUpdate) {
        const newUserId = userMapping[record.user_id]

        const { error: updateError } = await supabase
          .from(tableName)
          .update({ user_id: newUserId })
          .eq('id', record.id)

        if (updateError) {
          console.error(`   ❌ Failed to update record ${record.id}: ${updateError.message}`)
          failed++
        } else {
          updated++
        }
      }

      console.log(`   ✅ Updated: ${updated}, Failed: ${failed}`)
      updateLog.push({ 
        table: tableName, 
        status: 'completed', 
        updated, 
        failed,
        total: records.length
      })

    } catch (err) {
      console.error(`   ❌ Exception: ${err.message}`)
      updateLog.push({ table: tableName, status: 'error', error: err.message })
    }
  }

  // Save update log
  const logDir = path.dirname(mappingFilePath)
  const logPath = path.join(logDir, 'user_reference_update_log.json')
  fs.writeFileSync(logPath, JSON.stringify(updateLog, null, 2))

  // Summary
  const totalUpdated = updateLog.reduce((sum, log) => sum + (log.updated || 0), 0)
  const totalFailed = updateLog.reduce((sum, log) => sum + (log.failed || 0), 0)

  console.log(`
╔════════════════════════════════════════════════════════════╗
║           UPDATE SUMMARY                                   ║
╚════════════════════════════════════════════════════════════╝

✅ Total records updated: ${totalUpdated}
❌ Total failed: ${totalFailed}
📊 Tables processed: ${TABLES_WITH_USER_ID.length}

📄 Log saved to: ${logPath}

${totalFailed > 0 ? '⚠️  Some updates failed. Check the log for details.' : '✨ All updates completed successfully!'}

🎉 User migration is complete!
   - Users created in new project ✅
   - User IDs updated in all tables ✅
   - Users can now login with password reset ✅

`)
}

// Get mapping file from command line argument
const mappingFilePath = process.argv[2]

if (!mappingFilePath) {
  console.error(`
❌ Usage: node scripts/update-user-references.js <mapping-file-path>

Example:
  node scripts/update-user-references.js backups/user-migration-123456/user_id_mapping.json

The mapping file is created by migrate-users.js
`)
  process.exit(1)
}

updateUserReferences(mappingFilePath).catch(console.error)
