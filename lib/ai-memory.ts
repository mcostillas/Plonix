import { supabase } from './supabase'

interface UserProfile {
  userId: string
  name?: string
  age?: number
  occupation?: string
  educationLevel?: string
  location?: string
  familySize?: number
  dependents?: number
}

interface UserContext {
  userId: string
  income: number
  expenses: Record<string, number>
  goals: Array<{name: string, target: number, current: number, deadline?: string}>
  preferences: {
    language: 'en' | 'tl' | 'taglish'
    budgetStyle: '50-30-20' | 'envelope' | 'zero-based'
    communicationStyle: 'formal' | 'casual' | 'encouraging'
    reminderFrequency: 'daily' | 'weekly' | 'monthly'
  }
  aiInsights: {
    spendingPatterns: string[]
    recommendedActions: string[]
    lastAdvice: string
    personalityNotes: string[]
    successfulStrategies: string[]
    challengeAreas: string[]
  }
  memories: {
    importantDates: Array<{date: string, event: string, significance: string}>
    personalDetails: Record<string, string>
    achievements: Array<{date: string, achievement: string, impact: string}>
    concerns: Array<{topic: string, frequency: number, lastMentioned: string}>
    preferences: Record<string, any>
  }
}

interface ConversationMemory {
  userId: string
  conversationId: string
  keyTopics: string[]
  emotionalTone: 'positive' | 'neutral' | 'concerned' | 'excited'
  actionItems: string[]
  followUpNeeded: boolean
  personalInsights: string[]
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  messageType: 'text' | 'tool_use' | 'receipt_scan'
  metadata?: any
  timestamp: Date
  sentiment?: 'positive' | 'neutral' | 'negative'
  extractedInfo?: {
    amounts?: number[]
    goals?: string[]
    concerns?: string[]
    achievements?: string[]
  }
}

// New interfaces for financial data
interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  target_amount: number | string
  current_amount: number | string
  category: string
  deadline?: string
  icon?: string
  color?: string
  status: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at?: string
}

interface Transaction {
  id: string
  user_id: string
  amount: number | string
  transaction_type: 'income' | 'expense'
  merchant?: string
  category?: string
  date: string
  payment_method?: string
  notes?: string
  created_at: string
}

interface MonthlyBill {
  id: string
  user_id: string
  name: string
  amount: number | string
  category: string
  due_day: number
  frequency: string
  description?: string
  is_active: boolean
  next_due_date?: string
  created_at: string
  updated_at?: string
}

// Phase 2: Learning module interfaces
interface LearningModuleContent {
  id: string
  module_id: string
  module_title: string
  module_description?: string
  duration?: string
  category: 'core' | 'essential' | 'advanced'
  key_concepts: string[] // ["50-30-20 rule", "Needs vs Wants"]
  key_takeaways: string[]
  practical_tips: string[]
  common_mistakes?: string[]
  total_steps?: number
  reflect_questions?: string[]
  sources?: any
  created_at: string
}

interface CompletedModule {
  module_id: string
  module_title: string
  completion_date: string
  user_reflections?: string // User's answers to reflection questions
  key_concepts: string[]
  key_takeaways: string[]
  practical_tips: string[]
}

