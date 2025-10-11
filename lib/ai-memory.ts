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
  messageType: 'text' | 'tool_use' // | 'receipt_scan' // TODO: Re-enable with image API
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

// Phase 3: Challenges interfaces
interface ActiveChallenge {
  id: string
  user_id: string
  challenge_id: string
  title: string
  description: string
  icon: string
  category: string
  challenge_type: string
  difficulty: string
  status: string
  progress_percent: number
  checkins_completed: number
  checkins_required?: number
  current_streak: number
  deadline: string
  points_earned: number
  points_full: number
  days_left: number
  joined_at: string
}

interface ChallengeStats {
  total_completed: number
  active_count: number
  total_points: number
  success_rate: number
  current_longest_streak: number
}

// Phase 4: Analytics interfaces
interface NetWorth {
  total_assets: number
  total_liabilities: number
  net_worth: number
  growth_this_month: number
  growth_percentage: number
}

interface BurnRate {
  monthly_burn_rate: number
  daily_burn_rate: number
  runway_months: number // How long savings will last
  projected_depletion_date?: string
}

interface BudgetVsActual {
  period: string // "October 2025"
  budget_total: number
  actual_total: number
  variance: number
  variance_percentage: number
  categories: {
    category: string
    budgeted: number
    actual: number
    variance: number
    status: 'under' | 'over' | 'on-track'
  }[]
}

interface SpendingTrend {
  period: string // "Last 3 months"
  trend: 'increasing' | 'decreasing' | 'stable'
  change_amount: number
  change_percentage: number
  average_monthly: number
  highest_month: { month: string; amount: number }
  lowest_month: { month: string; amount: number }
  top_growing_categories: { category: string; growth: number }[]
}

interface SavingsVelocity {
  current_monthly_savings: number
  average_savings_rate: number // Percentage
  months_to_next_goal?: number
  projected_annual_savings: number
  pace: 'ahead' | 'on-track' | 'behind'
}

// ===== PHASE 5: BEHAVIORAL PATTERNS =====
interface SpendingTrigger {
  trigger_type: 'emotional' | 'social' | 'temporal' | 'environmental'
  trigger_name: string // "Weekend spending", "Post-stress shopping", "Payday splurge"
  occurrences: number
  average_amount: number
  total_impact: number
  confidence: number // 0-100
  pattern_description: string
  last_occurrence: string
  recommended_action: string
}

interface PaydayEffect {
  has_payday_pattern: boolean
  payday_dates: number[] // [15, 30] - days of month
  average_pre_payday_spending: number
  average_post_payday_spending: number
  spending_spike_percentage: number
  days_until_spike_ends: number
  total_payday_overspending: number // Extra spending due to payday effect
  recommendation: string
}

interface DayOfWeekPattern {
  highest_spending_day: string // "Friday"
  lowest_spending_day: string // "Tuesday"
  day_averages: { day: string; average: number; transaction_count: number }[]
  weekend_vs_weekday_ratio: number // 1.5 = 50% more on weekends
  pattern_strength: 'strong' | 'moderate' | 'weak'
  recommendation: string
}

interface RiskProfile {
  profile_type: 'conservative' | 'moderate' | 'aggressive'
  emergency_fund_months: number
  savings_allocation: { category: string; percentage: number }[]
  spending_volatility: number // Standard deviation of monthly spending
  financial_stability_score: number // 0-100
  personality_traits: string[]
  recommended_strategies: string[]
}

interface HabitFormation {
  detected_habits: {
    habit_name: string
    frequency: 'daily' | 'weekly' | 'monthly'
    streak_days: number
    consistency_score: number // 0-100
    financial_impact: number // Positive or negative
    habit_type: 'positive' | 'negative' | 'neutral'
    formed_date: string
    recommendation: string
  }[]
  breaking_habits: {
    habit_name: string
    previous_frequency: string
    days_since_last: number
    success_probability: number
  }[]
  habit_formation_speed: number // Days to form habits
  overall_habit_score: number // 0-100
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
    
    // ===== PHASE 3: FETCH CHALLENGES & GAMIFICATION DATA =====
    const activeChallenges = await this.getActiveChallenges(userId)
    const challengeStats = await this.getChallengeStats(userId)
    
    // ===== PHASE 4: FETCH REAL-TIME ANALYTICS =====
    const netWorth = await this.calculateNetWorth(userId)
    const burnRate = await this.calculateBurnRate(userId)
    const budgetVsActual = await this.getBudgetVsActual(userId)
    const spendingTrends = await this.detectSpendingTrends(userId)
    const savingsVelocity = await this.calculateSavingsVelocity(userId)
    
    // ===== PHASE 5: FETCH BEHAVIORAL PATTERNS =====
    const spendingTriggers = await this.analyzeSpendingTriggers(userId)
    const paydayEffect = await this.detectPaydayEffect(userId)
    const dayOfWeekPattern = await this.analyzeDayOfWeekPatterns(userId)
    const riskProfile = await this.profileRiskTolerance(userId)
    const habitFormation = await this.trackHabitFormation(userId)
    
    if (!userContext) return this.getDefaultContext()

    // Build learning insights from reflections
    const learningInsights = this.buildLearningInsights(learningReflections)

    // Build financial data contexts
    const goalsContext = this.formatGoalsContext(goals)
    const spendingContext = this.formatSpendingContext(spendingAnalysis)
    const billsContext = this.formatBillsContext(monthlyBills)
    
    // Build learning module context
    const learningContext = this.formatLearningContext(completedModules)
    
    // Build challenges context
    const challengesContext = this.formatChallengesContext(activeChallenges, challengeStats)
    
    // Build analytics context
    const analyticsContext = this.formatAnalyticsContext(netWorth, burnRate, budgetVsActual, spendingTrends, savingsVelocity)
    
