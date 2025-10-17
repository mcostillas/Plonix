# 📦 Plounix Database Migration Package

Complete database export with everything you need to set up on a new Supabase project.

## 📊 What's Included

- **6 tables** with **730 total records**
- Complete table schemas with constraints and indexes
- Row Level Security (RLS) policies
- All data in both JSON and SQL formats
- Automated import scripts

## 📋 Tables Exported

- **transactions**: 66 records
- **goals**: 26 records
- **scheduled_payments**: 37 records
- **learning_reflections**: 566 records
- **challenges**: 8 records
- **user_challenges**: 27 records

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
   - Copy and paste contents of `schemas/00_master_schema.sql`
   - Click "Run"
   - Wait for completion (creates all tables)

3. **Import Data**
   - For each file in `data/*.sql`:
     - Create a new query
     - Copy and paste the file contents
     - Run the query
   - Or run all at once by pasting `import-all.sql`

### Method 2: Using Node.js Script

1. **Update Environment Variables**
   ```bash
   # In your .env.local file, update to NEW Supabase project:
   NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
   ```

2. **Run Schema First** (in SQL Editor)
   - Open `schemas/00_master_schema.sql` in Supabase SQL Editor
   - Run it to create all tables

3. **Import Data** (with Node.js)
   ```bash
   cd scripts
   node import-to-new-database.js
   ```

## 📁 Package Structure

```
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
```

## ⚠️ Important Notes

1. **Run schema files BEFORE importing data**
   - Schema creates the tables
   - Data populates them

2. **Check for conflicts**
   - If tables already exist, you may get errors
   - Use `DROP TABLE IF EXISTS` if starting fresh

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
- Use `COPY` command for very large imports

## 📞 Support

Generated: 2025-10-16T03:17:38.391Z
Package contains complete snapshot of your database.

For questions, check the main project README.
