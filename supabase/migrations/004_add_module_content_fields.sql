-- Add individual columns for Learn, Apply, and Reflect content
-- This makes it easier to manage and edit modules in the admin panel

-- Learn Stage columns
ALTER TABLE learning_module_content 
ADD COLUMN IF NOT EXISTS learn_title TEXT,
ADD COLUMN IF NOT EXISTS learn_text TEXT,
ADD COLUMN IF NOT EXISTS learn_key_points TEXT[],
ADD COLUMN IF NOT EXISTS learn_sources TEXT[];

-- Apply Stage columns
ALTER TABLE learning_module_content
ADD COLUMN IF NOT EXISTS apply_title TEXT,
ADD COLUMN IF NOT EXISTS apply_test_type TEXT DEFAULT 'multiple_choice',
ADD COLUMN IF NOT EXISTS apply_scenario TEXT,
ADD COLUMN IF NOT EXISTS apply_task TEXT,
ADD COLUMN IF NOT EXISTS apply_options TEXT[],
ADD COLUMN IF NOT EXISTS apply_correct_answer TEXT,
ADD COLUMN IF NOT EXISTS apply_explanation TEXT;

-- Reflect Stage columns
ALTER TABLE learning_module_content
ADD COLUMN IF NOT EXISTS reflect_title TEXT,
ADD COLUMN IF NOT EXISTS reflect_questions TEXT[],
ADD COLUMN IF NOT EXISTS reflect_action_items TEXT[];

-- Add constraint for test types (only add if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'test_type_check'
  ) THEN
    ALTER TABLE learning_module_content
    ADD CONSTRAINT test_type_check 
    CHECK (apply_test_type IN ('multiple_choice', 'true_false', 'fill_blank', 'scenario_based', 'calculation'));
  END IF;
END $$;

-- Add icon and color columns for UI
ALTER TABLE learning_module_content
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'BookOpen',
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue';

-- Update existing modules to have default values
UPDATE learning_module_content 
SET 
  learn_title = COALESCE(learn_title, 'Learn'),
  apply_title = COALESCE(apply_title, 'Apply'),
  reflect_title = COALESCE(reflect_title, 'Reflect'),
  apply_test_type = COALESCE(apply_test_type, 'multiple_choice'),
  icon = COALESCE(icon, 'BookOpen'),
  color = COALESCE(color, 'blue')
WHERE learn_title IS NULL 
   OR apply_title IS NULL 
   OR reflect_title IS NULL;

-- Create index for test type filtering
CREATE INDEX IF NOT EXISTS idx_learning_module_test_type 
ON learning_module_content(apply_test_type);

COMMENT ON COLUMN learning_module_content.apply_test_type IS 'Type of test in Apply section: multiple_choice, true_false, fill_blank, scenario_based, or calculation';
