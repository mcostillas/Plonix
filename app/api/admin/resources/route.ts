import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/admin-auth'
import { requireAdmin } from '@/lib/admin-middleware'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = await createAdminClient()

    const { data: resources, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch resources:', error)
      return NextResponse.json(
        { error: 'Failed to fetch resources' },
        { status: 500 }
      )
    }

    return NextResponse.json(resources || [])
  } catch (error: any) {
    console.error('Admin resources GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = await createAdminClient()
    const body = await request.json()

    const { name, url, type, category, description, topics, services } = body

    if (!name || !url || !type || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('resources')
      .insert({
        name,
        url,
        type,
        category,
        description: description || null,
        topics: topics || [],
        services: services || [],
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create resource:', error)
      return NextResponse.json(
        { error: 'Failed to create resource' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Admin resources POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = await createAdminClient()
    const body = await request.json()

    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('resources')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update resource:', error)
      return NextResponse.json(
        { error: 'Failed to update resource' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Admin resources PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = await createAdminClient()
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete resource:', error)
      return NextResponse.json(
        { error: 'Failed to delete resource' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Admin resources DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
