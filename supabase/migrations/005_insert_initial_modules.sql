-- Insert initial learning modules from hardcoded arrays into learning_module_content table

-- Core Topics (3 modules)
INSERT INTO learning_module_content (
  module_id, 
  module_title, 
  module_description,
  duration,
  category,
  icon,
  color,
  total_steps,
  created_at,
  updated_at
) VALUES
-- Budgeting
(
  'budgeting',
  'Budgeting',
  'Master the 50-30-20 rule and create budgets that work with Filipino lifestyle and income levels.',
  '15 min',
  'core',
  'Calculator',
  'blue',
  3,
  NOW(),
  NOW()
),
-- Saving
(
  'saving',
  'Saving',
  'Discover where to save money for maximum growth with digital banks and high-interest accounts.',
  '20 min',
  'core',
  'PiggyBank',
  'green',
  3,
  NOW(),
  NOW()
),
-- Investing
(
  'investing',
  'Investing',
  'Start building wealth with beginner-friendly Philippine investments like mutual funds and stocks.',
  '25 min',
  'core',
  'TrendingUp',
  'purple',
  3,
  NOW(),
  NOW()
),
-- Essential Modules (6 modules)
-- Emergency Fund
(
  'emergency-fund',
  'Emergency Fund',
  'Build your financial safety net with emergency funds designed for Filipino youth.',
  '20 min',
  'essential',
  'Shield',
  'orange',
  3,
  NOW(),
  NOW()
),
-- Credit & Debt
(
  'credit-debt',
  'Credit & Debt',
  'Master credit cards, loans, and debt management to avoid common traps.',
  '25 min',
  'essential',
  'CreditCard',
  'red',
  3,
  NOW(),
  NOW()
),
-- Digital Money
(
  'digital-money',
  'Digital Money',
  'Navigate GCash, PayMaya, and online banking like a pro.',
  '15 min',
  'essential',
  'Globe',
  'green',
  3,
  NOW(),
  NOW()
),
-- Insurance Basics
(
  'insurance',
  'Insurance Basics',
  'Protection strategies for Filipino families - PhilHealth, SSS, and life insurance.',
  '30 min',
  'essential',
  'Shield',
  'blue',
  3,
  NOW(),
  NOW()
),
-- Financial Goals
(
  'financial-goals',
  'Financial Goals',
  'SMART goal setting for laptops, travel, and major life purchases.',
  '15 min',
  'essential',
  'Target',
  'purple',
  3,
  NOW(),
  NOW()
),
-- Money Mindset
(
  'money-mindset',
  'Money Mindset',
  'Transform your relationship with money and overcome limiting beliefs.',
  '20 min',
  'essential',
  'Brain',
  'yellow',
  3,
  NOW(),
  NOW()
)
ON CONFLICT (module_id) DO NOTHING;

-- Create index on module_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_learning_module_id ON learning_module_content(module_id);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_learning_module_category ON learning_module_content(category);
