import { NextRequest, NextResponse } from 'next/server'
import { WebSearchService } from '@/lib/web-search'
import { langchainMemory } from '@/lib/langchain-memory-simple'
import { serverAuth } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const { message, userId = null } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        response: "🔧 **Setup Required**: No OpenAI API key found. Please add your API key to the .env.local file.",
        success: true,
        fallback: true
      })
    }

    // Get authenticated user if available
    let authenticatedUserId = null
    try {
      const currentUser = await serverAuth.getUserFromHeaders(request)
      if (currentUser.success && currentUser.user) {
        authenticatedUserId = currentUser.user.id
      }
    } catch (error) {
      // User not authenticated, continue with limited features
    }

    // Build context (enhanced for authenticated users, basic for others)
    let enhancedContext: string
    try {
      enhancedContext = await langchainMemory.buildSmartContext(authenticatedUserId, message)
    } catch (error) {
      console.error('Memory system error:', error)
      // Fallback to basic context
      enhancedContext = `
You are Plounix AI, a helpful Filipino financial assistant. The user asked: "${message}"

Please provide helpful financial advice. Be encouraging, use Philippine financial context when relevant, and suggest creating an account for personalized features.
`
    }

    // Initialize web search service
    const webSearch = new WebSearchService()

    // Define functions that the AI can call
    const tools = [
      {
        type: "function",
        function: {
          name: "search_web",
          description: "Search the internet for current information, news, prices, or any real-time data",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to look up on the internet"
              }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_current_prices",
          description: "Get current prices for items or products in Philippines from shopping sites",
          parameters: {
            type: "object",
            properties: {
              item: {
                type: "string",
                description: "The item or product to search prices for"
              }
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
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_financial_news",
          description: "Get latest financial news from Philippines",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      }
    ]

    // Enhanced system prompt with LangChain memory integration
    const systemPrompt = `You are Plounix AI - a Filipino financial assistant with advanced personalized memory powered by LangChain.

PERSONALITY & APPROACH:
- Speak in Taglish (Filipino + English mix) 
- Use "kuya/ate" friendly tone
- Reference Filipino culture: 13th month pay, paluwagan, jeepney fare
- Be encouraging and celebrate user progress
- Always reference relevant past conversations and personal context

ENHANCED MEMORY CONTEXT:
${enhancedContext}

CAPABILITIES:
- Budget analysis and planning with personalized recommendations
- Savings strategies based on user's proven successful methods
- Investment basics tailored for Filipino market
- Financial tips adapted to user's income level and lifestyle
- Web search for current information, prices, news, and bank rates
- Advanced memory: Remember user preferences, track goal progress, learn from successful strategies

MEMORY INTEGRATION INSTRUCTIONS:
- ALWAYS reference specific details from the user's context above
- Build on previously successful strategies mentioned in their history
- Address challenges they've previously shared
- Use their preferred communication style and budget methods
- Celebrate progress on goals you've discussed before
- Reference their personal situation (income, occupation, location)
- Acknowledge past conversations and how things have progressed

TOOLS AVAILABLE:
- search_web: Search internet for any current information
- get_current_prices: Get current prices for items in Philippines  
- get_bank_rates: Get current bank interest rates
- search_financial_news: Get latest financial news

FILIPINO CONTEXT:
- Consider typical income ranges ₱15,000-30,000 for young adults
- Reference local banks: BPI, BDO, Metrobank, UnionBank
- Include digital wallets: GCash, PayMaya, Maya
- Use local examples: jeepney fare, rice prices, tuition fees
- Consider cultural factors: family obligations, bayanihan spirit

Remember: This user has a history with you. Use their context to provide truly personalized advice that builds on your relationship and their specific financial journey.`

    // First call to OpenAI to see if it wants to use any tools
    const initialMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ]

    // Call OpenAI API with function calling capability
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: initialMessages,
        tools: tools,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API Error:', errorData)
      
      if (openaiResponse.status === 401) {
        throw new Error('Invalid API key')
      }
      
      if (openaiResponse.status === 429) {
        throw new Error('Quota exceeded')
      }
      
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const data = await openaiResponse.json()
    const assistantMessage = data.choices[0]?.message

    let finalAiResponse = ""

    // Check if AI wants to call a function
    if (assistantMessage.tool_calls) {
      const toolCall = assistantMessage.tool_calls[0]
      const functionName = toolCall.function.name
      const functionArgs = JSON.parse(toolCall.function.arguments)

      let functionResult = ""

      // Execute the requested function
      switch (functionName) {
        case "search_web":
          const searchResults = await webSearch.searchWeb(functionArgs.query)
          functionResult = JSON.stringify(searchResults.slice(0, 3))
          break
        
        case "get_current_prices":
          const priceResults = await webSearch.getCurrentPrice(functionArgs.item)
          functionResult = JSON.stringify(priceResults)
          break
        
        case "get_bank_rates":
          const bankRates = await webSearch.getBankRates()
          functionResult = JSON.stringify(bankRates)
          break
        
        case "search_financial_news":
          const newsResults = await webSearch.searchFinancialNews()
          functionResult = JSON.stringify(newsResults)
          break
        
        default:
          functionResult = "Function not available"
      }

      // Send the function result back to OpenAI for final response
      const finalMessages = [
        ...initialMessages,
        assistantMessage,
        {
          role: "tool",
          tool_call_id: toolCall.id,
          content: functionResult
        }
      ]

      const finalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: finalMessages,
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      const finalData = await finalResponse.json()
      finalAiResponse = finalData.choices[0]?.message?.content || "I'm having trouble generating a response right now."

    } else {
      // If no function call, use the regular response
      finalAiResponse = assistantMessage?.content || "I'm having trouble generating a response right now."
    }

    // Save conversation to LangChain memory only for authenticated users
    if (authenticatedUserId) {
      try {
        await langchainMemory.addConversation(authenticatedUserId, message, finalAiResponse)
      } catch (error) {
        console.error('Error saving to memory:', error)
        // Continue without saving to memory
      }
    }

    return NextResponse.json({ 
      response: `🤖 ${finalAiResponse}`,
      success: true,
      model: 'gpt-4o-mini',
      memorySystem: authenticatedUserId ? 'langchain-enhanced' : 'basic',
      isAuthenticated: !!authenticatedUserId,
      userId: authenticatedUserId
    })

  } catch (error) {
    console.error('Enhanced AI API Error:', error)
    
    // Smart fallback response
    const fallbackResponse = "I'm having trouble connecting to OpenAI right now, pero I can still help! For budgeting, try the 50-30-20 rule - 50% needs, 30% wants, 20% savings. What's your monthly income?"
    
    return NextResponse.json({ 
      response: `⚠️ ${fallbackResponse}\n\n(Note: OpenAI API is temporarily unavailable)`,
      success: true,
      fallback: true
    })
  }
}