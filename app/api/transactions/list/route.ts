import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Authorization header
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required',
        success: false 
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Create Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
      return NextResponse.json({ 
        error: 'Invalid authentication',
        success: false 
      }, { status: 401 })
    }

    const { limit = 50, offset = 0, category, startDate, endDate } = await request.json()

    console.log('📊 Fetching transactions for user:', user.id)

    // Build query
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: transactions, error } = await query

    if (error) {
      console.error('❌ Error fetching transactions:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch transactions',
        success: false 
      }, { status: 500 })
    }

    // Calculate summary statistics
    const totalIncome = transactions
      ?.filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0

    const totalExpenses = transactions
      ?.filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0

    // Get category breakdown
    const categoryBreakdown = transactions?.reduce((acc: any, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { count: 0, total: 0, type: t.transaction_type }
      }
      acc[t.category].count++
      acc[t.category].total += parseFloat(t.amount.toString())
      return acc
    }, {})

    console.log(`✅ Found ${transactions?.length || 0} transactions`)

    return NextResponse.json({ 
      success: true,
      transactions: transactions || [],
      summary: {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        transactionCount: transactions?.length || 0
      },
      categoryBreakdown: categoryBreakdown || {}
    })

  } catch (error) {
    console.error('❌ Transaction list API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}
