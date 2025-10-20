-- =====================================================
-- DUMMY DATA FOR TESTING
-- Creates test user with complete financial history
-- =====================================================
-- Purpose: Test Financial Overview history and Notifications
-- Run this in Supabase SQL Editor
-- =====================================================

-- IMPORTANT: Get your real user ID first!
-- Run this query in Supabase to get your user ID:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
-- Then replace 'YOUR_USER_ID_HERE' below with your actual user ID

DO $$
DECLARE
  test_user_id UUID := 'YOUR_USER_ID_HERE'; -- REPLACE THIS WITH YOUR ACTUAL USER ID
  test_goal_id UUID;
  test_challenge_id UUID;
  test_user_challenge_id UUID;
BEGIN

-- =====================================================
-- 1. UPDATE USER PROFILE
-- =====================================================
UPDATE user_profiles 
SET 
  name = 'Test User',
  monthly_income = 25000,
  updated_at = NOW()
WHERE user_id = test_user_id;

RAISE NOTICE '✅ Updated user profile';

-- =====================================================
-- 2. CREATE TRANSACTIONS (3 months of history)
-- =====================================================

-- OCTOBER 2025 - Current Month
-- Income
INSERT INTO transactions (user_id, amount, merchant, category, date, payment_method, transaction_type, notes) VALUES
(test_user_id, 25000, 'Company Salary', 'salary', '2025-10-01', 'bank', 'income', 'Monthly salary'),
(test_user_id, 3000, 'Freelance Project', 'freelance', '2025-10-15', 'gcash', 'income', 'Website design project');

-- Expenses
INSERT INTO transactions (user_id, amount, merchant, category, date, payment_method, transaction_type, notes) VALUES
(test_user_id, 500, 'Jollibee', 'food', '2025-10-02', 'cash', 'expense', 'Lunch with friends'),
(test_user_id, 200, 'Grab', 'transportation', '2025-10-03', 'gcash', 'expense', 'Ride to office'),
(test_user_id, 1200, 'SM Department Store', 'shopping', '2025-10-05', 'card', 'expense', 'New clothes'),
(test_user_id, 800, 'Mercury Drug', 'health', '2025-10-07', 'cash', 'expense', 'Medicine'),
(test_user_id, 150, 'Load', 'bills', '2025-10-08', 'gcash', 'expense', 'Mobile load'),
(test_user_id, 2500, 'Meralco', 'bills', '2025-10-10', 'bank', 'expense', 'Electric bill'),
(test_user_id, 350, 'Starbucks', 'food', '2025-10-12', 'card', 'expense', 'Coffee meeting'),
(test_user_id, 5000, 'Savings: Emergency Fund', 'Savings', '2025-10-15', 'Transfer', 'expense', 'Monthly savings'),
(test_user_id, 600, 'Netflix', 'entertainment', '2025-10-16', 'card', 'expense', 'Subscription'),
(test_user_id, 450, 'Watsons', 'personal-care', '2025-10-18', 'cash', 'expense', 'Toiletries');

-- SEPTEMBER 2025
INSERT INTO transactions (user_id, amount, merchant, category, date, payment_method, transaction_type, notes) VALUES
(test_user_id, 25000, 'Company Salary', 'salary', '2025-09-01', 'bank', 'income', 'Monthly salary'),
(test_user_id, 2000, 'Freelance', 'freelance', '2025-09-20', 'gcash', 'income', 'Logo design'),
(test_user_id, 8500, 'Various Expenses', 'other', '2025-09-15', 'cash', 'expense', 'Monthly expenses'),
(test_user_id, 2500, 'Meralco', 'bills', '2025-09-10', 'bank', 'expense', 'Electric bill'),
(test_user_id, 5000, 'Savings: Emergency Fund', 'Savings', '2025-09-15', 'Transfer', 'expense', 'Monthly savings'),
(test_user_id, 3000, 'Rent', 'housing', '2025-09-05', 'bank', 'expense', 'Monthly rent');

-- AUGUST 2025
INSERT INTO transactions (user_id, amount, merchant, category, date, payment_method, transaction_type, notes) VALUES
(test_user_id, 25000, 'Company Salary', 'salary', '2025-08-01', 'bank', 'income', 'Monthly salary'),
(test_user_id, 7200, 'Various Expenses', 'other', '2025-08-15', 'cash', 'expense', 'Monthly expenses'),
(test_user_id, 2500, 'Meralco', 'bills', '2025-08-10', 'bank', 'expense', 'Electric bill'),
(test_user_id, 5000, 'Savings: Emergency Fund', 'Savings', '2025-08-15', 'Transfer', 'expense', 'Monthly savings'),
(test_user_id, 3000, 'Rent', 'housing', '2025-08-05', 'bank', 'expense', 'Monthly rent');

