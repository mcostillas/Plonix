# Fix Learning Module Database Schema

## Problem
The `learning_module_content` table is missing individual columns for Learn/Apply/Reflect content. The admin panel is trying to save these fields but they don't exist in the database.

## Solution
Run the migration script to add the missing columns.

## Steps to Fix:

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your Plounix project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `supabase/migrations/004_add_module_content_fields.sql`
6. Paste into the SQL editor
7. Click **Run** button
8. You should see "Success. No rows returned"

### Option 2: Using Supabase CLI
```bash
npx supabase db push
```

### Option 3: Manual SQL Execution
If you have PostgreSQL access, run:
```bash
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/004_add_module_content_fields.sql
```

## What This Migration Does:
- ✅ Adds `learn_title`, `learn_text`, `learn_key_points`, `learn_sources` columns
- ✅ Adds `apply_title`, `apply_test_type`, `apply_scenario`, `apply_task`, `apply_options`, `apply_correct_answer`, `apply_explanation` columns
- ✅ Adds `reflect_title`, `reflect_questions`, `reflect_action_items` columns
- ✅ Adds `icon` and `color` columns for UI customization
- ✅ Sets default values for existing modules
- ✅ Adds CHECK constraint for test types
- ✅ Creates index for performance

## After Running Migration:
- Refresh your admin page
- Try creating/editing a module
- All fields should save successfully! 🎉
