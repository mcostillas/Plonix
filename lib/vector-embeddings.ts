import { OpenAIEmbeddings } from '@langchain/openai'
import { supabase } from './supabase'

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small', // 1536 dimensions, cheaper than ada-002
})

export interface FinancialMemory {
  id?: string
  user_id: string
  content: string
  metadata: {
    type: 'conversation' | 'transaction' | 'goal' | 'insight'
    timestamp: string
    category?: string
    amount?: number
    [key: string]: any
  }
  embedding?: number[]
  created_at?: string
}

/**
 * Generate embedding vector for text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embedding = await embeddings.embedQuery(text)
    return embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

/**
 * Store a memory with its embedding in Supabase
 */
export async function storeMemory(memory: FinancialMemory): Promise<string | null> {
  try {
    // Generate embedding for the content
    const embedding = await generateEmbedding(memory.content)
    
    // Store in Supabase (using any to bypass type checking for now)
    const { data, error } = await (supabase as any)
      .from('financial_memories')
      .insert({
        user_id: memory.user_id,
        content: memory.content,
        metadata: memory.metadata,
        embedding: embedding,
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error storing memory:', error)
      return null
    }
    
    console.log(`✅ Stored memory: ${memory.content.substring(0, 50)}...`)
    return data?.id || null
  } catch (error) {
    console.error('Error in storeMemory:', error)
    return null
  }
}

/**
 * Search for similar memories using vector similarity
 */
export async function searchSimilarMemories(
  userId: string,
  query: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<FinancialMemory[]> {
  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query)
    
    // Search using Supabase's vector similarity
    // Using cosine similarity (1 - cosine_distance)
    const { data, error } = await (supabase as any).rpc('match_financial_memories', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      user_id_filter: userId,
    })
    
    if (error) {
      console.error('Error searching memories:', error)
      return []
    }
    
    console.log(`🔍 Found ${data?.length || 0} similar memories for query: "${query.substring(0, 50)}..."`)
    return (data as FinancialMemory[]) || []
  } catch (error) {
    console.error('Error in searchSimilarMemories:', error)
    return []
  }
}

/**
 * Store a conversation exchange as a memory
 */
export async function storeConversationMemory(
  userId: string,
  userMessage: string,
  aiResponse: string
): Promise<string | null> {
  const content = `User: ${userMessage}\nAI: ${aiResponse}`
  
  return storeMemory({
    user_id: userId,
    content,
    metadata: {
      type: 'conversation',
      timestamp: new Date().toISOString(),
      user_message: userMessage,
      ai_response: aiResponse,
    },
  })
}

/**
 * Store a transaction as a memory
 */
export async function storeTransactionMemory(
  userId: string,
  transaction: {
    description: string
    amount: number
    category: string
    date: string
  }
): Promise<string | null> {
  const content = `Transaction: ${transaction.description} - ₱${transaction.amount} (${transaction.category}) on ${transaction.date}`
  
  return storeMemory({
    user_id: userId,
    content,
    metadata: {
      type: 'transaction',
      timestamp: transaction.date,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
    },
  })
}

/**
 * Store a financial goal as a memory
 */
export async function storeGoalMemory(
  userId: string,
  goal: {
    title: string
    target: number
    current: number
    deadline?: string
  }
): Promise<string | null> {
  const progress = goal.current > 0 ? ((goal.current / goal.target) * 100).toFixed(1) : 0
  const content = `Goal: ${goal.title} - Target: ₱${goal.target}, Current: ₱${goal.current} (${progress}% complete)${goal.deadline ? ` by ${goal.deadline}` : ''}`
  
  return storeMemory({
    user_id: userId,
    content,
    metadata: {
      type: 'goal',
      timestamp: new Date().toISOString(),
      goal_title: goal.title,
      target_amount: goal.target,
      current_amount: goal.current,
      deadline: goal.deadline,
    },
  })
}

/**
 * Store an AI insight as a memory
 */
export async function storeInsightMemory(
  userId: string,
  insight: string,
  category?: string
): Promise<string | null> {
  return storeMemory({
    user_id: userId,
    content: `Insight: ${insight}`,
    metadata: {
      type: 'insight',
      timestamp: new Date().toISOString(),
      category: category || 'general',
    },
  })
}

/**
 * Get relevant context from vector search for AI
 */
export async function getRelevantContext(
  userId: string,
  currentMessage: string,
  limit: number = 3
): Promise<string> {
  const memories = await searchSimilarMemories(userId, currentMessage, limit)
  
  if (memories.length === 0) {
    return 'No relevant past memories found.'
  }
  
  const contextParts = memories.map((memory, index) => {
    const metadata = memory.metadata as any
    return `[${index + 1}] ${memory.content} (${metadata.type}, ${new Date(metadata.timestamp).toLocaleDateString()})`
  })
  
  return `
=== RELEVANT MEMORIES (Vector Search) ===
${contextParts.join('\n\n')}
`
}

/**
 * Batch store multiple memories efficiently
 */
export async function batchStoreMemories(memories: FinancialMemory[]): Promise<number> {
  let successCount = 0
  
  for (const memory of memories) {
    const id = await storeMemory(memory)
    if (id) successCount++
  }
  
  console.log(`✅ Batch stored ${successCount}/${memories.length} memories`)
  return successCount
}
