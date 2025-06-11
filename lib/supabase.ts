import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Tables Structure:
/*
1. conversations
   - id (uuid)
   - user_id (uuid)
   - title (text)
   - created_at (timestamp)
   - updated_at (timestamp)

2. messages
   - id (uuid)
   - conversation_id (uuid)
   - user_id (uuid)
   - content (text)
   - role ('user' | 'assistant')
   - message_type ('text' | 'tool_use' | 'receipt_scan')
   - metadata (jsonb) - for tool results, receipt data, etc.
   - created_at (timestamp)

3. user_context
   - user_id (uuid)
   - financial_data (jsonb) - income, expenses, goals
   - preferences (jsonb) - language, notification settings
   - ai_insights (jsonb) - learned patterns, recommendations
   - updated_at (timestamp)
*/
