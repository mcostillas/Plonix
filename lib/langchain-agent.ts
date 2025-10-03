import { ChatOpenAI } from "@langchain/openai"
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { DynamicTool } from "langchain/tools"
import { EnhancedLangChainMemory } from './langchain-memory'

export class PlounixAIAgent {
  private llm: ChatOpenAI
  private memoryManager: EnhancedLangChainMemory

  constructor() {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables')
    }
    
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.memoryManager = new EnhancedLangChainMemory()
  }

  private createFinancialTools() {
    return [
      new DynamicTool({
        name: "budget_analyzer",
        description: "Analyze user's budget using 50-30-20 rule for Filipino context",
        func: async (input: string) => {
          // Simulate budget analysis
          return `Based on ₱18,000 monthly income:
- Needs (50%): ₱9,000 - Currently ₱8,100 - Good
- Wants (30%): ₱5,400 - Currently ₱4,700 - Good  
- Savings (20%): ₱3,600 - Currently ₱5,200 - Excellent
Great job! You're saving more than recommended.`
        },
      }),

      new DynamicTool({
        name: "receipt_scanner",
        description: "Scan and analyze Filipino receipts for expense tracking",
        func: async (input: string) => {
          return `Receipt analyzed: Jollibee - ₱185.50, Food & Dining category. 
This represents 1% of monthly food budget. Consider meal prepping para makamura.`
        },
      }),

      new DynamicTool({
        name: "expense_tracker",
        description: "Track and categorize Filipino expenses with cultural context",
        func: async (input: string) => {
          return `Expense tracked: ${input}. Added to your Food & Dining category. 
Monthly total: ₱4,200 (target: ₱3,600). Medyo over budget, try cooking at home more.`
        },
      }),

      new DynamicTool({
        name: "challenge_generator",
        description: "Generate Filipino-specific financial challenges",
        func: async (input: string) => {
          const challenges = [
            "52-week peso challenge: Start with ₱50, increase by ₱50 weekly",
            "No-spend weekend: Zero expenses this Saturday-Sunday",
            "Jeepney budget week: Use only public transport",
            "Lutong bahay challenge: Cook all meals for 1 week"
          ]
          return challenges[Math.floor(Math.random() * challenges.length)]
        },
      })
    ]
  }

  async initializeAgent() {
    const tools = this.createFinancialTools()

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are Fili - a Filipino financial assistant for young adults.

PERSONALITY:
- Speak in Taglish (Filipino + English mix) when appropriate
- Use natural, conversational tone
- Reference Filipino culture: 13th month pay, paluwagan, GCash
- Be encouraging and supportive
- NO emojis in responses

RESPONSE STYLE:
- Keep responses SHORT and CONCISE (2-3 sentences max for simple questions)
- Only give detailed explanations when user specifically asks
- Get straight to the point
- Use bullet points only when listing multiple items

CONTEXT:
- Users earn ₱15,000-30,000 monthly
- They use GCash, PayMaya, BPI, BDO
- Always use Philippine Peso (₱) amounts

IMPORTANT RULES:
1. When given user context with a name, use it naturally (not every message)
2. Keep responses SHORT - users prefer quick, actionable advice
3. Match user's language preference (if they speak English, respond in English)
4. If conversation history is provided, use it ONLY when directly relevant to the current question
5. Don't force references to past topics - focus on answering the current question naturally
6. Treat each message as independent unless the user explicitly references previous discussion`],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ])

    const agent = await createOpenAIFunctionsAgent({
      llm: this.llm,
      tools,
      prompt,
    })

    return new AgentExecutor({
      agent,
      tools,
      verbose: true,
    })
  }

  async chat(userId: string, message: string, userContext?: any): Promise<string> {
    // Initialize agent if not already done
    const agentExecutor = await this.initializeAgent()

    // NOTE: Memory is handled by authenticated-memory.ts at API level
    // The message already contains full context (user info, transactions, goals, memory)
    // Just pass it through as-is

    // Run agent with the complete context message from API layer
    const result = await agentExecutor.invoke({
      input: message, // Use message as-is - it already has all context from API layer
      chat_history: [], // Empty for now, context comes from API layer
    })

    // Memory saving is handled at API level in authenticated-memory.ts

    return result.output
  }
}
