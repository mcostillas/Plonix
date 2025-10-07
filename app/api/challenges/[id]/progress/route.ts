import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/challenges/[id]/progress - Log progress/check-in
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userChallengeId = params.id
    const body = await request.json()
    const { completed, note, checkin_date, value } = body
    
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
      .select('*, challenges(*)')
      .eq('id', userChallengeId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    if (challengeError || !userChallenge) {
      return NextResponse.json({ error: 'Challenge not found or not active' }, { status: 404 })
    }
    
    // Check if already checked in for this date
    const checkDate = checkin_date || new Date().toISOString().split('T')[0]
    const { data: existingCheckin } = await supabase
      .from('challenge_progress')
      .select('id')
      .eq('user_challenge_id', userChallengeId)
      .eq('checkin_date', checkDate)
      .maybeSingle()
    
    if (existingCheckin) {
      return NextResponse.json({ 
        error: 'Already checked in for this date' 
      }, { status: 400 })
    }
    
    // Determine progress type
    const isRetroactive = checkin_date && checkin_date !== new Date().toISOString().split('T')[0]
    const progressType = isRetroactive ? 'retroactive_checkin' : 'daily_checkin'
    
    // Log the progress
    const { data: progress, error: progressError } = await supabase
      .from('challenge_progress')
      .insert({
        user_challenge_id: userChallengeId,
        progress_type: progressType,
        checkin_date: checkDate,
        completed: completed ?? true,
        note: note || null,
        value: value || null
      })
      .select()
      .single()
    
    if (progressError) {
      console.error('Error logging progress:', progressError)
      return NextResponse.json({ error: 'Failed to log progress' }, { status: 500 })
    }
    
    // Get updated challenge info (triggers will have updated progress)
    const { data: updatedChallenge } = await supabase
      .from('user_challenges')
      .select('*, challenges(*)')
      .eq('id', userChallengeId)
      .single()
    
    // Check if challenge is now complete
    const isComplete = updatedChallenge?.progress_percent >= 100
    
    return NextResponse.json({ 
      success: true,
      progress,
      challenge: updatedChallenge,
      isComplete,
      message: isComplete 
        ? `🎉 Challenge complete! You earned ${updatedChallenge?.points_earned} points!`
        : `✅ Progress logged! ${updatedChallenge?.checkins_completed}/${updatedChallenge?.checkins_required} complete`
    })
    
  } catch (error) {
    console.error('Progress API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
