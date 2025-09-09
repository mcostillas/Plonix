import { ChatOpenAI } from "@langchain/openai"
import { ConversationSummaryBufferMemory } from "langchain/memory"
import { ChatMessageHistory } from "langchain/stores/message/in_memory"
import { HumanMessage, AIMessage } from "@langchain/core/messages"
import { validateAuthentication } from './auth'

export class AuthenticatedMemoryManager {
  private llm: ChatOpenAI
  private conversationMemories: Map<string, ConversationSummaryBufferMemory> = new Map()

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    })
  }

  // ===== AUTHENTICATION METHODS =====
  
  // Validate that user is authenticated before using memory
  private async validateUser(userId: string) {
    const { user, isValid } = await validateAuthentication()
    
    if (!isValid || !user || user.id !== userId) {
      throw new Error('Authentication required for personalized memory')
    }
    
    return user
  }

  // ===== MEMORY MANAGEMENT =====

  // Get or create conversation memory for a user
  async getConversationMemory(userId: string): Promise<ConversationSummaryBufferMemory> {
    // Validate authentication first
    await this.validateUser(userId)
    
    // Check if memory already exists for this user
    if (this.conversationMemories.has(userId)) {
      return this.conversationMemories.get(userId)!
    }

    // Create new memory with chat history
    const chatHistory = new ChatMessageHistory()

    const memory = new ConversationSummaryBufferMemory({
      llm: this.llm,
      chatHistory,
      maxTokenLimit: 2000,
      returnMessages: true,
    })

    this.conversationMemories.set(userId, memory)
    return memory
  }

  // Add a message to memory
  async addMessage(userId: string, messageType: 'human' | 'ai', content: string) {
    try {
      // Validate authentication
      await this.validateUser(userId)
      
      // Get memory
      const memory = await this.getConversationMemory(userId)
      
      // Add to memory using the correct method
      if (messageType === 'human') {
        await memory.chatHistory.addMessage(new HumanMessage(content))
      } else {
        await memory.chatHistory.addMessage(new AIMessage(content))
      }
      
    } catch (error) {
      console.error('Error adding message:', error)
      throw error
    }
  }

  // Get conversation context for AI
  async getMemoryVariables(userId: string) {
    try {
      // Validate authentication
      await this.validateUser(userId)
      
      const memory = await this.getConversationMemory(userId)
      return await memory.loadMemoryVariables({})
    } catch (error) {
      console.error('Error getting memory variables:', error)
      // Return empty context for anonymous users
      return { history: [] }
    }
  }

  // Build smart context for AI responses
  async buildSmartContext(userId: string, userMessage: string): Promise<string> {
    try {
      // Try to get authenticated user context
      await this.validateUser(userId)
      
      const memoryVariables = await this.getMemoryVariables(userId)
      const conversationHistory = memoryVariables.history || []
      
      // Format conversation history for better context
      const formattedHistory = Array.isArray(conversationHistory) 
        ? conversationHistory.map((msg: any) => `${msg.constructor.name}: ${msg.content}`).join('\n')
        : 'No previous conversation'
      
      return `
CONVERSATION CONTEXT (Authenticated User):
Previous conversation:
${formattedHistory}

USER PROFILE:
- Authenticated user with personalized experience
- Learning progress tracked
- Memory of previous financial advice given

Current message: ${userMessage}

Please provide personalized financial advice based on our conversation history and user's financial journey.
      `.trim()
    } catch (error) {
      // Fallback for anonymous users
      return `
CONVERSATION CONTEXT (Anonymous User):
- First-time interaction
- No previous conversation history
- General financial advice only

Current message: ${userMessage}

Please provide helpful but general financial advice. Encourage user to create account for personalized experience with memory and learning tracking.
      `.trim()
    }
  }

  // Clear user memory (for privacy/reset)
  async clearUserMemory(userId: string) {
    try {
      // Validate authentication
      await this.validateUser(userId)
      
      // Clear from memory
      this.conversationMemories.delete(userId)

      console.log(`Cleared memory for user ${userId}`)
    } catch (error) {
      console.error('Error clearing user memory:', error)
      throw error
    }
  }
}

// Export singleton instance
export const authenticatedMemory = new AuthenticatedMemoryManager()

// ===== HELPER FUNCTIONS FOR API ROUTES =====

export async function getAuthenticatedMemoryContext(userId: string, userMessage: string) {
  return await authenticatedMemory.buildSmartContext(userId, userMessage)
}

export async function addToUserMemory(userId: string, userMessage: string, aiResponse: string) {
  await authenticatedMemory.addMessage(userId, 'human', userMessage)
  await authenticatedMemory.addMessage(userId, 'ai', aiResponse)
}

export async function getUserMemoryVariables(userId: string) {
  return await authenticatedMemory.getMemoryVariables(userId)
}

export async function clearUserMemory(userId: string) {
  return await authenticatedMemory.clearUserMemory(userId)
}
