import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Initialize Supabase with service role key for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * CRON endpoint to create daily bill payment reminders
 * Should be called once per day (e.g., via Vercel Cron Jobs)
 * GET /api/cron/bill-reminders
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (optional: add authorization header check)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    const currentDay = today.getDate()
    
    console.log(`🔔 Running bill reminders cron for day ${currentDay}`)

    // Fetch all active monthly bills
    const { data: bills, error: billsError } = await supabaseAdmin
      .from('scheduled_payments')
      .select('*')
      .eq('is_active', true)

    if (billsError) {
      console.error('Error fetching bills:', billsError)
      return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 })
    }

    if (!bills || bills.length === 0) {
      console.log('No active bills found')
      return NextResponse.json({ message: 'No active bills to process', created: 0 })
    }

    let notificationsCreated = 0
    const notifications = []

    for (const bill of bills) {
      const dueDay = bill.due_day
      const daysUntilDue = dueDay - currentDay

      // Create notification if due date is within the next 7 days (or already passed this month)
      let shouldNotify = false
      let daysMessage = ''

      if (daysUntilDue === 0) {
        shouldNotify = true
        daysMessage = 'due today'
      } else if (daysUntilDue > 0 && daysUntilDue <= 7) {
        shouldNotify = true
        daysMessage = `due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`
      } else if (daysUntilDue < 0) {
        // Bill due date has passed this month, calculate days until next month
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
        const daysUntilNextDue = Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilNextDue <= 7) {
          shouldNotify = true
          daysMessage = `due in ${daysUntilNextDue} day${daysUntilNextDue > 1 ? 's' : ''}`
        }
      }

      if (shouldNotify) {
        // Check if notification already exists for today for this bill
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const { data: existingNotification } = await supabaseAdmin
          .from('notifications')
          .select('id')
          .eq('user_id', bill.user_id)
          .eq('type', 'bill_reminder')
          .gte('created_at', todayStart.toISOString())
          .ilike('title', `%${bill.name}%`)
          .maybeSingle()

        if (!existingNotification) {
          notifications.push({
            user_id: bill.user_id,
            type: 'bill_reminder',
            title: `Bill Reminder: ${bill.name}`,
            message: `Your ${bill.name} payment of ₱${Number(bill.amount).toLocaleString()} is ${daysMessage}`,
            link: '/transactions',
            is_read: false,
            created_at: new Date().toISOString()
          })
          notificationsCreated++
        }
      }
    }

    // Bulk insert notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('notifications')
        .insert(notifications)

      if (insertError) {
        console.error('Error creating notifications:', insertError)
        return NextResponse.json({ error: 'Failed to create notifications' }, { status: 500 })
      }
    }

    console.log(`✅ Created ${notificationsCreated} bill reminder notifications`)

    return NextResponse.json({ 
      success: true,
      message: `Bill reminders processed`,
      created: notificationsCreated,
      totalBills: bills.length
    })

  } catch (error) {
    console.error('Bill reminders cron error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
