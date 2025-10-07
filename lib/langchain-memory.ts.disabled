import { ChatOpenAI } from "@langchain/openai"
import { ConversationSummaryBufferMemory, VectorStoreRetrieverMemory } from "langchain/memory"
import { ChatMessageHistory } from "langchain/stores/message/in_memory"
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { OpenAIEmbeddings } from "@langchain/openai"
import { Document } from "@langchain/core/documents"
import { AIMessage, HumanMessage } from "@langchain/core/messages"
import { supabase } from './supabase'

interface FinancialPersona {
  userId: string
  financialProfile: {
    monthlyIncome?: number
    budgetStyle?: string
    goals: string[]
    challenges: string[]
    successfulStrategies: string[]
  }
  personalContext: {
    name?: string
    age?: number
    occupation?: string
    location?: string
    communicationStyle?: string
  }
  memoryKey: string
}

export class EnhancedLangChainMemory {
  private llm: ChatOpenAI
  private embeddings: OpenAIEmbeddings
  private conversationMemories: Map<string, ConversationSummaryBufferMemory> = new Map()
  private vectorMemories: Map<string, VectorStoreRetrieverMemory> = new Map()
  private personas: Map<string, FinancialPersona> = new Map()

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    })

    this.embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small"
    })
  }

  // ===== AUTHENTICATION METHODS =====
  
  // Validate that user is authenticated before using memory
  private async validateAuthentication(userId: string) {
    try {
      // Check if user is authenticated
      const isAuth = await auth.isAuthenticated()
      if (!isAuth) {
        throw new Error('Authentication required for personalized memory')
      }

      // Verify the userId matches the authenticated user
      const currentUser = await auth.getCurrentUser()
      if (!currentUser.success || !currentUser.user || currentUser.user.id !== userId) {
        throw new Error('User ID does not match authenticated user')
      }

      return currentUser.user
    } catch (error) {
      console.error('Authentication validation failed:', error)
      throw new Error('Authentication required for personalized memory features')
    }
  }

  // Get authenticated user's ID
  async getAuthenticatedUserId() {
    try {
      const user = await auth.requireAuth()
      return user.id
    } catch (error) {
      throw new Error('Please log in to use personalized AI memory')
    }
  }

  // Check if memory features are available (user is logged in)
  async isMemoryAvailable() {
    try {
      return await auth.isAuthenticated()
    } catch (error) {
      return false
    }
  }

  // Provide fallback context for non-authenticated users
  async buildBasicContext(currentInput: string): Promise<string> {
    return `
You are a helpful Filipino financial AI assistant. The user is not logged in, so you don't have access to their personal financial history or preferences.

Current input: ${currentInput}

Please provide helpful, general financial advice. Encourage the user to create an account to access personalized features like:
- Remembering their financial goals and progress
- Learning their spending patterns and preferences
- Providing customized recommendations based on their history
- Tracking their financial journey over time

Remember to be helpful, encouraging, and include Philippine financial context when relevant.
`
  }

  // Smart context builder that handles both authenticated and non-authenticated users
  async buildSmartContext(userId: string | null, currentInput: string): Promise<string> {
    try {
      // If no userId or not authenticated, use basic context
      if (!userId || !(await this.isMemoryAvailable())) {
        return await this.buildBasicContext(currentInput)
      }

      // For authenticated users, use enhanced context
      return await this.buildEnhancedContext(userId, currentInput)
    } catch (error) {
      console.error('Error building context:', error)
      // Fallback to basic context if there's any error
      return await this.buildBasicContext(currentInput)
    }
  }

  // Enhanced conversation memory with automatic summarization
  async getConversationMemory(userId: string): Promise<ConversationSummaryBufferMemory> {
    // Validate authentication first
    await this.validateAuthentication(userId)

    if (this.conversationMemories.has(userId)) {
      return this.conversationMemories.get(userId)!
    }

    // Create chat history with Supabase persistence
    const chatHistory = new ChatMessageHistory()
    
    // Load existing messages from Supabase
    await this.loadExistingMessages(userId, chatHistory)

    // Enhanced memory with financial context awareness
    const memory = new ConversationSummaryBufferMemory({
      llm: this.llm,
      chatHistory,
      maxTokenLimit: 3000, // Increased for more context
      returnMessages: true,
      summaryChatMessageClass: AIMessage,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output"
    })

    this.conversationMemories.set(userId, memory)
    return memory
  }

  // Vector-based semantic memory for financial insights
  async getVectorMemory(userId: string): Promise<VectorStoreRetrieverMemory> {
    // Validate authentication first
    await this.validateAuthentication(userId)

    if (this.vectorMemories.has(userId)) {
      return this.vectorMemories.get(userId)!
    }

    // Create user-specific vector store for semantic search
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      this.embeddings,
      {
        client: supabase,
        tableName: "financial_memories",
        queryName: "match_financial_memories",
        filter: { user_id: userId }
      }
    )

    const vectorMemory = new VectorStoreRetrieverMemory({
      vectorStoreRetriever: vectorStore.asRetriever({
        k: 5, // Retrieve top 5 relevant memories
      }),
      memoryKey: "financial_context",
      inputKey: "input",
      returnDocs: true
    })

    this.vectorMemories.set(userId, vectorMemory)
    return vectorMemory
  }

  // Store financial persona and context
  async updateFinancialPersona(userId: string, updates: Partial<FinancialPersona>) {
    const existingPersona = this.personas.get(userId) || {
      userId,
      financialProfile: { goals: [], challenges: [], successfulStrategies: [] },
      personalContext: {},
      memoryKey: `persona_${userId}`
    }

    // Merge updates
    const updatedPersona: FinancialPersona = {
      ...existingPersona,
      financialProfile: { ...existingPersona.financialProfile, ...updates.financialProfile },
      personalContext: { ...existingPersona.personalContext, ...updates.personalContext }
    }

    this.personas.set(userId, updatedPersona)

    // Store in vector memory for semantic retrieval
    await this.storePersonaInVector(userId, updatedPersona)
  }

  private async storePersonaInVector(userId: string, persona: FinancialPersona) {
    const vectorMemory = await this.getVectorMemory(userId)
    
    // Create documents from persona data
    const documents = [
      new Document({
        pageContent: `User Profile: ${persona.personalContext.name || 'Unknown'}, ${persona.personalContext.age || 'Unknown age'}, works as ${persona.personalContext.occupation || 'Unknown occupation'} in ${persona.personalContext.location || 'Philippines'}. Monthly income: ₱${persona.financialProfile.monthlyIncome || 'Unknown'}. Prefers ${persona.financialProfile.budgetStyle || 'flexible'} budgeting style.`,
        metadata: { type: "profile", userId, timestamp: new Date().toISOString() }
      }),
      new Document({
        pageContent: `Financial Goals: ${persona.financialProfile.goals.join(', ')}`,
        metadata: { type: "goals", userId, timestamp: new Date().toISOString() }
      }),
      new Document({
        pageContent: `Financial Challenges: ${persona.financialProfile.challenges.join(', ')}`,
        metadata: { type: "challenges", userId, timestamp: new Date().toISOString() }
      }),
      new Document({
        pageContent: `Successful Strategies: ${persona.financialProfile.successfulStrategies.join(', ')}`,
        metadata: { type: "strategies", userId, timestamp: new Date().toISOString() }
      })
    ]

    // Save to vector store
    for (const doc of documents) {
      await vectorMemory.saveContext({ input: doc.pageContent }, { output: "stored" })
    }
  }

  // Add messages with automatic insight extraction
  async addConversation(userId: string, userMessage: string, aiResponse: string) {
    // Validate authentication first
    await this.validateAuthentication(userId)

    // Add to conversation memory
    const conversationMemory = await this.getConversationMemory(userId)
    await conversationMemory.chatHistory.addUserMessage(userMessage)
    await conversationMemory.chatHistory.addAIChatMessage(aiResponse)

    // Save to Supabase
    await this.saveMessageToSupabase(userId, 'human', userMessage)
    await this.saveMessageToSupabase(userId, 'ai', aiResponse)

    // Extract and store financial insights
    await this.extractAndStoreInsights(userId, userMessage, aiResponse)
  }

  private async extractAndStoreInsights(userId: string, userMessage: string, aiResponse: string) {
    // Use LLM to extract financial insights from conversation
    const extractionPrompt = `
Analyze this conversation and extract financial insights:

User: ${userMessage}
AI: ${aiResponse}

Extract the following if mentioned:
1. Financial amounts (income, expenses, goals)
2. Financial strategies discussed
3. User preferences or concerns
4. Goals or achievements
5. Personal context (age, job, family situation)

Format as JSON:
{
  "amounts": ["₱amount: description"],
  "strategies": ["strategy mentioned"],
  "preferences": ["preference mentioned"],
  "goals": ["goal mentioned"],
  "personalInfo": ["info mentioned"],
  "concerns": ["concern mentioned"]
}
`

    try {
      const extraction = await this.llm.invoke(extractionPrompt)
      const insights = JSON.parse(extraction.content as string)

      // Store significant insights in vector memory
      if (insights.strategies?.length > 0) {
        await this.storeFinancialInsight(userId, "strategy", insights.strategies.join(", "))
      }
      
      if (insights.goals?.length > 0) {
        await this.storeFinancialInsight(userId, "goal", insights.goals.join(", "))
      }

      if (insights.concerns?.length > 0) {
        await this.storeFinancialInsight(userId, "concern", insights.concerns.join(", "))
      }

      // Update persona with new information
      const personaUpdates: Partial<FinancialPersona> = {}
      
      if (insights.goals?.length > 0) {
        personaUpdates.financialProfile = { 
          goals: insights.goals,
          successfulStrategies: insights.strategies || [],
          challenges: insights.concerns || []
        }
      }

      if (Object.keys(personaUpdates).length > 0) {
        await this.updateFinancialPersona(userId, personaUpdates)
      }

    } catch (error) {
      console.log("Could not extract insights:", error)
    }
  }

  private async storeFinancialInsight(userId: string, type: string, content: string) {
    const vectorMemory = await this.getVectorMemory(userId)
    const insight = new Document({
      pageContent: `${type.toUpperCase()}: ${content}`,
      metadata: { 
        type, 
        userId, 
        timestamp: new Date().toISOString(),
        importance: type === "goal" ? "high" : "medium"
      }
    })

    await vectorMemory.saveContext({ input: content }, { output: `Stored ${type}` })
  }

  // Build comprehensive context for AI responses
  async buildEnhancedContext(userId: string, currentInput: string): Promise<string> {
    try {
      // Validate authentication first
      await this.validateAuthentication(userId)

      // Get conversation history
      const conversationMemory = await this.getConversationMemory(userId)
      const conversationContext = await conversationMemory.loadMemoryVariables({ input: currentInput })

      // Get relevant financial memories
      const vectorMemory = await this.getVectorMemory(userId)
      const financialContext = await vectorMemory.loadMemoryVariables({ input: currentInput })

      // Get persona
      const persona = this.personas.get(userId)

      // Build comprehensive context
      const enhancedContext = `
COMPREHENSIVE USER CONTEXT FOR PLOUNIX AI:

PERSONAL PROFILE:
${persona ? `
- Name: ${persona.personalContext.name || 'Not provided'}
- Age: ${persona.personalContext.age || 'Not provided'}
- Occupation: ${persona.personalContext.occupation || 'Not provided'}
- Location: ${persona.personalContext.location || 'Philippines'}
- Communication Style: ${persona.personalContext.communicationStyle || 'Casual and friendly'}
- Monthly Income: ₱${persona.financialProfile.monthlyIncome?.toLocaleString() || 'Not specified'}
- Preferred Budget Style: ${persona.financialProfile.budgetStyle || 'Flexible'}
` : 'New user - gathering profile information'}

FINANCIAL GOALS & CONTEXT:
${persona?.financialProfile.goals.length ? `
- Active Goals: ${persona.financialProfile.goals.join(', ')}
- Current Challenges: ${persona.financialProfile.challenges.join(', ')}
- Successful Strategies: ${persona.financialProfile.successfulStrategies.join(', ')}
` : 'Learning about user\'s financial situation'}

RELEVANT FINANCIAL MEMORIES:
${financialContext.financial_context || 'No specific financial memories yet'}

RECENT CONVERSATION HISTORY:
${conversationContext.chat_history || 'First interaction'}

INSTRUCTIONS FOR PLOUNIX AI:
- Reference specific details from the user's profile and history
- Use their preferred communication style
- Build on previously successful strategies
- Address known challenges with empathy
- Track progress on mentioned goals
- Adapt advice to their income level and situation
- Use Filipino cultural context and examples
- Remember and celebrate their achievements

Current User Input: "${currentInput}"
`

      return enhancedContext

    } catch (error) {
      console.error("Error building context:", error)
      return `New conversation with user ${userId}. Input: "${currentInput}"`
    }
  }

  // Get memory summary for debugging/monitoring
  async getMemorySummary(userId: string) {
    const conversationMemory = await this.getConversationMemory(userId)
    const persona = this.personas.get(userId)
    
    return {
      userId,
      hasConversationHistory: this.conversationMemories.has(userId),
      hasVectorMemory: this.vectorMemories.has(userId),
      persona: persona || null,
      conversationTokens: conversationMemory ? "Available" : "Not loaded"
    }
  }

  // Load existing messages from Supabase into ChatMessageHistory
  private async loadExistingMessages(userId: string, chatHistory: ChatMessageHistory) {
    try {
      const { data: messages, error } = await supabase
        .from('chat_history')
        .select('id, session_id, message_type, content, metadata, created_at')
        .eq('session_id', userId)
        .order('created_at', { ascending: true })
        .limit(50) // Load last 50 messages

      if (error) {
        console.error('Error loading chat history:', error)
        return
      }

      if (messages && Array.isArray(messages)) {
        for (const msg of messages) {
          if (msg.message_type === 'human') {
            await chatHistory.addUserMessage(msg.content)
          } else if (msg.message_type === 'ai') {
            await chatHistory.addAIMessage(msg.content)
          }
        }
      }
    } catch (error) {
      console.error('Error loading existing messages:', error)
    }
  }

  // Save messages to Supabase
  private async saveMessageToSupabase(userId: string, messageType: 'human' | 'ai', content: string) {
    try {
      const messageData = {
        session_id: userId,
        message_type: messageType as 'human' | 'ai',
        content: content,
        metadata: {}
      }
      
      const { error } = await supabase
        .from('chat_history')
        .insert(messageData)
        
      if (error) {
        console.error('Error inserting message:', error)
      }
    } catch (error) {
      console.error('Error saving message to Supabase:', error)
    }
  }

  // Clear user memory (for privacy/reset)
  async clearUserMemory(userId: string) {
    this.conversationMemories.delete(userId)
    this.vectorMemories.delete(userId)
    this.personas.delete(userId)

    // Clear from database
    await supabase
      .from('chat_history')
      .delete()
      .eq('session_id', userId)

    await supabase
      .from('financial_memories')
      .delete()
      .eq('user_id', userId)
  }
}

export const langchainMemory = new EnhancedLangChainMemory()
