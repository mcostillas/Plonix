-- Add icon and color columns to learning_module_content table
-- Run this in Supabase SQL Editor

ALTER TABLE learning_module_content 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'BookOpen',
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue';

-- Update existing modules with default values (optional - customize as needed)
UPDATE learning_module_content 
SET icon = 'Calculator', color = 'blue'
WHERE module_id = 'budgeting';

UPDATE learning_module_content 
SET icon = 'PiggyBank', color = 'green'
WHERE module_id = 'saving';

UPDATE learning_module_content 
SET icon = 'TrendingUp', color = 'purple'
WHERE module_id = 'investing';

-- Verify the changes
SELECT module_id, module_title, icon, color FROM learning_module_content;
