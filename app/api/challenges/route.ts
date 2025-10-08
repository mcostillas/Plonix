import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/challenges - List all available challenges
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const category = request.nextUrl.searchParams.get('category')
    const difficulty = request.nextUrl.searchParams.get('difficulty')
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Build query
    let query = supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('difficulty', { ascending: true })
      .order('total_participants', { ascending: false })
    
    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }
    
    const { data: challenges, error } = await query
    
    if (error) {
      console.error('Error fetching challenges:', error)
      return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
    }
    
    return NextResponse.json({ challenges })
    
  } catch (error) {
    console.error('Challenges API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
