# Database Migration Steps for Learning Modules

## Overview
The learning hub now fetches modules from the database instead of using hardcoded arrays. This allows you to manage all learning content through the admin panel.

## Required Migrations (Run in Order)

### Step 1: Add Module Content Fields (Migration 004)
**File:** `supabase/migrations/004_add_module_content_fields.sql`

This migration adds all the necessary columns to store learning module content:
- Learn stage fields (title, text, key_points, sources)
- Apply stage fields (title, test_type, scenario, task, options, correct_answer, explanation)
- Reflect stage fields (title, questions, action_items)
- Display fields (icon, color)

**To run:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire content of `004_add_module_content_fields.sql`
3. Click "Run"

### Step 2: Insert Initial Modules (Migration 005)
**File:** `supabase/migrations/005_insert_initial_modules.sql`

This migration populates the database with all 9 hardcoded modules that were previously in the code:

**Core Modules:**
- Budgeting (15 min, blue)
- Saving (20 min, green)
- Investing (25 min, purple)

**Essential Modules:**
- Emergency Fund (20 min, orange)
- Credit & Debt (25 min, red)
- Digital Money (15 min, green)
- Insurance Basics (30 min, blue)
- Financial Goals (15 min, purple)
- Money Mindset (20 min, yellow)

**To run:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire content of `005_insert_initial_modules.sql`
3. Click "Run"

## What Changed

### Before:
- Learning modules were hardcoded in `app/learning/page.tsx`
- Had to modify code to add new modules
- Two separate arrays: `coreTopics` and `essentialModules`

### After:
- All modules stored in `learning_module_content` table
- Admin panel creates/edits modules that instantly appear in learning hub
- Single source of truth in database
- New API endpoint: `/api/learning-modules` (public, no auth required)

## Files Modified

1. **`app/api/learning-modules/route.ts`** (NEW)
   - Public API endpoint to fetch all learning modules
   - Returns modules in format expected by learning hub
   - Maps icon names to icon components on frontend

2. **`app/learning/page.tsx`** (UPDATED)
   - Removed hardcoded `coreTopics` and `essentialModules` arrays
   - Added `fetchModules()` function to load from API
   - Added `loadingModules` state for better UX
   - Now fetches modules on page load

3. **`supabase/migrations/005_insert_initial_modules.sql`** (NEW)
   - Inserts all 9 original modules into database
   - Creates indexes for performance

## Verification Steps

After running both migrations:

1. **Check Database:**
   ```sql
   SELECT module_id, module_title, category, icon, color 
   FROM learning_module_content 
   ORDER BY category, module_id;
   ```
   You should see 9 modules (3 core + 6 essential)

2. **Check Learning Hub:**
   - Visit `/learning` page
   - Should see all 9 original modules
   - Plus your new NFT module if you created it!

3. **Check Admin Panel:**
   - Visit `/admin/learning-modules`
   - Should see all 10 modules (9 original + NFT)
   - Try editing one to verify it updates

## Your NFT Module

Your NFT module should now be visible! Here's what you created:
- **ID:** nft-basics-for-filipinos
- **Title:** NFTs Unlocked: A Filipino Guide
- **Duration:** 30 min
- **Category:** essential
- **Steps:** 3

If it's not showing:
1. Verify it exists in database
2. Check the `category` field is 'core', 'essential', or 'advanced'
3. Check browser console for API errors

## Adding New Modules

Now you can add modules two ways:

### Option 1: Admin Panel (Recommended)
1. Go to `/admin/learning-modules`
2. Click "Add New Module"
3. Fill in all fields
4. Click "Save Module"
5. Module instantly appears in learning hub!

### Option 2: Direct SQL Insert
```sql
INSERT INTO learning_module_content (
  module_id, module_title, module_description, duration, 
  category, icon, color, total_steps
) VALUES (
  'your-module-id',
  'Your Module Title',
  'Description of what students will learn',
  '20 min',
  'essential', -- or 'core' or 'advanced'
  'BookOpen', -- icon name
  'blue', -- color
  3 -- number of steps
);
```

## Available Icons
- Calculator
- PiggyBank
- TrendingUp
- Shield
- CreditCard
- Globe
- Target
- Brain
- BookOpen (default)

## Troubleshooting

### Modules not showing in learning hub:
1. Check browser console for errors
2. Verify API endpoint works: Visit `/api/learning-modules`
3. Check database has modules: `SELECT COUNT(*) FROM learning_module_content;`

### 500 Error when saving modules:
1. Make sure migration 004 ran successfully
2. Check Supabase logs for specific error
3. Verify all required columns exist

### NFT module missing:
1. Check it exists: `SELECT * FROM learning_module_content WHERE module_id = 'nft-basics-for-filipinos';`
2. If missing, recreate in admin panel
3. Check category is valid ('core', 'essential', or 'advanced')

## Next Steps

1. ✅ Run migration 004 (add content fields)
2. ✅ Run migration 005 (insert initial modules)
3. ✅ Refresh learning hub page
4. ✅ Verify all modules appear
5. ✅ Create/edit modules in admin panel
6. 🎉 Enjoy database-driven learning modules!

