/**
 * SQL Export Script
 * 
 * This script creates SQL dump files that can be imported anywhere
 * Usage: node scripts/export-sql.js
 * 
 * Creates: backups/sql-export-YYYY-MM-DD/database.sql
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

function escapeSQL(value) {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE'
  }
  if (typeof value === 'number') {
    return value.toString()
  }
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`
  }
  // String - escape single quotes
  return `'${value.toString().replace(/'/g, "''")}'`
}

async function exportToSQL() {
  const timestamp = new Date().toISOString().slice(0, 10)
  const backupDir = path.join(__dirname, '..', 'backups', `sql-export-${timestamp}`)
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  const sqlFilePath = path.join(backupDir, 'database.sql')
  const sqlStream = fs.createWriteStream(sqlFilePath)
  
  console.log(`\n📦 Starting SQL export...`)
  console.log(`📁 Export location: ${sqlFilePath}\n`)
  
  // Write header
  sqlStream.write(`-- Plounix Database Backup\n`)
  sqlStream.write(`-- Generated: ${new Date().toISOString()}\n`)
  sqlStream.write(`-- Database: ${supabaseUrl}\n\n`)
  sqlStream.write(`-- Disable triggers and constraints during import\n`)
  sqlStream.write(`SET session_replication_role = 'replica';\n\n`)
  
  let totalRecords = 0
  
  for (const table of TABLES) {
    try {
      console.log(`⏳ Exporting ${table}...`)
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
      
      if (error) {
        console.error(`❌ Error exporting ${table}:`, error.message)
        sqlStream.write(`-- ERROR: Could not export ${table}: ${error.message}\n\n`)
        continue
      }
      
      if (!data || data.length === 0) {
        console.log(`⚠️  ${table}: No data to export`)
        sqlStream.write(`-- ${table}: No data\n\n`)
        continue
      }
      
      sqlStream.write(`-- Table: ${table} (${data.length} records)\n`)
      sqlStream.write(`TRUNCATE TABLE ${table} CASCADE;\n`)
      
      // Get column names from first row
      const columns = Object.keys(data[0])
      const columnList = columns.join(', ')
      
      // Write INSERT statements
      for (const row of data) {
        const values = columns.map(col => escapeSQL(row[col])).join(', ')
        sqlStream.write(`INSERT INTO ${table} (${columnList}) VALUES (${values});\n`)
      }
      
      sqlStream.write(`\n`)
      totalRecords += data.length
      console.log(`✅ ${table}: ${data.length} records exported`)
      
    } catch (err) {
      console.error(`❌ Exception exporting ${table}:`, err.message)
      sqlStream.write(`-- ERROR: Exception in ${table}: ${err.message}\n\n`)
    }
  }
  
  // Write footer
  sqlStream.write(`-- Re-enable triggers and constraints\n`)
  sqlStream.write(`SET session_replication_role = 'origin';\n\n`)
  sqlStream.write(`-- Backup completed: ${totalRecords} total records\n`)
  
  sqlStream.end()
  
  console.log(`\n✨ SQL export completed!`)
  console.log(`📊 Total records: ${totalRecords}`)
  console.log(`📁 File: ${sqlFilePath}`)
  console.log(`📦 File size: ${(fs.statSync(sqlFilePath).size / 1024).toFixed(2)} KB`)
  console.log(`\n💡 To import this backup:`)
  console.log(`   1. In Supabase Dashboard: SQL Editor`)
  console.log(`   2. Paste the contents of database.sql`)
  console.log(`   3. Run the query\n`)
}

exportToSQL().catch(console.error)
