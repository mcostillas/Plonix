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

    const { transactionId, amount, category, merchant, date, paymentMethod, notes, transactionType } = await request.json()

    if (!transactionId) {
      return NextResponse.json({ 
        error: 'Transaction ID is required',
        success: false 
      }, { status: 400 })
    }

    console.log('✏️ Updating transaction:', transactionId)

    // Build update object - only include fields that are provided
    const updates: any = {}
    
    if (amount !== undefined) updates.amount = parseFloat(amount.toString())
    if (category !== undefined) updates.category = category
    if (merchant !== undefined) updates.merchant = merchant
    if (date !== undefined) updates.date = date
    if (paymentMethod !== undefined) updates.payment_method = paymentMethod
    if (notes !== undefined) updates.notes = notes
    if (transactionType !== undefined) updates.transaction_type = transactionType

    // Ensure user can only update their own transactions
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating transaction:', error)
      return NextResponse.json({ 
        error: 'Failed to update transaction',
        details: error.message,
        success: false 
      }, { status: 500 })
    }

    if (!transaction) {
      return NextResponse.json({ 
        error: 'Transaction not found or access denied',
        success: false 
      }, { status: 404 })
    }

    console.log('✅ Transaction updated successfully')

    return NextResponse.json({ 
      success: true,
      transaction,
      message: 'Transaction updated successfully'
    })

  } catch (error) {
    console.error('❌ Transaction update API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}
