import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/challenges/[id]/join - Join a challenge
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id
    
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
    
    // Check if challenge exists
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('is_active', true)
      .single()
    
    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }
    
    // Check if user already has an active instance of this challenge
    const { data: existing } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .eq('status', 'active')
      .maybeSingle()
    
    if (existing) {
      return NextResponse.json({ 
        error: 'You already have an active instance of this challenge' 
      }, { status: 400 })
    }
    
    // Join the challenge
    const { data: userChallenge, error: joinError } = await supabase
      .from('user_challenges')
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (joinError) {
      console.error('Error joining challenge:', joinError)
      return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      userChallenge,
      message: `You've joined "${challenge.title}"! Good luck! 🎯`
    })
    
  } catch (error) {
    console.error('Join challenge API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
