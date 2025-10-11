-- =====================================================
-- LEARNING MODULE CONTENT - SEED DATA
-- Extracted from app/learning/[topicId]/page.tsx
-- Purpose: Populate learning_module_content table
-- =====================================================

-- 1. BUDGETING MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps,
  reflect_questions,
  sources
) VALUES (
  'budgeting',
  'Budgeting Mastery for Students',
  'Learn to manage your allowance and starting salary like a pro',
  '15 min',
  'core',
  '["50-30-20 rule", "Needs vs Wants classification", "Budget allocation strategy", "Monthly expense tracking", "Zero-based budgeting"]'::jsonb,
  ARRAY[
    'Budgeting prevents you from running out of money before next allowance/payday',
    'The 50-30-20 rule adapts to any income level - from ₱5,000 to ₱50,000',
    'Treating savings as a "need" builds wealth automatically',
    '50% for NEEDS: Food, transportation, school supplies, load',
    '30% for WANTS: Movies, coffee dates, new clothes, games',
    '20% for SAVINGS: Emergency fund, future goals'
  ],
  ARRAY[
    'Apply 50-30-20 rule to your monthly allowance/salary',
    'Track all expenses for one week to see actual spending patterns',
    'Download a budgeting app or create a simple expense tracker',
    'Open a separate savings account for your 20% allocation',
    'Calculate your monthly income first, then allocate percentages',
    'For ₱12,000 monthly: ₱6,000 needs, ₱3,600 wants, ₱2,400 savings'
  ],
  ARRAY[
    'Not tracking expenses - you cant improve what you dont measure',
    'Treating wants as needs - leads to overspending on non-essentials',
    'Not having separate savings account - savings money gets spent',
    'Budgeting too strictly - leaves no room for enjoying life',
    'Forgetting irregular expenses like birthdays, school events'
  ],
  3,
  ARRAY[
    'Based on your current allowance/salary, how would you apply the 50-30-20 rule?',
    'What spending habits would you need to change to fit this budget?',
    'What financial goal would motivate you to stick to saving 20%?'
  ],
  '[
    {
      "title": "Khan Academy - Budget Planning",
      "url": "https://www.khanacademy.org/college-careers-more/financial-literacy/xa6995ea67a8e9fdd:budgeting-and-saving/xa6995ea67a8e9fdd:budgeting/a/planning-a-budget-start",
      "type": "Educational"
    }
  ]'::jsonb
);

-- 2. SAVING MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps,
  reflect_questions,
  sources
) VALUES (
  'saving',
  'Smart Saving for Filipino Youth',
  'Discover where and how to save money for maximum growth',
  '15 min',
  'core',
  '["Digital banks vs traditional banks", "High-yield savings accounts", "PDIC insurance", "Interest rate comparison", "Emergency fund placement"]'::jsonb,
  ARRAY[
    'Digital banks offer 10-20x higher interest than traditional banks',
    'All mentioned banks are PDIC-insured (safe up to ₱500,000)',
    'Start with digital wallets for convenience, upgrade to banks for higher amounts',
    'CIMB Bank: Up to 4% annually, ₱100 minimum',
    'GCash GSave: 2.6% annually, instant access, no minimum',
    'Tonik Bank: Up to 6% annually, ₱1,000 minimum',
    '₱10,000 saved at 6% earns ₱600 vs ₱25 at traditional banks'
  ],
  ARRAY[
    'Open GCash GSave account for instant access to emergency funds',
    'Open Tonik Bank or CIMB for higher interest on main savings',
    'Split savings: ₱2,000 in GCash for emergencies, rest in high-yield bank',
    'Set up automatic transfers to savings account every payday',
    'Research digital banks: CIMB, ING, or Tonik this week',
    'Compare interest rates: Traditional (0.25%) vs Digital (4-6%)'
  ],
  ARRAY[
    'Keeping all money in traditional bank - losing to inflation',
    'Not comparing interest rates - missing 10x higher earnings',
    'Using only one savings account - no separation of emergency vs goals',
    'Not setting up automatic transfers - savings happen by chance',
    'Choosing convenience over growth for all savings'
  ],
  3,
  ARRAY[
    'Which digital bank or wallet appeals most to you and why?',
    'How would you split your savings between convenience and growth?',
    'What savings milestone would you celebrate first?'
  ],
  '[
    {
      "title": "BSP List of Digital Banks",
      "url": "https://www.bsp.gov.ph/SitePages/Default.aspx",
      "type": "Government"
    }
  ]'::jsonb
);

