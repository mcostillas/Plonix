import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Initialize Supabase client with service role to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '')
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// POST: AI adds a transaction (income or expense) for the user
export async function POST(request: NextRequest) {
  try {
    console.log('💰 Transaction creation API called')
    const body = await request.json()
    console.log('📥 Request body:', JSON.stringify(body, null, 2))
    
    const { 
      userId, 
      amount,
      transactionType, // 'income' or 'expense'
      merchant,
      category,
      date,
      paymentMethod,
      notes
    } = body

    // Validate required fields
    if (!userId || !amount || !transactionType) {
      console.log('❌ Validation failed: missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, transactionType' }, 
        { status: 400 }
      )
    }

    // Validate transaction type
    if (transactionType !== 'income' && transactionType !== 'expense') {
      return NextResponse.json(
        { error: 'Transaction type must be either "income" or "expense"' }, 
        { status: 400 }
      )
    }

    // Validate amount
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' }, 
        { status: 400 }
      )
    }

    // Auto-detect category if not provided
    const finalCategory = category || detectCategory(transactionType, merchant || '', notes || '')

    // Auto-detect payment method if not provided
    const finalPaymentMethod = paymentMethod || detectPaymentMethod(merchant || '', notes || '')

    // Ensure merchant is never null
    const finalMerchant = merchant || (transactionType === 'income' ? 'Other Income' : 'Other Expense')

    // Use provided date or default to today
    const finalDate = date || new Date().toISOString().split('T')[0]

    // 🛡️ VALIDATION: Check available money BEFORE allowing expense
    if (transactionType === 'expense') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

      // Get monthly income
      const { data: incomeData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('transaction_type', 'income')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)

      // Get monthly bills
      const { data: billsData } = await supabase
        .from('scheduled_payments')
        .select('amount')
        .eq('user_id', userId)
        .eq('is_active', true)

      // Get current expenses
      const { data: expensesData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('transaction_type', 'expense')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)

      const monthlyIncome = incomeData?.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0) || 0
      const monthlyBills = billsData?.reduce((sum: number, bill: any) => sum + Number(bill.amount), 0) || 0
      const currentExpenses = expensesData?.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0) || 0
      const availableMoney = monthlyIncome - monthlyBills - currentExpenses

      // Block expense if insufficient funds
      if (numAmount > availableMoney) {
        console.log('❌ Insufficient funds:', {
          requested: numAmount,
          available: availableMoney,
          income: monthlyIncome,
          bills: monthlyBills,
          expenses: currentExpenses
        })

        if (availableMoney <= 0) {
          return NextResponse.json({
            error: 'Insufficient funds',
            message: `You have ₱${Math.abs(availableMoney).toLocaleString()} deficit. Cannot add ₱${numAmount.toLocaleString()} expense. Please add income first!`,
            details: {
              requested: numAmount,
              available: availableMoney,
              monthlyIncome,
              monthlyBills,
              currentExpenses,
              deficit: Math.abs(availableMoney)
            }
          }, { status: 400 })
        } else {
          return NextResponse.json({
            error: 'Insufficient funds',
            message: `You only have ₱${availableMoney.toLocaleString()} available, but trying to spend ₱${numAmount.toLocaleString()}. Short by ₱${(numAmount - availableMoney).toLocaleString()}!`,
            details: {
              requested: numAmount,
              available: availableMoney,
              monthlyIncome,
              monthlyBills,
              currentExpenses,
              shortfall: numAmount - availableMoney
            }
          }, { status: 400 })
        }
      }

      // Log warning if money is getting low
      const moneyAfterExpense = availableMoney - numAmount
      if (moneyAfterExpense > 0 && moneyAfterExpense < 1000) {
        console.log('⚠️ Low funds warning:', {
          afterExpense: moneyAfterExpense,
          message: `Only ₱${moneyAfterExpense.toLocaleString()} will remain after this expense`
        })
      }
    }

    console.log('📝 Preparing to insert transaction:', { 
      userId, 
      amount: numAmount,
      type: transactionType,
      category: finalCategory, 
      merchant: finalMerchant,
      paymentMethod: finalPaymentMethod
    })

    // Insert transaction into database
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: numAmount,
        transaction_type: transactionType,
        merchant: finalMerchant,
        category: finalCategory,
        date: finalDate,
        payment_method: finalPaymentMethod,
        notes: notes || null
      })
      .select()

    if (error) {
      console.error('❌ Database error creating transaction:', error)
      console.error('Error code:', error.code)
      console.error('Error details:', error.details)
      return NextResponse.json(
        { error: 'Failed to create transaction', details: error.message, code: error.code }, 
        { status: 500 }
      )
    }

    console.log('✅ Transaction created successfully:', data[0])
    
    // Return success with created transaction
    return NextResponse.json({ 
      success: true, 
      transaction: data[0],
      message: `${transactionType === 'income' ? 'Income' : 'Expense'} of ₱${numAmount.toLocaleString()} recorded successfully!`
    })

  } catch (error) {
    console.error('Transaction creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Helper function to detect category from context
function detectCategory(type: string, merchant: string, notes: string): string {
  const text = `${merchant} ${notes}`.toLowerCase()
  
  if (type === 'income') {
    // Income categories
    const incomeCategories: { [key: string]: string[] } = {
      'salary': ['salary', 'wage', 'payroll', 'sweldo', 'sahod'],
      'freelance': ['freelance', 'client', 'gig', 'upwork', 'fiverr', 'raket'],
      'business': ['business', 'sales', 'profit', 'negosyo', 'kita'],
      'investment': ['dividend', 'interest', 'stock', 'investment', 'tubo'],
      'gift': ['gift', 'regalo', 'bonus', 'incentive'],
      'other-income': ['refund', 'cashback', 'rebate']
    }

    for (const [category, keywords] of Object.entries(incomeCategories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category
      }
    }
    return 'other-income'
  } else {
    // Expense categories
    const expenseCategories: { [key: string]: string[] } = {
      'food': ['food', 'restaurant', 'jollibee', 'mcdo', 'kain', 'grocery', 'sari-sari'],
      'transportation': ['grab', 'taxi', 'jeep', 'mrt', 'lrt', 'bus', 'gas', 'pamasahe', 'transport'],
      'bills': ['bill', 'electric', 'water', 'meralco', 'internet', 'wifi', 'load', 'kuryente', 'tubig'],
      'shopping': ['shopping', 'lazada', 'shopee', 'mall', 'clothes', 'damit'],
      'entertainment': ['movie', 'netflix', 'spotify', 'game', 'concert', 'libangan'],
      'health': ['medicine', 'doctor', 'hospital', 'pharmacy', 'gamot', 'medical'],
      'education': ['school', 'tuition', 'book', 'pag-aaral', 'uniform'],
      'personal-care': ['salon', 'barber', 'gupit', 'beauty', 'hygiene'],
      'housing': ['rent', 'upa', 'mortgage', 'condo'],
      'debt': ['loan', 'utang', 'payment', 'bayad']
    }

    for (const [category, keywords] of Object.entries(expenseCategories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category
      }
    }
    return 'other'
  }
}

// Helper function to detect payment method
function detectPaymentMethod(merchant: string, notes: string): string {
  const text = `${merchant} ${notes}`.toLowerCase()
  
  const methods: { [key: string]: string[] } = {
    'gcash': ['gcash', 'g-cash'],
    'maya': ['maya', 'paymaya'],
    'card': ['card', 'credit', 'debit', 'visa', 'mastercard'],
    'bank': ['bank', 'bpi', 'bdo', 'transfer', 'online banking'],
    'cash': ['cash', 'pera', 'bayad']
  }

  for (const [method, keywords] of Object.entries(methods)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return method
    }
  }
  
  return 'cash' // Default to cash
}
