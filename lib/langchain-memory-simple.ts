// Simplified memory system without authentication dependencies
export class SimpleLangChainMemory {
  constructor() {}

  // Check if memory features are available
  async isMemoryAvailable() {
    return false // Temporarily disabled
  }

  // Provide fallback context for all users
  async buildBasicContext(currentInput: string): Promise<string> {
    return `
You are Plounix AI, a helpful Filipino financial assistant developed to help Filipinos improve their financial literacy and make better financial decisions.

ABOUT YOU:
- You specialize in Philippine financial context (banks, investments, regulations)
- You understand Filipino financial habits and challenges
- You provide practical, actionable advice
- You're encouraging and supportive

CURRENT REQUEST: ${currentInput}

INSTRUCTIONS:
- Give practical financial advice relevant to the Philippines
- Use Philippine peso (₱) for money examples
- Mention Philippine banks, investment options, and regulations when relevant
- Be encouraging and supportive
- Suggest specific next steps the user can take
- If you need current information (prices, rates, news), use the search tools available

Remember: You can search the web for current information about prices, bank rates, financial news, and other real-time data to give accurate, up-to-date advice.
`
  }

  // Smart context builder that handles both authenticated and non-authenticated users
  async buildSmartContext(userId: string | null, currentInput: string): Promise<string> {
    // For now, always use basic context since memory system is disabled
    return await this.buildBasicContext(currentInput)
  }

  // Placeholder methods for future implementation
  async addConversation(userId: string, userMessage: string, aiResponse: string) {
    // Disabled for now
    console.log('Memory storage disabled')
  }

  async getMemorySummary(userId: string) {
    return {
      userId,
      hasConversationHistory: false,
      hasVectorMemory: false,
      persona: null,
      conversationTokens: "Disabled"
    }
  }

  async clearUserMemory(userId: string) {
    // Disabled for now
    console.log('Memory clearing disabled')
  }
}

export const langchainMemory = new SimpleLangChainMemory()