-- 3. INVESTING MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps,
  reflect_questions,
  sources
) VALUES (
  'investing',
  'Investment Basics for Beginners',
  'Start building wealth with beginner-friendly investments',
  '18 min',
  'core',
  '["Investing vs Saving", "Risk and reward tradeoff", "Mutual funds", "Stock market basics", "Compound growth", "Investment timeline", "Diversification"]'::jsonb,
  ARRAY[
    'Investing puts money to work to earn more money over time',
    'Philippines inflation 3-4% yearly - savings accounts lose purchasing power',
    'Start investing early to harness compound growth',
    'Mutual funds offer professional management for beginners',
    'Invest money you wont need for at least 3-5 years',
    'BPI Investment Funds: ₱1,000 minimum, professional management',
    'COL Financial: ₱1,000 minimum, trade Philippine stocks',
    'Start with ₱1,000 monthly in balanced mutual fund'
  ],
  ARRAY[
    'Start with ₱10,000 in BPI Balanced Fund to learn',
    'Invest ₱2,000 monthly after building emergency fund',
    'Visit investment platform websites: BPI, BDO, COL Financial',
    'Calculate your potential investment using 20% of income rule',
    'Set up separate "investment fund" savings account',
    'Learn for 6 months before exploring individual stocks',
    'Only invest money you can afford not to touch for 5+ years'
  ],
  ARRAY[
    'Investing before building emergency fund - forced to withdraw at loss',
    'Investing money needed in next 3 years - not enough time to recover from losses',
    'Putting all money in one investment - no diversification',
    'Day trading as beginner - 90% of day traders lose money',
    'Following "hot tips" without research - gambling not investing'
  ],
  3,
  ARRAY[
    'What long-term financial goal would motivate you to start investing?',
    'How comfortable are you with risk that investment might lose value short-term?',
    'What investment platform (BPI, BDO, COL) seems most suitable for you?'
  ],
  '[
    {
      "title": "SEC Investor Education",
      "url": "https://www.sec.gov.ph/#gsc.tab=0",
      "type": "Government"
    }
  ]'::jsonb
);

-- 4. EMERGENCY FUND MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps,
  reflect_questions,
  sources
) VALUES (
  'emergency-fund',
  'Emergency Fund Essentials',
  'Build your financial safety net with smart emergency fund strategies',
  '15 min',
  'essential',
  '["Emergency fund definition", "3-6 months expenses rule", "Emergency vs savings distinction", "Accessible savings placement", "Emergency fund targets by life stage"]'::jsonb,
  ARRAY[
    'Emergency fund is money for unexpected expenses only',
    'Students need ₱10,000-15,000 minimum emergency fund',
    'Working professionals need 3-6 months of expenses',
    'Emergency funds prevent borrowing money or going into debt',
    'Keep emergency money separate from regular savings',
    'Emergency funds should be accessible within 24 hours',
    'Common emergencies: Medical (₱5k-15k), laptop/phone repairs (₱10k-40k), job loss'
  ],
  ARRAY[
    'Calculate your monthly expenses first',
    'Students: Target ₱10,000-15,000 minimum',
    'Fresh graduates: Target 3 months expenses (₱30k-60k)',
    'Working professionals: Target 6 months expenses',
    'Keep in GCash GSave for instant access (2.6% interest)',
    'Or CIMB Bank for higher interest (4%) with quick withdrawal',
    'Build gradually: Save ₱500-1,000 monthly if starting',
    'Celebrate milestones: ₱5,000, ₱10,000, ₱20,000 achieved'
  ],
  ARRAY[
    'Mixing emergency fund with regular savings - gets spent',
    'Not having emergency fund - forced to borrow when crisis hits',
    'Investing emergency fund - cant access quickly without losses',
    'Target too high initially - discouragement leads to not starting',
    'Using emergency fund for non-emergencies - depletes safety net'
  ],
  3,
  ARRAY[
    'What emergencies worry you most and how much would they cost?',
    'Based on your monthly expenses, what is your emergency fund target?',
    'How long would it take you to build your target emergency fund?'
  ],
  '[
    {
      "title": "BSP Financial Education",
      "url": "https://www.bsp.gov.ph/SitePages/Default.aspx",
      "type": "Government"
    }
  ]'::jsonb
);

