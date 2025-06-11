import { supabase } from './supabase'

interface UserContext {
  userId: string
  income: number
  expenses: Record<string, number>
  goals: Array<{name: string, target: number, current: number}>
  preferences: {
    language: 'en' | 'tl' | 'taglish'
    budgetStyle: '50-30-20' | 'envelope' | 'zero-based'
  }
  aiInsights: {
    spendingPatterns: string[]
    recommendedActions: string[]
    lastAdvice: string
  }
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  messageType: 'text' | 'tool_use' | 'receipt_scan'
  metadata?: any
  timestamp: Date
}

export class AIMemoryManager {
  async getUserContext(userId: string): Promise<UserContext | null> {
    const { data, error } = await supabase
      .from('user_context')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) return null
    return data
  }

  async updateUserContext(userId: string, context: Partial<UserContext>) {
    const { error } = await supabase
      .from('user_context')
      .upsert({
        user_id: userId,
        ...context,
        updated_at: new Date().toISOString()
      })
    
    return !error
  }

  async getConversationHistory(userId: string, limit: number = 10): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return []
    return data.reverse() // Oldest first for context
  }

  async saveMessage(
    userId: string, 
    conversationId: string,
    content: string, 
    role: 'user' | 'assistant',
    messageType: 'text' | 'tool_use' | 'receipt_scan' = 'text',
    metadata?: any
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        content,
        role,
        message_type: messageType,
        metadata,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (error) return null
    return data.id
  }

  async createConversation(userId: string, title?: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (error) return null
    return data.id
  }

  // Build context for AI prompt from user history
  async buildAIContext(userId: string): Promise<string> {
    const userContext = await this.getUserContext(userId)
    const recentMessages = await this.getConversationHistory(userId, 5)
    
    if (!userContext) return ''

    const contextPrompt = `
USER CONTEXT:
- Monthly Income: ₱${userContext.income?.toLocaleString() || '18,000'}
- Recent Expenses: ${JSON.stringify(userContext.expenses || {})}
- Financial Goals: ${userContext.goals?.map(g => `${g.name}: ₱${g.current}/${g.target}`).join(', ') || 'None set'}
- Budget Style: ${userContext.preferences?.budgetStyle || '50-30-20'}
- AI Insights: ${userContext.aiInsights?.lastAdvice || 'First conversation'}

RECENT CONVERSATION:
${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

Remember this context when responding. Be personal and reference their specific situation.
`
    
    return contextPrompt
  }

  // Learn from user interactions
  async updateAIInsights(userId: string, insights: {
    spendingPattern?: string
    recommendation?: string
    userPreference?: string
  }) {
    const currentContext = await this.getUserContext(userId)
    const currentInsights = currentContext?.aiInsights || { 
      spendingPatterns: [], 
      recommendedActions: [], 
      lastAdvice: '' 
    }

    if (insights.spendingPattern) {
      currentInsights.spendingPatterns.push(insights.spendingPattern)
    }
    if (insights.recommendation) {
      currentInsights.recommendedActions.push(insights.recommendation)
      currentInsights.lastAdvice = insights.recommendation
    }

    await this.updateUserContext(userId, {
      userId,
      aiInsights: currentInsights
    })
  }
}
