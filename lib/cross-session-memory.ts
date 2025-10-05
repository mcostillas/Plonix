import { supabase } from './supabase'

// Types for cross-session memory
export interface UserMemory {
  id: string
  user_id: string
  memory_type: 'fact' | 'preference' | 'goal' | 'item' | 'concern'
  category?: string
  key: string
  value: string
  context?: string
  source_session_id?: string
  importance: number
  last_accessed: Date
  created_at: Date
  expires_at?: Date
  metadata?: any
}

export class CrossSessionMemoryManager {
  /**
   * Extract important information from a conversation and store it
   * This uses AI to identify key facts worth remembering across sessions
   */
  async extractAndStoreMemories(
    userId: string,
    sessionId: string,
    userMessage: string,
    aiResponse: string
  ): Promise<void> {
    try {
      // Simple extraction logic (can be enhanced with AI later)
      const memories = this.extractMemoriesFromConversation(userMessage, aiResponse)
      
      for (const memory of memories) {
        await this.saveMemory(userId, sessionId, memory)
      }
    } catch (error) {
      console.error('Error extracting memories:', error)
    }
  }

  /**
   * Simple rule-based memory extraction
   * TODO: Enhance with GPT to extract more complex information
   */
  private extractMemoriesFromConversation(
    userMessage: string,
    aiResponse: string
  ): Array<{ type: UserMemory['memory_type']; category?: string; key: string; value: string; importance: number }> {
    const memories: any[] = []
    const lowerUser = userMessage.toLowerCase()
    const lowerAI = aiResponse.toLowerCase()

    // Detect price inquiries
    if (lowerUser.match(/how much|price|cost|magkano/i)) {
      // Extract item name from user message
      const itemMatch = userMessage.match(/(?:how much|price|cost|magkano).+?(?:is|for|ng)?\s+(.+?)(?:\?|$)/i)
      if (itemMatch) {
        const item = itemMatch[1].trim()
        
        // Extract price from AI response
        const priceMatch = aiResponse.match(/₱[\d,]+|PHP?\s*[\d,]+|pesos?\s*[\d,]+/i)
        const price = priceMatch ? priceMatch[0] : 'price discussed'
        
        memories.push({
          type: 'item',
          category: 'purchase_inquiry',
          key: `item_${item.substring(0, 30).replace(/\s+/g, '_').toLowerCase()}`,
          value: `${item}: ${price}`,
          importance: 8
        })
      }
    }

    // Detect budget/income discussions
    if (lowerUser.match(/income|salary|earn|sweldo|kita/i)) {
      const amountMatch = userMessage.match(/₱[\d,]+|PHP?\s*[\d,]+/i)
      if (amountMatch) {
        memories.push({
          type: 'fact',
          category: 'income',
          key: 'monthly_income',
          value: `Monthly income: ${amountMatch[0]}`,
          importance: 9
        })
      }
    }

    // Detect savings goals
    if (lowerUser.match(/save|saving|ipon|goal/i) && lowerUser.match(/₱[\d,]+/)) {
      const amountMatch = userMessage.match(/₱[\d,]+/i)
      memories.push({
        type: 'goal',
        category: 'savings',
        key: 'savings_goal',
        value: `Savings goal: ${amountMatch![0]}`,
        importance: 8
      })
    }

    // Detect concerns or problems
    if (lowerUser.match(/problem|worried|concerned|hirap|mahirap|can't afford/i)) {
      memories.push({
        type: 'concern',
        category: 'financial',
        key: `concern_${Date.now()}`,
        value: userMessage.substring(0, 200),
        importance: 7
      })
    }

    // Detect preferences
    if (lowerUser.match(/prefer|like|want|favorite|gusto/i)) {
      memories.push({
        type: 'preference',
        category: 'general',
        key: `preference_${Date.now()}`,
        value: userMessage.substring(0, 200),
        importance: 6
      })
    }

    return memories
  }

  /**
   * Save a memory to the database
   */
  private async saveMemory(
    userId: string,
    sessionId: string,
    memory: {
      type: UserMemory['memory_type']
      category?: string
      key: string
      value: string
      importance: number
      context?: string
    }
  ): Promise<void> {
    try {
      // Check if this key already exists for this user
      const { data: existing } = await (supabase as any)
        .from('user_memories')
        .select('id, importance')
        .eq('user_id', userId)
        .eq('key', memory.key)
        .single()

      if (existing) {
        // Update existing memory with new value and bump importance
        await (supabase as any)
          .from('user_memories')
          .update({
            value: memory.value,
            importance: Math.max(existing.importance, memory.importance),
            last_accessed: new Date().toISOString(),
            source_session_id: sessionId
          })
          .eq('id', existing.id)
        
        console.log('🔄 Updated existing memory:', memory.key)
      } else {
        // Create new memory
        await (supabase as any)
          .from('user_memories')
          .insert({
            user_id: userId,
            memory_type: memory.type,
            category: memory.category,
            key: memory.key,
            value: memory.value,
            context: memory.context,
            source_session_id: sessionId,
            importance: memory.importance
          })
        
        console.log('💾 Saved new memory:', memory.key, '-', memory.value)
      }
    } catch (error) {
      console.error('Error saving memory:', error)
    }
  }

  /**
   * Retrieve relevant memories for a user's current question
   */
  async getRelevantMemories(
    userId: string,
    currentMessage: string,
    limit: number = 5
  ): Promise<UserMemory[]> {
    try {
      // Get all user memories, ordered by importance and recency
      const { data: memories, error } = await (supabase as any)
        .from('user_memories')
        .select('*')
        .eq('user_id', userId)
        .order('importance', { ascending: false })
        .order('last_accessed', { ascending: false })
        .limit(20) // Get top 20 to filter

      if (error || !memories) {
        console.log('No memories found for user')
        return []
      }

      // Simple relevance scoring based on keyword matching
      const scoredMemories = memories.map((memory: any) => {
        let relevanceScore = memory.importance
        
        // Check if current message mentions keywords from the memory
        const lowerMessage = currentMessage.toLowerCase()
        const lowerValue = memory.value.toLowerCase()
        const lowerKey = memory.key.toLowerCase()
        
        // Extract keywords from memory value
        const keywords = lowerValue.split(/\s+/).filter((w: string) => w.length > 3)
        
        // Boost score if keywords match
        keywords.forEach((keyword: string) => {
          if (lowerMessage.includes(keyword)) {
            relevanceScore += 3
          }
        })
        
        // Boost if category/key matches
        if (lowerMessage.includes(lowerKey.replace(/_/g, ' '))) {
          relevanceScore += 5
        }
        
        return { ...memory, relevanceScore }
      })

      // Sort by relevance and return top results
      const relevantMemories = scoredMemories
        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)
        .filter((m: any) => m.relevanceScore > 5) // Only return if somewhat relevant

      // Update last_accessed for retrieved memories
      if (relevantMemories.length > 0) {
        const memoryIds = relevantMemories.map((m: any) => m.id)
        await (supabase as any)
          .from('user_memories')
          .update({ last_accessed: new Date().toISOString() })
          .in('id', memoryIds)
      }

      console.log(`🧠 Retrieved ${relevantMemories.length} relevant memories for user`)
      return relevantMemories
    } catch (error) {
      console.error('Error retrieving memories:', error)
      return []
    }
  }

  /**
   * Format memories as context for AI
   */
  formatMemoriesForContext(memories: UserMemory[]): string {
    if (memories.length === 0) {
      return ''
    }

    const formatted = memories.map(m => {
      const age = this.getMemoryAge(m.created_at)
      return `- ${m.value}${age ? ` (${age})` : ''}`
    }).join('\n')

    return `
REMEMBERED FROM PREVIOUS CONVERSATIONS:
${formatted}

Note: Use this information naturally if relevant to the current question.
`
  }

  /**
   * Get human-readable age of memory
   */
  private getMemoryAge(created_at: Date): string {
    const now = new Date()
    const created = new Date(created_at)
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return ''
  }

  /**
   * Clear all memories for a user (privacy/reset)
   */
  async clearUserMemories(userId: string): Promise<void> {
    try {
      await (supabase as any)
        .from('user_memories')
        .delete()
        .eq('user_id', userId)
      
      console.log(`🗑️ Cleared all memories for user ${userId}`)
    } catch (error) {
      console.error('Error clearing memories:', error)
    }
  }
}

// Export singleton instance
export const crossSessionMemory = new CrossSessionMemoryManager()
