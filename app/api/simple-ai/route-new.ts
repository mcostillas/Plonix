import { NextRequest, NextResponse } from 'next/server'
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
You are Fili, a helpful Filipino financial assistant. The user asked: "${message}"

Please provide helpful financial advice. Be encouraging, use Philippine financial context when relevant, and suggest creating an account for personalized features.
`
    }

    // Enhanced system prompt with web search instructions
    const systemPrompt = `You are Fili - a Filipino financial assistant with advanced personalized memory and web search capabilities.

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
- WEB SEARCH: You can search the internet for current information, prices, news, and bank rates
- Advanced memory: Remember user preferences, track goal progress, learn from successful strategies

MEMORY INTEGRATION INSTRUCTIONS:
- ALWAYS reference specific details from the user's context above
- Build on previously successful strategies mentioned in their history
- Address challenges they've previously shared
- Use their preferred communication style and budget methods
- Celebrate progress on goals you've discussed before
- Reference their personal situation (income, occupation, location)
- Acknowledge past conversations and how things have progressed

WEB SEARCH USAGE:
- Use web search to get current Philippine bank interest rates
- Search for current prices of items in Philippines (Shopee, Lazada, etc.)
- Look up latest financial news from Philippines
- Check current exchange rates (PHP to USD, etc.)
- Find current government financial programs or benefits
- Search for updated financial advice and trends

FILIPINO CONTEXT:
- Consider typical income ranges ₱15,000-30,000 for young adults
- Reference OFW remittances, 13th month pay, holiday bonuses
- Mention popular Filipino financial apps (GCash, Maya, etc.)
- Consider local expenses: jeepney fare, rice prices, rent costs
- Reference BSP (Bangko Sentral ng Pilipinas) for official rates
- Reference local banks: BPI, BDO, Metrobank, UnionBank
- Include digital wallets: GCash, PayMaya, Maya
- Use local examples: jeepney fare, rice prices, tuition fees
- Consider cultural factors: family obligations, bayanihan spirit

INSTRUCTIONS:
- When users ask about current prices, rates, or news, use web search automatically
- Always provide Philippine context in your financial advice
- Be encouraging and use personal details from their history
- Help them achieve goals they've previously discussed with you
- Remember: This user has a history with you. Use their context to provide truly personalized advice.`

    // Make API call to OpenAI with web search enabled
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',  // Use GPT-4o which has web search capabilities
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          // Enable web search - this allows the model to search the web automatically
          tools: [{ type: 'web_search' }],
          tool_choice: 'auto'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('OpenAI API Error:', errorData)
        
        if (response.status === 401) {
          return NextResponse.json({
            response: "🔑 **API Key Issue**: Invalid OpenAI API key. Please check your .env.local file.",
            success: false
          }, { status: 401 })
        }
        
        if (response.status === 429) {
          return NextResponse.json({
            response: "⏰ **Rate Limited**: Too many requests. Please wait a moment and try again.",
            success: false
          }, { status: 429 })
        }
        
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || "I'm having trouble generating a response right now."

      // Save conversation to memory if user is authenticated
      if (authenticatedUserId) {
        try {
          await langchainMemory.addConversation(authenticatedUserId, message, aiResponse)
        } catch (error) {
          console.error('Failed to save conversation to memory:', error)
          // Continue without saving - don't break the user experience
        }
      }

      return NextResponse.json({
        response: aiResponse,
        success: true,
        hasMemory: !!authenticatedUserId,
        webSearchEnabled: true
      })

    } catch (error) {
      console.error('AI response error:', error)
      return NextResponse.json({
        response: "🔧 **Service Issue**: I'm having trouble connecting right now. Please try again in a moment.",
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
