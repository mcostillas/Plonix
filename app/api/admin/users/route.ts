import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/admin-auth'
import { requireAdmin } from '@/lib/admin-middleware'

export const dynamic = 'force-dynamic'

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

    // Fetch all users from auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Failed to fetch users from auth:', authError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get user profiles with additional data including membership
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, monthly_income, preferences, membership_tier, membership_status')

    const profilesMap = new Map(
      (profiles || []).map(p => [p.user_id, p])
    )

    // Get today's date range for active today check
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // Combine auth data with profile data
    const users = authData.users.map(user => {
      const profile: any = profilesMap.get(user.id) || {}
      
      // Check if user was active today
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
      const activeToday = lastSignIn && lastSignIn >= today

      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        monthly_income: profile.monthly_income || 0,
        preferences: profile.preferences || {},
        membership_tier: profile.membership_tier || 'freemium',
        membership_status: profile.membership_status || 'active',
        active_today: activeToday,
      }
    })

    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