-- 5. CREDIT AND DEBT MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps,
  reflect_questions
) VALUES (
  'credit-debt',
  'Credit and Debt Management',
  'Master credit cards, loans, and debt payoff strategies for Filipino youth',
  '20 min',
  'essential',
  '["Good debt vs bad debt", "Credit score basics", "Credit card management", "Debt avalanche method", "Debt snowball method", "Interest rate impact"]'::jsonb,
  ARRAY[
    'Good debt: Education, business, real estate (appreciating assets)',
    'Bad debt: Credit card debt, consumer loans for wants',
    'Credit cards charge 3-3.5% monthly interest (42% annually)',
    'Always pay credit card in full to avoid interest charges',
    'Credit score affects future loan approvals and interest rates',
    'Debt avalanche: Pay highest interest rate first',
    'Debt snowball: Pay smallest balance first for motivation'
  ],
  ARRAY[
    'Pay credit card in full every month to avoid interest',
    'Use credit cards for rewards only if you can pay in full',
    'If in debt: List all debts with interest rates and balances',
    'Prioritize highest interest rate debt first (avalanche method)',
    'Or pay smallest debt first for quick wins (snowball method)',
    'Avoid new debt while paying off existing debt',
    'Consider balance transfer to lower interest if possible',
    'Track debt payoff progress monthly to stay motivated'
  ],
  ARRAY[
    'Paying only minimum on credit cards - decades to payoff',
    'Using credit card for wants without payoff plan',
    'Not knowing interest rates on existing debts',
    'Taking on new debt while paying off old debt',
    'Ignoring credit score - affects future financial opportunities'
  ],
  3,
  ARRAY[
    'Do you currently have any debts and what are the interest rates?',
    'Which debt payoff method (avalanche or snowball) appeals to you?',
    'What strategies will you use to avoid bad debt in the future?'
  ]
);

-- 6. DIGITAL MONEY MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes
) VALUES (
  'digital-money',
  'Digital Money and Financial Tech',
  'Navigate GCash, PayMaya, and digital banking safely and effectively',
  '15 min',
  'essential',
  '["E-wallet security", "Digital banking features", "Online payment safety", "QR code payments", "Digital money management"]'::jsonb,
  ARRAY[
    'E-wallets (GCash, PayMaya) provide convenience and higher interest',
    'Digital banks (CIMB, Tonik, ING) offer better rates than traditional banks',
    'All legitimate banks are PDIC-insured up to ₱500,000',
    'Enable two-factor authentication for all financial apps',
    'Never share OTP codes with anyone',
    'Use strong unique passwords for each financial app'
  ],
  ARRAY[
    'Enable 2FA (two-factor authentication) on all apps',
    'Use biometric login (fingerprint/face) when available',
    'Check transaction history weekly for unauthorized charges',
    'Link multiple funding sources for flexibility',
    'Keep small amount in e-wallet, larger in digital bank',
    'Never click suspicious links claiming to be from banks',
    'Verify recipient details before sending money'
  ],
  ARRAY[
    'Using same password for all financial apps - one breach compromises all',
    'Sharing OTP codes - enables unauthorized access',
    'Not checking transaction history - miss fraudulent charges',
    'Keeping large amounts in e-wallets - use banks for larger sums',
    'Clicking phishing links - fake bank websites steal credentials'
  ]
);

-- =====================================================
-- Verification Query
-- =====================================================
-- After running this seed file, verify with:
-- SELECT module_id, module_title, array_length(key_takeaways, 1) as takeaway_count 
-- FROM learning_module_content 
-- ORDER BY module_id;
