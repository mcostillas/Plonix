import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/challenges/[id]/abandon - Abandon a challenge
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userChallengeId = params.id
    
    // Get authenticated user
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const supabase = createClient(
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
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify user owns this challenge
    const { data: userChallenge, error: challengeError } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('id', userChallengeId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    if (challengeError || !userChallenge) {
      return NextResponse.json({ error: 'Challenge not found or not active' }, { status: 404 })
    }
    
    // Calculate partial points if enabled
    const { data: challenge } = await supabase
      .from('challenges')
      .select('points_full, points_partial_enabled')
      .eq('id', userChallenge.challenge_id)
      .single()
    
    let partialPoints = 0
    if (challenge?.points_partial_enabled && userChallenge.progress_percent > 0) {
      partialPoints = Math.floor((challenge.points_full * userChallenge.progress_percent) / 100)
    }
    
    // Mark as abandoned
    const { error: updateError } = await supabase
      .from('user_challenges')
      .update({
        status: 'abandoned',
        failed_at: new Date().toISOString(),
        failure_reason: 'manual_abandonment',
        partial_completion_percent: userChallenge.progress_percent,
        points_earned: partialPoints
      })
      .eq('id', userChallengeId)
    
    if (updateError) {
      console.error('Error abandoning challenge:', updateError)
      return NextResponse.json({ error: 'Failed to abandon challenge' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      partialPoints,
      message: partialPoints > 0 
        ? `Challenge abandoned. You earned ${partialPoints} points for your progress!`
        : 'Challenge abandoned. Try again when you\'re ready!'
    })
    
  } catch (error) {
    console.error('Abandon challenge API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
