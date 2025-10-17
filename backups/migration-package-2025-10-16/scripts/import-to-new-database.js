/**
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

console.log(`
🚀 Import Database to New Project
📍 Target: ${supabaseUrl}

⚠️  WARNING: This will import data to your database!
⚠️  Make sure you're pointing to the CORRECT Supabase project!
⚠️  Run the schema files FIRST before importing data!

Instructions:
1. Go to Supabase Dashboard → SQL Editor
2. Run schemas/00_master_schema.sql first
3. Then come back and run this script

`)

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
  
  console.log('\n📦 Starting data import...\n')
  
  const dataDir = path.join(__dirname, '../data')
  const jsonFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))
  
  for (const file of jsonFiles) {
    const tableName = file.replace('.json', '')
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
    
    console.log(`⏳ Importing ${tableName} (${data.length} records)...`)
    
    // Import in batches of 1000
    const batchSize = 1000
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      const { error } = await supabase.from(tableName).upsert(batch)
      
      if (error) {
        console.error(`   ❌ Error: ${error.message}`)
        break
      }
    }
    
    console.log(`   ✅ Imported ${data.length} records`)
  }
  
  console.log('\n✨ Import completed!\n')
})
