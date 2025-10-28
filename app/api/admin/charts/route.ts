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

    // Get user signups for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    const signupsData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        
        const { count } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', date)
          .lt('created_at', nextDate.toISOString().split('T')[0])

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          signups: count || 0
        }
      })
    )

    // Get transactions for the last 7 days
    const transactionsData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, type')
          .gte('created_at', date)
          .lt('created_at', nextDate.toISOString().split('T')[0])

        const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0
        const expense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          income,
          expense
        }
      })
    )

    // Get user distribution by membership
    const { data: users } = await supabase
      .from('user_profiles')
      .select('membership_tier')

    const membershipData = [
      { name: 'Freemium', value: users?.filter(u => (u.membership_tier || 'freemium') === 'freemium').length || 0 },
      { name: 'Premium', value: users?.filter(u => u.membership_tier === 'premium').length || 0 }
    ]

    // Get goals by status
    const { data: goals } = await supabase
      .from('goals')
      .select('status')

    const goalsData = [
      { name: 'Active', value: goals?.filter(g => g.status === 'active').length || 0 },
      { name: 'Completed', value: goals?.filter(g => g.status === 'completed').length || 0 },
      { name: 'Abandoned', value: goals?.filter(g => g.status === 'abandoned').length || 0 }
    ]

    // Get module completion rates
    const { data: moduleProgress } = await supabase
      .from('learning_module_content')
      .select('module_id, title')

    const moduleData = await Promise.all(
      (moduleProgress || []).slice(0, 5).map(async (module) => {
        const { count: totalUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })

        const { count: completedUsers } = await supabase
          .from('user_learning_progress')
          .select('*', { count: 'exact', head: true })
          .eq('module_id', module.module_id)
          .eq('completed', true)

        return {
          name: module.title.length > 15 ? module.title.substring(0, 15) + '...' : module.title,
          completion: totalUsers ? Math.round(((completedUsers || 0) / totalUsers) * 100) : 0
        }
      })
    )

    // Get age distribution
    const { data: userAges } = await supabase
      .from('user_profiles')
      .select('age')
      .not('age', 'is', null)

    // Group ages into ranges
    const ageRanges = {
      '18-20': 0,
      '21-25': 0,
      '26-30': 0,
      '31-35': 0,
      '36-40': 0,
      '40+': 0
    }

    userAges?.forEach(user => {
      const age = user.age
      if (age >= 18 && age <= 20) ageRanges['18-20']++
      else if (age >= 21 && age <= 25) ageRanges['21-25']++
      else if (age >= 26 && age <= 30) ageRanges['26-30']++
      else if (age >= 31 && age <= 35) ageRanges['31-35']++
      else if (age >= 36 && age <= 40) ageRanges['36-40']++
      else if (age > 40) ageRanges['40+']++
    })

    const ageData = Object.entries(ageRanges).map(([range, count]) => ({
      age: range,
      users: count
    }))

    return NextResponse.json({
      signups: signupsData,
      transactions: transactionsData,
      membership: membershipData,
      goals: goalsData,
      modules: moduleData,
      ages: ageData
    })
  } catch (error: any) {
    console.error('Admin charts API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}
