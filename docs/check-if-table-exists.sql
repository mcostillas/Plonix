-- Check if learning_reflections table already exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'learning_reflections';

-- If it exists, show its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'learning_reflections'
ORDER BY ordinal_position;

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'learning_reflections';
