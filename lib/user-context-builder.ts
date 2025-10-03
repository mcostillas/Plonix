import { supabase } from './supabase'

export interface UserContextData {
  userId: string
  profile: {
    hasProfile: boolean
    financial_data?: any
    preferences?: any
    ai_insights?: any
    persona_data?: any
  }
  transactions: {
    count: number
    totalSpent: number
    recentTransactions: any[]
    topCategories: { category: string; amount: number }[]
  }
  goals: {
    count: number
    activeGoals: any[]
    totalTarget: number
    totalSaved: number
  }
  challenges: {
    joined: number
    participatedChallenges: any[]
  }
  learningProgress: {
    // Placeholder for future learning module tracking
    modulesCompleted: number
    currentModule: string | null
  }
  insights: {
    hasData: boolean
    spendingTrend: string
    savingsRate: number | null
    recommendations: string[]
  }
}

export class UserContextBuilder {
  
  /**
   * Gather ALL available data for a specific user
   * Handles empty tables gracefully
   */
  async buildCompleteUserContext(userId: string): Promise<UserContextData> {
    const context: UserContextData = {
      userId,
      profile: { hasProfile: false },
      transactions: { count: 0, totalSpent: 0, recentTransactions: [], topCategories: [] },
      goals: { count: 0, activeGoals: [], totalTarget: 0, totalSaved: 0 },
      challenges: { joined: 0, participatedChallenges: [] },
      learningProgress: { modulesCompleted: 0, currentModule: null },
      insights: { hasData: false, spendingTrend: 'unknown', savingsRate: null, recommendations: [] }
    }

    // Run all data gathering in parallel for performance
    await Promise.all([
      this.loadUserProfile(userId, context),
      this.loadTransactions(userId, context),
      this.loadGoals(userId, context),
      this.loadChallenges(userId, context)
    ])

    // Generate insights based on available data
    this.generateInsights(context)

    return context
  }

  /**
   * Load user profile from user_data table
   */
  private async loadUserProfile(userId: string, context: UserContextData) {
    try {
      const { data, error } = await (supabase as any)
        .from('user_data')
        .select('financial_data, preferences, ai_insights, persona_data')
        .eq('id', userId)
        .single()

      if (!error && data) {
        context.profile = {
          hasProfile: true,
          financial_data: data.financial_data || {},
          preferences: data.preferences || {},
          ai_insights: data.ai_insights || {},
          persona_data: data.persona_data || {}
        }
      }
    } catch (error) {
      console.log('No user profile found (this is okay for new users)')
    }
  }