RAISE NOTICE '✅ Created transactions (3 months history)';

-- =====================================================
-- 3. CREATE MONTHLY BILLS
-- =====================================================
INSERT INTO scheduled_payments (user_id, name, amount, category, due_day, next_due_date, description, is_active) VALUES
(test_user_id, 'Rent', 3000, 'Housing', 5, '2025-11-05', 'Monthly apartment rent', true),
(test_user_id, 'Electric Bill', 2500, 'Utilities', 10, '2025-11-10', 'Meralco bill', true),
(test_user_id, 'Water Bill', 500, 'Utilities', 10, '2025-11-10', 'Manila Water', true),
(test_user_id, 'Internet', 1699, 'Utilities', 15, '2025-11-15', 'PLDT Fibr', true),
(test_user_id, 'Netflix', 600, 'Subscriptions', 16, '2025-11-16', 'Premium plan', true),
(test_user_id, 'Spotify', 149, 'Subscriptions', 20, '2025-11-20', 'Music streaming', true);

RAISE NOTICE '✅ Created monthly bills';

-- =====================================================
-- 4. CREATE FINANCIAL GOALS
-- =====================================================

-- Emergency Fund Goal (Active)
INSERT INTO goals (user_id, title, description, target_amount, current_amount, deadline, category, icon, color, status)
VALUES (test_user_id, 'Emergency Fund', 'Build 6 months worth of expenses', 150000, 45000, '2026-06-30', 'emergency', '🛡️', 'blue', 'active')
RETURNING id INTO test_goal_id;

-- Laptop Goal (Active)
INSERT INTO goals (user_id, title, description, target_amount, current_amount, deadline, category, icon, color, status)
VALUES (test_user_id, 'New Laptop', 'Macbook Air for work', 65000, 18000, '2026-03-31', 'electronics', '💻', 'purple', 'active');

-- Vacation Goal (Active)
INSERT INTO goals (user_id, title, description, target_amount, current_amount, deadline, category, icon, color, status)
VALUES (test_user_id, 'Japan Trip', 'Dream vacation to Tokyo', 80000, 12000, '2026-12-31', 'travel', '✈️', 'green', 'active');

-- Completed Goal
INSERT INTO goals (user_id, title, description, target_amount, current_amount, deadline, category, icon, color, status)
VALUES (test_user_id, 'New Phone', 'iPhone 14 Pro', 55000, 55000, '2025-09-30', 'electronics', '📱', 'yellow', 'completed');

RAISE NOTICE '✅ Created goals (3 active, 1 completed)';

-- =====================================================
-- 5. JOIN CHALLENGES
-- =====================================================

-- Get a challenge ID (100 Daily Challenge)
SELECT id INTO test_challenge_id 
FROM challenges 
WHERE title ILIKE '%100%daily%' 
LIMIT 1;

IF test_challenge_id IS NOT NULL THEN
  -- Join the challenge (with initial counts at 0)
  INSERT INTO user_challenges (
    user_id, 
    challenge_id, 
    status, 
    progress_percent, 
    checkins_completed, 
    checkins_required,
    points_earned,
    deadline
  ) VALUES (
    test_user_id,
    test_challenge_id,
    'active',
    0,  -- Will update after inserting check-ins
    0,  -- Will update after inserting check-ins
    20,
    0,  -- Will update after inserting check-ins
    NOW() + INTERVAL '12 days'
  ) RETURNING id INTO test_user_challenge_id;

  -- Temporarily disable the trigger to avoid conflicts
  ALTER TABLE challenge_progress DISABLE TRIGGER update_challenge_progress_trigger;

  -- Add check-in history (bulk insert now safe without trigger)
  INSERT INTO challenge_progress (user_challenge_id, progress_type, checkin_date, completed, value)
  VALUES 
    (test_user_challenge_id, 'daily_checkin', '2025-10-12', true, 100),
    (test_user_challenge_id, 'daily_checkin', '2025-10-13', true, 100),
    (test_user_challenge_id, 'daily_checkin', '2025-10-14', true, 100),
    (test_user_challenge_id, 'daily_checkin', '2025-10-15', true, 100),
    (test_user_challenge_id, 'daily_checkin', '2025-10-16', true, 100),
    (test_user_challenge_id, 'daily_checkin', '2025-10-17', true, 100),
    (test_user_challenge_id, 'daily_checkin', '2025-10-18', true, 100),
    (test_user_challenge_id, 'daily_checkin', '2025-10-19', true, 100);

  -- Re-enable the trigger
  ALTER TABLE challenge_progress ENABLE TRIGGER update_challenge_progress_trigger;

  -- Manually update the counts (since trigger was disabled)
  UPDATE user_challenges
  SET 
    checkins_completed = 8,
    progress_percent = 40,  -- 8/20 * 100 = 40%
    points_earned = 320,    -- 8 * 40 points each
    updated_at = NOW()
  WHERE id = test_user_challenge_id;

  RAISE NOTICE '✅ Joined challenge with 8 check-ins';
