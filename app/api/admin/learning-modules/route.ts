import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/admin-auth'
import { requireAdmin } from '@/lib/admin-middleware'

export const dynamic = 'force-dynamic'

// GET all learning modules
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('learning_module_content')
      .select('*')
      .order('category', { ascending: true })
      .order('module_id', { ascending: true })

    if (error) {
      console.error('Failed to fetch modules:', error)
      return NextResponse.json(
        { error: 'Failed to fetch modules' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('Admin modules API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// CREATE new learning module
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const supabase = await createAdminClient()

    // Validate required fields
    if (!body.module_id || !body.module_title) {
      return NextResponse.json(
        { error: 'module_id and module_title are required' },
        { status: 400 }
      )
    }

    // Create module
    const { data, error } = await supabase
      .from('learning_module_content')
      .insert([{
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Failed to create module:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create module' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Admin create module error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// UPDATE learning module
export async function PUT(request: NextRequest) {
  try {
    // Check admin authorization
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body
    const supabase = await createAdminClient()

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    // Update module
    const { data, error } = await supabase
      .from('learning_module_content')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update module:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update module' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Admin update module error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE learning module
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authorization
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const supabase = await createAdminClient()

    if (!id) {
      return NextResponse.json(
        { error: 'id parameter is required' },
        { status: 400 }
      )
    }

    // Delete module
    const { error } = await supabase
      .from('learning_module_content')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete module:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete module' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Admin delete module error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