    // Build behavioral patterns context
    const behavioralContext = this.formatBehavioralContext(spendingTriggers, paydayEffect, dayOfWeekPattern, riskProfile, habitFormation)

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

===== CHALLENGES & GAMIFICATION =====

${challengesContext}

===== END CHALLENGES DATA =====

===== REAL-TIME ANALYTICS & INSIGHTS =====

${analyticsContext}

===== END ANALYTICS DATA =====

===== BEHAVIORAL PATTERNS & PREDICTIONS =====

${behavioralContext}

===== END BEHAVIORAL DATA =====

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
1. You now have COMPLETE OMNISCIENT visibility: finances, learning, challenges, analytics, AND behavioral patterns
2. Reference SPECIFIC trends, growth percentages, projections, AND behavioral predictions
3. USE analytics for predictions: "At current ₱5,000/month savings, you'll hit ₱30k goal in 6 months"
4. USE behavioral patterns for personalization: "You usually overspend on Fridays - today's Friday, watch out!"
5. WARN about concerning trends (spending increasing, runway < 6 months, over budget, risky patterns)
6. WARN proactively about triggers: "You mentioned stress - your stress-shopping pattern costs ₱3,000 avg"
7. CELEBRATE positive analytics (net worth growth, savings velocity ahead, good habits forming)
8. CONNECT all 5 systems: challenges → spending → goals → analytics → behavioral patterns
9. Reference burn rate for urgency: "Your ₱20k savings = 4 months runway at current spending"
10. Use budget variance to suggest improvements: "Food spending ₱2k over budget - try Cook-at-Home challenge"
11. Highlight trends for awareness: "Your spending increased 15% this month - mostly in shopping category"
12. Project goal timelines: "At ₱3k/month savings velocity, your ₱50k laptop goal is 10 months away"
13. Reference pace for motivation: "You're ahead of pace! 🚀 Saving 28% vs target 20%"
14. PREDICT behavior: "It's Friday - you spend 45% more on weekends. Budget ₱500 for today"
15. PERSONALIZE based on risk profile: Conservative users → emergency fund focus. Aggressive → investment opportunities
16. CELEBRATE habit formation: "15-day coffee-skipping streak! That's ₱2,250 saved = habit officially formed! �"
17. IDENTIFY triggers from conversation: If user mentions "stressed", "tired", "celebrating" → reference their spending triggers
18. Give TEMPORAL warnings: "Payday in 3 days - you typically overspend 65% post-payday. Plan purchases now"
19. Be specific, data-driven, predictive, personalized, and actionable - not generic!

EXAMPLE RESPONSES WITH BEHAVIORAL PATTERNS:

- Spending Trigger Warning: "⚠️ You mentioned feeling stressed. I notice you have a 'Post-stress Shopping' pattern - happens 8x/month, costs ₱3,200 avg. Before you shop, try your Meditation mini-goal instead?"

- Payday Effect Alert: "🗓️ Payday is tomorrow! Heads up - you spend 65% more in the 3 days after payday (₱7,500 vs ₱4,500). Your typical payday splurge costs ₱9,000 extra/month. Plan your purchases NOW before the impulse hits!"

- Day-of-Week Prediction: "It's Friday! 📅 Your data shows Fridays are your highest spending day (₱1,200 avg vs ₱600 weekday). You spend 45% more on weekends. Budget ₱1,500 for today + tomorrow to stay on track."

- Risk Profile Personalization: "Based on your financial behavior, you're a CONSERVATIVE saver (85% in emergency funds, low spending volatility). This is smart! Your personality fits automated savings + secure digital banks. Not a crypto investor - and that's okay!"

- Habit Formation Celebration: "🎉 15-DAY STREAK! Your coffee-skipping habit is officially FORMED! You've saved ₱2,250 (₱150/day × 15 days). Habits take 18 days avg - you're ahead! This will save ₱54,750/year!"

- Breaking Bad Habit: "💪 Amazing progress! Your 'Impulse Food Delivery' habit - you haven't done it in 12 days! Previous frequency: 3x/week. If you make it to 21 days, it's officially broken. You're already 57% there!"

- Complete Omniscient Picture: "Let me give you the COMPLETE 360° view:
  
  💰 FINANCES:
  - Net Worth: ₱65,000 (+8.3% growth)
  - Burn Rate: ₱18,500/month (3.5 months runway)
  - Emergency Fund: ₱20,000/₱30,000 (67%)
  
  � ANALYTICS:
  - Spending: Up 15% this month
  - Budget: ₱3,000 over (food & shopping)
  - Savings Velocity: ₱6,500/month (26% - AHEAD!)
  
  🎯 CHALLENGES & LEARNING:
  - No-Spend Challenge: Day 5/7 (🔥 streak saving ₱2k!)
  - Completed: Budgeting, Saving modules
  - Active: Cook-at-Home, No-Impulse-Buy
  
  🧠 BEHAVIORAL PATTERNS (NEW!):
  - ⚠️ Payday Effect: You overspend 65% post-payday (₱9k/month)
  - ⚠️ Weekend Spending: 45% higher on Fri-Sun
  - ⚠️ Stress Trigger: 8x/month, ₱3,200 avg
  - ✅ Coffee Habit: 15-day skip streak = ₱2,250 saved!
  - � Risk Profile: Conservative (85% emergency funds)
  
  🎯 PERSONALIZED PREDICTIONS & ACTIONS:
  1. TODAY IS FRIDAY → Budget ₱1,200 (your Friday avg)
  2. Payday in 2 days → Plan purchases NOW to avoid ₱9k splurge
  3. If you feel stressed today → Your pattern = ₱3,200 shopping. Try meditation instead
  4. Your coffee habit is FORMED → Autopilot ₱54k/year savings! 🚀
  5. At ₱6,500/month velocity + payday control = Emergency Fund in 1.5 months!
  
  💡 THE INSIGHT: Your challenges are working (₱2k food savings), but payday effect (₱9k) erases gains. Control the payday splurge = ₱7k net savings boost = Emergency Fund NEXT MONTH instead of 1.5!"
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
    messageType: 'text' | 'tool_use' = 'text', // | 'receipt_scan' // TODO: Re-enable with image API
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

  // ===== PHASE 3: CHALLENGES & GAMIFICATION METHODS =====
  
  /**
   * Fetches user's active challenges with progress
   */
  async getActiveChallenges(userId: string): Promise<ActiveChallenge[]> {
    try {
      const { data, error } = await supabase
        .from('user_active_challenges')
        .select('*')
        .eq('user_id', userId)
        .order('deadline', { ascending: true })

      if (error) {
        console.error('Error fetching active challenges:', error)
        return []
      }

      return (data as any[]) || []
    } catch (error) {
      console.error('Error in getActiveChallenges:', error)
      return []
    }
  }

  /**
   * Gets challenge statistics for user
   */
  async getChallengeStats(userId: string): Promise<ChallengeStats> {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('status, points_earned, current_streak')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching challenge stats:', error)
        return {
          total_completed: 0,
          active_count: 0,
          total_points: 0,
          success_rate: 0,
          current_longest_streak: 0
        }
      }

      const challenges = (data as any[]) || []
      const completed = challenges.filter((c: any) => c.status === 'completed').length
      const active = challenges.filter((c: any) => c.status === 'active').length
      const failed = challenges.filter((c: any) => c.status === 'failed').length
      const totalPoints = challenges.reduce((sum: number, c: any) => sum + (c.points_earned || 0), 0)
      const successRate = challenges.length > 0 ? Math.round((completed / challenges.length) * 100) : 0
      const longestStreak = challenges.length > 0 
        ? Math.max(...challenges.map((c: any) => c.current_streak || 0)) 
        : 0

