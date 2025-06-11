interface MockUserData {
  income: number
  expenses: Record<string, number>
  savings: number
  conversations: Array<{role: string, content: string, timestamp: Date}>
}

export class MockAIAssistant {
  private userData: Map<string, MockUserData> = new Map()

  // Initialize mock user data
  initUser(userId: string) {
    if (!this.userData.has(userId)) {
      this.userData.set(userId, {
        income: 18000,
        expenses: {
          'Food & Dining': 4200,
          'Transportation': 2100,
          'Shopping': 3500,
          'Bills': 1800
        },
        savings: 8500,
        conversations: []
      })
    }
  }

  // Simple pattern matching instead of GPT
  async chat(userId: string, message: string): Promise<string> {
    this.initUser(userId)
    const userData = this.userData.get(userId)!
    
    // Add to conversation history
    userData.conversations.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    })

    // Simple keyword-based responses
    const lowerMessage = message.toLowerCase()
    let response = ''

    if (lowerMessage.includes('budget') || lowerMessage.includes('gastos')) {
      response = `Based sa ₱${userData.income.toLocaleString()} income mo, here's your budget analysis:
• Food: ₱${userData.expenses['Food & Dining'].toLocaleString()} (target: ₱3,600)
• Transportation: ₱${userData.expenses['Transportation'].toLocaleString()}
• Savings: ₱${userData.savings.toLocaleString()}

You're spending ₱600 more on food than recommended. Try meal prepping para makamura!`
    }
    else if (lowerMessage.includes('save') || lowerMessage.includes('ipon')) {
      response = `Great question about savings! You currently have ₱${userData.savings.toLocaleString()} saved. 

For emergency fund, aim for ₱54,000 (3 months expenses). You're ${Math.round((userData.savings/54000)*100)}% there na!

Try the 52-week peso challenge: Start with ₱50 this week, then increase by ₱50 each week.`
    }
    else if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
      response = `Perfect timing for investing! With your ₱${userData.savings.toLocaleString()} savings, you can start with:

• GCash GInvest: Start with ₱1,000, easy for beginners
• COL Financial: ₱5,000 minimum for PH stocks
• UITF: Available sa BPI/BDO, ₱10,000 minimum

I suggest starting with GInvest muna para ma-try mo without big commitment!`
    }
    else {
      response = `I understand you're asking about "${message}". As your financial AI kuya, I can help with:
• Budgeting and expense tracking
• Savings strategies and goals  
• Investment basics for Filipinos
• Digital wallet tips (GCash, PayMaya)

What specific financial topic would you like to explore?`
    }

    // Add AI response to history
    userData.conversations.push({
      role: 'assistant', 
      content: response,
      timestamp: new Date()
    })

    return response
  }

  // Mock receipt scanning
  async scanReceipt(fileName: string): Promise<any> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Return mock receipt data
    return {
      merchant: "Jollibee Ayala Triangle",
      amount: 185.50,
      date: "2024-01-15", 
      category: "Food & Dining",
      items: ["Chickenjoy w/ Rice", "Peach Mango Pie", "Iced Tea"]
    }
  }

  // Mock budget analysis
  async analyzeBudget(userId: string): Promise<string> {
    this.initUser(userId)
    const userData = this.userData.get(userId)!
    
    return `📊 Budget Analysis for ₱${userData.income.toLocaleString()} monthly income:

**50-30-20 Rule Breakdown:**
• Needs (50%): ₱9,000 - Currently ₱${(userData.expenses['Food & Dining'] + userData.expenses['Bills']).toLocaleString()}
• Wants (30%): ₱5,400 - Currently ₱${(userData.expenses['Shopping'] + userData.expenses['Transportation']).toLocaleString()}  
• Savings (20%): ₱3,600 - Currently ₱${userData.savings > 3600 ? '5,200 🎉' : userData.savings.toLocaleString()}

**Recommendation:** ${userData.savings > 3600 ? 'You\'re saving more than recommended! Consider investing the extra.' : 'Try to increase savings by reducing food delivery expenses.'}`
  }
}
