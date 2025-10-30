import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Initialize Supabase client with service role to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '') // Remove trailing slash
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()

console.log('🔑 Supabase URL:', supabaseUrl)
console.log('🔑 Service Role Key present:', serviceRoleKey ? `YES (${serviceRoleKey.substring(0, 20)}...)` : 'NO')

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

// POST: AI creates a goal for the user
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Goal creation API called')
    const body = await request.json()
    console.log('📥 Request body:', JSON.stringify(body, null, 2))
    
    const { 
      userId, 
      title, 
      description,
      targetAmount, 
      currentAmount,
      category, 
      deadline,
      icon,
      color,
      aiGenerated
    } = body

    // Validate required fields
    if (!userId || !title || !targetAmount) {
      console.log('❌ Validation failed: missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, targetAmount' }, 
        { status: 400 }
      )
    }

    // Validate target amount
    const target = parseFloat(targetAmount)
    if (isNaN(target) || target <= 0) {
      return NextResponse.json(
        { error: 'Target amount must be a positive number' }, 
        { status: 400 }
      )
    }

    // Validate current amount if provided
    const current = currentAmount ? parseFloat(currentAmount) : 0
    if (isNaN(current) || current < 0) {
      return NextResponse.json(
        { error: 'Current amount must be a non-negative number' }, 
        { status: 400 }
      )
    }

    // Validate deadline - must not be in the past
    if (deadline) {
      const deadlineDate = new Date(deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day for fair comparison
      
      if (deadlineDate < today) {
        console.log('❌ Validation failed: deadline is in the past')
        return NextResponse.json(
          { error: 'Deadline cannot be in the past. Please choose today or a future date.' }, 
          { status: 400 }
        )
      }
    }

    // Auto-detect category if not provided
    const finalCategory = category || detectCategory(title, description || '')

    // Auto-suggest icon if not provided
    const finalIcon = icon || suggestIcon(finalCategory)

    // Auto-suggest color if not provided
    const finalColor = color || suggestColor(finalCategory)

    console.log('📝 Preparing to insert goal with:', { 
      userId, 
      title, 
      category: finalCategory, 
      icon: finalIcon, 
      color: finalColor 
    })

    // Insert goal into database
    // Note: user_id should be UUID format, not TEXT
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId, // This should be UUID from auth.users
        title,
        description: description || null,
        target_amount: target,
        current_amount: current,
        category: finalCategory,
        deadline: deadline || null,
        icon: finalIcon,
        color: finalColor,
        status: 'active'
      })
      .select()

    if (error) {
      console.error('❌ Database error creating goal:', error)
      console.error('Error code:', error.code)
      console.error('Error details:', error.details)
      return NextResponse.json(
        { error: 'Failed to create goal', details: error.message, code: error.code }, 
        { status: 500 }
      )
    }

    console.log('✅ Goal created successfully:', data[0])
    
    // Return success with created goal
    return NextResponse.json({ 
      success: true, 
      goal: data[0],
      message: aiGenerated 
        ? 'Goal created by AI assistant based on your conversation!' 
        : 'Goal created successfully',
      aiGenerated: aiGenerated || false
    })

  } catch (error) {
    console.error('Goal creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Helper function to detect category from text
function detectCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()
  
  // Category detection patterns
  const categories: { [key: string]: string[] } = {
    'emergency-fund': ['emergency', 'panabla', 'contingency', 'safety net', '3-6 months'],
    'education': ['education', 'school', 'tuition', 'pag-aaral', 'college', 'university', 'course', 'training', 'seminar'],
    'travel': ['travel', 'trip', 'vacation', 'biyahe', 'tour', 'abroad', 'japan', 'korea', 'europe'],
    'gadget': ['phone', 'laptop', 'gadget', 'iphone', 'macbook', 'computer', 'tablet', 'gaming'],
    'home': ['house', 'bahay', 'condo', 'apartment', 'down payment', 'mortgage', 'furniture'],
    'investment': ['invest', 'stock', 'puhunan', 'business', 'mp2', 'mutual fund', 'crypto'],
    'healthcare': ['health', 'medical', 'hospital', 'insurance', 'dental', 'checkup'],
    'wedding': ['wedding', 'kasal', 'marriage', 'honeymoon', 'prenup'],
    'transportation': ['car', 'motor', 'bike', 'sasakyan', 'vehicle', 'kotse'],
    'debt': ['debt', 'utang', 'loan', 'credit card', 'pay off']
  }

  // Find matching category
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category
    }
  }

  return 'custom'
}

// Helper function to suggest icon based on category
function suggestIcon(category: string): string {
  const icons: { [key: string]: string } = {
    'emergency-fund': '🛡️',
    'education': '🎓',
    'travel': '✈️',
    'gadget': '📱',
    'home': '🏠',
    'investment': '📈',
    'healthcare': '🏥',
    'wedding': '💒',
    'transportation': '🚗',
    'debt': '💳',
    'savings': '💰',
    'retirement': '🌅',
    'custom': '🎯'
  }

  return icons[category] || '🎯'
}

// Helper function to suggest color based on category
function suggestColor(category: string): string {
  const colors: { [key: string]: string } = {
    'emergency-fund': 'red',
    'education': 'blue',
    'travel': 'purple',
    'gadget': 'indigo',
    'home': 'green',
    'investment': 'emerald',
    'healthcare': 'pink',
    'wedding': 'rose',
    'transportation': 'orange',
    'debt': 'yellow',
    'savings': 'teal',
    'retirement': 'cyan',
    'custom': 'gray'
  }

  return colors[category] || 'blue'
}
