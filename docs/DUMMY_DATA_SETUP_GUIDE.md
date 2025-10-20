# Dummy Data Setup Guide

This guide will help you populate your database with test data to verify the Financial Overview history and Notifications features are working.

## 📋 Prerequisites

- Access to Supabase SQL Editor
- Your user account email

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your User ID

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:

```sql
SELECT id, email FROM auth.users;
```

3. Copy your user ID (it looks like: `abc123-def456-ghi789...`)

### Step 2: Run the Dummy Data Script

1. Open the file: `docs/dummy-data-seed.sql`
2. **IMPORTANT:** Replace `'YOUR_USER_ID_HERE'` on line 17 with your actual user ID
3. Copy the entire SQL script
4. Paste it into Supabase SQL Editor
5. Click **"Run"**

### Step 3: Verify Data Was Created

You should see output like:
```
✅ Updated user profile
✅ Created transactions (3 months history)
✅ Created monthly bills
✅ Created goals (3 active, 1 completed)
✅ Joined challenge with check-in history
✅ Created notifications (4 unread, 6 read)
✅ Created learning progress (5 complete, 1 in progress)

========================================
✅ DUMMY DATA CREATED SUCCESSFULLY!
========================================
```

## 🧪 What Data Gets Created

### 1. **Transactions** (25 total across 3 months)
- **October 2025** (current): 12 transactions
  - Income: ₱28,000 (salary + freelance)
  - Expenses: ₱12,750 (food, bills, shopping, etc.)
- **September 2025**: 6 transactions
- **August 2025**: 5 transactions

### 2. **Monthly Bills** (6 active)
- Rent: ₱3,000 (due 5th)
- Electric: ₱2,500 (due 10th)
- Water: ₱500 (due 10th)
- Internet: ₱1,699 (due 15th)
- Netflix: ₱600 (due 16th)
- Spotify: ₱149 (due 20th)

### 3. **Financial Goals** (4 total)
- 🛡️ **Emergency Fund** - ₱45,000 / ₱150,000 (30% complete)
- 💻 **New Laptop** - ₱18,000 / ₱65,000 (27% complete)
- ✈️ **Japan Trip** - ₱12,000 / ₱80,000 (15% complete)
- 📱 **New Phone** - ✅ COMPLETED (₱55,000 / ₱55,000)

### 4. **Challenge Progress**
- ₱100 Daily Challenge - 8 check-ins completed (40% progress)

### 5. **Notifications** (10 total)
**Unread (4):**
- Goal milestone reached
- Bill due reminder
- Challenge progress update
- Savings tip

**Read (6):**
- Goal created
- Expense logged
- Bill paid
- Challenge joined
- Milestone reached
- Learning module completed

### 6. **Learning Progress**
- ✅ Budgeting (100%)
- ✅ Saving (100%)
- ✅ Investing (100%)
- ✅ Emergency Fund (100%)
- ✅ Credit & Debt (100%)
- 🔄 Digital Money (60% - in progress)

## ✅ Features to Test

After running the script, test these features:

### 1. Financial Overview Page
- ✅ View 3 months of transaction history
- ✅ Check expense categories breakdown
- ✅ Verify income vs expense trends
- ✅ Export functionality

### 2. Notifications
- ✅ Bell icon shows (4) unread notifications
- ✅ Notifications panel opens
- ✅ Can mark notifications as read
- ✅ Different notification types display correctly

### 3. Dashboard
- ✅ Available money calculation correct
- ✅ Active challenge shows with progress
- ✅ Goals display with progress bars
- ✅ Learning progress shows 5/9 modules

### 4. Goals Page
- ✅ 3 active goals displayed
- ✅ 1 completed goal shown
- ✅ Progress percentages correct
- ✅ Can add more to goals

### 5. Challenges Page
- ✅ Active challenge appears
- ✅ Check-in button works
- ✅ Progress updates after check-in

## 🗑️ Clean Up (Optional)

If you want to remove all dummy data and start fresh:

```sql
-- Run this in Supabase SQL Editor
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID

DO $$
DECLARE
  test_user_id UUID := 'YOUR_USER_ID_HERE';
BEGIN
  DELETE FROM challenge_progress WHERE user_challenge_id IN (
    SELECT id FROM user_challenges WHERE user_id = test_user_id
  );
  DELETE FROM user_challenges WHERE user_id = test_user_id;
  DELETE FROM notifications WHERE user_id = test_user_id;
  DELETE FROM learning_progress WHERE user_id = test_user_id;
  DELETE FROM scheduled_payments WHERE user_id = test_user_id;
  DELETE FROM goals WHERE user_id = test_user_id;
  DELETE FROM transactions WHERE user_id = test_user_id;
  
  RAISE NOTICE '✅ All dummy data deleted';
END $$;
```

## 🐛 Troubleshooting

### Error: "tuple to be updated was already modified"
- **Solution:** This was fixed in the latest version. Make sure you're using the updated script that inserts check-ins one at a time.
- If you still see this, it means the trigger is firing multiple times. This is now resolved.

### Error: "relation does not exist"
- **Solution:** Make sure all tables are created. Run the schema files first:
  - `docs/challenges-schema.sql`
  - Check if `notifications` table exists

### Error: "violates foreign key constraint"
- **Solution:** Make sure you replaced `YOUR_USER_ID_HERE` with your actual user ID from auth.users

### No notifications showing
- **Solution:** Check if notifications table exists:
  ```sql
  SELECT COUNT(*) FROM notifications WHERE user_id = 'YOUR_USER_ID';
  ```

### Challenge not created
- **Solution:** Make sure the challenges table has data. The script looks for "100 Daily Challenge".

## 📝 Notes

- All dates are relative to October 2025
- Amounts are in Philippine Peso (₱)
- Transaction history spans August - October 2025
- This is **test data only** - feel free to modify or delete it
- User profile monthly income is set to ₱25,000

## 🎯 Next Steps

After verifying everything works with dummy data:
1. Delete dummy data using cleanup script above
2. Start using the app with real data
3. Or keep dummy data for continued testing

---

**Questions?** Check the console logs or Supabase logs for detailed error messages.
