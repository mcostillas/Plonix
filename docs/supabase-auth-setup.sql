-- ================================
-- PLOUNIX AUTHENTICATION & PROFILES SETUP
-- ================================

-- Enable Row Level Security on built-in auth tables
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- ================================
-- 1. USER PROFILES TABLE
-- ================================
-- Extends Supabase auth.users with additional profile information

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ================================
-- 2. USER FINANCIAL PROFILES TABLE  
-- ================================
-- Stores financial persona and AI learning data

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  financial_data JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  ai_insights JSONB DEFAULT '{}',
  persona_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can manage their own financial profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- ================================
-- 3. CHAT HISTORY TABLE (for LangChain)
-- ================================
-- Stores conversation history for personalized AI

CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL, -- Maps to user ID
  message_type TEXT NOT NULL CHECK (message_type IN ('human', 'ai')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for chat_history  
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy for chat_history
CREATE POLICY "Users can manage their own chat history" ON public.chat_history
  FOR ALL USING (auth.uid()::text = session_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON public.chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at);

-- ================================
-- 4. FINANCIAL MEMORIES TABLE (Vector Storage)
-- ================================
-- Requires vector extension for AI embeddings

-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.financial_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Maps to user ID  
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536), -- OpenAI embedding dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for financial_memories
ALTER TABLE public.financial_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policy for financial_memories
CREATE POLICY "Users can manage their own financial memories" ON public.financial_memories
  FOR ALL USING (auth.uid()::text = user_id);

-- Indexes for vector search and performance
CREATE INDEX IF NOT EXISTS idx_financial_memories_user_id ON public.financial_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_memories_embedding ON public.financial_memories 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ================================
-- 5. FUNCTIONS AND TRIGGERS
-- ================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================
-- 6. VECTOR SEARCH FUNCTIONS
-- ================================

-- Function for similarity search in financial memories
CREATE OR REPLACE FUNCTION match_financial_memories (
  query_embedding vector(1536),
  match_user_id text,
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    financial_memories.id,
    financial_memories.content,
    financial_memories.metadata,
    1 - (financial_memories.embedding <=> query_embedding) AS similarity
  FROM financial_memories
  WHERE financial_memories.user_id = match_user_id
    AND 1 - (financial_memories.embedding <=> query_embedding) > match_threshold
  ORDER BY financial_memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to clear user's memory (for privacy)
CREATE OR REPLACE FUNCTION clear_user_memory(user_uuid uuid)
RETURNS void AS $$
BEGIN
  DELETE FROM public.chat_history WHERE session_id = user_uuid::text;
  DELETE FROM public.financial_memories WHERE user_id = user_uuid::text;
  
  -- Reset AI insights but keep basic profile
  UPDATE public.user_profiles 
  SET ai_insights = '{}', persona_data = '{}', updated_at = NOW()
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 7. SAMPLE DATA (Optional)
-- ================================

-- Insert sample financial memory categories
INSERT INTO public.financial_memories (user_id, content, metadata) VALUES
-- These will be replaced with real user data
('sample-user', 'Emergency fund strategies for Filipino families', '{"type": "strategy", "category": "emergency_fund"}'),
('sample-user', 'Budgeting with 50-30-20 rule for ₱25,000 monthly income', '{"type": "strategy", "category": "budgeting"}'),
('sample-user', 'Best savings accounts in Philippines for young professionals', '{"type": "resource", "category": "banking"}')
ON CONFLICT DO NOTHING;

-- ================================
-- SETUP COMPLETE
-- ================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Plounix authentication and profile setup complete!';
  RAISE NOTICE 'Tables created: profiles, user_profiles, chat_history, financial_memories';
  RAISE NOTICE 'RLS policies enabled for secure user data isolation';
  RAISE NOTICE 'Vector extension enabled for AI memory search';
  RAISE NOTICE 'Triggers set up for automatic profile creation';
END $$;
