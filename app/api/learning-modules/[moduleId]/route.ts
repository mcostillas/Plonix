import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Disable caching

// GET single module content by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const moduleId = params.moduleId
    console.log(`🔍 Fetching module content for: ${moduleId}`)
    
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
      .from('learning_module_content')
      .select('*')
      .eq('module_id', moduleId)
      .single()

    if (error || !data) {
      console.error(`❌ Module not found: ${moduleId}`, error)
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Successfully fetched module: ${data.module_title}`)
    
    // Return the full module content
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error: any) {
    console.error('Module fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
