import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST: Save a learning reflection
export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      moduleId, 
      moduleTitle, 
      phase, 
      stepNumber, 
      question, 
      answer 
    } = await request.json()

    // Validate required fields
    if (!userId || !moduleId || !phase || !question || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Basic sentiment detection
    const sentiment = detectSentiment(answer)

    // Extract insights from answer
    const extractedInsights = extractInsights(answer, question)

    // Save to database
    const { data, error } = await supabase
      .from('learning_reflections')
      .insert({
        user_id: userId,
        module_id: moduleId,
        module_title: moduleTitle,
        phase,
        step_number: stepNumber,
        question,
        answer,
        sentiment,
        extracted_insights: extractedInsights,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error saving reflection:', error)
      return NextResponse.json(
        { error: 'Failed to save reflection', details: error.message }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Reflection saved successfully' 
    })

  } catch (error) {
    console.error('Learning reflections API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// GET: Retrieve learning reflections for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const moduleId = searchParams.get('moduleId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' }, 
        { status: 400 }
      )
    }

    let query = supabase
      .from('learning_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by module if provided
    if (moduleId) {
      query = query.eq('module_id', moduleId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching reflections:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reflections', details: error.message }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length 
    })

  } catch (error) {
    console.error('Learning reflections API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Helper function to detect sentiment
function detectSentiment(text: string): string {
  const lowerText = text.toLowerCase()
  
  // Positive indicators
  const positiveWords = ['excited', 'happy', 'great', 'good', 'confident', 'motivated', 'eager', 'kaya ko', 'maganda', 'masaya']
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length

  // Concerned/negative indicators
  const concernedWords = ['worried', 'scared', 'difficult', 'hard', 'mahirap', 'takot', 'problema', 'hirap', 'confused', 'lost']
  const concernedCount = concernedWords.filter(word => lowerText.includes(word)).length

  // Motivated indicators
  const motivatedWords = ['will', 'going to', 'plan to', 'gagawin ko', 'try', 'start', 'begin', 'simula']
  const motivatedCount = motivatedWords.filter(word => lowerText.includes(word)).length

  if (positiveCount > 0 || motivatedCount > 1) return 'motivated'
  if (concernedCount > 0) return 'concerned'
  if (motivatedCount > 0) return 'positive'
  
  return 'neutral'
}

// Helper function to extract insights
function extractInsights(answer: string, question: string): any {
  const insights: any = {}
  const lowerAnswer = answer.toLowerCase()

  // Extract financial goals
  const goalKeywords = ['save', 'goal', 'target', 'achieve', 'ipon', 'gusto', 'pangarap']
  if (goalKeywords.some(keyword => lowerAnswer.includes(keyword))) {
    insights.hasGoal = true
    
    // Try to extract specific goals
    const goalMatches = answer.match(/(?:save|ipon|goal|target).*?(?:for|para sa|ng)\s+([^.,\n]+)/gi)
    if (goalMatches) {
      insights.goals = goalMatches.map(m => m.trim())
    }
  }

  // Extract amounts mentioned
  const amountMatches = answer.match(/₱[\d,]+|\d+[\s]*(?:pesos?|php)/gi)
  if (amountMatches) {
    insights.mentionedAmounts = amountMatches
  }

  // Extract challenges/concerns
  const challengeKeywords = ['challenge', 'difficult', 'hard', 'problem', 'mahirap', 'problema', 'hirap']
  if (challengeKeywords.some(keyword => lowerAnswer.includes(keyword))) {
    insights.hasChallenges = true
  }

  // Extract timeframes
  const timeframeMatches = answer.match(/(?:in|within|sa loob ng)\s+(\d+)\s+(day|week|month|year|araw|linggo|buwan|taon)/gi)
  if (timeframeMatches) {
    insights.timeframes = timeframeMatches
  }

  // Extract specific financial topics mentioned
  const topics = []
  if (lowerAnswer.includes('budget') || lowerAnswer.includes('badyet')) topics.push('budgeting')
  if (lowerAnswer.includes('saving') || lowerAnswer.includes('ipon')) topics.push('saving')
  if (lowerAnswer.includes('debt') || lowerAnswer.includes('utang')) topics.push('debt')
  if (lowerAnswer.includes('invest') || lowerAnswer.includes('puhunan')) topics.push('investing')
  if (lowerAnswer.includes('emergency') || lowerAnswer.includes('panabla')) topics.push('emergency-fund')
  if (lowerAnswer.includes('insurance') || lowerAnswer.includes('seguro')) topics.push('insurance')
  
  if (topics.length > 0) {
    insights.topics = topics
  }

  // Extract question type for context
  insights.questionContext = question.toLowerCase().includes('why') ? 'reasoning' :
                             question.toLowerCase().includes('how') ? 'action' :
                             question.toLowerCase().includes('what') ? 'knowledge' :
                             'reflection'

  return insights
}
