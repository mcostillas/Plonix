/**
 * Database Restore Script
 * Generated: 2025-10-16T03:12:32.176Z
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

const TABLES = [
  "users",
  "transactions",
  "goals",
  "monthly_bills",
  "scheduled_payments",
  "ai_chat_sessions",
  "ai_chat_messages",
  "learning_progress",
  "learning_reflections",
  "challenges",
  "user_challenges",
  "notifications",
  "admin_users",
  "admin_activity_logs"
]

async function restoreBackup() {
  console.log(`\n🔄 Starting database restore...\n`)
  
  for (const table of TABLES) {
    try {
      const filePath = path.join(__dirname, `${table}.json`)
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${table} (file not found)`)
        continue
      }
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      
      if (data.length === 0) {
        console.log(`⚠️  Skipping ${table} (no data)`)
        continue
      }
      
      console.log(`⏳ Restoring ${table} (${data.length} records)...`)
      
      // Insert data in batches of 1000
      const batchSize = 1000
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        const { error } = await supabase.from(table).upsert(batch)
        
        if (error) {
          console.error(`❌ Error restoring ${table}:`, error.message)
          break
        }
      }
      
      console.log(`✅ ${table} restored successfully`)
    } catch (err) {
      console.error(`❌ Exception restoring ${table}:`, err.message)
    }
  }
  
  console.log(`\n✨ Restore completed!\n`)
}

restoreBackup().catch(console.error)
