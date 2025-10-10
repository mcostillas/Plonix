import { ChatOpenAI } from "@langchain/openai"
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { DynamicTool } from "langchain/tools"
// import { EnhancedLangChainMemory } from './langchain-memory'
import { WebSearchService } from './web-search'
import { findLearningResources, getBeginnerFriendlySkills } from './learning-resources'

export class PlounixAIAgent {
  private llm: ChatOpenAI
  private memoryManager: any // EnhancedLangChainMemory
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
    this.memoryManager = null // new EnhancedLangChainMemory()
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

      // Work and Earning Opportunities Tools
      new DynamicTool({
        name: "suggest_work_opportunities",
        description: "Suggest real freelancing and job opportunities based on user's skills, hobbies, and financial goals. Use this when users ask about earning money, finding jobs, freelancing, or need income to reach savings goals.",
        func: async (input: string) => {
          try {
            console.log('💼 suggest_work_opportunities called with:', input)
            const workSuggestions = this.generateWorkSuggestions(input)
            return JSON.stringify(workSuggestions, null, 2)
          } catch (error) {
            console.error('❌ Work suggestions error:', error)
            return "Work opportunity search is temporarily unavailable. Please try again later."
          }
        },
      }),

      // Learning Resources Tool
      new DynamicTool({
        name: "suggest_learning_resources",
        description: "**CRITICAL TOOL** Suggest learning resources (YouTube videos, websites, online courses) when user wants to learn a skill. MUST USE when user mentions: 'learn', 'video editing', 'graphic design', 'web development', 'coding', 'freelancing', 'where to study', 'not good at', or ANY skill learning. Returns ACTUAL CLICKABLE URLs. DO NOT give generic advice like 'search YouTube' - use this tool instead to get real links.",
        func: async (input: string) => {
          try {
            console.log('📚 suggest_learning_resources called with:', input)
            
            // Search for relevant learning resources
            const matches = findLearningResources(input)
            
            if (matches.length > 0) {
              return JSON.stringify({
                foundSkills: matches.map(skill => ({
                  skill: skill.skill,
                  category: skill.category,
                  description: skill.description,
                  averageEarning: skill.averageEarning,
                  timeToLearn: skill.timeToLearn,
                  topResources: skill.resources.slice(0, 5).map(resource => ({
                    title: resource.title,
                    url: resource.url,
                    type: resource.type,
                    provider: resource.provider,
                    difficulty: resource.difficulty,
                    duration: resource.duration,
                    isFree: resource.isFree,
                    description: resource.description
                  }))
                })),
                totalSkillsFound: matches.length
              }, null, 2)
            } else {
              // If no specific match, show beginner-friendly options
              const beginnerSkills = getBeginnerFriendlySkills()
              return JSON.stringify({
                message: "No exact match found. Here are beginner-friendly skills you can learn:",
                recommendedSkills: beginnerSkills.map(skill => ({
                  skill: skill.skill,
                  category: skill.category,
                  description: skill.description,
                  averageEarning: skill.averageEarning,
                  timeToLearn: skill.timeToLearn,
                  topResources: skill.resources.slice(0, 3).map(resource => ({
                    title: resource.title,
                    url: resource.url,
                    type: resource.type,
                    difficulty: resource.difficulty,
                    isFree: resource.isFree
                  }))
                }))
              }, null, 2)
            }
          } catch (error) {
            console.error('❌ Learning resources error:', error)
            return "Learning resource search is temporarily unavailable. Please try again later."
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

TOPIC BOUNDARIES (STRICT ENFORCEMENT):
You are a FINANCIAL LITERACY assistant. You MUST stay within your scope:

✅ ACCEPTABLE TOPICS (Answer these):
- Personal finance, budgeting, savings, investments
- Banking, loans, credit cards, interest rates
- Shopping/purchases (but always with financial literacy angle)
- Products/gadgets IF discussed in context of budgeting or affordability
- Income, expenses, financial planning, goals
- Philippine financial systems (GCash, banks, paluwagan)
- Current prices, deals, shopping advice (with savings emphasis)
- Work opportunities, freelancing, side hustles, earning money (to support financial goals)
- Job suggestions based on skills and financial targets

❌ OUT OF SCOPE (Politely decline these):
- Religion, politics, philosophy (no exceptions)
- Medical/health advice (not a doctor)
- Legal advice (not a lawyer)
- Relationship advice (not a counselor)
- General knowledge questions unrelated to finance
- Academic homework/assignments (unless about financial literacy)
- Pure entertainment/gaming content (unless discussing budget for purchase)

WHEN ASKED OUT-OF-SCOPE QUESTIONS:
Respond with: "I'm here to help with financial literacy, but I can't provide [topic] information. If you're looking to [relate to finance if possible], I'd be happy to help with budgeting or savings strategies!"

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

WORK OPPORTUNITY FRAMEWORK:
When users need money or ask about earning:
1. Ask about their skills, hobbies, and available time
2. Assess their financial goal (target amount and timeline)
3. Use suggest_work_opportunities tool for personalized recommendations
4. Emphasize STARTING SMALL and building reputation
5. Always mention saving 20% of earnings for taxes/emergency fund
6. Provide REAL LINKS in underlined/highlighted format for job platforms

LEARNING RESOURCES FRAMEWORK:
When users want to learn a skill or say they're not good at something:
1. ALWAYS use suggest_learning_resources tool to find courses and tutorials
2. Ask what they want to achieve (earning goal, career change, hobby)
3. Recommend FREE resources first (YouTube, free courses)
4. Provide CLICKABLE LINKS formatted as: **[Resource Name](URL)** - Description
5. Mention realistic time commitment and earning potential
6. Encourage starting with beginner resources and practicing
7. Connect learning to their financial goals (e.g., "Learning this can help you earn ₱X/month")

Example responses for learning:
✅ "I see you're interested in freelancing but don't have the skills yet. Let me find learning resources for you..."
✅ "Great that you want to learn! Here are FREE YouTube courses and websites where you can start..."
✅ "This skill takes about 2-3 months to learn. Based on your ₱20,000 goal, you could start earning in 3-4 months. Here's where to learn..."

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

TOPIC BOUNDARIES (STRICT ENFORCEMENT):
You are a FINANCIAL LITERACY assistant. You MUST stay within your scope:

✅ ACCEPTABLE TOPICS (Answer these):
- Personal finance, budgeting, savings, investments
- Banking, loans, credit cards, interest rates
- Shopping/purchases (but always with financial literacy angle)
- Products/gadgets IF discussed in context of budgeting or affordability
- Income, expenses, financial planning, goals
- Philippine financial systems (GCash, banks, paluwagan)
- Current prices, deals, shopping advice (with savings emphasis)
- Work opportunities, freelancing, side hustles, earning money (to support financial goals)
- Job suggestions based on skills and financial targets

❌ OUT OF SCOPE (Politely decline these):
- Religion, politics, philosophy (no exceptions)
- Medical/health advice (not a doctor)
- Legal advice (not a lawyer)
- Relationship advice (not a counselor)
- General knowledge questions unrelated to finance
- Academic homework/assignments (unless about financial literacy)
- Pure entertainment/gaming content (unless discussing budget for purchase)

WHEN ASKED OUT-OF-SCOPE QUESTIONS:
Respond with: "I'm here to help with financial literacy, but I can't provide [topic] information. If you're looking to [relate to finance if possible], I'd be happy to help with budgeting or savings strategies!"

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

WORK OPPORTUNITY FRAMEWORK:
When users need money or ask about earning:
1. Ask about their skills, hobbies, and available time
2. Assess their financial goal (target amount and timeline)
3. Use suggest_work_opportunities tool for personalized recommendations
4. Emphasize STARTING SMALL and building reputation
5. Always mention saving 20% of earnings for taxes/emergency fund
6. Provide REAL LINKS in underlined/highlighted format for job platforms

LEARNING RESOURCES FRAMEWORK:
When users mention wanting to learn ANY skill (writing, design, coding, video editing, VA, etc.):
1. **IMMEDIATELY** call suggest_learning_resources tool - DON'T give generic advice
2. **NEVER** suggest "search YouTube" or "look for Udemy courses" - use the TOOL instead  
3. Tool returns ACTUAL CLICKABLE LINKS - present them as: **[Resource Name](URL)**
4. Show earning potential and learning timeline from tool results
5. Keywords that MUST trigger tool: "learn", "video editing", "graphic design", "coding", "freelancing", "where to study"

**CRITICAL**: If you mention YouTube, Udemy, Coursera WITHOUT providing actual clickable links from the tool, you're doing it WRONG.

✅ CORRECT: Call tool → Get real links → Present: **[DaVinci Resolve Tutorial](https://youtube.com/watch?v=UguJiz00meQ)** - Free software (1 hour)
❌ WRONG: "Search for Peter McKinnon on YouTube" (no actual link)

The tool has 51 pre-curated resources with REAL URLs. ALWAYS use it!

Example responses for learning:
✅ "I see you're interested in freelancing but don't have the skills yet. Let me find learning resources for you..."
✅ "Great that you want to learn! Here are FREE YouTube courses and websites where you can start..."
✅ "This skill takes about 2-3 months to learn. Based on your ₱20,000 goal, you could start earning in 3-4 months. Here's where to learn..."

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
- Format job/work links as: **[Platform Name](URL)** - Description
- Always highlight/underline important URLs for easy clicking

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
        },
        {
          type: "function",
          function: {
            name: "suggest_work_opportunities",
            description: "Suggest freelancing platforms and job opportunities based on skills and financial goals",
            parameters: {
              type: "object",
              properties: {
                skills: { type: "string", description: "User's skills, hobbies, or interests" },
                query: { type: "string", description: "Additional context about work needs" }
              },
              required: ["skills"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "suggest_learning_resources",
            description: "**USE THIS TOOL** when user wants to learn any skill (video editing, graphic design, coding, writing, etc.). Returns ACTUAL clickable YouTube links, course URLs, and platform links. DO NOT suggest 'search YouTube' or mention courses without using this tool first. Keywords: learn, video editing, graphic design, web development, freelancing, coding, tutorials, courses, where to study.",
            parameters: {
              type: "object",
              properties: {
                skill: { type: "string", description: "The skill the user wants to learn (e.g., 'video editing', 'graphic design', 'web development', 'freelancing')" },
                query: { type: "string", description: "Additional context about learning goals" }
              },
              required: ["skill"]
            }
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
          
          case "suggest_work_opportunities":
            const workSuggestions = this.generateWorkSuggestions(functionArgs.skills || functionArgs.query || JSON.stringify(functionArgs))
            functionResult = JSON.stringify(workSuggestions)
            break
          
          case "suggest_learning_resources":
            console.log('📚 Learning resources requested with args:', functionArgs)
            const skillQuery = functionArgs.skill || functionArgs.query || JSON.stringify(functionArgs)
            console.log('📚 Skill query:', skillQuery)
            const learningMatches = findLearningResources(skillQuery)
            console.log('📚 Found matches:', learningMatches.length)
            
            if (learningMatches.length > 0) {
              functionResult = JSON.stringify({
                foundSkills: learningMatches.map(skill => ({
                  skill: skill.skill,
                  category: skill.category,
                  description: skill.description,
                  averageEarning: skill.averageEarning,
                  timeToLearn: skill.timeToLearn,
                  topResources: skill.resources.slice(0, 5).map(resource => ({
                    title: resource.title,
                    url: resource.url,
                    type: resource.type,
                    provider: resource.provider,
                    difficulty: resource.difficulty,
                    duration: resource.duration,
                    isFree: resource.isFree,
                    description: resource.description
                  }))
                })),
                totalSkillsFound: learningMatches.length
              })
            } else {
              const beginnerSkills = getBeginnerFriendlySkills()
              functionResult = JSON.stringify({
                message: "No exact match found. Here are beginner-friendly skills:",
                recommendedSkills: beginnerSkills.map(skill => ({
                  skill: skill.skill,
                  category: skill.category,
                  description: skill.description,
                  averageEarning: skill.averageEarning,
                  timeToLearn: skill.timeToLearn,
                  topResources: skill.resources.slice(0, 3).map(resource => ({
                    title: resource.title,
                    url: resource.url,
                    type: resource.type,
                    difficulty: resource.difficulty,
                    isFree: resource.isFree
                  }))
                }))
              })
            }
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
        console.log('📨 Final response received:', { 
          hasChoices: !!finalData.choices, 
          choicesLength: finalData.choices?.length,
          hasError: !!finalData.error 
        })
        
        if (finalData.error) {
          console.error('❌ OpenAI API Error:', finalData.error)
          throw new Error(finalData.error.message || 'OpenAI API error')
        }
        
        if (!finalData.choices || finalData.choices.length === 0) {
          console.error('❌ No choices in response:', finalData)
          throw new Error('No response from OpenAI')
        }
        
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

  private generateWorkSuggestions(input: string): any {
    const lowerInput = input.toLowerCase()
    
    // Common freelancing platforms and job sites for Philippines
    const freelancingPlatforms = {
      general: [
        { name: 'Upwork', url: 'https://www.upwork.com', description: 'Global freelancing platform with diverse opportunities' },
        { name: 'Freelancer.com', url: 'https://freelancer.com', description: 'International marketplace for various skills' },
        { name: 'Fiverr', url: 'https://fiverr.com', description: 'Gig-based platform perfect for specific services' },
        { name: 'OnlineJobs.ph', url: 'https://onlinejobs.ph', description: 'Philippines dedicated job platform' },
        { name: 'Kalibrr', url: 'https://kalibrr.com', description: 'Philippine job platform with remote opportunities' }
      ],
      writing: [
        { name: 'ContentFly', url: 'https://contentfly.com', description: 'Content writing platform' },
        { name: 'WriterAccess', url: 'https://writeraccess.com', description: 'Professional writing marketplace' },
        { name: 'Contently', url: 'https://contently.com', description: 'Content marketing platform' }
      ],
      design: [
        { name: '99designs', url: 'https://99designs.com', description: 'Design contest and marketplace platform' },
        { name: 'Dribbble Jobs', url: 'https://dribbble.com/jobs', description: 'Design job board' },
        { name: 'Behance', url: 'https://behance.net', description: 'Creative portfolio and job platform' }
      ],
      tech: [
        { name: 'GitHub Jobs', url: 'https://github.com/jobs', description: 'Tech jobs from GitHub' },
        { name: 'Stack Overflow Jobs', url: 'https://stackoverflow.com/jobs', description: 'Developer job board' },
        { name: 'AngelList', url: 'https://angel.co', description: 'Startup jobs and equity opportunities' }
      ],
      tutoring: [
        { name: 'Preply', url: 'https://preply.com', description: 'Online tutoring platform' },
        { name: 'iTalki', url: 'https://italki.com', description: 'Language teaching platform' },
        { name: 'Cambly', url: 'https://cambly.com', description: 'English conversation tutoring' }
      ],
      delivery: [
        { name: 'GrabFood', url: 'https://grab.com/ph/driver/', description: 'Food delivery driver opportunities' },
        { name: 'Foodpanda', url: 'https://foodpanda.com.ph', description: 'Food delivery platform' },
        { name: 'Lalamove', url: 'https://lalamove.com', description: 'Logistics and delivery platform' }
      ]
    }

    // Analyze input to suggest relevant categories
    let suggestions: any[] = []
    let targetEarning = 0
    
    // Extract financial goal if mentioned
    const amountMatch = input.match(/(?:₱|php|pesos?)\s*([0-9,]+)/i)
    if (amountMatch) {
      targetEarning = parseInt(amountMatch[1].replace(/,/g, ''))
    }

    // Skill-based suggestions
    if (lowerInput.includes('writing') || lowerInput.includes('content') || lowerInput.includes('blog')) {
      suggestions.push({
        category: 'Content Writing & Copywriting',
        platforms: freelancingPlatforms.writing.concat(freelancingPlatforms.general.slice(0, 3)),
        earningPotential: '₱500-2,000 per article',
        skills: ['English proficiency', 'Research skills', 'SEO knowledge'],
        tips: 'Start with blog posts and social media content. Build a portfolio on Medium or personal blog.'
      })
    }

    if (lowerInput.includes('design') || lowerInput.includes('graphic') || lowerInput.includes('logo')) {
      suggestions.push({
        category: 'Graphic Design & Creative',
        platforms: freelancingPlatforms.design.concat(freelancingPlatforms.general.slice(0, 3)),
        earningPotential: '₱1,000-5,000 per project',
        skills: ['Adobe Creative Suite', 'Canva', 'Design principles'],
        tips: 'Create sample designs for different industries. Offer logo + business card packages.'
      })
    }

    if (lowerInput.includes('programming') || lowerInput.includes('coding') || lowerInput.includes('web') || lowerInput.includes('app')) {
      suggestions.push({
        category: 'Programming & Web Development',
        platforms: freelancingPlatforms.tech.concat(freelancingPlatforms.general.slice(0, 3)),
        earningPotential: '₱2,000-10,000 per project',
        skills: ['HTML/CSS', 'JavaScript', 'Python/PHP', 'Database management'],
        tips: 'Start with simple websites. Learn popular frameworks like React or WordPress.'
      })
    }

    if (lowerInput.includes('teaching') || lowerInput.includes('tutor') || lowerInput.includes('english') || lowerInput.includes('math')) {
      suggestions.push({
        category: 'Online Tutoring & Teaching',
        platforms: freelancingPlatforms.tutoring.concat([freelancingPlatforms.general[0]]),
        earningPotential: '₱300-800 per hour',
        skills: ['Subject expertise', 'Communication', 'Patience', 'Internet connection'],
        tips: 'Filipinos are in high demand for English tutoring. Flexible schedule perfect for students.'
      })
    }

    if (lowerInput.includes('delivery') || lowerInput.includes('driver') || lowerInput.includes('grab') || lowerInput.includes('motorcycle')) {
      suggestions.push({
        category: 'Delivery & Transportation',
        platforms: freelancingPlatforms.delivery,
        earningPotential: '₱800-1,500 per day',
        skills: ['Valid license', 'Own vehicle', 'Navigation skills', 'Time management'],
        tips: 'Peak hours (lunch, dinner) offer higher earnings. Maintain good ratings for more orders.'
      })
    }

    // If no specific skills mentioned, provide general suggestions
    if (suggestions.length === 0) {
      suggestions = [
        {
          category: 'Data Entry & Virtual Assistant',
          platforms: freelancingPlatforms.general,
          earningPotential: '₱15,000-25,000 per month',
          skills: ['Computer literacy', 'Attention to detail', 'English communication', 'Time management'],
          tips: 'Perfect for beginners. Start with simple tasks and build reputation gradually.'
        },
        {
          category: 'Social Media Management',
          platforms: freelancingPlatforms.general.slice(0, 3),
          earningPotential: '₱8,000-20,000 per month per client',
          skills: ['Social media knowledge', 'Content creation', 'Basic design', 'Scheduling tools'],
          tips: 'Offer packages including content creation, posting schedule, and engagement management.'
        },
        {
          category: 'Online Selling & E-commerce',
          platforms: [
            { name: 'Shopee', url: 'https://shopee.ph', description: 'Philippines e-commerce platform' },
            { name: 'Lazada', url: 'https://lazada.com.ph', description: 'Online marketplace' },
            { name: 'Facebook Marketplace', url: 'https://facebook.com/marketplace', description: 'Social commerce platform' }
          ],
          earningPotential: '₱5,000-50,000 per month',
          skills: ['Product sourcing', 'Customer service', 'Basic photography', 'Marketing'],
          tips: 'Start with products you understand. Use dropshipping to minimize initial investment.'
        }
      ]
    }

    // Add earning timeline if target amount was mentioned
    if (targetEarning > 0) {
      suggestions.forEach(suggestion => {
        const avgMonthlyEarning = this.extractAvgEarning(suggestion.earningPotential)
        if (avgMonthlyEarning > 0) {
          const monthsNeeded = Math.ceil(targetEarning / avgMonthlyEarning)
          suggestion.timeToGoal = `Approximately ${monthsNeeded} month${monthsNeeded > 1 ? 's' : ''} to reach ₱${targetEarning.toLocaleString()}`
        }
      })
    }

    return {
      suggestions,
      generalTips: [
        'Start with one platform and build your reputation before expanding',
        'Always deliver quality work on time to get positive reviews',
        'Set aside 20% of earnings for taxes and emergency fund',
        'Invest in improving your skills through free online courses',
        'Network with other freelancers for referrals and tips'
      ],
      nextSteps: [
        'Create professional profiles on suggested platforms',
        'Build a portfolio showcasing your best work',
        'Set competitive but fair pricing for your services',
        'Apply to 5-10 relevant jobs daily to build momentum'
      ]
    }
  }

  private extractAvgEarning(earningText: string): number {
    // Simple extraction of average earning from text like "₱15,000-25,000 per month"
    const matches = earningText.match(/₱([0-9,]+)(?:-([0-9,]+))?/g)
    if (matches && matches.length > 0) {
      const numbers = matches[0].replace(/₱|,/g, '').match(/\d+/g)
      if (numbers) {
        if (numbers.length === 2) {
          return (parseInt(numbers[0]) + parseInt(numbers[1])) / 2
        } else {
          return parseInt(numbers[0])
        }
      }
    }
    return 0
  }
}
