'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { Send, User as UserIcon, Bot, PlusCircle, Calculator, TrendingUp, PieChart, Target, FileText, Paperclip, Camera, Upload, Search, Globe, ArrowRight, Shield, LogIn } from 'lucide-react'
import { goalManager } from '@/lib/goal-manager'
import { WebSearchService } from '@/lib/web-search'
import { FinancialDataService } from '@/lib/financial-apis'
import { missionTracker } from '@/lib/mission-tracker'
import { auth, onAuthStateChange, type User } from '@/lib/auth'

export default function AIAssistantPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Kumusta! I\'m your AI-powered financial kuya/ate assistant! 🤖 I can help you with budgeting, savings plans, investment advice, and all things related to money management for Filipino youth. Ask me anything about your financial goals!',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [showTools, setShowTools] = useState(false)
  const [webSearchService] = useState(() => new WebSearchService())
  const [financialDataService] = useState(() => new FinancialDataService())

  // Authentication effect
  useEffect(() => {
    // Check initial auth state
    auth.getCurrentUser().then((result) => {
      setUser(result.user)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      setIsLoading(false)
      
      // Update welcome message based on auth status
      if (user) {
        setMessages(prev => [
          {
            id: 1,
            type: 'bot',
            content: `Welcome back, ${user.name}! 🤖 I remember our previous conversations and your financial goals. How can I help you today with your financial journey?`,
            timestamp: new Date()
          }
        ])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const financialTools = [
    {
      name: 'Budget Calculator',
      icon: Calculator,
      description: 'Calculate your 50-30-20 budget breakdown',
      action: 'analyze_budget'
    },
    {
      name: 'Investment Tracker',
      icon: TrendingUp,
      description: 'Track your investment portfolio performance',
      action: 'analyze_investments'
    },
    {
      name: 'Receipt Scanner',
      icon: Camera,
      description: 'Scan receipt photos to extract transaction data',
      action: 'scan_receipt'
    },
    {
      name: 'Expense Analyzer',
      icon: PieChart,
      description: 'Analyze your spending patterns',
      action: 'analyze_expenses'
    },
    {
      name: 'Savings Goal Tracker',
      icon: Target,
      description: 'Monitor your savings goals progress',
      action: 'analyze_savings'
    },
    {
      name: 'Financial Report',
      icon: FileText,
      description: 'Generate comprehensive financial summary',
      action: 'generate_report'
    }
  ]

  // Force logout and clear all cached data
  const handleForceLogout = async () => {
    try {
      // Clear Supabase session
      await auth.signOut()
      
      // Clear all browser storage
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.clear()
        
        // Clear sessionStorage
        sessionStorage.clear()
        
        // Clear cookies for this domain
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        })
      }
      
      // Reset component state
      setUser(null)
      setMessages([{
        id: 1,
        type: 'bot',
        content: 'All cached data cleared! You\'re now completely logged out. Feel free to create a new account or log in with different credentials.',
        timestamp: new Date()
      }])
      
      // Force page reload to clear any remaining state
      window.location.reload()
    } catch (error) {
      console.error('Error during force logout:', error)
      // Force reload anyway
      window.location.reload()
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return
    
    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Show loading message
    const loadingMessage = {
      id: Date.now(),
      type: 'bot',
      content: '� AI is thinking... Generating your personalized financial advice...',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, loadingMessage])
    
    try {
      // Call the simple AI API (direct OpenAI, no LangChain)
      const response = await fetch('/api/simple-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          // userId is handled by authentication in the API
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Remove loading message and add AI response
        const aiMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev.filter(msg => msg.id !== loadingMessage.id), aiMessage])
      } else {
        throw new Error(data.error || 'AI request failed')
      }
      
    } catch (error) {
      console.error('AI Chat Error:', error)
      
      // Enhanced fallback with web search integration
      let fallbackResponse = ''
      
      // Check for mission-related updates first
      const missionUpdates = missionTracker.updateMissionFromAI(inputMessage, '')
      const missionResponse = missionTracker.generateAIResponse(missionUpdates)
      
      if (missionResponse) {
        fallbackResponse = missionResponse + '\n\n'
      }
      
      // Check if user wants to search a specific website
      if (inputMessage.toLowerCase().includes('search') && inputMessage.toLowerCase().includes('site:')) {
        try {
          const siteMatch = inputMessage.match(/site:([^\s]+)/)
          const queryMatch = inputMessage.replace(/site:[^\s]+/, '').trim()
          
          if (siteMatch && queryMatch) {
            const results = await webSearchService.searchSpecificSite(siteMatch[1], queryMatch)
            
            if (results.length > 0) {
              fallbackResponse += `🔍 **Search Results from ${siteMatch[1]}:**

${results.slice(0, 3).map((result: any, index: number) => `
**${index + 1}. ${result.title}**
${result.snippet}
🔗 Source: ${result.displayLink}
[Read more](${result.link})
`).join('\n')}

Based on this information, how can I help you with your financial planning? 💡`
            } else {
              fallbackResponse += `I searched ${siteMatch[1]} but couldn't find specific results for "${queryMatch}". Try a different search term or let me help with general financial advice!`
            }
          }
        } catch (searchError) {
          fallbackResponse += 'I had trouble searching that specific site. Google Custom Search might be at its daily limit. Let me help you with my financial knowledge instead!'
        }
      }
      
      // Check for price searches
      else if (inputMessage.toLowerCase().includes('price') || inputMessage.toLowerCase().includes('cost') || inputMessage.toLowerCase().includes('how much')) {
        try {
          const priceResults = await webSearchService.getCurrentPrice(inputMessage)
          
          if (priceResults.length > 0) {
            fallbackResponse += `💰 **Current Price Information (via Google Search):**

${priceResults.map((result: any, index: number) => `
**${index + 1}. ${result.title}**
${result.snippet}
📍 Source: ${result.displayLink}
🔗 [Check current price](${result.link})
`).join('\n')}

**Financial Planning Tips:**
• Compare prices across multiple platforms
• Look for seasonal sales (11.11, 12.12, end-of-month)
• Factor in shipping costs for online purchases
• Consider installment options if available

Ready to create a savings plan for this purchase? Just tell me your target timeline! 🎯`
          } else {
            fallbackResponse += `I searched for current prices but didn't find specific results. This might be because:
• Google Custom Search daily limit reached (100 searches/day)
• The item might be too specific
• Try rephrasing your search

I can still help you create a savings plan! What's your estimated target amount and timeline? 💡`
          }
        } catch (searchError) {
          fallbackResponse += 'Google Search is temporarily unavailable (might have reached daily limit). However, I can still help you with budgeting and savings strategies! What\'s your target amount?'
        }
      }
      
      // Default fallback responses
      else {
        const enhancedResponses = [
          '⚠️ AI is temporarily unavailable, pero I can still help! For budgeting, I suggest the 50-30-20 rule. With your income, allocate 50% for needs, 30% for wants, and 20% for savings. I can search for current bank rates to help you choose the best savings account!',
          '⚠️ My AI brain is resting, but I have backup knowledge! I can help you find current information about any financial topic. Try asking me to "search for [topic]" and I\'ll find the latest information!',
          '⚠️ AI connection failed, pero I can still search the web for you! Try "search for current CIMB bank rates" or "find iPhone 15 prices in Philippines" for real-time data!',
          '⚠️ Primary AI is down, but I can still help with financial planning! What specific topic would you like me to research using web search?'
        ]
        fallbackResponse += enhancedResponses[Math.floor(Math.random() * enhancedResponses.length)]
      }
      
      // Remove loading message and add fallback response
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: fallbackResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev.filter(msg => msg.id !== loadingMessage.id), fallbackMessage])
    }
    
    setInputMessage('')
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: `📷 Scanning receipt: ${file.name}...`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Simulate receipt scanning
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: `📊 **Receipt Scanned Successfully!**

**Merchant:** Jollibee Ayala Triangle
**Amount:** ₱185.50
**Date:** January 15, 2024
**Category:** Food & Dining
**Payment:** GCash

**Items:**
• Chickenjoy w/ Rice - ₱99.00
• Peach Mango Pie - ₱35.00
• Iced Tea - ₱39.00

**Financial Insight:** This represents about 1% of your monthly budget. Medyo okay naman, but if you're doing this 2-3x per week, consider meal prepping para makamura. Want me to suggest affordable lutong bahay alternatives?`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1500)
  }

  const useTool = (tool: any) => {
    if (tool.action === 'scan_receipt') {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/*'
      fileInput.onchange = (e) => {
        const event = e as any
        if (event.target && event.target.files) {
          handleImageUpload({
            target: event.target,
            currentTarget: event.target
          } as React.ChangeEvent<HTMLInputElement>)
        }
      }
      fileInput.click()
      return
    }

    const toolMessage = {
      id: messages.length + 1,
      type: 'user',
      content: `Use ${tool.name} tool`,
      timestamp: new Date()
    }
    
    setMessages([...messages, toolMessage])
    
    // Simulate tool analysis
    setTimeout(() => {
      let analysisResult = ''
      switch (tool.action) {
        case 'analyze_budget':
          analysisResult = `📊 **Budget Analysis Complete!**

Uy Juan, here's your budget breakdown based on ₱18,000 monthly income:

• **Needs (50%):** ₱9,000 
  - Currently: ₱8,100 ✅ (Rent ₱5,000, Groceries ₱2,100, Utilities ₱1,000)
  
• **Wants (30%):** ₱5,400
  - Currently: ₱4,700 ✅ (Food delivery ₱2,200, Shopping ₱1,500, Entertainment ₱1,000)
  
• **Savings (20%):** ₱3,600
  - Currently: ₱5,200 🎉 (Emergency fund ₱3,000, GInvest ₱2,200)

**Sige, you're doing great!** You're saving more than recommended. Consider investing the extra ₱1,600 in COL Financial or increase your GCash investment. Want specific investment recommendations?`
          break
        case 'analyze_investments':
          analysisResult = `📈 **Investment Portfolio Analysis**

Current Portfolio Value: ₱12,750
• **Mutual Funds:** ₱8,500 (+3.2%)
• **GCash Invest:** ₱2,750 (+1.8%)
• **Stocks (COL):** ₱1,500 (+5.1%)

**Recommendation:** Your portfolio is well-diversified! Consider adding more to stocks for higher growth potential.`
          break
        case 'analyze_expenses':
          analysisResult = `💳 **Expense Pattern Analysis**

Top Categories This Month:
1. **Food & Dining:** ₱4,200 (33%) - Above average
2. **Shopping:** ₱3,500 (27%) - Within budget
3. **Transportation:** ₱2,100 (16%) - Optimal

**Insight:** Try meal prepping to reduce food expenses by ₱1,000/month.`
          break
        default:
          analysisResult = `Tool analysis completed! Here are your personalized insights based on your financial data.`
      }
      
      const aiResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: analysisResult,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 2000)
    
    setShowTools(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-green-50/30">
      <Navbar currentPage="ai assistant" />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto">
          {/* Enhanced Chat Header */}
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Financial AI Assistant</h1>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Search className="w-4 h-4 mr-1" />
                    Your personal kuya/ate powered by OpenAI • Ready to help 24/7
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  <Globe className="w-4 h-4" />
                  <span>AI Assistant Active</span>
                </div>
                <Button
                  variant={showTools ? "default" : "outline"}
                  onClick={() => setShowTools(!showTools)}
                  className="flex items-center space-x-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">Tools</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Authentication Status Banner */}
          {!user && !isLoading && (
            <div className="bg-gradient-to-r from-primary/10 to-blue-100/50 border-b border-primary/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Get Personalized AI Memory
                    </p>
                    <p className="text-xs text-gray-600">
                      Log in to enable AI that remembers your goals, preferences, and financial journey
                    </p>
                  </div>
                </div>
                <Link href="/auth/login">
                  <Button size="sm" className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Log In</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {user && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-100/50 border-b border-green-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Memory Active:</span> AI remembers your financial journey, {user.name}!
                  </p>
                </div>
                <Button
                  onClick={handleForceLogout}
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  Clear & Logout
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white/50 to-transparent">
            {messages.map((message) => (
              <div key={message.id} className={`flex space-x-4 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-gray-600 to-gray-800 text-white' 
                    : 'bg-gradient-to-br from-primary to-blue-600 text-white'
                }`}>
                  {message.type === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`flex-1 space-y-2 max-w-3xl ${message.type === 'user' ? 'flex flex-col items-end' : ''}`}>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-700">
                      {message.type === 'user' ? 'You' : 'Financial AI'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={`prose prose-sm max-w-none ${
                    message.type === 'user' 
                      ? 'bg-primary text-white p-4 rounded-xl rounded-tr-sm shadow-md' 
                      : 'bg-white p-4 rounded-xl rounded-tl-sm shadow-md border border-gray-100'
                  }`}>
                    <p className={`whitespace-pre-wrap m-0 ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Input Area */}
          <div className="bg-white/90 backdrop-blur-md border-t border-gray-200/50 p-6 shadow-lg">
            <div className="flex space-x-3 mb-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload">
                <Button variant="ghost" size="icon" className="flex-shrink-0 hover:bg-primary/10" asChild>
                  <span>
                    <Camera className="w-5 h-5" />
                  </span>
                </Button>
              </label>
              <Button variant="ghost" size="icon" className="flex-shrink-0 hover:bg-primary/10">
                <Paperclip className="w-5 h-5" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about money... Try 'How should I budget ₱25,000?' or 'Best investment for beginners?'"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="pr-14 h-12 bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!inputMessage.trim()}
                  size="icon"
                  className="absolute right-1 top-1 h-10 w-10 shadow-md"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">
                💡 Try: "Budget my ₱20k salary", "Best savings account", or upload receipt photos
              </p>
              <div className="flex items-center space-x-1 text-gray-400">
                <Shield className="w-3 h-3" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tools Sidebar */}
        {showTools && (
          <div className="w-80 bg-white/90 backdrop-blur-md border-l border-gray-200/50 shadow-lg">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Digital Financial Tools</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Access our comprehensive suite of financial tools
                </p>
              </div>
              
              {/* Quick Access to Popular Tools */}
              <div className="space-y-3">
                <Link href="/tools/budget-calculator">
                  <Card className="p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 group border border-gray-100">
                    <div className="flex items-start space-x-3">
                      <Calculator className="w-6 h-6 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">Budget Calculator</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">Quick 50-30-20 budget breakdown</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </Link>

                <Link href="/tools/savings-tracker">
                  <Card className="p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 group border border-gray-100">
                    <div className="flex items-start space-x-3">
                      <Target className="w-6 h-6 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">Savings Tracker</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">Track your savings goals</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </Link>
              </div>

              {/* Link to All Tools */}
              <div className="pt-4 border-t border-gray-200">
                <Link href="/digital-tools">
                  <Button className="w-full">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    View All Digital Tools
                  </Button>
                </Link>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-sm mb-3 text-gray-900">Quick Actions</h4>
                <div className="space-y-2">
                  <Link href="/goals">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs hover:bg-primary/5">
                      <PlusCircle className="w-3 h-3 mr-2" />
                      Create Financial Goal
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs hover:bg-primary/5">
                    <FileText className="w-3 h-3 mr-2" />
                    Export Chat History
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-sm text-primary mb-2">💡 Pro Tip</h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Ask me to search for current prices, bank rates, or financial news for the most up-to-date information!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
