import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBillReminder } from '@/lib/smart-notification-triggers'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
)

export async function POST(request: NextRequest) {
  try {
    const { userId, name, amount, category, dueDay, description, isActive } = await request.json()

    // Validation
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    if (!name || !amount || !category || !dueDay) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, amount, category, and dueDay are required' 
      }, { status: 400 })
    }

    // Validate amount
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Amount must be a positive number' 
      }, { status: 400 })
    }

    // Validate due day (1-31)
    const parsedDueDay = parseInt(dueDay)
    if (isNaN(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31) {
      return NextResponse.json({ 
        success: false, 
        error: 'Due day must be between 1 and 31' 
      }, { status: 400 })
    }

    // Validate category
    const validCategories = ['Housing', 'Utilities', 'Subscriptions', 'Transportation', 'Insurance', 'Other']
    const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    
    if (!validCategories.includes(normalizedCategory)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      }, { status: 400 })
    }

    console.log('💳 Adding monthly bill:', {
      userId,
      name,
      amount: parsedAmount,
      category: normalizedCategory,
      dueDay: parsedDueDay,
      description,
      isActive: isActive !== false
    })

    // Insert into scheduled_payments table
    const { data, error } = await supabase
      .from('scheduled_payments')
      .insert({
        user_id: userId,
        name: name.trim(),
        amount: parsedAmount,
        category: normalizedCategory,
        due_day: parsedDueDay,
        description: description?.trim() || null,
        is_active: isActive !== false // Default to true
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error inserting monthly bill:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to add monthly bill to database',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Monthly bill added successfully:', data)

    // Check if bill is due soon and create notification
    try {
      const today = new Date()
      const currentDay = today.getDate()
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      
      // Calculate days until due
      let daysUntilDue: number
      
      if (parsedDueDay >= currentDay) {
        // Due this month
        const dueDate = new Date(currentYear, currentMonth, parsedDueDay)
        daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      } else {
        // Due next month
        const dueDate = new Date(currentYear, currentMonth + 1, parsedDueDay)
        daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      }
      
      // Send notification if bill is due within 7 days
      if (daysUntilDue >= 0 && daysUntilDue <= 7) {
        await sendBillReminder(
          userId,
          name.trim(),
          parsedAmount,
          parsedDueDay,
          daysUntilDue,
          data.id
        )
        console.log(`📬 Bill reminder notification created for "${name}" (due in ${daysUntilDue} days)`)
      }
    } catch (notifError) {
      // Don't fail the bill creation if notification fails
      console.error('⚠️ Error creating bill reminder notification:', notifError)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Monthly bill "${name}" added successfully. It will be due on day ${parsedDueDay} of each month.`,
      bill: data
    })

  } catch (error) {
    console.error('❌ Error in monthly bill API:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
