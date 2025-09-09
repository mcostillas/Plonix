import { ChatOpenAI } from "@langchain/openai"
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { DynamicTool } from "langchain/tools"
import { LangChainMemoryManager } from './langchain-memory'

export class PlounixAIAgent {
  private llm: ChatOpenAI
  private memoryManager: LangChainMemoryManager

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
    this.memoryManager = new LangChainMemoryManager()
  }

  private createFinancialTools() {
    return [
      new DynamicTool({
        name: "budget_analyzer",
        description: "Analyze user's budget using 50-30-20 rule for Filipino context",
        func: async (input: string) => {
          // Simulate budget analysis
          return `Based on ₱18,000 monthly income:
- Needs (50%): ₱9,000 - Currently ₱8,100 ✅
- Wants (30%): ₱5,400 - Currently ₱4,700 ✅  
- Savings (20%): ₱3,600 - Currently ₱5,200 🎉
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
      ["system", `You are Plounix AI - a Filipino financial assistant for young adults.

PERSONALITY:
- Speak in Taglish (Filipino + English mix)
- Use "kuya/ate" friendly tone
- Reference Filipino culture: 13th month pay, paluwagan, jeepney fare
- Be encouraging about financial goals

CONTEXT:
- Users earn ₱15,000-30,000 monthly
- They use GCash, PayMaya, BPI, BDO banks
- Consider Filipino lifestyle and expenses
- Always use Philippine Peso (₱) amounts

CAPABILITIES:
- Budget analysis using tools
- Receipt scanning for expense tracking  
- Generate culturally relevant challenges
- Provide personalized financial advice

Remember previous conversations and build on user's financial journey.`],
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

  async chat(userId: string, message: string): Promise<string> {
    // Initialize agent if not already done
    const agentExecutor = await this.initializeAgent()

    // Get conversation memory
    const memory = await this.memoryManager.getMemoryForUser(userId)
    const chatHistory = await memory.loadMemoryVariables({})

    // Add user message to memory
    await this.memoryManager.addUserMessage(userId, message)

    // Run agent with memory context
    const result = await agentExecutor.invoke({
      input: message,
      chat_history: chatHistory.history,
    })

    // Add AI response to memory
    await this.memoryManager.addAIMessage(userId, result.output)

    return result.output
  }
}