ELSE
  RAISE NOTICE '⚠️ No challenge found - skipping challenge data';
END IF;

-- =====================================================
-- 6. CREATE NOTIFICATIONS
-- =====================================================

INSERT INTO notifications (user_id, type, title, message, priority, is_read, metadata) VALUES
-- Unread notifications
(test_user_id, 'goal_milestone', '🎯 Goal Progress!', 'You''re 30% towards your Emergency Fund goal!', 'medium', false, '{"goal_id": "' || test_goal_id::text || '", "progress": 30}'),
(test_user_id, 'bill_due', '📅 Bill Reminder', 'Your Rent payment of ₱3,000 is due in 3 days', 'high', false, '{"amount": 3000, "due_date": "2025-11-05"}'),
(test_user_id, 'challenge_progress', '🏆 Challenge Update', 'Great job! 8 check-ins completed for ₱100 Daily Challenge', 'low', false, '{"challenge_id": "' || COALESCE(test_user_challenge_id::text, 'null') || '"}'),
(test_user_id, 'savings_reminder', '💰 Savings Tip', 'You saved ₱5,000 this month! Keep up the great work!', 'low', false, '{"amount": 5000}'),

-- Read notifications (older)
(test_user_id, 'goal_created', '🎯 New Goal Created', 'Emergency Fund goal created successfully!', 'low', true, '{"goal_id": "' || test_goal_id::text || '"}'),
(test_user_id, 'transaction_added', '💸 Expense Logged', 'Added ₱2,500 expense for Electric bill', 'low', true, '{"amount": 2500}'),
(test_user_id, 'bill_paid', '✅ Bill Paid', 'Electric Bill payment recorded', 'low', true, '{"amount": 2500}'),
(test_user_id, 'challenge_joined', '🎮 Challenge Started', 'You joined ₱100 Daily Challenge!', 'medium', true, '{}'),
(test_user_id, 'goal_milestone', '🎉 Milestone Reached', 'You reached 20% of your Laptop goal!', 'medium', true, '{}'),
(test_user_id, 'learning_complete', '📚 Module Complete', 'You completed the Budgeting module!', 'low', true, '{}');

RAISE NOTICE '✅ Created notifications (4 unread, 6 read)';

-- =====================================================
-- 7. LEARNING PROGRESS
-- =====================================================

INSERT INTO learning_progress (user_id, module_id, completed, progress_percentage) VALUES
(test_user_id, 'budgeting', true, 100),
(test_user_id, 'saving', true, 100),
(test_user_id, 'investing', true, 100),
(test_user_id, 'emergency-fund', true, 100),
(test_user_id, 'credit-debt', true, 100),
(test_user_id, 'digital-money', false, 60);

RAISE NOTICE '✅ Created learning progress (5 complete, 1 in progress)';

-- =====================================================
-- SUMMARY
-- =====================================================
RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '✅ DUMMY DATA CREATED SUCCESSFULLY!';
RAISE NOTICE '========================================';
RAISE NOTICE 'User ID: %', test_user_id;
RAISE NOTICE '';
RAISE NOTICE '📊 Data Summary:';
RAISE NOTICE '  • Transactions: 25 (3 months history)';
RAISE NOTICE '  • Monthly Bills: 6 active';
RAISE NOTICE '  • Goals: 4 (3 active, 1 completed)';
RAISE NOTICE '  • Challenges: 1 active with 8 check-ins';
RAISE NOTICE '  • Notifications: 10 (4 unread, 6 read)';
RAISE NOTICE '  • Learning: 5 modules completed';
RAISE NOTICE '';
RAISE NOTICE '🧪 Test These Features:';
RAISE NOTICE '  1. Financial Overview - Check transaction history';
RAISE NOTICE '  2. Notifications - 4 unread notifications';
RAISE NOTICE '  3. Goals - View progress on 3 active goals';
RAISE NOTICE '  4. Challenges - See active challenge progress';
RAISE NOTICE '  5. Dashboard - All stats should be populated';
RAISE NOTICE '========================================';

END $$;