  /**
   * Load user transactions from transactions table
   */
  private async loadTransactions(userId: string, context: UserContextData) {
    try {
      const { data: transactions, error } = await (supabase as any)
        .from('transactions')
        .select('amount, category, merchant, date, payment_method')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(10)

      if (!error && transactions && transactions.length > 0) {
        context.transactions.count = transactions.length
        context.transactions.recentTransactions = transactions

        // Calculate total spent
        context.transactions.totalSpent = transactions.reduce(
          (sum: number, t: any) => sum + Number(t.amount), 
          0
        )

        // Group by category
        const categoryMap = new Map<string, number>()
        transactions.forEach((t: any) => {
          if (t.category) {
            const current = categoryMap.get(t.category) || 0
            categoryMap.set(t.category, current + Number(t.amount))
          }
        })

        context.transactions.topCategories = Array.from(categoryMap.entries())
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3)
      }
    } catch (error) {
      console.log('No transactions found (user hasn\'t tracked expenses yet)')
    }
  }

  /**
   * Load user goals from savings_goals table
   */
  private async loadGoals(userId: string, context: UserContextData) {
    try {
      const { data: goals, error } = await (supabase as any)
        .from('savings_goals')
        .select('goal_name, goal_amount, current_savings, monthly_savings, created_at')
        .eq('user_id', userId)

      if (!error && goals && goals.length > 0) {
        context.goals.count = goals.length
        context.goals.activeGoals = goals

        // Calculate totals
        context.goals.totalTarget = goals.reduce(
          (sum: number, g: any) => sum + Number(g.goal_amount), 
          0
        )
        context.goals.totalSaved = goals.reduce(
          (sum: number, g: any) => sum + Number(g.current_savings), 
          0
        )
      }
    } catch (error) {
      console.log('No goals found (user hasn\'t set financial goals yet)')
    }
  }

  /**
   * Load user challenges from user_challenges table
   */
  private async loadChallenges(userId: string, context: UserContextData) {
    try {
      const { data: userChallenges, error } = await (supabase as any)
        .from('user_challenges')
        .select('challenge_id, joined_at')
        .eq('user_id', userId)

      if (!error && userChallenges && userChallenges.length > 0) {
        context.challenges.joined = userChallenges.length

        // Get challenge details
        const challengeIds = userChallenges.map((uc: any) => uc.challenge_id)
        const { data: challenges } = await (supabase as any)
          .from('challenges')
          .select('id, title, difficulty, category')
          .in('id', challengeIds)

        if (challenges) {
          context.challenges.participatedChallenges = challenges
        }
      }
    } catch (error) {
      console.log('No challenges found (user hasn\'t joined any challenges yet)')
    }
  }

  /**
   * Generate AI insights based on available data
   */
  private generateInsights(context: UserContextData) {
    const recommendations: string[] = []
    let hasData = false

    // Transaction insights
    if (context.transactions.count > 0) {
      hasData = true
      
      if (context.transactions.count >= 5) {
        context.insights.spendingTrend = 'active tracker'
        recommendations.push('Great job tracking expenses! Keep it up for better insights.')
      } else {
        context.insights.spendingTrend = 'getting started'
        recommendations.push('Track more expenses to get personalized spending insights.')
      }

      if (context.transactions.topCategories.length > 0) {
        const topCategory = context.transactions.topCategories[0]
        recommendations.push(`Your biggest expense is ${topCategory.category} (₱${topCategory.amount.toFixed(2)})`)
      }
    } else {
      recommendations.push('Start tracking your expenses to get personalized financial advice!')
    }

    // Goal insights
    if (context.goals.count > 0) {
      hasData = true
      
      const progress = context.goals.totalTarget > 0 
        ? (context.goals.totalSaved / context.goals.totalTarget) * 100 
        : 0

      context.insights.savingsRate = Math.round(progress)

      if (progress < 25) {
        recommendations.push('You\'re just getting started on your goals. Let\'s create a savings plan!')
      } else if (progress < 75) {
        recommendations.push(`You're ${Math.round(progress)}% toward your goals. Keep going!`)
      } else {
        recommendations.push('Amazing progress! You\'re almost at your savings goals!')
      }
    } else {
      recommendations.push('Set your first financial goal - emergency fund, vacation, or investment!')
    }

    // Challenge insights
    if (context.challenges.joined > 0) {
      hasData = true
      recommendations.push(`You're participating in ${context.challenges.joined} challenge${context.challenges.joined > 1 ? 's' : ''}. Stay motivated!`)
    }

    // Profile insights
    if (context.profile.hasProfile && context.profile.persona_data?.financial_persona) {
      hasData = true
      const persona = context.profile.persona_data.financial_persona
      recommendations.push(`As a ${persona}, I'll tailor advice to your style!`)
    }

    context.insights.hasData = hasData
    context.insights.recommendations = recommendations
  }

  /**
   * Format user context for AI prompt
   */
  formatContextForAI(context: UserContextData): string {
    let aiContext = `
=== USER PROFILE (ID: ${context.userId}) ===

📊 FINANCIAL OVERVIEW:
`

    // Profile section
    if (context.profile.hasProfile) {
      const { financial_data, preferences, persona_data } = context.profile
      
      aiContext += `
- Persona: ${persona_data?.financial_persona || 'Still learning about user'}
- Preferences: ${JSON.stringify(preferences) !== '{}' ? JSON.stringify(preferences) : 'Default settings'}
- Financial Status: ${JSON.stringify(financial_data) !== '{}' ? 'Profile created' : 'Setting up'}
`
    } else {
      aiContext += `
- Status: New user, still setting up profile
- Recommendation: Learn about user through conversation
`
    }

    // Transactions section
    aiContext += `
💰 EXPENSE TRACKING:
`
    if (context.transactions.count > 0) {
      aiContext += `
- Total Transactions: ${context.transactions.count}
- Total Spent: ₱${context.transactions.totalSpent.toFixed(2)}
- Top Spending Categories:
${context.transactions.topCategories.map(c => `  • ${c.category}: ₱${c.amount.toFixed(2)}`).join('\n')}

Recent Transactions:
${context.transactions.recentTransactions.slice(0, 5).map(t => 
  `  • ${t.merchant} - ₱${Number(t.amount).toFixed(2)} (${t.category || 'uncategorized'}) on ${t.date}`
).join('\n')}
`
    } else {
      aiContext += `- No expenses tracked yet
- Encourage user to start tracking for personalized advice
`
    }

    // Goals section
    aiContext += `
🎯 FINANCIAL GOALS:
`
    if (context.goals.count > 0) {
      const progress = context.goals.totalTarget > 0 
        ? ((context.goals.totalSaved / context.goals.totalTarget) * 100).toFixed(1)
        : '0'

      aiContext += `
- Active Goals: ${context.goals.count}
- Total Target: ₱${context.goals.totalTarget.toFixed(2)}
- Total Saved: ₱${context.goals.totalSaved.toFixed(2)}
- Overall Progress: ${progress}%

Goals Details:
${context.goals.activeGoals.map(g => 
  `  • ${g.goal_name}: ₱${Number(g.current_savings).toFixed(2)} / ₱${Number(g.goal_amount).toFixed(2)} (Monthly: ₱${Number(g.monthly_savings).toFixed(2)})`
).join('\n')}
`
    } else {
      aiContext += `- No goals set yet
- Help user define their first financial goal
`
    }

    // Challenges section
    if (context.challenges.joined > 0) {
      aiContext += `
🏆 CHALLENGES:
- Participating in: ${context.challenges.joined} challenge(s)
${context.challenges.participatedChallenges.map(c => 
  `  • ${c.title} (${c.difficulty} - ${c.category})`
).join('\n')}
`
    }

    // AI Insights section
    aiContext += `
💡 AI INSIGHTS:
- Has Data: ${context.insights.hasData ? 'Yes' : 'No - Still learning'}
- Spending Trend: ${context.insights.spendingTrend}
${context.insights.savingsRate !== null ? `- Savings Progress: ${context.insights.savingsRate}%` : ''}

Recommendations:
${context.insights.recommendations.map(r => `  • ${r}`).join('\n')}

=== END USER PROFILE ===
`

    return aiContext.trim()
  }
}

// Export singleton instance
export const userContextBuilder = new UserContextBuilder()
