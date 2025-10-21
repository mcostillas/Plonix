/**
 * AI Usage Limits Manager
 * 
 * Handles AI interaction limits based on membership type:
 * - freemium: 50 messages/month
 * - premium: unlimited
 */

export type MembershipType = 'freemium' | 'premium'

export interface AIUsageLimit {
  allowed: boolean
  remaining: number // -1 = unlimited
  limit: number // -1 = unlimited
  membershipType: MembershipType
  resetDate?: string
  message?: string
}

// Constants
const FREEMIUM_MONTHLY_LIMIT = 50
const UNLIMITED = -1

/**
 * Get membership type from user metadata
 */
export function getMembershipType(userMetadata: any): MembershipType {
  return userMetadata?.membership_type || 'freemium' // Default to freemium
}

/**
 * Get limit for membership type
 */
export function getMembershipLimit(membershipType: MembershipType): number {
  return membershipType === 'premium' ? UNLIMITED : FREEMIUM_MONTHLY_LIMIT
}

/**
 * Check if user can send AI message
 * Returns usage limit information
 */
export async function checkAIUsageLimit(
  supabase: any,
  userId: string,
  membershipType: MembershipType
): Promise<AIUsageLimit> {
  const limit = getMembershipLimit(membershipType)

  // Unlimited for premium
  if (membershipType === 'premium') {
    return {
      allowed: true,
      remaining: UNLIMITED,
      limit: UNLIMITED,
      membershipType,
      message: 'Unlimited AI access (Premium)'
    }
  }

  // Check freemium limit
  const currentMonth = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
  
  try {
    // Get current usage
    const { data: usage, error } = await supabase
      .from('ai_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking AI usage:', error)
      // Fail open - allow on error but log it
      return {
        allowed: true,
        remaining: limit,
        limit,
        membershipType,
        message: 'Usage check failed, allowing request'
      }
    }

    const messageCount = usage?.message_count || 0

    // Check if limit reached
    if (messageCount >= limit) {
      const nextMonth = new Date(currentMonth + '-01')
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      
      return {
        allowed: false,
        remaining: 0,
        limit,
        membershipType,
        resetDate: nextMonth.toISOString(),
        message: `You've reached your monthly limit of ${limit} AI messages. Upgrade to Premium for unlimited access, or wait until ${nextMonth.toLocaleDateString()} when your limit resets.`
      }
    }

    // Under limit
    return {
      allowed: true,
      remaining: limit - messageCount,
      limit,
      membershipType,
      message: `${limit - messageCount} AI messages remaining this month (Freemium)`
    }
  } catch (error) {
    console.error('Error in checkAIUsageLimit:', error)
    // Fail open - allow the request but log the error
    return {
      allowed: true,
      remaining: limit,
      limit,
      membershipType,
      message: 'Usage tracking unavailable'
    }
  }
}

/**
 * Increment AI usage counter after successful message
 */
export async function incrementAIUsage(
  supabase: any,
  userId: string,
  membershipType: MembershipType
): Promise<boolean> {
  // Don't track premium users
  if (membershipType === 'premium') {
    return true
  }

  const currentMonth = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
  
  try {
    // Try to get existing record
    const { data: existing } = await supabase
      .from('ai_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single()

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('ai_usage_tracking')
        .update({
          message_count: existing.message_count + 1,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('month', currentMonth)

      if (error) {
        console.error('Error updating AI usage:', error)
        return false
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('ai_usage_tracking')
        .insert({
          user_id: userId,
          month: currentMonth,
          message_count: 1,
          last_message_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error creating AI usage record:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error in incrementAIUsage:', error)
    return false
  }
}

/**
 * Get user's AI usage statistics
 */
export async function getAIUsageStats(
  supabase: any,
  userId: string,
  membershipType: MembershipType
): Promise<{
  currentMonth: string
  messageCount: number
  membershipType: MembershipType
  limit: number
  remaining: number
  limitReached: boolean
  resetDate: string
}> {
  const currentMonth = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
  const limit = getMembershipLimit(membershipType)
  
  try {
    const { data: usage } = await supabase
      .from('ai_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single()

    const messageCount = usage?.message_count || 0
    const remaining = limit === UNLIMITED ? UNLIMITED : Math.max(0, limit - messageCount)
    const limitReached = limit !== UNLIMITED && messageCount >= limit

    // Calculate reset date (first day of next month)
    const resetDate = new Date(currentMonth + '-01')
    resetDate.setMonth(resetDate.getMonth() + 1)

    return {
      currentMonth,
      messageCount,
      membershipType,
      limit,
      remaining,
      limitReached,
      resetDate: resetDate.toISOString()
    }
  } catch (error) {
    console.error('Error getting AI usage stats:', error)
    
    // Return default stats on error
    const resetDate = new Date(currentMonth + '-01')
    resetDate.setMonth(resetDate.getMonth() + 1)

    return {
      currentMonth,
      messageCount: 0,
      membershipType,
      limit,
      remaining: limit,
      limitReached: false,
      resetDate: resetDate.toISOString()
    }
  }
}
