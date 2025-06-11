export interface MissionProgress {
  id: string
  type: 'daily-budget' | 'transport-budget' | 'cooking' | 'no-spend' | 'savings' | 'investment'
  target: number
  current: number
  startDate: string
  endDate: string
  completed: boolean
  dailyLogs: Array<{
    date: string
    amount?: number
    activity?: string
    verified: boolean
  }>
}

export class MissionTracker {
  private missions: MissionProgress[] = []

  updateMissionFromAI(userMessage: string, aiResponse: string): MissionProgress[] {
    const updatedMissions: MissionProgress[] = []

    // Parse spending messages for budget missions
    const spendingMatch = userMessage.match(/spent|cost|paid.*?₱?(\d+)/i)
    if (spendingMatch) {
      const amount = parseInt(spendingMatch[1])
      
      // Update daily budget missions
      const dailyBudgetMissions = this.missions.filter(m => m.type === 'daily-budget')
      dailyBudgetMissions.forEach(mission => {
        mission.dailyLogs.push({
          date: new Date().toISOString(),
          amount: amount,
          verified: true
        })
        mission.current += amount
        
        if (mission.current <= mission.target) {
          // Still within budget - good progress
        } else {
          // Over budget - mission might fail
        }
        
        updatedMissions.push(mission)
      })
    }

    // Parse cooking/food prep messages
    const cookingKeywords = ['cooked', 'prepared', 'lutong bahay', 'home cooked', 'meal prep']
    if (cookingKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      const cookingMissions = this.missions.filter(m => m.type === 'cooking')
      cookingMissions.forEach(mission => {
        mission.dailyLogs.push({
          date: new Date().toISOString(),
          activity: 'cooked at home',
          verified: true
        })
        mission.current += 1
        updatedMissions.push(mission)
      })
    }

    // Parse transportation messages
    const transportKeywords = ['jeepney', 'walked', 'transport', 'fare', 'grab', 'carpool']
    if (transportKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      const transportMatch = userMessage.match(/₱?(\d+).*?(jeepney|transport|fare)/i)
      if (transportMatch) {
        const amount = parseInt(transportMatch[1])
        const transportMissions = this.missions.filter(m => m.type === 'transport-budget')
        transportMissions.forEach(mission => {
          mission.dailyLogs.push({
            date: new Date().toISOString(),
            amount: amount,
            activity: 'transport expense',
            verified: true
          })
          mission.current += amount
          updatedMissions.push(mission)
        })
      }
    }

    // Parse no-spend messages
    const noSpendKeywords = ['no spend', 'didn\'t spend', 'stayed home', 'free activity']
    if (noSpendKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      const noSpendMissions = this.missions.filter(m => m.type === 'no-spend')
      noSpendMissions.forEach(mission => {
        mission.dailyLogs.push({
          date: new Date().toISOString(),
          amount: 0,
          activity: 'no spending day',
          verified: true
        })
        mission.current += 1
        updatedMissions.push(mission)
      })
    }

    return updatedMissions
  }

  generateAIResponse(missionUpdates: MissionProgress[]): string {
    if (missionUpdates.length === 0) return ''

    const responses = missionUpdates.map(mission => {
      switch (mission.type) {
        case 'daily-budget':
          const remaining = mission.target - mission.current
          if (remaining >= 0) {
            return `Great job! You have ₱${remaining} left in your daily budget mission. Keep it up! 💪`
          } else {
            return `Oops! You went ₱${Math.abs(remaining)} over your daily budget. Try to adjust tomorrow's spending. 💡`
          }
        
        case 'cooking':
          return `Awesome! Added another home-cooked meal to your Lutong Bahay mission. You've cooked ${mission.current} times so far! 🍳`
        
        case 'transport-budget':
          const weeklyRemaining = mission.target - mission.current
          return `Transport expense logged! You have ₱${weeklyRemaining} left in your weekly transport budget. ${weeklyRemaining > 0 ? 'Good job staying on track! 🚌' : 'Consider walking or jeepney for remaining trips. 🚶'}`
        
        case 'no-spend':
          return `Perfect no-spend day! You're ${mission.current} days into your no-spend mission. Keep finding those free activities! 🎉`
        
        default:
          return `Mission progress updated! Keep going strong! 💯`
      }
    })

    return responses.join('\n\n')
  }
}

export const missionTracker = new MissionTracker()