export class AIMemoryManager {
  // Enhanced context building with personalization
  async buildPersonalizedContext(userId: string): Promise<string> {
    const userContext = await this.getUserContext(userId)
    const profile = await this.getUserProfile(userId)
    const recentMemories = await this.getRecentMemories(userId, 10)
    const conversationHistory = await this.getConversationHistory(userId, 5)
    const learningReflections = await this.getLearningReflections(userId, 10)
    
    // ===== PHASE 1: FETCH COMPREHENSIVE FINANCIAL DATA =====
    const goals = await this.getUserGoals(userId)
    const spendingAnalysis = await this.analyzeSpending(userId, 30)
    const monthlyBills = await this.getUserMonthlyBills(userId)
    
    // ===== PHASE 2: FETCH LEARNING MODULE DATA =====
    const completedModules = await this.getCompletedModules(userId)
    
    if (!userContext) return this.getDefaultContext()

    // Build learning insights from reflections
    const learningInsights = this.buildLearningInsights(learningReflections)

    // Build financial data contexts
    const goalsContext = this.formatGoalsContext(goals)
    const spendingContext = this.formatSpendingContext(spendingAnalysis)
    const billsContext = this.formatBillsContext(monthlyBills)
    
    // Build learning module context
    const learningContext = this.formatLearningContext(completedModules)

    const personalizedPrompt = `
PERSONAL PROFILE:
- Name: ${profile?.name || 'Friend'}
- Age: ${profile?.age || 'Unknown'}
- Occupation: ${profile?.occupation || 'Student/Young Professional'}
- Location: ${profile?.location || 'Philippines'}
- Family: ${profile?.familySize ? `${profile.familySize} members` : 'Unknown'} ${profile?.dependents ? `(${profile.dependents} dependents)` : ''}

FINANCIAL CONTEXT:
- Monthly Income: ₱${userContext.income?.toLocaleString() || '18,000'}
- Main Expenses: ${Object.entries(userContext.expenses || {}).map(([k,v]) => `${k}: ₱${v}`).join(', ')}
- Budget Preference: ${userContext.preferences?.budgetStyle || '50-30-20'}
- Communication Style: ${userContext.preferences?.communicationStyle || 'casual'}

===== COMPLETE FINANCIAL PICTURE =====

${goalsContext}

${spendingContext}

${billsContext}

===== END FINANCIAL DATA =====

===== LEARNING MODULES COMPLETED =====

${learningContext}

===== END LEARNING DATA =====

LEARNING JOURNEY & REFLECTIONS:
${learningInsights}

PERSONAL MEMORIES & INSIGHTS:
- Important Dates: ${userContext.memories?.importantDates?.slice(-3).map(d => `${d.date}: ${d.event}`).join(', ') || 'None recorded'}
- Recent Achievements: ${userContext.memories?.achievements?.slice(-2).map(a => a.achievement).join(', ') || 'None recorded'}
- Current Concerns: ${userContext.memories?.concerns?.slice(-3).map(c => c.topic).join(', ') || 'None recorded'}
- Successful Strategies: ${userContext.aiInsights?.successfulStrategies?.slice(-2).join(', ') || 'None yet'}
- Challenge Areas: ${userContext.aiInsights?.challengeAreas?.slice(-2).join(', ') || 'None identified'}

PERSONALITY NOTES:
${userContext.aiInsights?.personalityNotes?.slice(-3).join('\n') || 'Learning about user personality...'}

RECENT CONVERSATION CONTEXT:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

AI INSTRUCTIONS - CRITICAL:
1. You now have COMPLETE visibility into the user's finances AND learning journey
2. Reference SPECIFIC concepts they learned (e.g., "Remember the 50-30-20 rule from Budgeting?")
3. Connect financial advice to modules they completed (e.g., "Since you learned about digital banks...")
4. Give ACTIONABLE advice based on their ACTUAL spending patterns AND knowledge
5. Celebrate progress on goals with EXACT percentages
6. Warn about upcoming bills if they're within 3 days
7. Build on their financial education (e.g., "Now that you understand budgeting, let's apply it...")
8. Reference SPECIFIC numbers from goals, transactions, and bills
9. Use their name (${profile?.name || 'Friend'}) naturally
10. Be specific, data-driven, and personalized - not generic!

EXAMPLE RESPONSES WITH LEARNING CONTEXT:
- Instead of "Try the 50-30-20 rule": "I see you completed the Budgeting module! Let's apply that 50-30-20 rule to your ₱25,000 income: ₱12,500 needs, ₱7,500 wants, ₱5,000 savings."
- Instead of "Save in a bank": "Remember the digital banks you learned about in the Saving module? Your ₱10,000 emergency fund would earn ₱600/year in Tonik (6%) vs ₱25 in traditional banks!"
- Instead of "Good progress": "Awesome! You're applying what you learned from the Emergency Fund module - already at ₱15,000/₱20,000 (75%)!"
- Instead of "Consider investing": "Since you completed the Investing module, you understand mutual funds. Ready to start with ₱1,000 monthly in BPI Balanced Fund?"
`
    
    return personalizedPrompt
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) return null
    return data
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>) {
    const { error } = await (supabase as any)
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString()
      })
    
    return !error
  }

  async getUserContext(userId: string): Promise<UserContext | null> {
    const { data, error } = await supabase
      .from('user_context')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) return null
    return data
  }

  async updateUserContext(userId: string, context: Partial<UserContext>) {
    const { error } = await (supabase as any)
      .from('user_context')
      .upsert({
        user_id: userId,
        ...context,
        updated_at: new Date().toISOString()
      })
    
    return !error
  }

  // New method to extract and store insights from conversations
  async analyzeAndStoreConversation(
    userId: string, 
    conversationId: string, 
    userMessage: string, 
    aiResponse: string
  ) {
    const analysis = await this.extractInsightsFromConversation(userMessage, aiResponse)
    
    // Update user context with new insights
    if (analysis.personalInfo) {
      await this.updatePersonalMemories(userId, analysis.personalInfo)
    }

    if (analysis.financialInfo) {
      await this.updateFinancialContext(userId, analysis.financialInfo)
    }

    if (analysis.preferences) {
      await this.updateUserPreferences(userId, analysis.preferences)
    }

    // Store conversation summary
    await this.storeConversationMemory(userId, conversationId, analysis)
  }

  private async extractInsightsFromConversation(userMessage: string, aiResponse: string) {
    // Simple keyword-based extraction (can be enhanced with AI)
    const analysis: any = {}

    // Extract amounts mentioned
    const amounts = userMessage.match(/₱[\d,]+|\d+[\s]*pesos?/gi)
    if (amounts) analysis.amounts = amounts

    // Extract goals mentioned
    if (userMessage.toLowerCase().includes('goal') || userMessage.toLowerCase().includes('gusto') || userMessage.toLowerCase().includes('target')) {
      analysis.hasGoal = true
    }

    // Extract personal information patterns
    const personalPatterns = [
      /my name is (\w+)/i,
      /i am (\d+) years old/i,
      /i work as a? ([\w\s]+)/i,
      /i study ([\w\s]+)/i,
      /i live in ([\w\s]+)/i
    ]

    personalPatterns.forEach(pattern => {
      const match = userMessage.match(pattern)
      if (match) {
        analysis.personalInfo = analysis.personalInfo || {}
        analysis.personalInfo[pattern.source] = match[1]
      }
    })

    return analysis
  }

  async updatePersonalMemories(userId: string, personalInfo: any) {
    const currentContext = await this.getUserContext(userId)
    if (!currentContext) return

    const memories = currentContext.memories || {
      importantDates: [],
      personalDetails: {},
      achievements: [],
      concerns: [],
      preferences: {}
    }

    // Update personal details
    memories.personalDetails = { ...memories.personalDetails, ...personalInfo }

    await this.updateUserContext(userId, { memories })
  }

  async updateFinancialContext(userId: string, financialInfo: any) {
    const currentContext = await this.getUserContext(userId)
    if (!currentContext) return

    const updates: any = {}

    if (financialInfo.income) {
      updates.income = financialInfo.income
    }

    if (financialInfo.expenses) {
      updates.expenses = { ...currentContext.expenses, ...financialInfo.expenses }
    }

    if (financialInfo.goals) {
      updates.goals = [...(currentContext.goals || []), ...financialInfo.goals]
    }

    await this.updateUserContext(userId, updates)
  }

  async updateUserPreferences(userId: string, preferences: any) {
    const currentContext = await this.getUserContext(userId)
    if (!currentContext) return

    const updatedPreferences = {
      ...currentContext.preferences,
      ...preferences
    }

    await this.updateUserContext(userId, { preferences: updatedPreferences })
  }

  async storeConversationMemory(userId: string, conversationId: string, analysis: any) {
    const { error } = await (supabase as any)
      .from('conversation_memories')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        key_topics: analysis.topics || [],
        emotional_tone: analysis.tone || 'neutral',
        action_items: analysis.actionItems || [],
        follow_up_needed: analysis.followUpNeeded || false,
        personal_insights: analysis.insights || [],
        created_at: new Date().toISOString()
      })
    
    return !error
  }

  async getRecentMemories(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('conversation_memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return []
    return data
  }

  async getConversationHistory(userId: string, limit: number = 10): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return []
    return data.reverse() // Oldest first for context
  }

  async saveMessage(
    userId: string, 
    conversationId: string,
    content: string, 
    role: 'user' | 'assistant',
    messageType: 'text' | 'tool_use' | 'receipt_scan' = 'text',
    metadata?: any
  ): Promise<string | null> {
    const { data, error } = await (supabase as any)
      .from('messages')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        content,
        role,
        message_type: messageType,
        metadata,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (error) return null
    return data.id
  }

  async createConversation(userId: string, title?: string): Promise<string | null> {
    const { data, error } = await (supabase as any)
      .from('conversations')
      .insert({
        user_id: userId,
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (error) return null
    return data.id
  }

  // Enhanced AI insights with personality learning
  async updateAIInsights(userId: string, insights: {
    spendingPattern?: string
    recommendation?: string
    userPreference?: string
    personalityNote?: string
    successfulStrategy?: string
    challengeArea?: string
  }) {
    const currentContext = await this.getUserContext(userId)
    const currentInsights = currentContext?.aiInsights || { 
      spendingPatterns: [], 
      recommendedActions: [], 
      lastAdvice: '',
      personalityNotes: [],
      successfulStrategies: [],
      challengeAreas: []
    }

    if (insights.spendingPattern) {
      currentInsights.spendingPatterns.push(insights.spendingPattern)
    }
    if (insights.recommendation) {
      currentInsights.recommendedActions.push(insights.recommendation)
      currentInsights.lastAdvice = insights.recommendation
    }
    if (insights.personalityNote) {
      currentInsights.personalityNotes.push(insights.personalityNote)
    }
    if (insights.successfulStrategy) {
      currentInsights.successfulStrategies.push(insights.successfulStrategy)
    }
    if (insights.challengeArea) {
      currentInsights.challengeAreas.push(insights.challengeArea)
    }

    await this.updateUserContext(userId, {
      userId,
      aiInsights: currentInsights
    })
  }

  private getDefaultContext(): string {
    return `
CONTEXT: New user - learning about their financial situation and preferences.
Please ask questions to understand their:
- Monthly income and expenses
- Financial goals
- Current challenges
- Communication preferences
- Personal situation

Be friendly, encouraging, and use Taglish as appropriate.
`
  }

  // Method to remember user achievements
  async recordAchievement(userId: string, achievement: string, impact: string) {
    const currentContext = await this.getUserContext(userId)
    if (!currentContext) return

    const memories = currentContext.memories || {
      importantDates: [],
      personalDetails: {},
      achievements: [],
      concerns: [],
      preferences: {}
    }

    memories.achievements.push({
      date: new Date().toISOString(),
      achievement,
      impact
    })

    await this.updateUserContext(userId, { memories })
  }

  // Method to track recurring concerns
  async trackConcern(userId: string, concern: string) {
    const currentContext = await this.getUserContext(userId)
    if (!currentContext) return

    const memories = currentContext.memories || {
      importantDates: [],
      personalDetails: {},
      achievements: [],
      concerns: [],
      preferences: {}
    }

    const existingConcern = memories.concerns.find(c => c.topic.toLowerCase() === concern.toLowerCase())
    if (existingConcern) {
      existingConcern.frequency += 1
      existingConcern.lastMentioned = new Date().toISOString()
    } else {
      memories.concerns.push({
        topic: concern,
        frequency: 1,
        lastMentioned: new Date().toISOString()
      })
    }

    await this.updateUserContext(userId, { memories })
  }

  // Get learning reflections from modules
  async getLearningReflections(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('learning_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return []
    return data
  }

  // ===== PHASE 1: COMPREHENSIVE FINANCIAL DATA READING =====

  // Get user's financial goals
  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching goals:', error)
        return []
      }
      return (data as Goal[]) || []
    } catch (error) {
      console.error('Failed to get user goals:', error)
      return []
    }
  }

  // Get user's transaction history
  async getUserTransactions(userId: string, limit: number = 30): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('Error fetching transactions:', error)
        return []
      }
      return (data as Transaction[]) || []
    } catch (error) {
      console.error('Failed to get user transactions:', error)
      return []
    }
  }

  // Get user's monthly bills
  async getUserMonthlyBills(userId: string): Promise<MonthlyBill[]> {
    try {
      const { data, error } = await supabase
        .from('scheduled_payments')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('due_day', { ascending: true })
      
      if (error) {
        console.error('Error fetching monthly bills:', error)
        return []
      }
      return (data as MonthlyBill[]) || []
    } catch (error) {
      console.error('Failed to get user monthly bills:', error)
      return []
    }
  }

  // Analyze spending patterns from transactions
  async analyzeSpending(userId: string, days: number = 30) {
    try {
      const transactions = await this.getUserTransactions(userId, 100)
      
      if (transactions.length === 0) {
        return null
      }

      // Filter transactions from last N days
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      const recentTransactions = transactions.filter(t => new Date(t.date) >= cutoffDate)

      // Calculate totals by type
      const income = recentTransactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(t.amount)), 0)
      
      const expenses = recentTransactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(t.amount)), 0)

      // Group expenses by category
      const expensesByCategory: { [key: string]: number } = {}
      recentTransactions
        .filter(t => t.transaction_type === 'expense')
        .forEach(t => {
          const category = t.category || 'Other'
          const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount)
          expensesByCategory[category] = (expensesByCategory[category] || 0) + amount
        })

      // Sort categories by amount
      const topCategories = Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: Math.round((amount / expenses) * 100)
        }))

      // Get recent transactions (last 5)
      const recentTxns = recentTransactions.slice(0, 5).map(t => ({
        date: t.date,
        amount: typeof t.amount === 'number' ? t.amount : parseFloat(t.amount),
        type: t.transaction_type,
        merchant: t.merchant || 'Unknown',
        category: t.category || 'Other'
      }))

      return {
        period: days,
        totalIncome: income,
        totalExpenses: expenses,
        netSavings: income - expenses,
        savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
        topCategories,
        recentTransactions: recentTxns,
        transactionCount: recentTransactions.length
      }
    } catch (error) {
      console.error('Failed to analyze spending:', error)
      return null
    }
  }

  // Calculate financial summary for dashboard
  async getFinancialSummary(userId: string) {
    try {
      const [goals, bills, spendingAnalysis] = await Promise.all([
        this.getUserGoals(userId),
        this.getUserMonthlyBills(userId),
        this.analyzeSpending(userId, 30)
      ])

      // Calculate goals summary
      const activeGoals = goals.filter(g => g.status === 'active')
      const totalGoalTarget = activeGoals.reduce((sum, g) => {
        const amount = typeof g.target_amount === 'number' ? g.target_amount : parseFloat(g.target_amount)
        return sum + amount
      }, 0)
      const totalGoalSaved = activeGoals.reduce((sum, g) => {
        const amount = typeof g.current_amount === 'number' ? g.current_amount : parseFloat(g.current_amount || '0')
        return sum + amount
      }, 0)
      const overallGoalProgress = totalGoalTarget > 0 ? Math.round((totalGoalSaved / totalGoalTarget) * 100) : 0

      // Calculate bills summary
      const totalMonthlyBills = bills.reduce((sum, b) => {
        const amount = typeof b.amount === 'number' ? b.amount : parseFloat(b.amount)
        return sum + amount
      }, 0)

      // Calculate available money (if we have spending data)
      const estimatedAvailable = spendingAnalysis 
        ? spendingAnalysis.totalIncome - spendingAnalysis.totalExpenses - totalMonthlyBills
        : null

      return {
        goals: {
          total: activeGoals.length,
          totalTarget: totalGoalTarget,
          totalSaved: totalGoalSaved,
          overallProgress: overallGoalProgress
        },
        bills: {
          total: bills.length,
          totalMonthly: totalMonthlyBills
        },
        spending: spendingAnalysis,
        estimatedAvailable
      }
    } catch (error) {
      console.error('Failed to get financial summary:', error)
      return null
    }
  }

  // Build learning insights from reflections
  buildLearningInsights(reflections: any[]): string {
    if (!reflections || reflections.length === 0) {
      return 'User has not completed any learning modules yet.'
    }

    // Group by module
    const byModule: any = {}
    reflections.forEach(r => {
      if (!byModule[r.module_id]) {
        byModule[r.module_id] = {
          title: r.module_title,
          reflections: []
        }
      }
      byModule[r.module_id].reflections.push(r)
    })

    let insights = 'Modules Completed & User Insights:\n'
    
    Object.keys(byModule).forEach(moduleId => {
      const module = byModule[moduleId]
      insights += `\n📚 ${module.title}:\n`
      
      // Get key reflections
      module.reflections.slice(0, 3).forEach((r: any) => {
        insights += `  Q: ${r.question}\n`
        insights += `  A: ${r.answer.substring(0, 150)}${r.answer.length > 150 ? '...' : ''}\n`
        
        // Add extracted insights
        if (r.extracted_insights) {
          if (r.extracted_insights.goals) {
            insights += `    → Goals mentioned: ${r.extracted_insights.goals.join(', ')}\n`
          }
          if (r.extracted_insights.mentionedAmounts) {
            insights += `    → Amounts: ${r.extracted_insights.mentionedAmounts.join(', ')}\n`
          }
          if (r.extracted_insights.hasChallenges) {
            insights += `    → Facing challenges in this area\n`
          }
          if (r.extracted_insights.topics) {
            insights += `    → Interested in: ${r.extracted_insights.topics.join(', ')}\n`
          }
        }
        
        // Add sentiment
        if (r.sentiment) {
          const sentimentEmoji = {
            'motivated': '💪',
            'positive': '😊',
            'concerned': '😟',
            'confused': '🤔',
            'neutral': '😐'
          }
          insights += `    Sentiment: ${sentimentEmoji[r.sentiment as keyof typeof sentimentEmoji] || ''} ${r.sentiment}\n`
        }
      })
    })

    return insights
  }

  // ===== FORMAT FINANCIAL DATA FOR AI CONTEXT =====

  // Format goals for AI context
  formatGoalsContext(goals: Goal[]): string {
    if (goals.length === 0) {
      return 'No financial goals set yet. Encourage user to create goals!'
    }

    const activeGoals = goals.filter(g => g.status === 'active')
    const completedGoals = goals.filter(g => g.status === 'completed')

    let context = `FINANCIAL GOALS:\n`
    
    if (activeGoals.length > 0) {
      context += `\nActive Goals (${activeGoals.length}):\n`
      activeGoals.forEach((goal, index) => {
        const target = typeof goal.target_amount === 'number' ? goal.target_amount : parseFloat(goal.target_amount)
        const current = typeof goal.current_amount === 'number' ? goal.current_amount : parseFloat(goal.current_amount || '0')
        const progress = Math.round((current / target) * 100)
        const remaining = target - current
        
        context += `${index + 1}. ${goal.title} (${goal.category || 'custom'})\n`
        context += `   Progress: ₱${current.toLocaleString()}/${target.toLocaleString()} (${progress}%)\n`
        context += `   Remaining: ₱${remaining.toLocaleString()}\n`
        if (goal.deadline) {
          const daysUntil = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          context += `   Deadline: ${new Date(goal.deadline).toLocaleDateString()} (${daysUntil} days)\n`
        }
        if (goal.description) {
          context += `   Note: ${goal.description}\n`
        }
        context += '\n'
      })

      // Summary
      const totalTarget = activeGoals.reduce((sum, g) => {
        const amount = typeof g.target_amount === 'number' ? g.target_amount : parseFloat(g.target_amount)
        return sum + amount
      }, 0)
      const totalSaved = activeGoals.reduce((sum, g) => {
        const amount = typeof g.current_amount === 'number' ? g.current_amount : parseFloat(g.current_amount || '0')
        return sum + amount
      }, 0)
      const overallProgress = Math.round((totalSaved / totalTarget) * 100)
      
      context += `Summary: ${activeGoals.length} active goals, ₱${totalSaved.toLocaleString()}/₱${totalTarget.toLocaleString()} (${overallProgress}% overall)\n`
    }

    if (completedGoals.length > 0) {
      context += `\n✅ Completed Goals: ${completedGoals.length} (Celebrate these achievements!)\n`
    }

    return context
  }

  // Format spending analysis for AI context
  formatSpendingContext(analysis: any): string {
    if (!analysis) {
      return 'No transaction history yet. Encourage user to track expenses!'
    }

    let context = `SPENDING ANALYSIS (Last ${analysis.period} days):\n`
    context += `Total Income: ₱${analysis.totalIncome.toLocaleString()}\n`
    context += `Total Expenses: ₱${analysis.totalExpenses.toLocaleString()}\n`
    context += `Net Savings: ₱${analysis.netSavings.toLocaleString()} (${analysis.savingsRate}% savings rate)\n`
    
    if (analysis.topCategories.length > 0) {
      context += `\nTop Expense Categories:\n`
      analysis.topCategories.forEach((cat: any) => {
        context += `- ${cat.category}: ₱${cat.amount.toLocaleString()} (${cat.percentage}%)\n`
      })
    }

    if (analysis.recentTransactions.length > 0) {
      context += `\nRecent Transactions:\n`
      analysis.recentTransactions.slice(0, 3).forEach((txn: any) => {
        const sign = txn.type === 'income' ? '+' : '-'
        const date = new Date(txn.date).toLocaleDateString()
        context += `- ${date}: ${sign}₱${txn.amount.toLocaleString()} (${txn.merchant}, ${txn.category})\n`
      })
    }

    return context
  }

  // Format monthly bills for AI context
  formatBillsContext(bills: MonthlyBill[]): string {
    if (bills.length === 0) {
      return 'No recurring bills set up yet.'
    }

    const totalMonthly = bills.reduce((sum, b) => {
      const amount = typeof b.amount === 'number' ? b.amount : parseFloat(b.amount)
      return sum + amount
    }, 0)

    let context = `RECURRING MONTHLY BILLS:\n`
    context += `Total Monthly Commitments: ₱${totalMonthly.toLocaleString()}\n\n`
    context += `Upcoming Bills:\n`
    
    bills.forEach(bill => {
      const amount = typeof bill.amount === 'number' ? bill.amount : parseFloat(bill.amount)
      context += `- Day ${bill.due_day}: ${bill.name} - ₱${amount.toLocaleString()} (${bill.category})\n`
    })

    // Find next bill due
    const today = new Date().getDate()
    const nextBills = bills.filter(b => b.due_day >= today).sort((a, b) => a.due_day - b.due_day)
    if (nextBills.length > 0) {
      const nextBill = nextBills[0]
      const daysUntil = nextBill.due_day - today
      const amount = typeof nextBill.amount === 'number' ? nextBill.amount : parseFloat(nextBill.amount)
      context += `\n⚠️ Next Bill Due: ${nextBill.name} (₱${amount.toLocaleString()}) on day ${nextBill.due_day}`
      if (daysUntil <= 3) {
        context += ` - COMING UP IN ${daysUntil} DAYS!\n`
      } else {
        context += ` (in ${daysUntil} days)\n`
      }
    }

    return context
  }

  // ===== PHASE 2: LEARNING MODULE CONTENT METHODS =====
  
  /**
   * Fetches completed learning modules with their content
   * Joins learning_reflections with learning_module_content
   */
  async getCompletedModules(userId: string): Promise<CompletedModule[]> {
    try {
      // First get user's completed modules from learning_reflections
      const { data: reflections, error: reflectionsError } = await supabase
        .from('learning_reflections')
        .select('*')
        .eq('user_id', userId)
        .eq('module_completed', true)
        .order('completion_date', { ascending: false })

      if (reflectionsError) {
        console.error('Error fetching learning reflections:', reflectionsError)
        return []
      }

      if (!reflections || reflections.length === 0) {
        return []
      }

      // Get module content from learning_module_content table
      const moduleIds = (reflections as any[]).map((r: any) => r.module_id)
      const { data: moduleContent, error: contentError } = await supabase
        .from('learning_module_content')
        .select('*')
        .in('module_id', moduleIds)

      if (contentError) {
        console.error('Error fetching module content:', contentError)
        // If table doesn't exist yet, return empty array
        if (contentError.message?.includes('does not exist')) {
          console.warn('learning_module_content table not created yet. Run docs/learning-content-schema.sql')
          return []
        }
        return []
      }

      // Combine reflections with module content
      const completedModules: CompletedModule[] = (reflections as any[]).map((reflection: any) => {
        const content = (moduleContent as any[] || []).find((c: any) => c.module_id === reflection.module_id)
        
        return {
          module_id: reflection.module_id,
          module_title: content?.module_title || reflection.module_id,
          completion_date: reflection.completion_date,
          user_reflections: this.extractReflectionsText(reflection.reflections_data),
          key_concepts: content?.key_concepts || [],
          key_takeaways: content?.key_takeaways || [],
          practical_tips: content?.practical_tips || []
        }
      })

      return completedModules

    } catch (error) {
      console.error('Error in getCompletedModules:', error)
      return []
    }
  }

  /**
   * Extracts reflection text from reflections_data JSON
   */
  private extractReflectionsText(reflectionsData: any): string {
    if (!reflectionsData) return ''
    
    try {
      const data = typeof reflectionsData === 'string' ? JSON.parse(reflectionsData) : reflectionsData
      
      // Extract all answers from the reflections
      const answers: string[] = []
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.answer) answers.push(item.answer)
        })
      } else if (data.answer) {
        answers.push(data.answer)
      }
      
      return answers.join(' | ')
    } catch (error) {
      console.error('Error parsing reflections data:', error)
      return ''
    }
  }

  /**
   * Gets specific module content by module_id
   */
  async getModuleContent(moduleId: string): Promise<LearningModuleContent | null> {
    try {
      const { data, error } = await supabase
        .from('learning_module_content')
        .select('*')
        .eq('module_id', moduleId)
        .single()

      if (error) {
        if (error.message?.includes('does not exist')) {
          console.warn('learning_module_content table not created yet.')
        } else {
          console.error('Error fetching module content:', error)
        }
        return null
      }

      return data as LearningModuleContent
    } catch (error) {
      console.error('Error in getModuleContent:', error)
      return null
    }
  }

  /**
   * Formats learning module context for AI
   */
  formatLearningContext(modules: CompletedModule[]): string {
    if (modules.length === 0) {
      return 'No learning modules completed yet. Encourage user to explore Learning Hub!'
    }

    let context = `FINANCIAL EDUCATION COMPLETED (${modules.length} modules):\n\n`

    modules.forEach((module, index) => {
      const completionDate = new Date(module.completion_date).toLocaleDateString()
      
      context += `${index + 1}. ${module.module_title} (Completed: ${completionDate})\n`
      
      // Key concepts learned
      if (module.key_concepts && module.key_concepts.length > 0) {
        context += `   💡 Concepts Learned: ${module.key_concepts.slice(0, 3).join(', ')}\n`
      }
      
      // Key takeaways
      if (module.key_takeaways && module.key_takeaways.length > 0) {
        context += `   ✅ Key Takeaways:\n`
        module.key_takeaways.slice(0, 2).forEach(takeaway => {
          context += `      - ${takeaway}\n`
        })
      }
      
      // User's reflections
      if (module.user_reflections) {
        const shortReflection = module.user_reflections.slice(0, 150)
        context += `   📝 User Reflection: "${shortReflection}${module.user_reflections.length > 150 ? '...' : ''}"\n`
      }
      
      context += `\n`
    })

    // Add AI instructions
    context += `\n🎯 AI INSTRUCTIONS FOR LEARNING CONTEXT:\n`
    context += `- Reference SPECIFIC concepts user learned (e.g., "Remember the 50-30-20 rule from Budgeting?")\n`
    context += `- Connect advice to modules completed (e.g., "Since you learned about digital banks...")\n`
    context += `- Build on their knowledge (e.g., "Now that you understand budgeting, let's apply it to...")\n`
    context += `- Acknowledge their learning journey (e.g., "Great progress completing Saving module!")\n`
    context += `- Suggest next modules if relevant (e.g., "Ready to learn about investing next?")\n`

    return context
  }

  /**
   * Gets learning progress summary
   */
  async getLearningProgress(userId: string): Promise<{
    totalCompleted: number
    coreModulesCompleted: string[]
    essentialModulesCompleted: string[]
    recentModule?: CompletedModule
  }> {
    const modules = await this.getCompletedModules(userId)
    
    const coreModules = ['budgeting', 'saving', 'investing']
    const coreCompleted = modules.filter(m => coreModules.includes(m.module_id))
    const essentialCompleted = modules.filter(m => !coreModules.includes(m.module_id))
    
    return {
      totalCompleted: modules.length,
      coreModulesCompleted: coreCompleted.map(m => m.module_id),
      essentialModulesCompleted: essentialCompleted.map(m => m.module_id),
      recentModule: modules[0] // Most recent
    }
  }
}

export const memoryManager = new AIMemoryManager()
