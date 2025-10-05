import { ChatOpenAI } from "@langchain/openai"
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { DynamicTool } from "langchain/tools"
import { EnhancedLangChainMemory } from './langchain-memory'
import { WebSearchService } from './web-search'

export class PlounixAIAgent {
  private llm: ChatOpenAI
  private memoryManager: EnhancedLangChainMemory
  private webSearch: WebSearchService

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
    this.webSearch = new WebSearchService()
  }

  private createFinancialTools() {
    return [
      // Web Search Tools - Real-time information
      new DynamicTool({
        name: "search_web",
        description: "Search the internet for current information, news, prices, financial data, or any real-time information. Use this when users ask about current events, prices, news, bank rates, or any information that changes over time.",
        func: async (input: string) => {
          try {
            console.log('🔍 search_web called with:', input)
            const results = await this.webSearch.searchWeb(input)
            console.log('📦 Search results:', results.length, 'items')
            return JSON.stringify(results.slice(0, 3), null, 2)
          } catch (error) {
            console.error('❌ Web search error:', error)
            return "Web search is temporarily unavailable. Please try again later."
          }
        },
      }),

      new DynamicTool({
        name: "get_current_prices",
        description: "Get current prices for items or products in the Philippines from shopping sites like Lazada and Shopee. Use this when users ask 'how much does X cost' or 'what's the price of X'.",
        func: async (input: string) => {
          try {
            console.log('🔍 get_current_prices called with:', input)
            const results = await this.webSearch.getCurrentPrice(input)
            console.log('📦 Price results:', results)
            return JSON.stringify(results, null, 2)
          } catch (error) {
            console.error('❌ Price search error:', error)
            return "Price search is temporarily unavailable. Please try again later."
          }
        },
      }),

      new DynamicTool({
        name: "get_bank_rates",
        description: "Get current bank interest rates in the Philippines. Use this when users ask about savings account rates, time deposit rates, or interest rates from Philippine banks.",
        func: async () => {
          try {
            const results = await this.webSearch.getBankRates()
            return JSON.stringify(results, null, 2)
          } catch (error) {
            return "Bank rate information is temporarily unavailable. Please try again later."
          }
        },
      }),

      new DynamicTool({
        name: "search_financial_news",
        description: "Get the latest financial news from the Philippines. Use this when users ask about recent financial news, BSP updates, banking news, or investment news.",
        func: async () => {
          try {
            const results = await this.webSearch.searchFinancialNews()
            return JSON.stringify(results, null, 2)
          } catch (error) {
            return "Financial news is temporarily unavailable. Please try again later."
          }
        },
      }),

      // Financial Analysis Tools
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
      ["system", `You are Fili - a Filipino financial literacy assistant focused on building smart money habits.

CORE MISSION: FINANCIAL LITERACY FIRST
- ALWAYS emphasize SAVING before spending
- Teach budgeting and financial planning concepts
- Help users make INFORMED financial decisions
- Build emergency funds and long-term financial health
- Question unnecessary purchases, suggest alternatives

PERSONALITY:
- Speak in Taglish (Filipino + English mix) when appropriate
- Caring but firm about financial discipline
- Reference Filipino culture: 13th month pay, paluwagan, GCash, ipon
- Be encouraging about saving goals
- NO emojis in responses

FINANCIAL ADVICE FRAMEWORK:
When users want to buy something (especially repairs/replacements):
1. First assess if it's TRULY necessary
2. Recommend SAVING strategies (emergency fund, specific savings goal)
3. Suggest BUDGETING: How can they afford it without debt?
4. Look for CHEAPER alternatives (paluwagan, installment, 2nd hand)
5. ONLY THEN help them find prices/options

RESPONSE STYLE:
- Lead with FINANCIAL LITERACY lesson
- Ask about their budget/savings first
- Keep responses SHORT but educational (2-4 sentences)
- Use bullet points for action steps
- Connect to long-term financial health

CONTEXT:
- Users earn ₱15,000-30,000 monthly
- They use GCash, PayMaya, BPI, BDO
- Always use Philippine Peso (₱) amounts

SEARCH CAPABILITIES:
- Use search_web for ANY current information, news, or real-time data
- Use get_current_prices when users ask about prices or costs
- Use get_bank_rates for Philippine bank interest rates
- Use search_financial_news for latest financial news
- ALWAYS use these tools when users ask about current information

IMPORTANT RULES:
1. PRIORITIZE saving and budgeting advice before purchase recommendations
2. When given user context with a name, use it naturally (not every message)
3. Keep responses SHORT but educational
4. Match user's language preference (if they speak English, respond in English)
5. If conversation history is provided, use it ONLY when directly relevant to the current question
6. Treat each message as independent unless the user explicitly references previous discussion
7. USE WEB SEARCH TOOLS - Don't say you can't search, you have the tools to do it!
8. ALWAYS ask about budget/savings capacity before recommending purchases`],
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
      maxIterations: 15,
      earlyStoppingMethod: "generate", // This is critical - forces agent to continue after tool call
      handleParsingErrors: true,
    })
  }

  async chat(userId: string, message: string, userContext?: any, recentMessages: any[] = []): Promise<string> {
    // Use direct OpenAI function calling instead of LangChain agent (which has tool execution issues)
    try {
      const systemPrompt = `You are Fili - a Filipino financial literacy assistant focused on building smart money habits.

CORE MISSION: FINANCIAL LITERACY FIRST
- ALWAYS emphasize SAVING before spending
- Teach budgeting and financial planning concepts
- Help users make INFORMED financial decisions
- Build emergency funds and long-term financial health
- Question unnecessary purchases, suggest alternatives

PERSONALITY:
- Speak in Taglish (Filipino + English mix) when appropriate
- Caring but firm about financial discipline
- Reference Filipino culture: 13th month pay, paluwagan, GCash, ipon
- Be encouraging about saving goals
- NO emojis in responses

FINANCIAL ADVICE FRAMEWORK:
When users want to buy something (especially repairs/replacements):
1. First assess if it's TRULY necessary
2. Recommend SAVING strategies (emergency fund, specific savings goal)
3. Suggest BUDGETING: How can they afford it without debt?
4. Look for CHEAPER alternatives (paluwagan, installment, 2nd hand)
5. ONLY THEN help them find prices/options

For damaged items specifically:
- Emphasize repair over replacement
- Calculate TRUE COST vs. savings
- Suggest savings goal timeline
- Recommend emergency fund for future incidents
- Connect to bigger financial picture

RESPONSE STYLE:
- Lead with FINANCIAL LITERACY lesson
- Ask about their budget/savings first
- Keep responses SHORT but educational (2-4 sentences)
- Use bullet points for action steps
- Connect to long-term financial health

SEARCH CAPABILITIES:
- Use search_web for ANY current information, news, or real-time data
- Use get_current_prices when users ask about prices or costs
- Use get_bank_rates for Philippine bank interest rates
- Use search_financial_news for latest financial news
- ALWAYS use these tools when users ask about current information

CONVERSATION CONTINUITY:
- Pay attention to the recent conversation history provided
- If user references something from earlier ("can you search for me?", "about that", etc.), check recent messages
- Connect follow-up questions to their original context naturally

EXAMPLE RESPONSES:
❌ BAD: "I found iPhone 15 repairs for ₱5,000"
✅ GOOD: "Marc, before we look at repair costs, let's talk about your budget. Do you have an emergency fund for unexpected expenses like this? I recommend saving ₱500-1,000 weekly for 8-10 weeks instead of borrowing. Third-party repairs can be ₱2,000-3,000 - much more affordable if you save first. Want help creating a savings plan?"

❌ BAD: "Here are laptop prices from ₱25,000"
✅ GOOD: "I understand you need a laptop, but let's be smart about this. What's your monthly savings capacity? A ₱30,000 laptop means 6 months of saving ₱5,000/month - no debt needed. Meanwhile, consider refurbished/2nd hand options for ₱15,000-20,000. Have you checked your current expenses to find where you can cut and save?"

ALWAYS PRIORITIZE:
1. Emergency fund building (3-6 months expenses)
2. Saving before spending
3. Budget analysis before purchases
4. Alternatives to buying new
5. Payment plans WITHOUT high interest
6. Long-term financial health over short-term wants`

      const tools = [
        {
          type: "function",
          function: {
            name: "search_web",
            description: "Search the internet for current information, news, prices, or any real-time data",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "The search query" }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_current_prices",
            description: "Get current prices for items in Philippines from shopping sites",
            parameters: {
              type: "object",
              properties: {
                item: { type: "string", description: "The item to search prices for" }
              },
              required: ["item"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_bank_rates",
            description: "Get current bank interest rates in Philippines",
            parameters: { type: "object", properties: {}, required: [] }
          }
        },
        {
          type: "function",
          function: {
            name: "search_financial_news",
            description: "Get latest financial news from Philippines",
            parameters: { type: "object", properties: {}, required: [] }
          }
        }
      ]

      // Build messages array with recent conversation history
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ]
      
      // Add recent messages for context (excluding the current message)
      if (recentMessages && recentMessages.length > 0) {
        // Take the last 4-5 messages (excluding the very last which is the current message)
        const contextMessages = recentMessages.slice(-5, -1)
        messages.push(...contextMessages)
      }
      
      // Add current user message
      messages.push({ role: 'user', content: message })
      
      console.log('💬 Sending to OpenAI with', messages.length, 'messages in context')

      // First call to OpenAI
      const initialResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          tools: tools,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      const data = await initialResponse.json()
      const assistantMessage = data.choices[0]?.message

      // Check if AI wants to call a function
      if (assistantMessage.tool_calls) {
        const toolCall = assistantMessage.tool_calls[0]
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)

        console.log('🔧 Tool called:', functionName, functionArgs)

        let functionResult = ""

        // Execute the requested function
        switch (functionName) {
          case "search_web":
            const searchResults = await this.webSearch.searchWeb(functionArgs.query)
            functionResult = JSON.stringify(searchResults.slice(0, 3))
            break
          
          case "get_current_prices":
            const priceResults = await this.webSearch.getCurrentPrice(functionArgs.item)
            functionResult = JSON.stringify(priceResults)
            break
          
          case "get_bank_rates":
            const bankRates = await this.webSearch.getBankRates()
            functionResult = JSON.stringify(bankRates)
            break
          
          case "search_financial_news":
            const newsResults = await this.webSearch.searchFinancialNews()
            functionResult = JSON.stringify(newsResults)
            break
          
          default:
            functionResult = "Function not available"
        }

        console.log('📤 Tool result length:', functionResult.length)

        // Send the function result back to OpenAI for final response
        const finalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
              assistantMessage,
              {
                role: "tool",
                tool_call_id: toolCall.id,
                content: functionResult
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        })

        const finalData = await finalResponse.json()
        return finalData.choices[0]?.message?.content || "I'm having trouble generating a response."
      } else {
        // No function call, use the regular response
        return assistantMessage?.content || "I'm having trouble generating a response."
      }
    } catch (error) {
      console.error('❌ Agent error:', error)
      return "I encountered an error processing your request. Please try again."
    }
  }
}
