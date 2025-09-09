# AI Personalized Memory System Documentation

## Overview

This system provides your Plounix AI with comprehensive personalized memories, allowing it to:

- **Remember user details**: Name, age, occupation, goals, preferences
- **Track conversation history**: Past interactions and context
- **Learn from interactions**: Successful strategies, user preferences, concerns
- **Provide personalized responses**: Adapt communication style and reference past conversations
- **Maintain context across sessions**: Long-term memory beyond single conversations

## Architecture

### 1. Core Components

#### `AIMemoryManager` (`lib/ai-memory.ts`)
- Main class handling all memory operations
- Stores and retrieves user context, profiles, and memories
- Analyzes conversations for insights
- Builds personalized context for AI prompts

#### `UserSessionManager` (`lib/user-session.ts`)
- Manages user sessions and IDs
- Handles session persistence across browser sessions
- Tracks user activity and session lifecycle

#### `Enhanced AI Route` (`app/api/simple-ai/route.ts`)
- Integrates memory system with OpenAI API
- Builds personalized context for each request
- Saves conversations and analyzes them for insights

### 2. Database Schema (Supabase)

Run the SQL commands in `docs/supabase-memory-schema.sql` to create:

- `user_profiles`: Personal information (name, age, occupation, etc.)
- `user_context`: Financial context, preferences, AI insights, memories
- `conversations`: Conversation sessions
- `messages`: Individual messages with metadata
- `conversation_memories`: Analyzed conversation summaries
- `chat_history`: LangChain integration support

## Implementation Steps

### Step 1: Database Setup

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the SQL commands from `docs/supabase-memory-schema.sql`
4. Verify all tables are created successfully

### Step 2: Environment Variables

Ensure you have these in your `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Integration in Your Components

#### Basic Usage in AI Assistant:

```tsx
import { useAIMemory } from '@/lib/ai-memory-hooks'

export function YourAIComponent() {
  const { userId, updateActivity } = useAIMemory()
  
  const sendMessage = async (message: string) => {
    updateActivity() // Track user activity
    
    const response = await fetch('/api/simple-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId })
    })
    
    const data = await response.json()
    return data.response
  }
}
```

#### Advanced Memory Operations:

```tsx
import { memoryManager } from '@/lib/ai-memory'

// Record user achievements
await memoryManager.recordAchievement(
  userId, 
  "Saved ₱10,000 for emergency fund", 
  "Reached 50% of emergency fund goal"
)

// Track recurring concerns
await memoryManager.trackConcern(userId, "difficulty saving money")

// Update user profile
await memoryManager.updateUserProfile(userId, {
  name: "Juan",
  age: 22,
  occupation: "College Student"
})

// Update financial context
await memoryManager.updateUserContext(userId, {
  income: 15000,
  expenses: { food: 5000, transportation: 2000 },
  goals: [{
    name: "Emergency Fund",
    target: 15000,
    current: 7500,
    deadline: "2025-12-31"
  }]
})
```

## Memory Features

### 1. Personal Profile Memory
- **Name and Demographics**: Age, occupation, education level
- **Family Context**: Family size, dependents
- **Location**: Where they live (for localized advice)

### 2. Financial Context Memory
- **Income and Expenses**: Track monthly financial situation
- **Goals**: Short and long-term financial objectives with progress
- **Preferences**: Budget style, communication style, reminder frequency

### 3. Conversation Memory
- **Recent Interactions**: Last 10 conversations for context
- **Key Topics**: Important subjects discussed
- **Emotional Tone**: User's mood and concerns
- **Action Items**: Follow-up tasks or recommendations

### 4. AI Learning Memory
- **Successful Strategies**: What advice worked well for this user
- **Challenge Areas**: Topics the user struggles with
- **Personality Notes**: Communication preferences and style
- **Recurring Concerns**: Issues the user frequently mentions

### 5. Achievement Memory
- **Milestones**: Financial goals reached
- **Important Dates**: Significant financial events
- **Progress Tracking**: How they're improving over time

## Personalization Examples

### Before (Generic Response):
> User: "I want to save money"
> AI: "Try the 50-30-20 rule: 50% needs, 30% wants, 20% savings."

### After (Personalized Response):
> User: "I want to save money"
> AI: "Hi Juan! I remember you're working on your emergency fund goal of ₱15,000. You're already at ₱7,500 - that's awesome progress! Since you mentioned last time that the envelope method works better for you than 50-30-20, try putting ₱1,000 from your ₱15,000 monthly income into a separate GCash account. You're so close to your goal!"

## Advanced Features

### 1. Adaptive Communication
The AI learns how each user prefers to communicate:
- **Formal vs Casual**: Adjusts tone based on user preference
- **Language Mix**: Learns optimal English/Tagalog ratio
- **Detail Level**: Some users want detailed explanations, others prefer quick tips

### 2. Contextual Recommendations
Based on user history:
- **Previous Success**: "Last time when you used the envelope method..."
- **Recurring Issues**: "I notice you often ask about saving for emergencies..."
- **Goal Progress**: "You're 50% closer to your laptop fund since we last talked!"

### 3. Proactive Follow-ups
- **Check Progress**: "How's your emergency fund coming along?"
- **Seasonal Advice**: "13th month pay is coming - remember your savings goal?"
- **Celebration**: "Congratulations on reaching your savings milestone!"

## Best Practices

### 1. Privacy and Data Handling
- Only store necessary information
- Allow users to view/edit their stored data
- Implement proper data retention policies
- Follow GDPR/data privacy guidelines

### 2. Memory Management
- Regularly clean old conversation data
- Summarize old conversations to save space
- Focus on recent and relevant memories
- Balance detail with performance

### 3. User Experience
- Make memory features transparent to users
- Allow users to correct AI assumptions
- Provide options to clear or reset memory
- Show users what the AI remembers about them

## Testing the System

### 1. Basic Memory Test
1. Start a conversation with the AI
2. Share some personal information (name, goal, income)
3. End the conversation
4. Start a new conversation - AI should remember the information

### 2. Learning Test
1. Try different advice approaches
2. Give feedback on what works
3. In future conversations, AI should reference successful strategies

### 3. Context Test
1. Set a financial goal
2. Report progress over multiple conversations
3. AI should track and celebrate your progress

## Troubleshooting

### Common Issues:

1. **AI doesn't remember information**
   - Check if database tables are created
   - Verify Supabase connection
   - Check user ID consistency

2. **Memory seems inconsistent**
   - Review conversation analysis logic
   - Check data extraction patterns
   - Verify context building function

3. **Performance issues**
   - Limit conversation history loaded
   - Optimize database queries
   - Consider caching frequent data

## Future Enhancements

1. **Advanced NLP Analysis**: Use AI to better extract insights from conversations
2. **Predictive Recommendations**: Suggest actions based on patterns
3. **Multi-user Support**: Family or shared account memories
4. **Export/Import**: Allow users to backup their AI memory
5. **Integration with Financial Apps**: Connect with GCash, bank APIs for automatic context

## Security Considerations

1. **Data Encryption**: Sensitive data should be encrypted at rest
2. **Access Control**: Implement proper user authentication
3. **Audit Logging**: Track who accesses memory data
4. **Data Minimization**: Only store what's necessary for personalization
5. **User Control**: Allow users to delete their memory data

This memory system transforms your AI from a stateless chatbot into a personalized financial advisor that truly knows and grows with each user!
