import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient<Database> | null = null

function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings.'
    )
  }

  supabaseInstance = createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  )

  return supabaseInstance
}

// Export a getter instead of the client directly
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get: (target, prop) => {
    const client = getSupabaseClient()
    return (client as any)[prop]
  }
})

// Database Tables Structure for Authentication:
/*
Built-in Supabase Auth Tables:
- auth.users - User accounts and metadata
- auth.sessions - Active user sessions

Custom Tables:
1. profiles (extends auth.users)
   - id (uuid, references auth.users.id)
   - email (text)
   - full_name (text)
   - avatar_url (text)
   - created_at (timestamp)
   - updated_at (timestamp)

2. chat_history (for LangChain memory)
   - id (uuid)
   - session_id (text) - maps to user ID
   - message_type ('human' | 'ai')
   - content (text)
   - metadata (jsonb)
   - created_at (timestamp)

3. financial_memories (for vector storage)
   - id (uuid)
   - user_id (text) - maps to user ID
   - content (text)
   - metadata (jsonb)
   - embedding (vector)
   - created_at (timestamp)

4. user_profiles (financial persona data)
   - user_id (uuid, references auth.users.id)
   - financial_data (jsonb) - income, expenses, goals
   - preferences (jsonb) - language, notification settings
   - ai_insights (jsonb) - learned patterns, recommendations
   - updated_at (timestamp)
*/
