export interface FinancialGoal {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  monthlyTarget: number
  category: 'phone' | 'laptop' | 'vacation' | 'emergency' | 'education' | 'custom'
  createdBy: 'ai-assistant' | 'manual' | 'challenge'
  createdAt: string
  status: 'active' | 'completed' | 'paused'
  milestones: Array<{
    percentage: number
    amount: number
    reward: string
    completed: boolean
  }>
}

export class GoalManager {
  private goals: FinancialGoal[] = []

  createGoalFromAI(goalData: {
    item: string
    amount: number
    timeframe: number
    userIncome: number
  }): FinancialGoal {
    const monthlyTarget = Math.ceil(goalData.amount / goalData.timeframe)
    const deadline = new Date()
    deadline.setMonth(deadline.getMonth() + goalData.timeframe)

    const newGoal: FinancialGoal = {
      id: `ai-goal-${Date.now()}`,
      title: `Save for ${goalData.item}`,
      description: `AI-generated savings plan to buy ${goalData.item} in ${goalData.timeframe} months`,
      targetAmount: goalData.amount,
      currentAmount: 0,
      deadline: deadline.toISOString(),
      monthlyTarget,
      category: this.categorizeItem(goalData.item),
      createdBy: 'ai-assistant',
      createdAt: new Date().toISOString(),
      status: 'active',
      milestones: [
        { percentage: 25, amount: goalData.amount * 0.25, reward: 'Great start! Keep going!', completed: false },
        { percentage: 50, amount: goalData.amount * 0.5, reward: 'Halfway there! You\'re doing amazing!', completed: false },
        { percentage: 75, amount: goalData.amount * 0.75, reward: 'Almost there! Final push!', completed: false },
        { percentage: 100, amount: goalData.amount, reward: `Congratulations! You can now buy your ${goalData.item}!`, completed: false }
      ]
    }

    this.goals.push(newGoal)
    return newGoal
  }

  createManualGoal(goalData: {
    title: string
    description: string
    targetAmount: number
    timeframe: number
    category: string
  }): FinancialGoal {
    const monthlyTarget = Math.ceil(goalData.targetAmount / goalData.timeframe)
    const deadline = new Date()
    deadline.setMonth(deadline.getMonth() + goalData.timeframe)

    const newGoal: FinancialGoal = {
      id: `manual-goal-${Date.now()}`,
      title: goalData.title,
      description: goalData.description,
      targetAmount: goalData.targetAmount,
      currentAmount: 0,
      deadline: deadline.toISOString(),
      monthlyTarget,
      category: goalData.category as any,
      createdBy: 'manual',
      createdAt: new Date().toISOString(),
      status: 'active',
      milestones: [
        { percentage: 25, amount: goalData.targetAmount * 0.25, reward: '25% milestone reached!', completed: false },
        { percentage: 50, amount: goalData.targetAmount * 0.5, reward: 'Halfway to your goal!', completed: false },
        { percentage: 75, amount: goalData.targetAmount * 0.75, reward: 'You\'re almost there!', completed: false },
        { percentage: 100, amount: goalData.targetAmount, reward: 'Goal achieved! Congratulations!', completed: false }
      ]
    }

    this.goals.push(newGoal)
    return newGoal
  }

  private categorizeItem(item: string): FinancialGoal['category'] {
    const itemLower = item.toLowerCase()
    if (itemLower.includes('phone') || itemLower.includes('iphone') || itemLower.includes('samsung')) return 'phone'
    if (itemLower.includes('laptop') || itemLower.includes('computer') || itemLower.includes('macbook')) return 'laptop'
    if (itemLower.includes('vacation') || itemLower.includes('travel') || itemLower.includes('trip')) return 'vacation'
    if (itemLower.includes('emergency') || itemLower.includes('fund')) return 'emergency'
    if (itemLower.includes('course') || itemLower.includes('education') || itemLower.includes('school')) return 'education'
    return 'custom'
  }

  updateProgress(goalId: string, newAmount: number): FinancialGoal | null {
    const goal = this.goals.find(g => g.id === goalId)
    if (!goal) return null

    goal.currentAmount = newAmount
    
    // Check milestones
    goal.milestones.forEach(milestone => {
      if (newAmount >= milestone.amount && !milestone.completed) {
        milestone.completed = true
        // Trigger celebration notification
      }
    })

    // Check if goal is completed
    if (newAmount >= goal.targetAmount) {
      goal.status = 'completed'
    }

    return goal
  }

  getGoals(): FinancialGoal[] {
    return this.goals
  }

  getGoalById(id: string): FinancialGoal | undefined {
    return this.goals.find(g => g.id === id)
  }
}

export const goalManager = new GoalManager()
