import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Disable caching

// GET all published resources (public endpoint)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching resources from database...')
    
    // Use service role to bypass RLS for public data
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('is_active', true) // Only fetch active resources
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Failed to fetch resources:', error)
      return NextResponse.json(
        { error: 'Failed to fetch resources', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} resources from database`)
    
    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error: any) {
    console.error('Resources API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
