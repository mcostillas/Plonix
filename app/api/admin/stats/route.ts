import { NextResponse } from 'next/server'
import { requireAdmin, createAdminClient } from '@/lib/admin-auth'

export async function GET() {
  try {
    // Check admin authentication
    await requireAdmin()

    const supabase = await createAdminClient()

    // Fetch dashboard stats from the view
    const { data: stats, error } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single()

    if (error) {
      console.error('Stats query error:', error)
      
      // If view doesn't exist yet, return default values
      return NextResponse.json({
        total_users: 0,
        active_users: 0,
        inactive_users: 0,
        signups_today: 0,
        signups_this_week: 0,
        signups_this_month: 0,
        visits_this_month: 0,
        new_bug_reports: 0,
        active_bug_reports: 0,
      })
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Admin stats error:', error)
    
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
