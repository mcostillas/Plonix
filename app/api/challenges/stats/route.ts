import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: Request) {
  try {
    console.log('🔍 API: Fetching global challenge statistics...')
    
    // Fetch ALL user_challenges records (bypassing RLS with service role)
    const { data: allChallenges, error } = await supabaseAdmin
      .from('user_challenges')
      .select('user_id, status, progress')

    if (error) {
      console.error('❌ API Error fetching challenge stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch challenge statistics', details: error.message },
        { status: 500 }
      )
    }

    console.log('📊 API: Total challenge records fetched:', allChallenges?.length || 0)
    console.log('📊 API: Sample records:', allChallenges?.slice(0, 3))

    // Calculate statistics
    const uniqueUserIds = new Set(allChallenges?.map((uc: any) => uc.user_id) || [])
    const totalMembers = uniqueUserIds.size
    
    // Count completed challenges (status = 'completed' OR progress = 100)
    const completedChallenges = allChallenges?.filter((uc: any) => 
      uc.status === 'completed' || uc.progress >= 100
    ).length || 0

    console.log('📊 API: Unique users who joined challenges:', totalMembers)
    console.log('📊 API: Unique user IDs:', Array.from(uniqueUserIds))
    console.log('📊 API: Completed challenges:', completedChallenges)

    return NextResponse.json({
      totalMembers,
      completedChallenges,
      totalChallengeEntries: allChallenges?.length || 0,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ API Exception in challenge stats:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
