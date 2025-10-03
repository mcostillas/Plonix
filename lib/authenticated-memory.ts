import { ChatOpenAI } from "@langchain/openai"
import { ConversationSummaryBufferMemory } from "langchain/memory"
import { ChatMessageHistory } from "langchain/stores/message/in_memory"
import { HumanMessage, AIMessage } from "@langchain/core/messages"
import { validateAuthentication } from './auth'
import { supabase } from './supabase'

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
  
  // Validate that user object is provided (authentication should be done at API route level)
  private validateUser(user: any | null) {
    if (!user || !user.id) {
      throw new Error('Valid user object required for personalized memory')
    }
    return user
  }

  // ===== MEMORY MANAGEMENT =====

  // Get or create conversation memory for a user
  async getConversationMemory(userId: string, user: any | null = null): Promise<ConversationSummaryBufferMemory> {
    // Validate user if provided (for authenticated access)
    if (user) {
      this.validateUser(user)
    }
    
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

  // Load existing conversation history from database
  private async loadExistingMessages(userId: string, chatHistory: ChatMessageHistory) {
    try {
      const { data: messages, error } = await (supabase as any)
        .from('chat_history')
        .select('message_type, content, created_at')
        .eq('session_id', userId)
        .order('created_at', { ascending: false })
        .limit(10) // Load only last 10 messages (5 exchanges) - reduced for less aggressive memory

      if (error) {
        console.error('Error loading message history:', error)
        return
      }

      if (messages && messages.length > 0) {
        console.log(`Loading ${messages.length} previous messages for user ${userId}`)
        
        // Reverse to get chronological order (since we fetched descending)
        const chronologicalMessages = messages.reverse()
        
        for (const msg of chronologicalMessages) {
          if (msg.message_type === 'human') {
            await chatHistory.addMessage(new HumanMessage(msg.content))
          } else {
            await chatHistory.addMessage(new AIMessage(msg.content))
          }
        }
      }
    } catch (error) {
      console.error('Failed to load existing messages:', error)
    }
  }

  // Add a message to memory
  async addMessage(userId: string, messageType: 'human' | 'ai', content: string, user: any | null = null) {
    try {
      // Debug logging
      console.log('💾 addMessage called:', {
        userId,
        messageType,
        hasUser: !!user,
        contentPreview: content.substring(0, 50)
      })
      
      // Validate user if provided
      if (user) {
        this.validateUser(user)
      }
      
      // Store in database first
      await this.saveMessageToDatabase(userId, messageType, content)
      console.log('✅ Message saved to database')
      
      // Get memory
      const memory = await this.getConversationMemory(userId, user)
      
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

  // Save message to Supabase database
  private async saveMessageToDatabase(userId: string, messageType: 'human' | 'ai', content: string) {
    try {
      const { error } = await supabase
        .from('chat_history')
        .insert({
          session_id: userId,
          message_type: messageType,
          content: content,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'authenticated_chat'
          }
        })

      if (error) {
        console.error('Database save error:', error)
        // Don't throw - let memory continue working even if DB save fails
      }
    } catch (error) {
      console.error('Failed to save message to database:', error)
    }
  }

  // Get conversation context for AI
  async getMemoryVariables(userId: string, user: any | null = null) {
    try {
      // Validate user if provided
      if (user) {
        this.validateUser(user)
      }
      
      const memory = await this.getConversationMemory(userId, user)
      return await memory.loadMemoryVariables({})
    } catch (error) {
      console.error('Error getting memory variables:', error)
      // Return empty context for anonymous users
      return { history: [] }
    }
  }

  // Get user profile data from user_data table
  async getUserProfile(userId: string, user: any | null = null) {
    try {
      // Validate user if provided
      if (user) {
        this.validateUser(user)
      }
      
      const { data: userData, error } = await (supabase as any)
        .from('user_data')
        .select('financial_data, preferences, ai_insights, persona_data')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading user profile:', error)
        return null
      }

      return userData
    } catch (error) {
      console.error('Failed to get user profile:', error)
      return null
    }
  }

  // Update user profile data in user_data table
  async updateUserProfile(userId: string, updates: {
    financial_data?: any,
    preferences?: any, 
    ai_insights?: any,
    persona_data?: any
  }, user: any | null = null) {
    try {
      // Validate user if provided
      if (user) {
        this.validateUser(user)
      }
      
      const { error } = await (supabase as any)
        .from('user_data')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating user profile:', error)
      } else {
        console.log(`Updated user profile for ${userId}`)
      }
    } catch (error) {
      console.error('Failed to update user profile:', error)
    }
  }

  // Build smart context for AI responses with user profile
  async buildSmartContext(userId: string, userMessage: string, user: any | null = null): Promise<string> {
    try {
      // Debug logging
      console.log('🔍 buildSmartContext called with:', {
        userId,
        hasUser: !!user,
        userEmail: user?.email
      })
      
      // Validate user if provided
      if (user) {
        this.validateUser(user)
      }
      
      const memoryVariables = await this.getMemoryVariables(userId, user)
      console.log('📚 Memory variables loaded:', {
        historyLength: Array.isArray(memoryVariables.history) ? memoryVariables.history.length : 0
      })
      const conversationHistory = memoryVariables.history || []
      
      // Get user profile for personalization
      const userProfile = await this.getUserProfile(userId, user)
      
      // Format conversation history for better context
      const formattedHistory = Array.isArray(conversationHistory) 
        ? conversationHistory.map((msg: any) => `${msg.constructor.name}: ${msg.content}`).join('\n')
        : 'No previous conversation'
      
      // Format user profile information
      let profileContext = ''
      if (userProfile) {
        const { financial_data, preferences, ai_insights, persona_data } = userProfile
        
        profileContext = `
USER FINANCIAL PROFILE:
- Financial Data: ${JSON.stringify(financial_data) !== '{}' ? 'Available' : 'Not set'}
- Preferences: ${JSON.stringify(preferences) !== '{}' ? JSON.stringify(preferences) : 'Default settings'}
- AI Insights: ${ai_insights?.recommendedActions?.length ? `${ai_insights.recommendedActions.length} recommendations` : 'Learning about user'}
- Persona: ${persona_data?.financial_persona || 'Still determining'}
        `.trim()
      }
      
      // Only include recent relevant conversation history (last 3-4 exchanges)
      const recentHistory = Array.isArray(conversationHistory) 
        ? conversationHistory.slice(-6).map((msg: any) => `${msg.constructor.name === 'HumanMessage' ? 'User' : 'AI'}: ${msg.content}`).join('\n')
        : ''

      const userName = user?.name || user?.email?.split('@')[0] || 'there'
      console.log('👤 Building context for user:', userName)

      return `
CONVERSATION CONTEXT (Authenticated User):
User Name: ${user?.name || 'User'}
User Email: ${user?.email || 'Unknown'}

${recentHistory ? `Recent conversation:\n${recentHistory}\n` : ''}
${profileContext ? `${profileContext}\n` : ''}
Current message: ${userMessage}

IMPORTANT INSTRUCTIONS: 
- The user's name is "${userName}" - use it naturally in your greeting or response when appropriate
- Focus on answering the current question naturally and directly
- Only reference past conversation if DIRECTLY relevant to the current question
- Don't force connections to previous topics unless the user explicitly asks about them
- Treat each message as fresh unless context is clearly needed
- Be conversational and friendly
      `.trim()
    } catch (error) {
      // Fallback for anonymous users
      return `
CONVERSATION CONTEXT:
- First-time interaction or no conversation history available yet
- User is exploring the AI assistant

Current message: ${userMessage}

Provide helpful financial advice based on the user's question.
      `.trim()
    }
  }

  // Clear user memory (for privacy/reset)
  async clearUserMemory(userId: string, user: any | null = null) {
    try {
      // Validate user if provided
      if (user) {
        this.validateUser(user)
      }
      
      // Clear from database
      await this.clearUserDataFromDatabase(userId)
      
      // Clear from memory
      this.conversationMemories.delete(userId)

      console.log(`Cleared memory for user ${userId}`)
    } catch (error) {
      console.error('Error clearing user memory:', error)
      throw error
    }
  }

  // Clear user data from database
  private async clearUserDataFromDatabase(userId: string) {
    try {
      // Clear chat history
      const { error: chatError } = await (supabase as any)
        .from('chat_history')
        .delete()
        .eq('session_id', userId)

      if (chatError) {
        console.error('Error clearing chat history:', chatError)
      }

      // Clear financial memories (if they exist)
      const { error: memoryError } = await (supabase as any)
        .from('financial_memories')
        .delete()
        .eq('user_id', userId)

      if (memoryError) {
        console.error('Error clearing financial memories:', memoryError)
      }

      console.log(`Cleared database records for user ${userId}`)
    } catch (error) {
      console.error('Failed to clear user data from database:', error)
    }
  }
}

// Export singleton instance
export const authenticatedMemory = new AuthenticatedMemoryManager()

// ===== HELPER FUNCTIONS FOR API ROUTES =====
// These functions now accept a user object that has already been validated at the API route level

export async function getAuthenticatedMemoryContext(userId: string, userMessage: string, user: any | null = null) {
  return await authenticatedMemory.buildSmartContext(userId, userMessage, user)
}

export async function addToUserMemory(userId: string, userMessage: string, aiResponse: string, user: any | null = null) {
  await authenticatedMemory.addMessage(userId, 'human', userMessage, user)
  await authenticatedMemory.addMessage(userId, 'ai', aiResponse, user)
}

export async function getUserMemoryVariables(userId: string, user: any | null = null) {
  return await authenticatedMemory.getMemoryVariables(userId, user)
}

export async function clearUserMemory(userId: string, user: any | null = null) {
  return await authenticatedMemory.clearUserMemory(userId, user)
}

export async function getUserProfile(userId: string, user: any | null = null) {
  return await authenticatedMemory.getUserProfile(userId, user)
}

export async function updateUserProfile(userId: string, updates: any, user: any | null = null) {
  return await authenticatedMemory.updateUserProfile(userId, updates, user)
}
