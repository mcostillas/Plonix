import { NextRequest, NextResponse } from 'next/server'
import { PlounixAIAgent } from '@/lib/langchain-agent'
import { getAuthenticatedMemoryContext, addToUserMemory } from '@/lib/authenticated-memory'
import { getCurrentUser } from '@/lib/auth'

// In-memory storage for chat sessions (use database in production)
const aiAgents = new Map<string, PlounixAIAgent>()

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get authenticated user for memory context
    let authenticatedUser = null
    try {
      const user = await getCurrentUser()
      authenticatedUser = user || null
    } catch (error) {
      // User not authenticated, continue with general mode
      console.log('User not authenticated, providing general advice')
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

    // Use authenticated user ID if available, otherwise fall back to provided/default userId
    const effectiveUserId = authenticatedUser?.id || userId || 'anonymous'

    // Get or create AI agent for this user
    let agent = aiAgents.get(effectiveUserId)
    if (!agent) {
      agent = new PlounixAIAgent()
      aiAgents.set(effectiveUserId, agent)
    }

    // Build smart context with memory (only for authenticated users)
    let contextualMessage = message
    if (authenticatedUser) {
      try {
        contextualMessage = await getAuthenticatedMemoryContext(authenticatedUser.id, message)
      } catch (error) {
        console.log('Memory not available, using direct message')
      }
    }

    // Get AI response with user context
    const response = await agent.chat(effectiveUserId, contextualMessage, authenticatedUser)

    // Save to memory if user is authenticated
    if (authenticatedUser) {
      try {
        await addToUserMemory(authenticatedUser.id, message, response)
      } catch (error) {
        console.log('Could not save to memory, continuing without persistence')
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
