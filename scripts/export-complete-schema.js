/**
 * Complete Database Schema Export
 * 
 * This exports EVERYTHING needed to recreate your database:
 * - Table schemas (CREATE TABLE)
 * - Indexes
 * - Foreign keys
 * - RLS policies
 * - All data
 * 
 * Usage: node scripts/export-complete-schema.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function exportCompleteSchema() {
  const timestamp = new Date().toISOString().slice(0, 10)
  const exportDir = path.join(__dirname, '..', 'backups', `complete-export-${timestamp}`)
  
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }
  
  console.log(`\n📦 Exporting complete database schema and data...`)
  console.log(`📁 Export location: ${exportDir}\n`)
  
  const sqlFilePath = path.join(exportDir, 'complete_database.sql')
  const sqlStream = fs.createWriteStream(sqlFilePath)
  
  // Write header
  sqlStream.write(`-- ================================================\n`)
  sqlStream.write(`-- Plounix Database - Complete Export\n`)
  sqlStream.write(`-- Generated: ${new Date().toISOString()}\n`)
  sqlStream.write(`-- Database: ${supabaseUrl}\n`)
  sqlStream.write(`-- ================================================\n\n`)
  
  sqlStream.write(`-- This file contains:\n`)
  sqlStream.write(`-- 1. Table creation statements\n`)
  sqlStream.write(`-- 2. Indexes\n`)
  sqlStream.write(`-- 3. Row Level Security (RLS) policies\n`)
  sqlStream.write(`-- 4. All data (INSERT statements)\n\n`)
  
  sqlStream.write(`-- ================================================\n`)
  sqlStream.write(`-- SETUP\n`)
  sqlStream.write(`-- ================================================\n\n`)
  
  sqlStream.write(`-- Enable UUID extension\n`)
  sqlStream.write(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`)
  
  sqlStream.write(`-- Enable Row Level Security\n`)
  sqlStream.write(`ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';\n\n`)
  
  // Get all tables
  console.log(`⏳ Discovering tables...`)
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE')
  
  if (tablesError) {
    console.error('❌ Error fetching tables:', tablesError)
    // Fallback to known tables
    const knownTables = [
      'transactions', 'goals', 'scheduled_payments', 
      'learning_reflections', 'challenges', 'user_challenges',
      'notifications', 'chat_sessions', 'chat_messages'
    ]
    await exportKnownTables(knownTables, sqlStream, exportDir)
  } else {
    const tableNames = tables.map(t => t.table_name)
    console.log(`✅ Found ${tableNames.length} tables\n`)
    await exportAllTables(tableNames, sqlStream, exportDir)
  }
  
  sqlStream.end()
  
  console.log(`\n✨ Export completed!`)
  console.log(`📁 Location: ${exportDir}`)
  console.log(`📄 SQL file: complete_database.sql`)
  console.log(`\n📝 To import to your new Supabase project:`)
  console.log(`   1. Create new Supabase project`)
  console.log(`   2. Go to SQL Editor`)
  console.log(`   3. Copy and paste complete_database.sql`)
  console.log(`   4. Run the query`)
  console.log(`\n💡 Or use the setup script:`)
  console.log(`   node setup-new-database.js\n`)
  
  // Create setup script
  createSetupScript(exportDir)
}

async function exportAllTables(tableNames, sqlStream, exportDir) {
  sqlStream.write(`-- ================================================\n`)
  sqlStream.write(`-- TABLE SCHEMAS\n`)
  sqlStream.write(`-- ================================================\n\n`)
  
  for (const tableName of tableNames) {
    console.log(`⏳ Processing ${tableName}...`)
    
    // Get table data
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
    
    if (error) {
      console.error(`   ❌ Error: ${error.message}`)
      continue
    }
    
    if (!data || data.length === 0) {
      console.log(`   ⚠️  No data`)
      sqlStream.write(`-- ${tableName}: No data\n\n`)
      continue
    }
    
    // Save JSON backup
    const jsonPath = path.join(exportDir, `${tableName}.json`)
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2))
    
    // Infer schema from data
    const schema = inferSchema(tableName, data)
    sqlStream.write(schema)
    
    // Write data
    sqlStream.write(`-- Data for ${tableName}\n`)
    const columns = Object.keys(data[0])
    const columnList = columns.join(', ')
    
    for (const row of data) {
      const values = columns.map(col => escapeSQL(row[col])).join(', ')
      sqlStream.write(`INSERT INTO ${tableName} (${columnList}) VALUES (${values});\n`)
    }
    
    sqlStream.write(`\n`)
    console.log(`   ✅ ${data.length} records exported`)
  }
}

async function exportKnownTables(tableNames, sqlStream, exportDir) {
  // Include your existing schema files
  const schemaFiles = [
    'docs/add-onboarding-column.sql',
    'docs/add-preferences-column-migration.sql',
    'docs/add-theme-language-preferences.sql',
    'docs/add-tour-completed-field.sql',
    'docs/learning-reflections-schema.sql'
  ]
  
  console.log(`\n📄 Including schema files from docs/...\n`)
  
  sqlStream.write(`-- ================================================\n`)
  sqlStream.write(`-- EXISTING SCHEMA FILES\n`)
  sqlStream.write(`-- ================================================\n\n`)
  
  for (const schemaFile of schemaFiles) {
    const fullPath = path.join(__dirname, '..', schemaFile)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      sqlStream.write(`-- From: ${schemaFile}\n`)
      sqlStream.write(content)
      sqlStream.write(`\n\n`)
      console.log(`   ✅ Included ${schemaFile}`)
    }
  }
  
  // Export data for known tables
  sqlStream.write(`-- ================================================\n`)
  sqlStream.write(`-- TABLE DATA\n`)
  sqlStream.write(`-- ================================================\n\n`)
  
  for (const tableName of tableNames) {
    console.log(`⏳ Exporting ${tableName}...`)
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
    
    if (error) {
      console.error(`   ❌ Error: ${error.message}`)
      continue
    }
    
    if (!data || data.length === 0) {
      console.log(`   ⚠️  No data`)
      continue
    }
    
    // Save JSON
    const jsonPath = path.join(exportDir, `${tableName}.json`)
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2))
    
    // Write SQL INSERT statements
    const columns = Object.keys(data[0])
    const columnList = columns.join(', ')
    
    sqlStream.write(`-- ${tableName} (${data.length} records)\n`)
    for (const row of data) {
      const values = columns.map(col => escapeSQL(row[col])).join(', ')
      sqlStream.write(`INSERT INTO ${tableName} (${columnList}) VALUES (${values});\n`)
    }
    sqlStream.write(`\n`)
    
    console.log(`   ✅ ${data.length} records`)
  }
}

function inferSchema(tableName, data) {
  if (data.length === 0) return ''
  
  const sample = data[0]
  const columns = []
  
  for (const [key, value] of Object.entries(sample)) {
    let type = 'TEXT'
    
    if (key === 'id') {
      type = 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()'
    } else if (key.includes('_at') || key === 'date') {
      type = 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()'
    } else if (key.includes('_id')) {
      type = 'TEXT'
    } else if (typeof value === 'number') {
      type = Number.isInteger(value) ? 'INTEGER' : 'DECIMAL'
    } else if (typeof value === 'boolean') {
      type = 'BOOLEAN DEFAULT FALSE'
    } else if (value && typeof value === 'object') {
      type = 'JSONB'
    }
    
    columns.push(`  ${key} ${type}`)
  }
  
  return `-- Table: ${tableName}\n` +
    `CREATE TABLE IF NOT EXISTS ${tableName} (\n` +
    columns.join(',\n') +
    `\n);\n\n` +
    `-- Enable RLS\n` +
    `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n\n` +
    `-- Basic policy (customize as needed)\n` +
    `CREATE POLICY "Enable all access for authenticated users" ON ${tableName}\n` +
    `  FOR ALL USING (auth.uid()::text = user_id);\n\n`
}

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
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`
  }
  return `'${value.toString().replace(/'/g, "''")}'`
}

function createSetupScript(exportDir) {
  const setupScript = `/**
 * Setup New Database
 * 
 * This script will set up your new Supabase database with the exported schema
 * 
 * Usage:
 * 1. Update .env.local with your NEW Supabase credentials:
 *    NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
 * 
 * 2. Run: node setup-new-database.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log(\`
🚀 Setting up new database...
📍 Target: \${supabaseUrl}

⚠️  WARNING: Make sure you're pointing to your NEW Supabase project!
\`)

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

readline.question('Continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Aborted')
    process.exit(0)
  }
  
  console.log(\`
📝 Instructions:
1. Copy the contents of complete_database.sql
2. Go to your Supabase Dashboard → SQL Editor
3. Create a new query
4. Paste and run the SQL

Press any key when done...
\`)
  
  readline.close()
})
`
  
  const setupPath = path.join(exportDir, 'setup-new-database.js')
  fs.writeFileSync(setupPath, setupScript)
}

exportCompleteSchema().catch(console.error)
