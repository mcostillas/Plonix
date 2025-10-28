import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/admin-auth'
import { requireAdmin } from '@/lib/admin-middleware'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = await createAdminClient()

    // Fetch landing page content from database
    const { data, error } = await supabase
      .from('landing_page_content')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error
    }

    // Return content or default empty state
    return NextResponse.json({
      content: data?.content || null
    })
  } catch (error: any) {
    console.error('Landing page GET error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch landing page content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = await createAdminClient()

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('landing_page_content')
      .select('id')
      .single()

    let result

    if (existing) {
      // Update existing
      result = await supabase
        .from('landing_page_content')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      // Insert new
      result = await supabase
        .from('landing_page_content')
        .insert({
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    }

    if (result.error) {
      throw result.error
    }

    return NextResponse.json({
      success: true,
      message: 'Landing page content updated successfully'
    })
  } catch (error: any) {
    console.error('Landing page POST error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save landing page content' },
      { status: 500 }
    )
  }
}
