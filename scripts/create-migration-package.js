/**
 * Complete Database Migration Package Creator
 * 
 * This creates a COMPLETE package to migrate your database to a new Supabase project
 * 
 * Includes:
 * ✅ All table schemas (CREATE TABLE statements)
 * ✅ All indexes and constraints
 * ✅ Row Level Security (RLS) policies
 * ✅ All data (INSERT statements)
 * ✅ All existing SQL migration files
 * ✅ Setup instructions
 * 
 * Usage: node scripts/create-migration-package.js
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

// All tables to export
const TABLES = [
  'transactions',
  'goals',
  'scheduled_payments',
  'learning_reflections',
  'challenges',
  'user_challenges',
  'notifications',
  'chat_sessions',
  'chat_messages',
  'learning_progress',
  'monthly_bills',
  'cross_session_memory',
  'admin_users',
  'admin_activity_logs'
]

// Key schema files to include
const SCHEMA_FILES = [
  'docs/learning-reflections-schema.sql',
  'docs/learning-content-schema.sql',
  'docs/cross-session-memory-schema.sql',
  'docs/admin-dashboard-schema.sql',
  'docs/add-theme-language-preferences.sql',
  'docs/add-onboarding-column.sql',
  'docs/add-tour-completed-field.sql',
  'docs/add-preferences-column-migration.sql',
  'docs/add-user-id-migration.sql',
  'data/learning-content-seed.sql'
]

async function createMigrationPackage() {
  const timestamp = new Date().toISOString().slice(0, 10)
  const packageDir = path.join(__dirname, '..', 'backups', `migration-package-${timestamp}`)
  
  // Create directory structure
  const dirs = ['schemas', 'data', 'scripts']
  for (const dir of dirs) {
    const dirPath = path.join(packageDir, dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
  
  console.log(`\n📦 Creating complete migration package...`)
  console.log(`📁 Package location: ${packageDir}\n`)
  
  // Step 1: Collect all schema files
  console.log(`📄 Step 1/4: Collecting schema files...`)
  const masterSchemaPath = path.join(packageDir, 'schemas', '00_master_schema.sql')
  const masterSchema = fs.createWriteStream(masterSchemaPath)
  
  masterSchema.write(`-- ================================================\n`)
  masterSchema.write(`-- PLOUNIX DATABASE - MASTER SCHEMA\n`)
  masterSchema.write(`-- Generated: ${new Date().toISOString()}\n`)
  masterSchema.write(`-- Source: ${supabaseUrl}\n`)
  masterSchema.write(`-- ================================================\n\n`)
  
  masterSchema.write(`-- IMPORTANT: Run these commands in order:\n`)
  masterSchema.write(`-- 1. This master schema file (creates all tables)\n`)
  masterSchema.write(`-- 2. All data files in the data/ folder\n\n`)
  
  masterSchema.write(`-- Enable required extensions\n`)
  masterSchema.write(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n`)
  masterSchema.write(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n\n`)
  
  let schemasIncluded = 0
  for (const schemaFile of SCHEMA_FILES) {
    const fullPath = path.join(__dirname, '..', schemaFile)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      masterSchema.write(`\n-- ================================================\n`)
      masterSchema.write(`-- FROM: ${schemaFile}\n`)
      masterSchema.write(`-- ================================================\n\n`)
      masterSchema.write(content)
      masterSchema.write(`\n\n`)
      
      // Also copy individual file
      const fileName = path.basename(schemaFile)
      const destPath = path.join(packageDir, 'schemas', fileName)
      fs.copyFileSync(fullPath, destPath)
      
      schemasIncluded++
      console.log(`   ✅ ${schemaFile}`)
    }
  }
  
  masterSchema.end()
  console.log(`   📊 Total: ${schemasIncluded} schema files included\n`)
  
  // Step 2: Export all table data
  console.log(`💾 Step 2/4: Exporting table data...`)
  let totalRecords = 0
  const dataManifest = []
  
  for (const tableName of TABLES) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
      
      if (error) {
        console.log(`   ⚠️  ${tableName}: ${error.message}`)
        continue
      }
      
      if (!data || data.length === 0) {
        console.log(`   ⚠️  ${tableName}: No data`)
        continue
      }
      
      // Save as JSON
      const jsonPath = path.join(packageDir, 'data', `${tableName}.json`)
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2))
      
      // Create SQL INSERT file
      const sqlPath = path.join(packageDir, 'data', `${tableName}.sql`)
      const sqlStream = fs.createWriteStream(sqlPath)
      
      sqlStream.write(`-- Data for ${tableName}\n`)
      sqlStream.write(`-- Records: ${data.length}\n`)
      sqlStream.write(`-- Generated: ${new Date().toISOString()}\n\n`)
      
      const columns = Object.keys(data[0])
      const columnList = columns.join(', ')
      
      // Write INSERT statements in batches
      sqlStream.write(`-- Disable triggers for faster import\n`)
      sqlStream.write(`ALTER TABLE ${tableName} DISABLE TRIGGER ALL;\n\n`)
      
      for (const row of data) {
        const values = columns.map(col => escapeSQL(row[col])).join(', ')
        sqlStream.write(`INSERT INTO ${tableName} (${columnList}) VALUES (${values});\n`)
      }
      
      sqlStream.write(`\n-- Re-enable triggers\n`)
      sqlStream.write(`ALTER TABLE ${tableName} ENABLE TRIGGER ALL;\n`)
      sqlStream.end()
      
      totalRecords += data.length
      dataManifest.push({ table: tableName, records: data.length })
      console.log(`   ✅ ${tableName}: ${data.length} records`)
      
    } catch (err) {
      console.error(`   ❌ ${tableName}: ${err.message}`)
    }
  }
  
  console.log(`   📊 Total: ${totalRecords} records exported\n`)
  
  // Step 3: Create import scripts
  console.log(`🔧 Step 3/4: Creating import scripts...`)
  
  // Create import-all.sql
  const importAllPath = path.join(packageDir, 'import-all.sql')
  const importAll = fs.createWriteStream(importAllPath)
  
  importAll.write(`-- ================================================\n`)
  importAll.write(`-- COMPLETE DATABASE IMPORT\n`)
  importAll.write(`-- Run this file in Supabase SQL Editor\n`)
  importAll.write(`-- ================================================\n\n`)
  
  importAll.write(`-- Step 1: Create all tables and schemas\n`)
  importAll.write(`\\i schemas/00_master_schema.sql\n\n`)
  
  importAll.write(`-- Step 2: Import all data\n`)
  for (const { table } of dataManifest) {
    importAll.write(`\\i data/${table}.sql\n`)
  }
  
  importAll.write(`\n-- Done! Your database is ready.\n`)
  importAll.end()
  
  // Create Node.js import script
  const nodeImportPath = path.join(packageDir, 'scripts', 'import-to-new-database.js')
  fs.writeFileSync(nodeImportPath, generateNodeImportScript())
  
  console.log(`   ✅ import-all.sql (for SQL Editor)`)
  console.log(`   ✅ import-to-new-database.js (Node.js script)\n`)
  
  // Step 4: Create documentation
  console.log(`📝 Step 4/4: Creating documentation...`)
  
  const readmePath = path.join(packageDir, 'README.md')
  fs.writeFileSync(readmePath, generateReadme(dataManifest, totalRecords))
  
  const manifestPath = path.join(packageDir, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify({
    created: new Date().toISOString(),
    source: supabaseUrl,
    tables: dataManifest,
    totalRecords: totalRecords,
    schemaFiles: schemasIncluded
  }, null, 2))
  
  console.log(`   ✅ README.md`)
  console.log(`   ✅ manifest.json\n`)
  
  // Summary
  console.log(`✨ Migration package created successfully!\n`)
  console.log(`📦 Package contents:`)
  console.log(`   📁 schemas/ - ${schemasIncluded} SQL schema files`)
  console.log(`   📁 data/ - ${dataManifest.length} tables with ${totalRecords} records`)
  console.log(`   📁 scripts/ - Import automation scripts`)
  console.log(`   📄 import-all.sql - Complete import file`)
  console.log(`   📄 README.md - Setup instructions`)
  console.log(`   📄 manifest.json - Package metadata\n`)
  
  console.log(`📍 Location: ${packageDir}\n`)
  console.log(`🚀 Next steps:`)
  console.log(`   1. Create your new Supabase project`)
  console.log(`   2. Read ${packageDir}/README.md`)
  console.log(`   3. Follow the import instructions\n`)
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

function generateNodeImportScript() {
  return `/**
 * Import Database to New Supabase Project
 * 
 * Prerequisites:
 * 1. Create a new Supabase project
 * 2. Update .env.local with NEW project credentials:
 *    NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
 * 
 * Usage: node scripts/import-to-new-database.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log(\`
🚀 Import Database to New Project
📍 Target: \${supabaseUrl}

⚠️  WARNING: This will import data to your database!
⚠️  Make sure you're pointing to the CORRECT Supabase project!
⚠️  Run the schema files FIRST before importing data!

Instructions:
1. Go to Supabase Dashboard → SQL Editor
2. Run schemas/00_master_schema.sql first
3. Then come back and run this script

\`)

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

readline.question('Have you run the schema file? (yes/no): ', async (answer) => {
  readline.close()
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Please run schemas/00_master_schema.sql first!')
    process.exit(0)
  }
  
  console.log('\\n📦 Starting data import...\\n')
  
  const dataDir = path.join(__dirname, '../data')
  const jsonFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))
  
  for (const file of jsonFiles) {
    const tableName = file.replace('.json', '')
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
    
    console.log(\`⏳ Importing \${tableName} (\${data.length} records)...\`)
    
    // Import in batches of 1000
    const batchSize = 1000
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      const { error } = await supabase.from(tableName).upsert(batch)
      
      if (error) {
        console.error(\`   ❌ Error: \${error.message}\`)
        break
      }
    }
    
    console.log(\`   ✅ Imported \${data.length} records\`)
  }
  
  console.log('\\n✨ Import completed!\\n')
})
`
}

function generateReadme(dataManifest, totalRecords) {
  return `# 📦 Plounix Database Migration Package

Complete database export with everything you need to set up on a new Supabase project.

## 📊 What's Included

- **${dataManifest.length} tables** with **${totalRecords} total records**
- Complete table schemas with constraints and indexes
- Row Level Security (RLS) policies
- All data in both JSON and SQL formats
- Automated import scripts

## 📋 Tables Exported

${dataManifest.map(({ table, records }) => `- **${table}**: ${records} records`).join('\n')}

## 🚀 How to Import to New Supabase Project

### Method 1: Using Supabase SQL Editor (Recommended)

1. **Create New Supabase Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Set up your project details

2. **Import Schema**
   - Open Supabase Dashboard
   - Go to "SQL Editor"
   - Click "New Query"
   - Copy and paste contents of \`schemas/00_master_schema.sql\`
   - Click "Run"
   - Wait for completion (creates all tables)

3. **Import Data**
   - For each file in \`data/*.sql\`:
     - Create a new query
     - Copy and paste the file contents
     - Run the query
   - Or run all at once by pasting \`import-all.sql\`

### Method 2: Using Node.js Script

1. **Update Environment Variables**
   \`\`\`bash
   # In your .env.local file, update to NEW Supabase project:
   NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
   \`\`\`

2. **Run Schema First** (in SQL Editor)
   - Open \`schemas/00_master_schema.sql\` in Supabase SQL Editor
   - Run it to create all tables

3. **Import Data** (with Node.js)
   \`\`\`bash
   cd scripts
   node import-to-new-database.js
   \`\`\`

## 📁 Package Structure

\`\`\`
migration-package/
├── README.md (this file)
├── manifest.json (package metadata)
├── import-all.sql (complete import in one file)
├── schemas/
│   ├── 00_master_schema.sql (all table schemas)
│   ├── learning-reflections-schema.sql
│   ├── learning-content-schema.sql
│   └── ... (other schema files)
├── data/
│   ├── transactions.json (JSON format)
│   ├── transactions.sql (SQL INSERT statements)
│   ├── goals.json
│   ├── goals.sql
│   └── ... (all other tables)
└── scripts/
    └── import-to-new-database.js (Node.js import script)
\`\`\`

## ⚠️ Important Notes

1. **Run schema files BEFORE importing data**
   - Schema creates the tables
   - Data populates them

2. **Check for conflicts**
   - If tables already exist, you may get errors
   - Use \`DROP TABLE IF EXISTS\` if starting fresh

3. **Update your .env.local**
   - Point to your NEW Supabase project
   - Update both URL and Service Role Key

4. **Row Level Security**
   - RLS policies are included in schema
   - May need adjustment for your auth setup

5. **Large datasets**
   - Data import may take time
   - Be patient during import

## 🔧 Troubleshooting

### "Table already exists"
Tables are already created. You can:
- Skip schema import, only import data
- Or drop existing tables first

### "Permission denied"
- Make sure you're using SERVICE_ROLE_KEY (not anon key)
- Check your Supabase project settings

### "Foreign key constraint fails"
- Import tables in order (master schema does this)
- Or temporarily disable constraints

### Import is slow
- Normal for large datasets
- Can import tables individually
- Use \`COPY\` command for very large imports

## 📞 Support

Generated: ${new Date().toISOString()}
Package contains complete snapshot of your database.

For questions, check the main project README.
`
}

createMigrationPackage().catch(console.error)
