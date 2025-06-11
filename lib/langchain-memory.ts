import { ChatOpenAI } from "@langchain/openai"
import { ConversationSummaryBufferMemory } from "langchain/memory"
import { SupabaseChatMessageHistory } from "@langchain/community/stores/message/supabase"
import { supabase } from './supabase'

export class LangChainMemoryManager {
  private llm: ChatOpenAI
  private memories: Map<string, ConversationSummaryBufferMemory> = new Map()

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    })
  }

  async getMemoryForUser(userId: string): Promise<ConversationSummaryBufferMemory> {
    if (this.memories.has(userId)) {
      return this.memories.get(userId)!
    }

    // Create Supabase-backed chat history
    const chatHistory = new SupabaseChatMessageHistory({
      client: supabase,
      sessionId: userId,
      tableName: "chat_history"
    })

    // Create memory with automatic summarization
    const memory = new ConversationSummaryBufferMemory({
      llm: this.llm,
      chatHistory,
      maxTokenLimit: 2000, // Summarize when context gets too long
      returnMessages: true,
    })

    this.memories.set(userId, memory)
    return memory
  }

  async addUserMessage(userId: string, message: string) {
    const memory = await this.getMemoryForUser(userId)
    await memory.chatHistory.addUserMessage(message)
  }

  async addAIMessage(userId: string, message: string) {
    const memory = await this.getMemoryForUser(userId)
    await memory.chatHistory.addAIChatMessage(message)
  }

  async getConversationContext(userId: string): Promise<string> {
    const memory = await this.getMemoryForUser(userId)
    const context = await memory.loadMemoryVariables({})
    return context.history || ""
  }
}
