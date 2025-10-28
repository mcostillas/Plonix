-- Add missing learning modules to database
-- Run this in Supabase SQL Editor

-- 7. INSURANCE BASICS MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  icon,
  color,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps
) VALUES (
  'insurance',
  'Insurance Basics',
  'Protection strategies for Filipino families - PhilHealth, SSS, and life insurance',
  '15 min',
  'essential',
  'Shield',
  'blue',
  ARRAY['Health insurance basics', 'Government benefits', 'PhilHealth coverage', 'SSS contributions', 'Life insurance'],
  ARRAY[
    'Health insurance protects you from medical emergencies',
    'PhilHealth and SSS provide essential government benefits',
    'Start insurance coverage early for better rates',
    'Understand what your insurance covers before you need it'
  ],
  ARRAY[
    'Register for PhilHealth as soon as you start working',
    'Contribute to SSS for retirement and emergency benefits',
    'Know your PhilHealth benefits and coverage limits',
    'Keep insurance documents organized and accessible',
    'Review insurance policies annually'
  ],
  ARRAY[
    'Not enrolling in government insurance programs',
    'Waiting until emergency to understand coverage',
    'Forgetting to update beneficiary information',
    'Not keeping proof of premium payments'
  ],
  3
);

-- 8. FINANCIAL GOALS MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  icon,
  color,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps
) VALUES (
  'financial-goals',
  'Financial Goals',
  'SMART goal setting for laptops, travel, and major life purchases',
  '15 min',
  'essential',
  'Target',
  'purple',
  ARRAY['SMART goals', 'Goal tracking', 'Milestone planning', 'Savings timeline', 'Priority setting'],
  ARRAY[
    'SMART goals are Specific, Measurable, Achievable, Relevant, Time-bound',
    'Breaking big goals into milestones makes them achievable',
    'Tracking progress keeps you motivated',
    'Prioritize goals based on urgency and importance'
  ],
  ARRAY[
    'Write down specific goals with target dates',
    'Calculate how much to save monthly for each goal',
    'Set up automatic transfers to goal-specific accounts',
    'Review and adjust goals quarterly',
    'Celebrate milestones to stay motivated'
  ],
  ARRAY[
    'Setting vague goals without specific targets',
    'Not breaking large goals into smaller steps',
    'Forgetting to track progress regularly',
    'Setting too many goals at once',
    'Giving up when facing setbacks'
  ],
  3
);

-- 9. MONEY MINDSET MODULE
INSERT INTO learning_module_content (
  module_id,
  module_title,
  module_description,
  duration,
  category,
  icon,
  color,
  key_concepts,
  key_takeaways,
  practical_tips,
  common_mistakes,
  total_steps
) VALUES (
  'money-mindset',
  'Money Mindset',
  'Transform your relationship with money and overcome limiting beliefs',
  '15 min',
  'essential',
  'Brain',
  'yellow',
  ARRAY['Money beliefs', 'Abundance mindset', 'Financial psychology', 'Money scripts', 'Wealth consciousness'],
  ARRAY[
    'Your beliefs about money shape your financial behaviors',
    'Scarcity mindset limits financial growth',
    'Money is a tool, not a measure of self-worth',
    'Changing your money mindset takes time and practice'
  ],
  ARRAY[
    'Identify your limiting beliefs about money',
    'Practice gratitude for what you have',
    'Replace negative money thoughts with positive affirmations',
    'Learn from wealthy mentors and success stories',
    'Focus on value creation, not just earning'
  ],
  ARRAY[
    'Believing money is evil or corrupting',
    'Thinking wealth is only for others',
    'Feeling guilty about wanting financial success',
    'Comparing your finances to others',
    'Not addressing emotional spending triggers'
  ],
  3
);

-- Verify the additions
SELECT module_id, module_title, category, icon, color 
FROM learning_module_content 
ORDER BY category, module_id;
