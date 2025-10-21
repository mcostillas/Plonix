import { NextRequest, NextResponse } from 'next/server'
import { PlounixAIAgent } from '@/lib/langchain-agent'
import { getAuthenticatedMemoryContext, addToUserMemory } from '@/lib/authenticated-memory'
import { createClient } from '@supabase/supabase-js'
import { checkAIUsageLimit, incrementAIUsage, getMembershipType } from '@/lib/ai-usage-limits'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// In-memory storage for chat sessions (use database in production)
const aiAgents = new Map<string, PlounixAIAgent>()

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, recentMessages, language } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log('📨 Received message for session:', sessionId)
    console.log('💬 Recent messages count:', recentMessages?.length || 0)
    console.log('🌐 Language preference:', language || 'taglish (default)')

    // Get authenticated user from Authorization header (token-based auth for API routes)
    let authenticatedUser: any = null
    let supabaseClient: any = null
    
    try {
      const authHeader = request.headers.get('Authorization')
      console.log('🔑 Auth header present:', !!authHeader)
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        
        // Create Supabase client with the token
        supabaseClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          }
        )
        
        // Get user from token
        const { data: { user }, error } = await supabaseClient.auth.getUser()
        
        if (user && !error) {
          const membershipType = getMembershipType(user.user_metadata)
          
          authenticatedUser = {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.email?.split('@')[0],
            membershipType
          }
          console.log('🔐 Authentication check:', {
            isAuthenticated: true,
            userId: authenticatedUser.id,
            userEmail: authenticatedUser.email,
            membershipType: authenticatedUser.membershipType
          })
        } else {
          console.log('❌ Token validation failed:', error?.message)
        }
      } else {
        console.log('⚠️ No Authorization header found')
      }
    } catch (error) {
      // User not authenticated, continue with general mode
      console.log('❌ Authentication error:', error)
    }

    // ✅ CHECK AI USAGE LIMIT (for authenticated users only)
    if (authenticatedUser && supabaseClient) {
      try {
        const usageLimit = await checkAIUsageLimit(
          supabaseClient,
          authenticatedUser.id,
          authenticatedUser.membershipType
        )

        console.log('📊 AI Usage Check:', usageLimit)

        if (!usageLimit.allowed) {
          // User has reached their limit
          return NextResponse.json({
            response: usageLimit.message,
            success: false,
            limitReached: true,
            membershipType: authenticatedUser.membershipType,
            remaining: 0,
            resetDate: usageLimit.resetDate,
            authenticated: true
          })
        }

        // Log remaining messages for freemium users
        if (authenticatedUser.membershipType === 'freemium' && usageLimit.remaining >= 0) {
          console.log(`💬 Freemium user has ${usageLimit.remaining} messages remaining`)
        }
      } catch (error) {
        console.error('⚠️ Error checking AI usage limit:', error)
        // Continue on error (fail open) but log it
      }
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not found, using fallback response')
      const fallbackResponse = authenticatedUser 
        ? "Hi! I notice the AI is not fully configured yet. You'll need to add your OpenAI API key to the .env.local file. Since you're logged in, I'll remember our conversation once the AI is configured! In the meantime, I can still help with basic financial advice!"
        : "Hi! I notice the AI is not fully configured yet. You'll need to add your OpenAI API key to the .env.local file. Consider logging in for a personalized experience once the AI is ready!"
      
      return NextResponse.json({ 
        response: fallbackResponse,
        success: true,
        fallback: true,
        authenticated: !!authenticatedUser
      })
    }

    // Use authenticated user ID for user identification, sessionId for chat separation
    const userId = authenticatedUser?.id || 'anonymous'
    const effectiveSessionId = sessionId || `${userId}_default`

    // Get or create AI agent for this session
    let agent = aiAgents.get(effectiveSessionId)
    if (!agent) {
      agent = new PlounixAIAgent()
      aiAgents.set(effectiveSessionId, agent)
    }

    // Build smart context with memory (only for authenticated users)
    // Use actual userId for database queries, sessionId for chat grouping
    let contextualMessage = message
    if (authenticatedUser) {
      try {
        // Pass user.id for database queries, but keep sessionId for conversation context
        contextualMessage = await getAuthenticatedMemoryContext(authenticatedUser.id, message, authenticatedUser, recentMessages)
      } catch (error) {
        console.log('Memory not available, using direct message:', error)
      }
    }

    // Get AI response with user context
    // Pass recent messages for immediate session context
    const response = await agent.chat(effectiveSessionId, contextualMessage, authenticatedUser, recentMessages, language)

    // ✅ INCREMENT AI USAGE COUNTER (for authenticated users only)
    if (authenticatedUser && supabaseClient) {
      try {
        await incrementAIUsage(supabaseClient, authenticatedUser.id, authenticatedUser.membershipType)
        console.log('📈 AI usage incremented for user:', authenticatedUser.id)
      } catch (error) {
        console.error('⚠️ Error incrementing AI usage:', error)
        // Continue anyway - don't block the response
      }
    }

    // Save to memory if user is authenticated
    // CRITICAL FIX: Pass effectiveSessionId (not user.id!) as first parameter for session_id
    if (authenticatedUser) {
      try {
        await addToUserMemory(effectiveSessionId, message, response, authenticatedUser)
      } catch (error) {
        console.log('Could not save to memory, continuing without persistence:', error)
      }
    }

    return NextResponse.json({ 
      response,
      success: true,
      authenticated: !!authenticatedUser,
      memoryEnabled: !!authenticatedUser
    })

  } catch (error) {
    console.error('AI Chat API Error:', error)
    
    // Check if it's an API key issue
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json({ 
        response: "Setup Required: The AI needs an OpenAI API key to work. Please add your API key to the .env.local file as OPENAI_API_KEY=your_key_here. Once configured, I'll be able to provide personalized financial advice!",
        success: true,
        fallback: true,
        authenticated: false
      })
    }
    
    // Fallback to mock response if AI fails
    const mockResponses = [
      "I'm having trouble connecting to my AI brain right now, pero I can still help! For budgeting, try the 50-30-20 rule - 50% needs, 30% wants, 20% savings. What's your monthly income para ma-calculate ko?",
      "Sorry, my AI connection is down, but here's what I know: Start with emergency fund worth 3-6 months expenses. Then invest in GCash GInvest or COL Financial. How much can you save monthly?",
      "My AI is temporarily offline, but I can share this tip: Track expenses using GCash transaction history or create a simple notes list. Ano bang biggest expense mo monthly?",
      "AI connection failed, pero here's timeless advice: Compare prices before buying, look for sales during 11.11 or 12.12, and always factor in delivery fees. What are you planning to buy?"
    ]
    
    const fallbackResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    
    return NextResponse.json({ 
      response: fallbackResponse + "\n\nNote: AI is temporarily unavailable, pero I'm still here to help!",
      success: true,
      fallback: true,
      authenticated: false
    })
  }
}
