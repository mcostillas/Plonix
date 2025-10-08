-- ================================
-- SCHEDULED PAYMENTS TABLE SETUP
-- ================================
-- Feature: Recurring expense tracking for better budgeting
-- Use Case: Student pays rent on 4th, bills on 15th, wants to see "available money" after fixed expenses

-- Create scheduled_payments table
CREATE TABLE IF NOT EXISTS public.scheduled_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g., "Dormitory Rent", "Internet Bill"
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL, -- e.g., "Housing", "Utilities", "Subscriptions"
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31), -- Day of month (1-31)
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  description TEXT, -- Optional notes
  is_active BOOLEAN DEFAULT true, -- Can disable without deleting
  next_due_date DATE, -- Calculated field for convenience
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own scheduled payments
CREATE POLICY "Users can view their own scheduled payments" 
  ON public.scheduled_payments
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled payments" 
  ON public.scheduled_payments
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled payments" 
  ON public.scheduled_payments
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled payments" 
  ON public.scheduled_payments
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scheduled_payments_user_id ON public.scheduled_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_payments_due_day ON public.scheduled_payments(due_day);
CREATE INDEX IF NOT EXISTS idx_scheduled_payments_next_due_date ON public.scheduled_payments(next_due_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_payments_active ON public.scheduled_payments(is_active);

-- Function to calculate next due date
CREATE OR REPLACE FUNCTION calculate_next_due_date(due_day INTEGER, frequency TEXT)
RETURNS DATE AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  current_year INTEGER := EXTRACT(YEAR FROM current_date);
  current_month INTEGER := EXTRACT(MONTH FROM current_date);
  current_day INTEGER := EXTRACT(DAY FROM current_date);
  next_date DATE;
BEGIN
  IF frequency = 'monthly' THEN
    -- If due day hasn't passed this month, use this month
    IF current_day <= due_day THEN
      next_date := make_date(current_year, current_month, LEAST(due_day, extract(days from date_trunc('month', current_date) + interval '1 month - 1 day')::integer));
    ELSE
      -- Use next month
      IF current_month = 12 THEN
        next_date := make_date(current_year + 1, 1, LEAST(due_day, 31));
      ELSE
        next_date := make_date(current_year, current_month + 1, LEAST(due_day, extract(days from date_trunc('month', make_date(current_year, current_month + 1, 1)) + interval '1 month - 1 day')::integer));
      END IF;
    END IF;
  ELSE
    -- For now, default to monthly behavior for other frequencies
    -- Can be expanded later for weekly, quarterly, yearly
    next_date := calculate_next_due_date(due_day, 'monthly');
  END IF;
  
  RETURN next_date;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update next_due_date
CREATE OR REPLACE FUNCTION update_next_due_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.next_due_date := calculate_next_due_date(NEW.due_day, NEW.frequency);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_next_due_date
  BEFORE INSERT OR UPDATE ON public.scheduled_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_next_due_date();

-- Function to get current month's scheduled expenses for a user
CREATE OR REPLACE FUNCTION get_monthly_scheduled_expenses(p_user_id UUID)
RETURNS TABLE (
  total_amount DECIMAL(12,2),
  payment_count INTEGER,
  payments JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(amount), 0) as total_amount,
    COUNT(*)::INTEGER as payment_count,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'amount', amount,
          'category', category,
          'due_day', due_day,
          'next_due_date', next_due_date,
          'description', description
        )
      ), 
      '[]'::jsonb
    ) as payments
  FROM public.scheduled_payments 
  WHERE user_id = p_user_id 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Sample data (commented out - uncomment to test)
/*
INSERT INTO public.scheduled_payments (user_id, name, amount, category, due_day, description) VALUES
  (auth.uid(), 'Dormitory Rent', 3500.00, 'Housing', 4, 'Monthly dorm payment'),
  (auth.uid(), 'Internet Bill', 1200.00, 'Utilities', 15, 'Fiber internet subscription'),
  (auth.uid(), 'Phone Bill', 800.00, 'Utilities', 20, 'Mobile plan'),
  (auth.uid(), 'Utilities', 1000.00, 'Utilities', 25, 'Electricity and water');
*/

-- ================================
-- USAGE EXAMPLES
-- ================================

-- Get all scheduled payments for current user:
-- SELECT * FROM scheduled_payments WHERE user_id = auth.uid() AND is_active = true ORDER BY due_day;

-- Get monthly total and breakdown:
-- SELECT * FROM get_monthly_scheduled_expenses(auth.uid());

-- Calculate available money (to be used in dashboard):
-- WITH monthly_income AS (
--   SELECT COALESCE(SUM(amount), 0) as total_income
--   FROM transactions 
--   WHERE user_id = auth.uid() 
--     AND transaction_type = 'income'
--     AND date >= date_trunc('month', CURRENT_DATE)
-- ),
-- scheduled_expenses AS (
--   SELECT total_amount as scheduled_total
--   FROM get_monthly_scheduled_expenses(auth.uid())
-- )
-- SELECT 
--   mi.total_income,
--   se.scheduled_total,
--   (mi.total_income - se.scheduled_total) as available_money
-- FROM monthly_income mi, scheduled_expenses se;

-- ================================
-- SETUP COMPLETE
-- ================================

COMMENT ON TABLE public.scheduled_payments IS 'Tracks recurring payments like rent, bills, subscriptions for better budgeting';
COMMENT ON FUNCTION get_monthly_scheduled_expenses IS 'Returns total scheduled expenses and payment details for current month';
COMMENT ON FUNCTION calculate_next_due_date IS 'Calculates the next due date based on due day and frequency';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Scheduled Payments feature setup complete!';
  RAISE NOTICE '📋 Table created: scheduled_payments';
  RAISE NOTICE '🔒 RLS policies enabled for secure user data isolation';
  RAISE NOTICE '⚡ Functions created: get_monthly_scheduled_expenses, calculate_next_due_date';
  RAISE NOTICE '🎯 Ready to track recurring expenses and show available money!';
END $$;