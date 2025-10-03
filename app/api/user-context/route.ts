import { NextRequest, NextResponse } from 'next/server'
import { userContextBuilder } from '@/lib/user-context-builder'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please log in to see your AI context'
      }, { status: 401 })
    }

    // Build complete user context
    const userContext = await userContextBuilder.buildCompleteUserContext(user.id)
    
    // Format it as the AI would see it
    const aiFormattedContext = userContextBuilder.formatContextForAI(userContext)

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      contextData: userContext,
      aiPromptContext: aiFormattedContext,
      summary: {
        hasTransactions: userContext.transactions.count > 0,
        transactionCount: userContext.transactions.count,
        hasGoals: userContext.goals.count > 0,
        goalCount: userContext.goals.count,
        hasChallenges: userContext.challenges.joined > 0,
        challengeCount: userContext.challenges.joined,
        hasProfile: userContext.profile.hasProfile,
        hasAnyData: userContext.insights.hasData,
        recommendations: userContext.insights.recommendations
      },
      message: 'This is what your AI assistant knows about you!'
    })

  } catch (error) {
    console.error('User context error:', error)
    return NextResponse.json({
      error: 'Failed to build user context',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
