/**
 * Database Backup Script
 * 
 * This script creates a complete backup of your Supabase database
 * Usage: node scripts/backup-database.js
 * 
 * Creates backups in: backups/backup-YYYY-MM-DD-HH-mm-ss/
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Tables to backup
const TABLES = [
  'users',
  'transactions',
  'goals',
  'monthly_bills',
  'scheduled_payments',
  'ai_chat_sessions',
  'ai_chat_messages',
  'learning_progress',
  'learning_reflections',
  'challenges',
  'user_challenges',
  'notifications',
  'admin_users',
  'admin_activity_logs'
]

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const backupDir = path.join(__dirname, '..', 'backups', `backup-${timestamp}`)
  
  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  console.log(`\n📦 Starting database backup...`)
  console.log(`📁 Backup directory: ${backupDir}\n`)
  
  const backupSummary = {
    timestamp: new Date().toISOString(),
    tables: {},
    totalRecords: 0,
    errors: []
  }
  
  // Backup each table
  for (const table of TABLES) {
    try {
      console.log(`⏳ Backing up ${table}...`)
      
      // Fetch all data from table
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
      
      if (error) {
        console.error(`❌ Error backing up ${table}:`, error.message)
        backupSummary.errors.push({ table, error: error.message })
        continue
      }
      
      // Save to JSON file
      const filePath = path.join(backupDir, `${table}.json`)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      
      const recordCount = data?.length || 0
      backupSummary.tables[table] = recordCount
      backupSummary.totalRecords += recordCount
      
      console.log(`✅ ${table}: ${recordCount} records backed up`)
    } catch (err) {
      console.error(`❌ Exception backing up ${table}:`, err.message)
      backupSummary.errors.push({ table, error: err.message })
    }
  }
  
  // Save backup summary
  const summaryPath = path.join(backupDir, '_backup_summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify(backupSummary, null, 2))
  
  // Create restore script
  const restoreScript = generateRestoreScript(timestamp)
  const restorePath = path.join(backupDir, 'restore.js')
  fs.writeFileSync(restorePath, restoreScript)
  
  console.log(`\n✨ Backup completed successfully!`)
  console.log(`📊 Total records backed up: ${backupSummary.totalRecords}`)
  console.log(`📁 Backup location: ${backupDir}`)
  
  if (backupSummary.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered:`)
    backupSummary.errors.forEach(({ table, error }) => {
      console.log(`   - ${table}: ${error}`)
    })
  }
  
  console.log(`\n📝 To restore this backup, run:`)
  console.log(`   node "${restorePath}"`)
  console.log(`\n💡 Tip: You can also import the JSON files manually into any database`)
}

function generateRestoreScript(timestamp) {
  return `/**
 * Database Restore Script
 * Generated: ${new Date().toISOString()}
 * 
 * ⚠️  WARNING: This will INSERT data into your database
 * Make sure you're restoring to the correct database!
 * 
 * Usage: node restore.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const TABLES = ${JSON.stringify(TABLES, null, 2)}

async function restoreBackup() {
  console.log(\`\\n🔄 Starting database restore...\\n\`)
  
  for (const table of TABLES) {
    try {
      const filePath = path.join(__dirname, \`\${table}.json\`)
      
      if (!fs.existsSync(filePath)) {
        console.log(\`⚠️  Skipping \${table} (file not found)\`)
        continue
      }
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      
      if (data.length === 0) {
        console.log(\`⚠️  Skipping \${table} (no data)\`)
        continue
      }
      
      console.log(\`⏳ Restoring \${table} (\${data.length} records)...\`)
      
      // Insert data in batches of 1000
      const batchSize = 1000
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        const { error } = await supabase.from(table).upsert(batch)
        
        if (error) {
          console.error(\`❌ Error restoring \${table}:\`, error.message)
          break
        }
      }
      
      console.log(\`✅ \${table} restored successfully\`)
    } catch (err) {
      console.error(\`❌ Exception restoring \${table}:\`, err.message)
    }
  }
  
  console.log(\`\\n✨ Restore completed!\\n\`)
}

restoreBackup().catch(console.error)
`
}

// Run backup
createBackup().catch(console.error)
