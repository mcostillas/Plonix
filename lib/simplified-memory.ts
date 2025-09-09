import { ChatOpenAI } from "@langchain/openai"
import { ConversationSummaryBufferMemory } from "langchain/memory"
import { ChatMessageHistory } from "langchain/stores/message/in_memory"
import { AIMessage, HumanMessage } from "@langchain/core/messages"
import { supabase } from './supabase'
import { validateAuthentication } from './auth'

// Simple type for chat messages
interface ChatMessage {
  id: string
  session_id: string
  message_type: 'human' | 'ai'
  content: string
  metadata: any
  created_at: string
}

export class SimplifiedLangChainMemory {
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
    
    // Load existing messages from database
    await this.loadExistingMessages(userId, chatHistory)

    const memory = new ConversationSummaryBufferMemory({
      llm: this.llm,
      chatHistory,
      maxTokenLimit: 2000,
      returnMessages: true,
    })

    this.conversationMemories.set(userId, memory)
    return memory
  }

  // Add a message to memory and save to database
  async addMessage(userId: string, messageType: 'human' | 'ai', content: string) {
    try {
      // Validate authentication
      await this.validateUser(userId)
      
      // Get memory
      const memory = await this.getConversationMemory(userId)
      
      // Add to memory
      if (messageType === 'human') {
        await memory.chatHistory.addUserMessage(content)
      } else {
        await memory.chatHistory.addAIMessage(content)
      }
      
      // Save to database
      await this.saveMessageToDatabase(userId, messageType, content)
      
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
      
      return `
CONVERSATION CONTEXT (Authenticated User):
Previous conversation: ${JSON.stringify(conversationHistory)}

USER FINANCIAL PROFILE:
- Personalized recommendations available
- Learning progress tracked
- Memory of previous advice given

Current message: ${userMessage}

Please provide personalized financial advice based on our conversation history.
      `.trim()
    } catch (error) {
      // Fallback for anonymous users
      return `
CONVERSATION CONTEXT (Anonymous User):
- First-time interaction
- No previous conversation history
- General financial advice only

Current message: ${userMessage}

Please provide helpful but general financial advice. Encourage user to create account for personalized experience.
      `.trim()
    }
  }

  // ===== DATABASE OPERATIONS =====

  // Load existing messages from database
  private async loadExistingMessages(userId: string, chatHistory: ChatMessageHistory) {
    try {
      // Use raw SQL query to avoid type issues
      const { data, error } = await supabase.rpc('get_chat_messages', {
        user_id: userId,
        limit_count: 50
      })

      if (error) {
        console.warn('Could not load chat history, starting fresh:', error.message)
        return
      }

      if (data && Array.isArray(data)) {
        for (const msg of data) {
          if (msg.message_type === 'human') {
            await chatHistory.addUserMessage(msg.content)
          } else if (msg.message_type === 'ai') {
            await chatHistory.addAIMessage(msg.content)
          }
        }
      }
    } catch (error) {
      console.warn('Could not load existing messages, starting fresh session')
    }
  }

  // Save message to database using raw SQL
  private async saveMessageToDatabase(userId: string, messageType: 'human' | 'ai', content: string) {
    try {
      // Use raw SQL to avoid type issues
      const { error } = await supabase.rpc('save_chat_message', {
        user_id: userId,
        msg_type: messageType,
        msg_content: content,
        msg_metadata: {}
      })

      if (error) {
        console.warn('Could not save message to database:', error.message)
      }
    } catch (error) {
      console.warn('Could not save message to database, continuing without persistence')
    }
  }

  // Clear user memory (for privacy/reset)
  async clearUserMemory(userId: string) {
    try {
      // Validate authentication
      await this.validateUser(userId)
      
      // Clear from memory
      this.conversationMemories.delete(userId)

      // Clear from database
      const { error } = await supabase.rpc('clear_user_chat_history', {
        user_id: userId
      })

      if (error) {
        console.warn('Could not clear database history:', error.message)
      }
    } catch (error) {
      console.error('Error clearing user memory:', error)
      throw error
    }
  }
}

// Export singleton instance
export const enhancedMemory = new SimplifiedLangChainMemory()

// ===== HELPER FUNCTIONS FOR API ROUTES =====

export async function getAuthenticatedMemoryContext(userId: string, userMessage: string) {
  return await enhancedMemory.buildSmartContext(userId, userMessage)
}

export async function addToUserMemory(userId: string, userMessage: string, aiResponse: string) {
  await enhancedMemory.addMessage(userId, 'human', userMessage)
  await enhancedMemory.addMessage(userId, 'ai', aiResponse)
}

export async function getUserMemoryVariables(userId: string) {
  return await enhancedMemory.getMemoryVariables(userId)
}