      return {
        total_completed: completed,
        active_count: active,
        total_points: totalPoints,
        success_rate: successRate,
        current_longest_streak: longestStreak
      }
    } catch (error) {
      console.error('Error in getChallengeStats:', error)
      return {
        total_completed: 0,
        active_count: 0,
        total_points: 0,
        success_rate: 0,
        current_longest_streak: 0
      }
    }
  }

  /**
   * Formats challenges context for AI
   */
  formatChallengesContext(challenges: ActiveChallenge[], stats: ChallengeStats): string {
    if (challenges.length === 0 && stats.total_completed === 0) {
      return 'No challenges started yet. Encourage user to join a challenge for motivation!'
    }

    let context = `GAMIFICATION & CHALLENGES:\n\n`

    // Overall stats
    context += `📊 Challenge Statistics:\n`
    context += `- Completed: ${stats.total_completed} challenges\n`
    context += `- Active: ${stats.active_count} challenges\n`
    context += `- Total Points Earned: ${stats.total_points} points\n`
    context += `- Success Rate: ${stats.success_rate}%\n`
    if (stats.current_longest_streak > 0) {
      context += `- Longest Streak: ${stats.current_longest_streak} days 🔥\n`
    }
    context += `\n`

    // Active challenges
    if (challenges.length > 0) {
      context += `🎯 ACTIVE CHALLENGES (${challenges.length}):\n\n`
      
      challenges.forEach((challenge, index) => {
        context += `${index + 1}. ${challenge.title} ${challenge.icon}\n`
        context += `   Category: ${challenge.category} | Difficulty: ${challenge.difficulty}\n`
        context += `   Progress: ${challenge.progress_percent}% (${challenge.checkins_completed}/${challenge.checkins_required || '?'} check-ins)\n`
        
        if (challenge.current_streak > 0) {
          context += `   Current Streak: ${challenge.current_streak} days 🔥\n`
        }
        
        context += `   Days Remaining: ${challenge.days_left} days\n`
        context += `   Points: ${challenge.points_earned}/${challenge.points_full}\n`
        
        // Urgency warnings
        if (challenge.days_left <= 2 && challenge.progress_percent < 80) {
          context += `   ⚠️ URGENT: Only ${challenge.days_left} days left and ${100 - challenge.progress_percent}% remaining!\n`
        } else if (challenge.progress_percent >= 90) {
          context += `   🎉 Almost done! Just ${100 - challenge.progress_percent}% to go!\n`
        }
        
        context += `\n`
      })
    }

    // AI instructions
    context += `\n🎯 AI INSTRUCTIONS FOR CHALLENGES:\n`
    context += `- CELEBRATE progress! Use emojis for streaks (🔥) and achievements (🎉)\n`
    context += `- ENCOURAGE users on active challenges\n`
    context += `- WARN about upcoming deadlines (if < 3 days and < 80% progress)\n`
    context += `- SUGGEST check-ins if user hasn't updated today\n`
    context += `- CONNECT challenges to financial goals (e.g., "Your No-Spend challenge helps reach your ₱20k emergency fund!")\n`
    context += `- ACKNOWLEDGE streaks: "Amazing ${stats.current_longest_streak}-day streak! Keep it up!"\n`
    context += `- RECOMMEND new challenges if none active\n`

    return context
  }

  /**
   * Gets recent challenge activity
   */
  async getRecentChallengeActivity(userId: string, limit: number = 5): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*, challenges(*)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent challenge activity:', error)
        return []
      }

      return (data as any[]) || []
    } catch (error) {
      console.error('Error in getRecentChallengeActivity:', error)
      return []
    }
  }

  // ===== PHASE 4: REAL-TIME ANALYTICS METHODS =====
  
  /**
   * Calculates net worth (assets - liabilities)
   */
  async calculateNetWorth(userId: string): Promise<NetWorth> {
    try {
      // Get all goals (assets)
      const goals = await this.getUserGoals(userId)
      const totalAssets = goals.reduce((sum, g) => {
        const amount = typeof g.current_amount === 'number' ? g.current_amount : parseFloat(g.current_amount || '0')
        return sum + amount
      }, 0)

      // For now, we don't track liabilities separately
      // In future, could add loans/debts table
      const totalLiabilities = 0

      const netWorth = totalAssets - totalLiabilities

      // Calculate growth (compare to 30 days ago)
      // For now, estimate based on savings rate
      const spendingAnalysis = await this.analyzeSpending(userId, 30)
      const monthlyGrowth = spendingAnalysis?.netSavings || 0
      const growthPercentage = totalAssets > 0 ? (monthlyGrowth / totalAssets) * 100 : 0

      return {
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        net_worth: netWorth,
        growth_this_month: monthlyGrowth,
        growth_percentage: Math.round(growthPercentage * 100) / 100
      }
    } catch (error) {
      console.error('Error calculating net worth:', error)
      return {
        total_assets: 0,
        total_liabilities: 0,
        net_worth: 0,
        growth_this_month: 0,
        growth_percentage: 0
      }
    }
  }

  /**
   * Calculates burn rate (how fast user is spending money)
   */
  async calculateBurnRate(userId: string): Promise<BurnRate> {
    try {
      const analysis = await this.analyzeSpending(userId, 30)
      
      if (!analysis) {
        return {
          monthly_burn_rate: 0,
          daily_burn_rate: 0,
          runway_months: 0
        }
      }

      const monthlyBurnRate = analysis.totalExpenses
      const dailyBurnRate = monthlyBurnRate / 30

      // Calculate runway (how long savings will last)
      const goals = await this.getUserGoals(userId)
      const liquidSavings = goals.reduce((sum, g) => {
        // Only count emergency fund or savings as liquid
        if (g.category === 'emergency' || g.category === 'savings') {
          const amount = typeof g.current_amount === 'number' ? g.current_amount : parseFloat(g.current_amount || '0')
          return sum + amount
        }
        return sum
      }, 0)

      const runwayMonths = monthlyBurnRate > 0 ? liquidSavings / monthlyBurnRate : 0

      // Calculate projected depletion date
      let projectedDepletionDate: string | undefined
      if (runwayMonths > 0 && runwayMonths < 120) { // Only if < 10 years
        const depletionDate = new Date()
        depletionDate.setMonth(depletionDate.getMonth() + Math.floor(runwayMonths))
        projectedDepletionDate = depletionDate.toISOString().split('T')[0]
      }

      return {
        monthly_burn_rate: monthlyBurnRate,
        daily_burn_rate: Math.round(dailyBurnRate * 100) / 100,
        runway_months: Math.round(runwayMonths * 10) / 10,
        projected_depletion_date: projectedDepletionDate
      }
    } catch (error) {
      console.error('Error calculating burn rate:', error)
      return {
        monthly_burn_rate: 0,
        daily_burn_rate: 0,
        runway_months: 0
      }
    }
  }

  /**
   * Compares budget vs actual spending
   */
  async getBudgetVsActual(userId: string): Promise<BudgetVsActual> {
    try {
      const userContext = await this.getUserContext(userId)
      const analysis = await this.analyzeSpending(userId, 30)

      if (!userContext || !analysis) {
        return {
          period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          budget_total: 0,
          actual_total: 0,
          variance: 0,
          variance_percentage: 0,
          categories: []
        }
      }

      // Use 50-30-20 rule as default budget
      const income = userContext.income || 0
      const budgetNeeds = income * 0.5
      const budgetWants = income * 0.3
      const budgetSavings = income * 0.2
      const budgetTotal = income

      const actualTotal = analysis.totalExpenses
      const variance = budgetTotal - actualTotal
      const variancePercentage = budgetTotal > 0 ? (variance / budgetTotal) * 100 : 0

      // Categorize spending
      const categories = analysis.topCategories.map((cat: any) => {
        // Estimate budget based on category type
        let budgeted = 0
        const isNeed = ['food', 'transport', 'utilities', 'rent', 'bills'].includes(cat.category.toLowerCase())
        const isWant = ['entertainment', 'shopping', 'dining', 'leisure'].includes(cat.category.toLowerCase())
        
        if (isNeed) {
          budgeted = budgetNeeds * (cat.percentage / 100) * 2 // Rough allocation
        } else if (isWant) {
          budgeted = budgetWants * (cat.percentage / 100) * 2
        }

        const catVariance = budgeted - cat.amount
        const status: 'under' | 'over' | 'on-track' = 
          catVariance > budgeted * 0.1 ? 'under' : 
          catVariance < -budgeted * 0.1 ? 'over' : 
          'on-track'

        return {
          category: cat.category,
          budgeted: Math.round(budgeted),
          actual: cat.amount,
          variance: Math.round(catVariance),
          status
        }
      })

      return {
        period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        budget_total: budgetTotal,
        actual_total: actualTotal,
        variance: Math.round(variance),
        variance_percentage: Math.round(variancePercentage * 100) / 100,
        categories: categories.slice(0, 5) // Top 5 categories
      }
    } catch (error) {
      console.error('Error calculating budget vs actual:', error)
      return {
        period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        budget_total: 0,
        actual_total: 0,
        variance: 0,
        variance_percentage: 0,
        categories: []
      }
    }
  }

  /**
   * Detects spending trends over time
   */
  async detectSpendingTrends(userId: string): Promise<SpendingTrend> {
    try {
      // Get spending for last 90 days
      const currentMonth = await this.analyzeSpending(userId, 30)
      const previousMonth = await this.analyzeSpending(userId, 60) // Last 30-60 days
      const twoMonthsAgo = await this.analyzeSpending(userId, 90) // Last 60-90 days

      if (!currentMonth) {
        return {
          period: 'Last 3 months',
          trend: 'stable',
          change_amount: 0,
          change_percentage: 0,
          average_monthly: 0,
          highest_month: { month: 'Unknown', amount: 0 },
          lowest_month: { month: 'Unknown', amount: 0 },
          top_growing_categories: []
        }
      }

      const current = currentMonth.totalExpenses
      const previous = previousMonth?.totalExpenses || current
      const twoAgo = twoMonthsAgo?.totalExpenses || current

      const average = (current + previous + twoAgo) / 3
      const changeAmount = current - previous
      const changePercentage = previous > 0 ? (changeAmount / previous) * 100 : 0

      // Determine trend
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      if (changePercentage > 10) {
        trend = 'increasing'
      } else if (changePercentage < -10) {
        trend = 'decreasing'
      }

      // Find highest and lowest months
      const months = [
        { month: 'This month', amount: current },
        { month: 'Last month', amount: previous },
        { month: '2 months ago', amount: twoAgo }
      ]
      months.sort((a, b) => b.amount - a.amount)

      // Detect growing categories
      const topGrowingCategories = currentMonth.topCategories
        .slice(0, 3)
        .map((cat: any) => ({
          category: cat.category,
          growth: cat.percentage
        }))

      return {
        period: 'Last 3 months',
        trend,
        change_amount: Math.round(changeAmount),
        change_percentage: Math.round(changePercentage * 100) / 100,
        average_monthly: Math.round(average),
        highest_month: months[0],
        lowest_month: months[months.length - 1],
        top_growing_categories: topGrowingCategories
      }
    } catch (error) {
      console.error('Error detecting spending trends:', error)
      return {
        period: 'Last 3 months',
        trend: 'stable',
        change_amount: 0,
        change_percentage: 0,
        average_monthly: 0,
        highest_month: { month: 'Unknown', amount: 0 },
        lowest_month: { month: 'Unknown', amount: 0 },
        top_growing_categories: []
      }
    }
  }

  /**
   * Calculates savings velocity (how fast user is saving)
   */
  async calculateSavingsVelocity(userId: string): Promise<SavingsVelocity> {
    try {
      const analysis = await this.analyzeSpending(userId, 30)
      const goals = await this.getUserGoals(userId)

      if (!analysis) {
        return {
          current_monthly_savings: 0,
          average_savings_rate: 0,
          projected_annual_savings: 0,
          pace: 'on-track'
        }
      }

      const monthlySavings = analysis.netSavings
      const savingsRate = analysis.savingsRate
      const projectedAnnualSavings = monthlySavings * 12

      // Calculate months to next goal
      const activeGoals = goals.filter(g => g.status === 'active')
      let monthsToNextGoal: number | undefined
      
      if (activeGoals.length > 0 && monthlySavings > 0) {
        // Find closest goal
        const closestGoal = activeGoals.reduce((closest, current) => {
          const currentAmount = typeof current.current_amount === 'number' ? current.current_amount : parseFloat(current.current_amount || '0')
          const currentTarget = typeof current.target_amount === 'number' ? current.target_amount : parseFloat(current.target_amount || '0')
          const currentRemaining = currentTarget - currentAmount

          const closestAmount = typeof closest.current_amount === 'number' ? closest.current_amount : parseFloat(closest.current_amount || '0')
          const closestTarget = typeof closest.target_amount === 'number' ? closest.target_amount : parseFloat(closest.target_amount || '0')
          const closestRemaining = closestTarget - closestAmount

          return currentRemaining < closestRemaining ? current : closest
        })

        const closestAmount = typeof closestGoal.current_amount === 'number' ? closestGoal.current_amount : parseFloat(closestGoal.current_amount || '0')
        const closestTarget = typeof closestGoal.target_amount === 'number' ? closestGoal.target_amount : parseFloat(closestGoal.target_amount || '0')
        const remaining = closestTarget - closestAmount
        monthsToNextGoal = Math.ceil(remaining / monthlySavings)
      }

      // Determine pace
      let pace: 'ahead' | 'on-track' | 'behind' = 'on-track'
      if (savingsRate >= 25) {
        pace = 'ahead'
      } else if (savingsRate < 15) {
        pace = 'behind'
      }

      return {
        current_monthly_savings: monthlySavings,
        average_savings_rate: savingsRate,
        months_to_next_goal: monthsToNextGoal,
        projected_annual_savings: projectedAnnualSavings,
        pace
      }
    } catch (error) {
      console.error('Error calculating savings velocity:', error)
      return {
        current_monthly_savings: 0,
        average_savings_rate: 0,
        projected_annual_savings: 0,
        pace: 'on-track'
      }
    }
  }

  /**
   * Formats analytics context for AI
   */
  formatAnalyticsContext(
    netWorth: NetWorth,
    burnRate: BurnRate,
    budgetVsActual: BudgetVsActual,
    trends: SpendingTrend,
    velocity: SavingsVelocity
  ): string {
    let context = `REAL-TIME ANALYTICS & INSIGHTS:\n\n`

    // Net Worth
    context += `💰 NET WORTH:\n`
    context += `- Total Assets: ₱${netWorth.total_assets.toLocaleString()}\n`
    context += `- Net Worth: ₱${netWorth.net_worth.toLocaleString()}\n`
    if (netWorth.growth_this_month !== 0) {
      const sign = netWorth.growth_this_month > 0 ? '+' : ''
      context += `- Monthly Growth: ${sign}₱${netWorth.growth_this_month.toLocaleString()} (${sign}${netWorth.growth_percentage}%)\n`
    }
    context += `\n`

    // Burn Rate
    context += `🔥 BURN RATE:\n`
    context += `- Monthly: ₱${burnRate.monthly_burn_rate.toLocaleString()}\n`
    context += `- Daily: ₱${burnRate.daily_burn_rate.toLocaleString()}\n`
    if (burnRate.runway_months > 0) {
      context += `- Runway: ${burnRate.runway_months} months`
      if (burnRate.runway_months < 6) {
        context += ` ⚠️ LOW!`
      }
      context += `\n`
      if (burnRate.projected_depletion_date) {
        context += `- Depletion Date: ${burnRate.projected_depletion_date} (if no income)\n`
      }
    }
    context += `\n`

    // Budget vs Actual
    context += `📊 BUDGET VS ACTUAL (${budgetVsActual.period}):\n`
    context += `- Budgeted: ₱${budgetVsActual.budget_total.toLocaleString()}\n`
    context += `- Actual: ₱${budgetVsActual.actual_total.toLocaleString()}\n`
    context += `- Variance: ₱${budgetVsActual.variance.toLocaleString()} (${budgetVsActual.variance_percentage}%)\n`
    if (budgetVsActual.categories.length > 0) {
      context += `\nCategory Performance:\n`
      budgetVsActual.categories.forEach(cat => {
        const icon = cat.status === 'under' ? '✅' : cat.status === 'over' ? '⚠️' : '➡️'
        context += `${icon} ${cat.category}: ₱${cat.actual.toLocaleString()} vs ₱${cat.budgeted.toLocaleString()}\n`
      })
    }
    context += `\n`

    // Spending Trends
    context += `📈 SPENDING TRENDS (${trends.period}):\n`
    const trendIcon = trends.trend === 'increasing' ? '📈' : trends.trend === 'decreasing' ? '📉' : '➡️'
    context += `- Trend: ${trendIcon} ${trends.trend.toUpperCase()}\n`
    context += `- Change: ${trends.change_amount >= 0 ? '+' : ''}₱${trends.change_amount.toLocaleString()} (${trends.change_percentage}%)\n`
    context += `- Average Monthly: ₱${trends.average_monthly.toLocaleString()}\n`
    context += `- Highest: ${trends.highest_month.month} (₱${trends.highest_month.amount.toLocaleString()})\n`
    context += `- Lowest: ${trends.lowest_month.month} (₱${trends.lowest_month.amount.toLocaleString()})\n`
    if (trends.top_growing_categories.length > 0) {
      context += `\nGrowing Categories:\n`
      trends.top_growing_categories.forEach(cat => {
        context += `- ${cat.category}: ${cat.growth}% of spending\n`
      })
    }
    context += `\n`

    // Savings Velocity
    context += `🚀 SAVINGS VELOCITY:\n`
    context += `- Monthly Savings: ₱${velocity.current_monthly_savings.toLocaleString()}\n`
    context += `- Savings Rate: ${velocity.average_savings_rate}%\n`
    context += `- Annual Projection: ₱${velocity.projected_annual_savings.toLocaleString()}\n`
    if (velocity.months_to_next_goal) {
      context += `- Next Goal: ${velocity.months_to_next_goal} months away\n`
    }
    const paceIcon = velocity.pace === 'ahead' ? '🚀' : velocity.pace === 'behind' ? '🐌' : '✅'
    context += `- Pace: ${paceIcon} ${velocity.pace.toUpperCase()}\n`
    context += `\n`

    // AI Instructions
    context += `\n🎯 AI INSTRUCTIONS FOR ANALYTICS:\n`
    context += `- Reference SPECIFIC numbers and percentages\n`
    context += `- Highlight trends (increasing/decreasing)\n`
    context += `- WARN if burn rate runway < 6 months\n`
    context += `- CELEBRATE positive growth and savings velocity\n`
    context += `- CONNECT analytics to goals (e.g., "At current pace, you'll hit goal in 3 months")\n`
    context += `- RECOMMEND actions based on budget variance\n`
    context += `- Use trend data for predictions\n`
    context += `- Reference pace (ahead/on-track/behind) for encouragement\n`

    return context
  }

  // ===== PHASE 5: BEHAVIORAL PATTERN DETECTION METHODS =====

  async analyzeSpendingTriggers(userId: string): Promise<SpendingTrigger[]> {
    // Get last 90 days of transactions with metadata (notes, tags, timestamps)
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false })

    if (!transactions || transactions.length === 0) return []

    const triggers: SpendingTrigger[] = []

    // Detect weekend spending trigger
    const weekendTransactions: any[] = transactions.filter((t: any) => {
      const day = new Date(t.date).getDay()
      return day === 0 || day === 6 // Sunday or Saturday
    })
    if (weekendTransactions.length > 0) {
      const weekendTotal = weekendTransactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
      const weekendAvg = weekendTotal / weekendTransactions.length
      triggers.push({
        trigger_type: 'temporal',
        trigger_name: 'Weekend Spending',
        occurrences: weekendTransactions.length,
        average_amount: Math.round(weekendAvg),
        total_impact: Math.round(weekendTotal),
        confidence: weekendTransactions.length > 10 ? 85 : 65,
        pattern_description: `You spend more on weekends (${weekendTransactions.length} transactions in 13 weeks)`,
        last_occurrence: weekendTransactions[0]?.date || '',
        recommended_action: 'Set weekend budget limit. Plan free activities. Use No-Spend Weekend challenge.'
      })
    }

    // Detect evening/night spending (> 8pm)
    const eveningTransactions: any[] = transactions.filter((t: any) => {
      const hour = new Date(t.created_at).getHours()
      return hour >= 20 // 8pm or later
    })
    if (eveningTransactions.length > 5) {
      const eveningTotal = eveningTransactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
      const eveningAvg = eveningTotal / eveningTransactions.length
      triggers.push({
        trigger_type: 'temporal',
        trigger_name: 'Evening Impulse Spending',
        occurrences: eveningTransactions.length,
        average_amount: Math.round(eveningAvg),
        total_impact: Math.round(eveningTotal),
        confidence: 75,
        pattern_description: `You make ${eveningTransactions.length} purchases after 8pm (impulse shopping time)`,
        last_occurrence: eveningTransactions[0]?.date || '',
        recommended_action: 'Delete shopping apps from phone after 8pm. Use 24-hour rule for purchases.'
      })
    }

    // Detect high-frequency small purchases (coffee, snacks, etc.)
    const smallPurchases: any[] = transactions.filter((t: any) => Math.abs(t.amount) < 200)
    const frequentCategories = new Map<string, number>()
    smallPurchases.forEach((t: any) => {
      const count = frequentCategories.get(t.category) || 0
      frequentCategories.set(t.category, count + 1)
    })
    
    frequentCategories.forEach((count, category) => {
      if (count > 15) { // More than 15x in 90 days = habitual
        const categoryTotal = smallPurchases
          .filter((t: any) => t.category === category)
          .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
        const categoryAvg = categoryTotal / count
        
        triggers.push({
          trigger_type: 'environmental',
          trigger_name: `Habitual ${category} Purchases`,
          occurrences: count,
          average_amount: Math.round(categoryAvg),
          total_impact: Math.round(categoryTotal),
          confidence: count > 30 ? 90 : 75,
          pattern_description: `${count} small ${category} purchases (₱${Math.round(categoryAvg)} avg) = habitual spending`,
          last_occurrence: smallPurchases.find((t: any) => t.category === category)?.date || '',
          recommended_action: `Track your ${category} spending. Consider alternatives. Start Skip-${category} challenge.`
        })
      }
    })

    return triggers.slice(0, 5) // Return top 5 most significant triggers
  }

  async detectPaydayEffect(userId: string): Promise<PaydayEffect> {
    // Get user income/payday info
    const userContext = await this.getUserContext(userId)
    const income = userContext?.income || 25000

    // Assume payday is 15th and end of month (common in Philippines)
    const paydayDates = [15, 30]

    // Get last 90 days of transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    if (!transactions || transactions.length === 0) {
      return {
        has_payday_pattern: false,
        payday_dates: paydayDates,
        average_pre_payday_spending: 0,
        average_post_payday_spending: 0,
        spending_spike_percentage: 0,
        days_until_spike_ends: 0,
        total_payday_overspending: 0,
        recommendation: 'Not enough data to detect payday pattern yet.'
      }
    }

    // Categorize transactions as pre-payday (days 1-14, 16-29) vs post-payday (days 15-17, 30-2)
    const prePaydayTransactions: number[] = []
    const postPaydayTransactions: number[] = []

    transactions.forEach((t: any) => {
      const day = new Date(t.date).getDate()
      const amount = Math.abs(t.amount)
      
      // Post-payday: 15-17 or 30-2 (next month)
      if ((day >= 15 && day <= 17) || (day >= 30) || (day <= 2)) {
        postPaydayTransactions.push(amount)
      } else {
        prePaydayTransactions.push(amount)
      }
    })

    const avgPrePayday = prePaydayTransactions.length > 0
      ? prePaydayTransactions.reduce((a, b) => a + b, 0) / prePaydayTransactions.length
      : 0
    const avgPostPayday = postPaydayTransactions.length > 0
      ? postPaydayTransactions.reduce((a, b) => a + b, 0) / postPaydayTransactions.length
      : 0

    const spikePercentage = avgPrePayday > 0
      ? Math.round(((avgPostPayday - avgPrePayday) / avgPrePayday) * 100)
      : 0

    const hasPattern = spikePercentage > 20 // 20%+ increase = payday effect

    // Calculate total overspending due to payday effect (monthly)
    const totalOverspending = hasPattern
      ? Math.round((avgPostPayday - avgPrePayday) * postPaydayTransactions.length / 3) // 3 months of data
      : 0

    return {
      has_payday_pattern: hasPattern,
      payday_dates: paydayDates,
      average_pre_payday_spending: Math.round(avgPrePayday),
      average_post_payday_spending: Math.round(avgPostPayday),
      spending_spike_percentage: spikePercentage,
      days_until_spike_ends: 3, // Typically lasts 3 days
      total_payday_overspending: totalOverspending,
      recommendation: hasPattern
        ? `You overspend ${spikePercentage}% after payday (₱${totalOverspending}/month extra). Plan purchases BEFORE payday to avoid impulse splurges.`
        : 'Good news! No significant payday spending pattern detected. Keep it up!'
    }
  }

  async analyzeDayOfWeekPatterns(userId: string): Promise<DayOfWeekPattern> {
    // Get last 90 days of transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    if (!transactions || transactions.length === 0) {
      return {
        highest_spending_day: 'Unknown',
        lowest_spending_day: 'Unknown',
        day_averages: [],
        weekend_vs_weekday_ratio: 1.0,
        pattern_strength: 'weak',
        recommendation: 'Not enough data to detect day-of-week patterns yet.'
      }
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayTotals = new Map<number, { total: number; count: number }>()

    // Initialize all days
    for (let i = 0; i < 7; i++) {
      dayTotals.set(i, { total: 0, count: 0 })
    }

    // Aggregate by day of week
    transactions.forEach((t: any) => {
      const day = new Date(t.date).getDay()
      const amount = Math.abs(t.amount)
      const current = dayTotals.get(day)!
      dayTotals.set(day, { total: current.total + amount, count: current.count + 1 })
    })

    // Calculate averages
    const dayAverages: { day: string; average: number; transaction_count: number }[] = []
    let highestDay = 0
    let lowestDay = 0
    let highestAvg = 0
    let lowestAvg = Infinity

    dayTotals.forEach((data, dayNum) => {
      const avg = data.count > 0 ? data.total / data.count : 0
      dayAverages.push({
        day: dayNames[dayNum],
        average: Math.round(avg),
        transaction_count: data.count
      })

      if (avg > highestAvg) {
        highestAvg = avg
        highestDay = dayNum
      }
      if (avg < lowestAvg && data.count > 0) {
        lowestAvg = avg
        lowestDay = dayNum
      }
    })

    // Calculate weekend vs weekday ratio
    const weekendData = [0, 6].map(d => dayTotals.get(d)!).reduce((sum, d) => sum + d.total, 0)
    const weekendCount = [0, 6].map(d => dayTotals.get(d)!).reduce((sum, d) => sum + d.count, 0)
    const weekdayData = [1, 2, 3, 4, 5].map(d => dayTotals.get(d)!).reduce((sum, d) => sum + d.total, 0)
    const weekdayCount = [1, 2, 3, 4, 5].map(d => dayTotals.get(d)!).reduce((sum, d) => sum + d.count, 0)

    const weekendAvg = weekendCount > 0 ? weekendData / weekendCount : 0
    const weekdayAvg = weekdayCount > 0 ? weekdayData / weekdayCount : 0
    const ratio = weekdayAvg > 0 ? weekendAvg / weekdayAvg : 1.0

    // Determine pattern strength
    const percentageDiff = Math.abs(highestAvg - lowestAvg) / ((highestAvg + lowestAvg) / 2) * 100
    const patternStrength = percentageDiff > 50 ? 'strong' : percentageDiff > 25 ? 'moderate' : 'weak'

    return {
      highest_spending_day: dayNames[highestDay],
      lowest_spending_day: dayNames[lowestDay],
      day_averages: dayAverages,
      weekend_vs_weekday_ratio: Math.round(ratio * 100) / 100,
      pattern_strength: patternStrength,
      recommendation: ratio > 1.3
        ? `You spend ${Math.round((ratio - 1) * 100)}% more on weekends. Plan free weekend activities to save ₱${Math.round((weekendAvg - weekdayAvg) * 8)}/month.`
        : 'Your spending is balanced across the week. Great consistency!'
    }
  }

  async profileRiskTolerance(userId: string): Promise<RiskProfile> {
    // Get user's financial data
    const goals = await this.getUserGoals(userId)
    const userContext = await this.getUserContext(userId)
    const spendingAnalysis = await this.analyzeSpending(userId, 90)

    if (!goals || goals.length === 0) {
      return {
        profile_type: 'moderate',
        emergency_fund_months: 0,
        savings_allocation: [],
        spending_volatility: 0,
        financial_stability_score: 50,
        personality_traits: ['Not enough data'],
        recommended_strategies: ['Start by setting financial goals']
      }
    }

    // Analyze savings allocation
    const totalSavings = goals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0)
    const savingsBreakdown: { category: string; percentage: number }[] = []
    const emergencyFunds = goals.filter(g => 
      g.category?.toLowerCase().includes('emergency') || 
      (g.title || '').toLowerCase().includes('emergency')
    )
    const investmentGoals = goals.filter(g => 
      g.category?.toLowerCase().includes('investment') ||
      (g.title || '').toLowerCase().includes('invest') ||
      (g.title || '').toLowerCase().includes('stock')
    )
    const savingsGoals = goals.filter(g => 
      g.category?.toLowerCase().includes('savings')
    )

    const emergencyTotal = emergencyFunds.reduce((sum, g) => sum + Number(g.current_amount || 0), 0)
    const investmentTotal = investmentGoals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0)
    const savingsTotal = savingsGoals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0)

    if (totalSavings > 0) {
      savingsBreakdown.push({ category: 'Emergency Fund', percentage: Math.round((emergencyTotal / totalSavings) * 100) })
      savingsBreakdown.push({ category: 'Investments', percentage: Math.round((investmentTotal / totalSavings) * 100) })
      savingsBreakdown.push({ category: 'Savings', percentage: Math.round((savingsTotal / totalSavings) * 100) })
    }

    // Calculate emergency fund months
    const monthlyExpenses = spendingAnalysis?.totalExpenses || userContext?.income || 20000
    const emergencyMonths = monthlyExpenses > 0 ? emergencyTotal / monthlyExpenses : 0

    // Calculate spending volatility (standard deviation)
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    let volatility = 0
    if (recentTransactions && recentTransactions.length > 0) {
      const amounts = recentTransactions.map((t: any) => Math.abs(t.amount))
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
      const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
      volatility = Math.sqrt(variance)
    }

    // Determine risk profile
    const emergencyPercentage = savingsBreakdown.find(s => s.category === 'Emergency Fund')?.percentage || 0
    const investmentPercentage = savingsBreakdown.find(s => s.category === 'Investments')?.percentage || 0

    let profileType: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
    if (emergencyPercentage > 60) profileType = 'conservative'
    else if (investmentPercentage > 40) profileType = 'aggressive'

    // Calculate stability score (0-100)
    const stabilityScore = Math.min(100, Math.round(
      (emergencyMonths / 6) * 30 + // 30 points for 6 months emergency fund
      (goals.length / 5) * 20 + // 20 points for having multiple goals
      (100 - Math.min(100, volatility / 10)) * 30 + // 30 points for low volatility
      ((spendingAnalysis?.netSavings || 0) > 0 ? 20 : 0) // 20 points for positive savings
    ))

    // Personality traits
    const traits: string[] = []
    if (profileType === 'conservative') traits.push('Security-focused', 'Risk-averse', 'Long-term planner')
    else if (profileType === 'aggressive') traits.push('Growth-oriented', 'Risk-tolerant', 'Investment-focused')
    else traits.push('Balanced', 'Pragmatic', 'Goal-oriented')

    if (emergencyMonths >= 6) traits.push('Well-prepared for emergencies')
    if (volatility < 500) traits.push('Consistent spender')

    // Recommended strategies
    const strategies: string[] = []
    if (profileType === 'conservative') {
      strategies.push('Automate savings to high-yield accounts (digital banks: 6% interest)')
      strategies.push('Focus on building 6-month emergency fund first')
      strategies.push('Consider low-risk investments after emergency fund complete')
    } else if (profileType === 'aggressive') {
      strategies.push('Ensure 3-month emergency fund before increasing investments')
      strategies.push('Diversify investment portfolio')
      strategies.push('Research stocks, crypto, or index funds')
    } else {
      strategies.push('Continue balanced approach: savings + investments')
      strategies.push('Build emergency fund to 6 months')
      strategies.push('Gradually increase investment allocation')
    }

    return {
      profile_type: profileType,
      emergency_fund_months: Math.round(emergencyMonths * 10) / 10,
      savings_allocation: savingsBreakdown,
      spending_volatility: Math.round(volatility),
      financial_stability_score: stabilityScore,
      personality_traits: traits,
      recommended_strategies: strategies
    }
  }

  async trackHabitFormation(userId: string): Promise<HabitFormation> {
    // Get user's challenges and transaction history
    const { data: userChallenges } = await supabase
      .from('user_challenges')
      .select('*, challenges(*)')
      .eq('user_id', userId)

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: true })

    const detectedHabits: HabitFormation['detected_habits'] = []
    const breakingHabits: HabitFormation['breaking_habits'] = []

    // Analyze active challenges as habit formation
    if (userChallenges) {
      userChallenges.forEach((uc: any) => {
        if (uc.status === 'active' && uc.current_streak && uc.current_streak > 3) {
          const daysSinceStart = Math.floor(
            (Date.now() - new Date(uc.start_date).getTime()) / (1000 * 60 * 60 * 24)
          )
          const consistency = Math.round((uc.current_streak / daysSinceStart) * 100)

          // Calculate financial impact (estimated savings)
          const estimatedDailySavings = uc.challenges?.points_reward || 50
          const financialImpact = uc.current_streak * estimatedDailySavings

          const habitType = uc.current_streak >= 15 ? 'positive' : 'neutral'

          detectedHabits.push({
            habit_name: uc.challenges?.title || 'Habit',
            frequency: 'daily',
            streak_days: uc.current_streak,
            consistency_score: Math.min(100, consistency),
            financial_impact: financialImpact,
            habit_type: habitType,
            formed_date: uc.current_streak >= 21 ? uc.start_date : '',
            recommendation: uc.current_streak >= 21
              ? `🎉 Habit FORMED! Keep going on autopilot!`
              : `${21 - uc.current_streak} more days to form this habit (${Math.round((uc.current_streak / 21) * 100)}% there)`
          })
        }
      })

      // Check for completed challenges that weren't maintained (breaking habits)
      const completedChallenges = userChallenges.filter((uc: any) => uc.status === 'completed')
      completedChallenges.forEach((uc: any) => {
        const daysSinceCompleted = Math.floor(
          (Date.now() - new Date(uc.end_date || uc.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (daysSinceCompleted > 7 && daysSinceCompleted < 30) {
          // Check if behavior resumed (negative habit returning)
          breakingHabits.push({
            habit_name: `Old ${uc.challenges?.title || 'Habit'}`,
            previous_frequency: 'daily',
            days_since_last: daysSinceCompleted,
            success_probability: Math.min(95, 50 + (daysSinceCompleted * 2))
          })
        }
      })
    }

    // Detect transaction-based habits (recurring purchases)
    if (transactions) {
      const categoryFrequency = new Map<string, Date[]>()
      
      transactions.forEach((t: any) => {
        if (!categoryFrequency.has(t.category)) {
          categoryFrequency.set(t.category, [])
        }
        categoryFrequency.get(t.category)!.push(new Date(t.date))
      })

      categoryFrequency.forEach((dates, category) => {
        if (dates.length >= 15) { // 15+ occurrences in 60 days = habitual
          // Check consistency (are purchases evenly spaced?)
          dates.sort((a, b) => a.getTime() - b.getTime())
          const gaps: number[] = []
          for (let i = 1; i < dates.length; i++) {
            const gap = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
            gaps.push(gap)
          }
          const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
          const consistency = avgGap < 7 ? 90 : avgGap < 14 ? 70 : 50

          const categoryTransactions = transactions.filter((t: any) => t.category === category)
          const totalSpent = categoryTransactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)

          // Determine if habit is positive or negative
          const habitType = category.toLowerCase().includes('savings') || 
                           category.toLowerCase().includes('invest')
            ? 'positive'
            : totalSpent > 5000
            ? 'negative'
            : 'neutral'

          detectedHabits.push({
            habit_name: `Regular ${category} ${habitType === 'positive' ? 'Contributions' : 'Purchases'}`,
            frequency: avgGap < 7 ? 'daily' : avgGap < 30 ? 'weekly' : 'monthly',
            streak_days: Math.floor((dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24)),
            consistency_score: Math.round(consistency),
            financial_impact: habitType === 'positive' ? totalSpent : -totalSpent,
            habit_type: habitType,
            formed_date: dates[0].toISOString(),
            recommendation: habitType === 'negative'
              ? `This habit costs ₱${Math.round(totalSpent)}/60 days. Consider reducing frequency.`
              : `Great habit! You've built consistency in ${category}.`
          })
        }
      })
    }

    // Calculate habit formation speed (average days to form habits)
    const formedHabits = detectedHabits.filter(h => h.streak_days >= 21)
    const avgFormationSpeed = formedHabits.length > 0
      ? Math.round(formedHabits.reduce((sum, h) => sum + h.streak_days, 0) / formedHabits.length)
      : 21 // Default to 21 days

    // Overall habit score (0-100)
    const positiveHabits = detectedHabits.filter(h => h.habit_type === 'positive').length
    const negativeHabits = detectedHabits.filter(h => h.habit_type === 'negative').length
    const avgConsistency = detectedHabits.length > 0
      ? detectedHabits.reduce((sum, h) => sum + h.consistency_score, 0) / detectedHabits.length
      : 50

    const habitScore = Math.round(
      (positiveHabits / Math.max(1, positiveHabits + negativeHabits)) * 50 + // 50 points for positive ratio
      (avgConsistency / 100) * 50 // 50 points for consistency
    )

    return {
      detected_habits: detectedHabits.slice(0, 6), // Top 6 habits
      breaking_habits: breakingHabits.slice(0, 3), // Top 3 breaking habits
      habit_formation_speed: avgFormationSpeed,
      overall_habit_score: habitScore
    }
  }

  formatBehavioralContext(
    triggers: SpendingTrigger[],
    paydayEffect: PaydayEffect,
    dayPattern: DayOfWeekPattern,
    riskProfile: RiskProfile,
    habitFormation: HabitFormation
  ): string {
    let context = '\n'

    // Spending Triggers
    if (triggers.length > 0) {
      context += `⚠️ SPENDING TRIGGERS DETECTED:\n`
      triggers.forEach((trigger, idx) => {
        context += `\n${idx + 1}. ${trigger.trigger_name} (${trigger.trigger_type})\n`
        context += `   - Occurrences: ${trigger.occurrences} times\n`
        context += `   - Avg Amount: ₱${trigger.average_amount.toLocaleString()}\n`
        context += `   - Total Impact: ₱${trigger.total_impact.toLocaleString()}\n`
        context += `   - Confidence: ${trigger.confidence}%\n`
        context += `   - Pattern: ${trigger.pattern_description}\n`
        context += `   - Last: ${new Date(trigger.last_occurrence).toLocaleDateString()}\n`
        context += `   - Action: ${trigger.recommended_action}\n`
      })
      context += `\n`
    }

    // Payday Effect
    context += `📅 PAYDAY SPENDING PATTERN:\n`
    if (paydayEffect.has_payday_pattern) {
      context += `- ⚠️ PAYDAY EFFECT DETECTED!\n`
      context += `- Payday Dates: ${paydayEffect.payday_dates.join(', ')} of month\n`
      context += `- Pre-Payday Spending: ₱${paydayEffect.average_pre_payday_spending.toLocaleString()}/transaction\n`
      context += `- Post-Payday Spending: ₱${paydayEffect.average_post_payday_spending.toLocaleString()}/transaction\n`
      context += `- Spending Spike: +${paydayEffect.spending_spike_percentage}% 📈\n`
      context += `- Monthly Overspending: ₱${paydayEffect.total_payday_overspending.toLocaleString()}\n`
      context += `- Recommendation: ${paydayEffect.recommendation}\n`
    } else {
      context += `- ✅ No significant payday spending pattern\n`
      context += `- ${paydayEffect.recommendation}\n`
    }
    context += `\n`

    // Day of Week Pattern
    context += `📆 DAY-OF-WEEK SPENDING:\n`
    context += `- Highest: ${dayPattern.highest_spending_day}\n`
    context += `- Lowest: ${dayPattern.lowest_spending_day}\n`
    context += `- Weekend vs Weekday: ${dayPattern.weekend_vs_weekday_ratio}x ${dayPattern.weekend_vs_weekday_ratio > 1.2 ? '⚠️' : '✅'}\n`
    context += `- Pattern Strength: ${dayPattern.pattern_strength.toUpperCase()}\n`
    context += `- Daily Averages:\n`
    dayPattern.day_averages.forEach(d => {
      context += `  * ${d.day}: ₱${d.average.toLocaleString()} (${d.transaction_count} transactions)\n`
    })
    context += `- Recommendation: ${dayPattern.recommendation}\n`
    context += `\n`

    // Risk Profile
    context += `👤 FINANCIAL PERSONALITY:\n`
    context += `- Profile: ${riskProfile.profile_type.toUpperCase()} ${
      riskProfile.profile_type === 'conservative' ? '🛡️' : 
      riskProfile.profile_type === 'aggressive' ? '🚀' : '⚖️'
    }\n`
    context += `- Emergency Fund: ${riskProfile.emergency_fund_months.toFixed(1)} months ${
      riskProfile.emergency_fund_months >= 6 ? '✅' : '⚠️'
    }\n`
    context += `- Savings Allocation:\n`
    riskProfile.savings_allocation.forEach(s => {
      context += `  * ${s.category}: ${s.percentage}%\n`
    })
    context += `- Spending Volatility: ₱${riskProfile.spending_volatility.toLocaleString()} ${
      riskProfile.spending_volatility < 500 ? '(Low - consistent)' : '(High - variable)'
    }\n`
    context += `- Stability Score: ${riskProfile.financial_stability_score}/100\n`
    context += `- Personality Traits: ${riskProfile.personality_traits.join(', ')}\n`
    context += `- Recommended Strategies:\n`
    riskProfile.recommended_strategies.forEach(s => {
      context += `  * ${s}\n`
    })
    context += `\n`

    // Habit Formation
    context += `🔄 HABIT TRACKING:\n`
    context += `- Overall Habit Score: ${habitFormation.overall_habit_score}/100\n`
    context += `- Habit Formation Speed: ${habitFormation.habit_formation_speed} days\n`
    context += `\n`

    if (habitFormation.detected_habits.length > 0) {
      context += `ACTIVE HABITS:\n`
      habitFormation.detected_habits.forEach((habit, idx) => {
        const icon = habit.habit_type === 'positive' ? '✅' : habit.habit_type === 'negative' ? '⚠️' : 'ℹ️'
        context += `${idx + 1}. ${icon} ${habit.habit_name}\n`
        context += `   - Frequency: ${habit.frequency}\n`
        context += `   - Streak: ${habit.streak_days} days ${habit.streak_days >= 21 ? '🎉 FORMED!' : `(${Math.round((habit.streak_days / 21) * 100)}% to formed)`}\n`
        context += `   - Consistency: ${habit.consistency_score}/100\n`
        context += `   - Financial Impact: ${habit.financial_impact > 0 ? '+' : ''}₱${Math.abs(habit.financial_impact).toLocaleString()}\n`
        context += `   - ${habit.recommendation}\n`
      })
    }

    if (habitFormation.breaking_habits.length > 0) {
      context += `\nBREAKING HABITS:\n`
      habitFormation.breaking_habits.forEach((habit, idx) => {
        context += `${idx + 1}. ${habit.habit_name}\n`
        context += `   - Days Since Last: ${habit.days_since_last}\n`
        context += `   - Success Probability: ${habit.success_probability}%\n`
      })
    }

    context += `\n🎯 AI INSTRUCTIONS FOR BEHAVIORAL PATTERNS:\n`
    context += `- PREDICT user behavior based on triggers and patterns\n`
    context += `- WARN proactively about triggers (e.g., "It's Friday - your high spending day")\n`
    context += `- REFERENCE triggers when user mentions emotions ("You mentioned stress - watch for stress-shopping")\n`
    context += `- ALERT about payday effect 2-3 days before payday\n`
    context += `- CELEBRATE habit milestones (15 days = forming, 21 days = formed!)\n`
    context += `- PERSONALIZE advice based on risk profile\n`
    context += `- CONNECT behaviors to financial outcomes\n`
    context += `- Use temporal context (day of week, distance from payday) for predictions\n`

    return context
  }
}

export const memoryManager = new AIMemoryManager()
