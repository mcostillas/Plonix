-- Add test_type field to learning_module_content table
-- This allows admins to specify different types of tests in the Apply section

-- Add the column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'learning_module_content' 
    AND column_name = 'test_type'
  ) THEN
    ALTER TABLE learning_module_content 
    ADD COLUMN test_type TEXT DEFAULT 'multiple_choice';
    
    -- Add a check constraint for valid test types
    ALTER TABLE learning_module_content
    ADD CONSTRAINT test_type_check 
    CHECK (test_type IN ('multiple_choice', 'true_false', 'fill_blank', 'scenario_based', 'calculation'));
    
    RAISE NOTICE 'Added test_type column to learning_module_content table';
  ELSE
    RAISE NOTICE 'test_type column already exists';
  END IF;
END $$;

-- Update existing modules to have multiple_choice as default
UPDATE learning_module_content 
SET test_type = 'multiple_choice' 
WHERE test_type IS NULL;

-- Create index for faster filtering by test type
CREATE INDEX IF NOT EXISTS idx_learning_module_test_type 
ON learning_module_content(test_type);

COMMENT ON COLUMN learning_module_content.test_type IS 'Type of test in Apply section: multiple_choice, true_false, fill_blank, scenario_based, or calculation';
