# LangChain Enhanced Memory System for Plounix AI

## Overview

Your Plounix AI now uses **LangChain's advanced memory capabilities** combined with **vector storage** and **automatic conversation analysis**. This provides:

- **Conversation Memory**: Automatic summarization when conversations get long
- **Vector Memory**: Semantic search through past interactions and insights
- **Financial Persona**: AI learns and adapts to each user's financial personality
- **Automatic Insight Extraction**: AI analyzes conversations to extract financial preferences, goals, and strategies

## 🧠 How LangChain Memory Works

### 1. **ConversationSummaryBufferMemory**
- Keeps recent messages in full detail
- Automatically summarizes older conversations when token limit is reached
- Maintains context while preventing memory overflow
- Stored in Supabase `chat_history` table

### 2. **VectorStoreRetrieverMemory** 
- Converts conversations into embeddings for semantic search
- Finds relevant past conversations based on meaning, not just keywords
- Stored in Supabase `financial_memories` table with vector similarity search
- Retrieves top 5 most relevant memories for each conversation

### 3. **Financial Persona Learning**
- Automatically builds user profile from conversations
- Tracks successful strategies, challenges, and preferences
- Adapts communication style based on user interactions
- Stores personality insights for personalized responses

## 🚀 Implementation Features

### Enhanced Memory Capabilities

```typescript
// Automatic conversation analysis
await langchainMemory.addConversation(userId, userMessage, aiResponse)

// Build comprehensive context
const context = await langchainMemory.buildEnhancedContext(userId, currentInput)

// Update financial persona
await langchainMemory.updateFinancialPersona(userId, {
  financialProfile: {
    monthlyIncome: 25000,
    budgetStyle: 'envelope',
    goals: ['Emergency fund', 'Laptop savings'],
    successfulStrategies: ['GCash auto-save', '50-30-20 rule']
  },
  personalContext: {
    name: 'Juan',
    age: 22,
    occupation: 'College Student'
  }
})
```

### Automatic Insight Extraction

The AI automatically extracts and stores:
- **Financial amounts** mentioned (income, expenses, goals)
- **Strategies** that work for the user
- **Preferences** in budgeting and communication
- **Goals** and their progress
- **Personal information** (age, job, location)
- **Concerns** and challenges

### Vector Semantic Search

Instead of just looking at recent messages, the AI can find relevant past conversations:
- User asks about "saving money" → AI finds past successful savings strategies
- User mentions "emergency fund" → AI retrieves previous emergency fund discussions
- User shares concerns → AI references similar past challenges and solutions

## 📊 Database Schema

### Required Tables (run `docs/langchain-vector-schema.sql`):

1. **`chat_history`** - LangChain conversation storage
2. **`financial_memories`** - Vector embeddings for semantic search
3. **Enable vector extension** for similarity search

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Financial memories with vector embeddings
CREATE TABLE financial_memories (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536), -- OpenAI embedding dimension
  created_at TIMESTAMP
);
```

## 🔧 Setup Steps

### 1. Install Dependencies
```bash
npm install @langchain/community
```

### 2. Database Setup
```sql
-- Run the SQL commands in docs/langchain-vector-schema.sql
-- This enables vector storage and similarity search
```

### 3. Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Component Integration
```tsx
import { useLangChainMemory } from '@/lib/langchain-memory-hooks'

function YourComponent() {
  const { sendMessageWithMemory, updateUserProfile } = useLangChainMemory()
  
  // Use enhanced memory in your chat
  const handleMessage = async (message: string) => {
    const result = await sendMessageWithMemory(message)
    return result.response
  }
}
```

## 💡 Memory Examples

### Before (No Memory):
```
User: "I want to save money"
AI: "Try the 50-30-20 rule"
```

### After (LangChain Memory):
```
User: "I want to save money"
AI: "Hi Juan! I remember you mentioned struggling with impulse buying on gadgets. Since the envelope method worked really well for you last month when you saved ₱3,000, let's use that again. Based on your ₱25,000 monthly income, try putting ₱5,000 in a separate GCash account for savings. You're already 40% towards your ₱15,000 emergency fund goal!"
```

## 🔄 Memory Flow

1. **User sends message** → Stored in conversation memory
2. **AI analyzes context** → Retrieves relevant past memories via vector search
3. **AI generates response** → Uses comprehensive context including persona and history
4. **Conversation stored** → Both user and AI messages saved
5. **Insights extracted** → AI automatically identifies and stores financial insights
6. **Persona updated** → User profile and preferences updated based on conversation

## 🎯 Advanced Features

### 1. Automatic Conversation Summarization
- When conversations exceed 3000 tokens, LangChain automatically summarizes older parts
- Keeps recent details while maintaining long-term context
- Prevents memory overflow while preserving important information

### 2. Semantic Memory Search
- Finds relevant past conversations based on meaning
- "Emergency fund" matches with "unexpected expenses", "financial cushion", etc.
- Much more intelligent than keyword matching

### 3. Financial Persona Evolution
- AI learns communication preferences over time
- Tracks what advice works vs doesn't work for each user
- Adapts budgeting recommendations based on user success patterns

### 4. Multi-layered Context
```
Current Input: "I need help with budgeting"

Retrieved Context:
- Recent conversation about struggling with food expenses
- Past success with envelope method (vector search)
- User profile: 22yo student, ₱25k income
- Personality: prefers visual tools, responds well to encouragement
- Goals: Emergency fund (40% complete), Laptop fund (just started)
```

## 🛠️ API Endpoints

### Enhanced AI Chat
```
POST /api/simple-ai
Body: { message: "string", userId: "string" }
Response: { response: "string", memorySystem: "langchain-enhanced" }
```

### Memory Management
```
GET /api/memory-summary?userId=user123
POST /api/clear-memory { userId: "user123" }
```

## 🔒 Privacy & Security

### Memory Management
- Users can view what the AI remembers about them
- Clear memory option for privacy
- Gradual memory fade for old, irrelevant information
- Secure storage with row-level security in Supabase

### Data Types Stored
- ✅ Financial preferences and successful strategies
- ✅ Goals and progress tracking
- ✅ Communication style preferences
- ❌ Sensitive financial details (account numbers, passwords)
- ❌ Personal secrets or private information

## 🚨 Troubleshooting

### Common Issues:

1. **Vector search not working**
   - Ensure `vector` extension is enabled in Supabase
   - Check if `financial_memories` table exists
   - Verify OpenAI embeddings API key

2. **Memory not persisting**
   - Check Supabase connection
   - Verify `chat_history` table permissions
   - Ensure user ID consistency

3. **Slow responses**
   - Vector search adds some latency
   - Consider reducing `k` parameter in retriever
   - Optimize embedding batch size

## 🔮 Future Enhancements

1. **Multi-Modal Memory**: Store and recall images, receipts, charts
2. **Collaborative Memory**: Family or shared account insights  
3. **Predictive Memory**: Anticipate user needs based on patterns
4. **Memory Export**: Allow users to download their AI memory data
5. **Memory Analytics**: Insights into user's financial journey over time

## 🎉 Benefits Over Simple Memory

| Feature | Simple Memory | LangChain Memory |
|---------|---------------|------------------|
| Context Length | Limited by tokens | Automatic summarization |
| Relevance | Recent messages only | Semantic search across all history |
| Learning | Manual pattern matching | Automatic insight extraction |
| Personalization | Basic preferences | Full financial persona |
| Scalability | Limited to small conversations | Handles months of conversations |
| Intelligence | Keyword-based | Meaning-based retrieval |

Your AI now has a **PhD in remembering and understanding** each user's unique financial journey! 🎓💰
