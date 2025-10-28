import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/admin-auth'
import { requireAdmin } from '@/lib/admin-middleware'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Multi-layer admin authentication check
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = await createAdminClient()

    // Fetch dashboard stats from the view
    const { data: stats, error } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single()

    // Fetch additional learning modules stats
    const { data: learningStats } = await supabase
      .from('learning_module_content')
      .select('module_id, category')

    const totalModules = learningStats?.length || 0
    const coreModules = learningStats?.filter(m => m.category === 'core').length || 0
    const essentialModules = learningStats?.filter(m => m.category === 'essential').length || 0

    // Fetch transactions stats
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: totalTransactions } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })

    const { count: transactionsThisMonth } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Fetch goals stats
    const { count: totalGoals } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })

    const { count: activeGoals } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: completedGoals } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // Fetch challenges stats
    const { count: totalChallenges } = await supabase
      .from('user_challenges')
      .select('*', { count: 'exact', head: true })

    const { count: activeChallenges } = await supabase
      .from('user_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (error) {
      console.error('Stats query error:', error)
      
      // If view doesn't exist yet, return default values with new stats
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
        // Learning modules
        total_modules: totalModules,
        core_modules: coreModules,
        essential_modules: essentialModules,
        // Transactions
        total_transactions: totalTransactions || 0,
        transactions_this_month: transactionsThisMonth || 0,
        // Goals
        total_goals: totalGoals || 0,
        active_goals: activeGoals || 0,
        completed_goals: completedGoals || 0,
        // Challenges
        total_challenges: totalChallenges || 0,
        active_challenges_count: activeChallenges || 0,
      })
    }

    return NextResponse.json({
      ...stats,
      // Learning modules
      total_modules: totalModules,
      core_modules: coreModules,
      essential_modules: essentialModules,
      // Transactions
      total_transactions: totalTransactions || 0,
      transactions_this_month: transactionsThisMonth || 0,
      // Goals
      total_goals: totalGoals || 0,
      active_goals: activeGoals || 0,
      completed_goals: completedGoals || 0,
      // Challenges
      total_challenges: totalChallenges || 0,
      active_challenges_count: activeChallenges || 0,
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
