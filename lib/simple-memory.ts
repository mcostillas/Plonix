import { supabase } from './supabase'

/**
 * Simple conversation memory - NO AUTHENTICATION VALIDATION
 * Auth is handled at API route level
 */

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

/**
 * Load recent conversation history from database
 * NO AUTH VALIDATION - assumes userId is already validated
 */
export async function loadConversationHistory(userId: string, limit: number = 20): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('session_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error loading chat history:', error)
      return []
    }
    
    if (!data || data.length === 0) {
      console.log(`📝 No chat history found for user ${userId}`)
      return []
    }
    
    // Convert to ChatMessage format and reverse (oldest first)
    const messages: ChatMessage[] = data
      .reverse()
      .map((row: any) => ({
        role: row.message_type === 'human' ? 'user' : 'assistant',
        content: row.content,
        timestamp: new Date(row.created_at),
      }))
    
    console.log(`📚 Loaded ${messages.length} previous messages for user ${userId}`)
    return messages
  } catch (error) {
    console.error('Error in loadConversationHistory:', error)
    return []
  }
}

/**
 * Save a conversation exchange to database
 * NO AUTH VALIDATION - assumes userId is already validated
 */
export async function saveConversationExchange(
  userId: string,
  userMessage: string,
  aiResponse: string
): Promise<boolean> {
  try {
    // Save user message
    const { error: userError } = await supabase
      .from('chat_history')
      .insert({
        session_id: userId,
        message_type: 'human',
        content: userMessage,
        metadata: { timestamp: new Date().toISOString() },
      })
    
    if (userError) {
      console.error('Error saving user message:', userError)
      return false
    }
    
    // Save AI response
    const { error: aiError } = await supabase
      .from('chat_history')
      .insert({
        session_id: userId,
        message_type: 'ai',
        content: aiResponse,
        metadata: { timestamp: new Date().toISOString() },
      })
    
    if (aiError) {
      console.error('Error saving AI response:', aiError)
      return false
    }
    
    console.log(`✅ Saved conversation exchange for user ${userId}`)
    return true
  } catch (error) {
    console.error('Error in saveConversationExchange:', error)
    return false
  }
}

/**
 * Format conversation history for AI context
 */
export function formatConversationHistory(messages: ChatMessage[]): string {
  if (messages.length === 0) {
    return '- No previous conversation history yet'
  }
  
  const formatted = messages
    .slice(-10) // Last 10 messages only
    .map((msg) => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
    .join('\n')
  
  return `Recent conversation history (last ${Math.min(messages.length, 10)} messages):\n${formatted}`
}

/**
 * Get conversation context for AI - SIMPLE VERSION
 */
export async function getSimpleConversationContext(
  userId: string,
  currentMessage: string
): Promise<string> {
  try {
    const history = await loadConversationHistory(userId, 10)
    const formattedHistory = formatConversationHistory(history)
    
    return `
=== CONVERSATION HISTORY ===
${formattedHistory}

=== CURRENT MESSAGE ===
${currentMessage}
    `.trim()
  } catch (error) {
    console.error('Error getting conversation context:', error)
    return `
=== CONVERSATION HISTORY ===
- No previous conversation history yet

=== CURRENT MESSAGE ===
${currentMessage}
    `.trim()
  }
}
