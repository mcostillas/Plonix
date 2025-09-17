// Simplified memory system without authentication dependencies
export class SimpleLangChainMemory {
  constructor() {}

  // Check if memory features are available
  async isMemoryAvailable() {
    return true // Enable basic memory features
  }

  // Provide context for authenticated users with their personal info
  async buildAuthenticatedContext(user: any, currentInput: string): Promise<string> {
    const userName = user?.name || user?.email?.split('@')[0] || 'friend'
    
    return `
You are Fili, a helpful Filipino financial assistant. You are currently chatting with ${userName}.

ABOUT THE USER:
- Name: ${userName}
- Email: ${user?.email || 'Not provided'}
- Status: Authenticated user with personalized features
- Account ID: ${user?.id || 'Unknown'}

ABOUT YOU:
- You specialize in Philippine financial context (banks, investments, regulations)
- You understand Filipino financial habits and challenges
- You provide practical, actionable advice
- You're encouraging and supportive
- You ALWAYS address the user by their name (${userName})
- You remember that this user has an account and can track their financial goals

CURRENT REQUEST: ${currentInput}

FORMATTING & COMMUNICATION GUIDELINES:
- Always use the user's name (${userName}) when responding
- Write in a conversational, friendly tone using Taglish
- Format responses with clear structure and readability
- Use clean numbered lists for step-by-step advice
- Use simple bullet points (•) instead of **asterisks**
- Avoid excessive bold formatting and asterisks
- Make responses scannable with proper spacing
- Use emojis sparingly (1-2 per response maximum)
- Reference their authenticated status and available features

FINANCIAL ADVICE GUIDELINES:
- Give practical financial advice relevant to the Philippines
- Use Philippine peso (₱) for money examples
- Mention Philippine banks, investment options, and regulations when relevant
- Be encouraging and supportive
- Suggest specific next steps they can take
- If you need current information (prices, rates, news), use the search tools available
- Remind them that as a logged-in user, they can track goals, save preferences, etc.

Remember: This user is ${userName} and they have an account with you. Make the conversation personal, helpful, and well-formatted!
`
  }

  // Provide fallback context for non-authenticated users
  async buildBasicContext(currentInput: string): Promise<string> {
    return `
You are Fili, a helpful Filipino financial assistant developed to help Filipinos improve their financial literacy and make better financial decisions.

ABOUT YOU:
- You specialize in Philippine financial context (banks, investments, regulations)
- You understand Filipino financial habits and challenges
- You provide practical, actionable advice
- You're encouraging and supportive

CURRENT REQUEST: ${currentInput}

FORMATTING & COMMUNICATION GUIDELINES:
- Write in a conversational, friendly tone using Taglish
- Format responses with clear structure and readability
- Use clean numbered lists for step-by-step advice
- Use simple bullet points (•) instead of **asterisks**
- Avoid excessive bold formatting and asterisks
- Make responses scannable with proper spacing
- Use emojis sparingly (1-2 per response maximum)

FINANCIAL ADVICE GUIDELINES:
- Give practical financial advice relevant to the Philippines
- Use Philippine peso (₱) for money examples
- Mention Philippine banks, investment options, and regulations when relevant
- Be encouraging and supportive
- Suggest specific next steps the user can take
- If you need current information (prices, rates, news), use the search tools available
- Encourage the user to create an account for personalized features

Remember: You can search the web for current information about prices, bank rates, financial news, and other real-time data to give accurate, up-to-date advice. Keep responses clean and well-formatted!
`
  }

  // Smart context builder that handles both authenticated and non-authenticated users
  async buildSmartContext(userId: string | null, currentInput: string, userInfo: any = null): Promise<string> {
    if (userId && userInfo) {
      return await this.buildAuthenticatedContext(userInfo, currentInput)
    } else {
      return await this.buildBasicContext(currentInput)
    }
  }

  // Basic conversation storage using localStorage
  async addConversation(userId: string, userMessage: string, aiResponse: string) {
    try {
      if (typeof window !== 'undefined') {
        const conversationKey = `fili-memory-${userId}`
        const existing = localStorage.getItem(conversationKey)
        let conversations = []
        
        if (existing) {
          conversations = JSON.parse(existing)
        }
        
        conversations.push({
          timestamp: new Date().toISOString(),
          userMessage,
          aiResponse,
          id: Date.now()
        })
        
        // Keep only last 10 conversations to prevent storage bloat
        if (conversations.length > 10) {
          conversations = conversations.slice(-10)
        }
        
        localStorage.setItem(conversationKey, JSON.stringify(conversations))
      }
    } catch (error) {
      console.error('Error saving conversation to memory:', error)
    }
  }

  async getMemorySummary(userId: string) {
    try {
      if (typeof window !== 'undefined') {
        const conversationKey = `fili-memory-${userId}`
        const existing = localStorage.getItem(conversationKey)
        const hasHistory = !!existing
        
        return {
          userId,
          hasConversationHistory: hasHistory,
          hasVectorMemory: false,
          persona: hasHistory ? 'Remembers recent conversations' : 'New user',
          conversationTokens: hasHistory ? `${JSON.parse(existing).length} recent conversations` : "No history"
        }
      }
    } catch (error) {
      console.error('Error getting memory summary:', error)
    }
    
    return {
      userId,
      hasConversationHistory: false,
      hasVectorMemory: false,
      persona: null,
      conversationTokens: "Memory unavailable"
    }
  }

  async clearUserMemory(userId: string) {
    try {
      if (typeof window !== 'undefined') {
        const conversationKey = `fili-memory-${userId}`
        localStorage.removeItem(conversationKey)
        console.log('User memory cleared for:', userId)
      }
    } catch (error) {
      console.error('Error clearing user memory:', error)
    }
  }
}

export const langchainMemory = new SimpleLangChainMemory()
