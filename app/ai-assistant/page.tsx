'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { Send, User as UserIcon, Bot, Plus, PlusCircle, Calculator, TrendingUp, PieChart, Target, FileText, Paperclip, Camera, Upload, Search, Globe, ArrowRight, Shield, LogIn, Menu, X, MessageSquare, Trash2, PiggyBank } from 'lucide-react'
import { goalManager } from '@/lib/goal-manager'
import { missionTracker } from '@/lib/mission-tracker'
import { auth, onAuthStateChange, type User } from '@/lib/auth'
import { WebSearchService } from '@/lib/web-search'

export default function AIAssistantPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const webSearchService = new WebSearchService()
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Kumusta! I\'m Fili, your AI-powered financial kuya/ate! 🤖 I can help you with budgeting, savings plans, investment advice, and all things related to money management for Filipino youth. Ask me anything about your financial goals!',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [showTools, setShowTools] = useState(false)
  
  // Sidebar state management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [chatSessions, setChatSessions] = useState([
    { id: 1, title: 'Budget Planning Help', lastMessage: 'How to create a 50-30-20 budget?', timestamp: '2 hours ago' },
    { id: 2, title: 'Investment Advice', lastMessage: 'Best investment options for beginners', timestamp: '1 day ago' },
    { id: 3, title: 'Emergency Fund', lastMessage: 'Building emergency fund strategies', timestamp: '3 days ago' },
    { id: 4, title: 'Savings Goals', lastMessage: 'Setting realistic savings targets', timestamp: '1 week ago' }
  ])

  // Sidebar functions
  const startNewChat = () => {
    const newSession = {
      id: chatSessions.length + 1,
      title: 'New Chat',
      lastMessage: 'Chat started',
      timestamp: 'Just now'
    }
    setChatSessions(prev => [newSession, ...prev])
    setMessages([{
      id: 1,
      type: 'bot',
      content: 'Kumusta! I\'m Fili, your AI-powered financial kuya/ate! 🤖 How can I help you with your financial journey today?',
      timestamp: new Date()
    }])
  }

  const filteredSessions = chatSessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const deleteSession = (sessionId: number) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId))
  }

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
    <div className="min-h-screen bg-white">
      <Navbar currentPage="fili" />

      <div className="flex h-[calc(100vh-64px)] relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ChatGPT-Style Sidebar */}
        <div className={`
          fixed md:relative z-50 md:z-0 h-full bg-gray-50 text-gray-900 border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-64 md:w-64
        `}>
          {/* Sidebar Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-800">Fili</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1 hover:bg-gray-200 rounded text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* New Chat Button */}
            <button
              onClick={startNewChat}
              className="w-full flex items-center space-x-2 text-gray-700 hover:bg-gray-200 
                       rounded-lg px-3 py-2 text-sm transition-colors border border-gray-300"
            >
              <MessageSquare className="w-4 h-4" />
              <span>New chat</span>
            </button>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm 
                         placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-3">
            <div className="space-y-1">
              <div className="text-xs text-gray-500 px-3 py-2 font-medium">Recent</div>
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="group flex items-center justify-between p-3 hover:bg-gray-200 
                           rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm text-gray-800 truncate font-medium">{session.title}</h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded transition-opacity text-gray-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-3 border-t border-gray-200">
            {user ? (
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">Premium Plan</p>
                </div>
              </div>
            ) : (
              <Link href="/auth/login">
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Sign in</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Main Chat Interface - Centered like Gemini */}
        <div className="flex-1 flex flex-col h-full">
          {/* Minimal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-primary" />
                <h1 className="text-lg font-semibold text-gray-800">Fili</h1>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">2.5 Flash</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={showTools ? "default" : "ghost"}
                onClick={() => setShowTools(!showTools)}
                size="sm"
              >
                <Calculator className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto">
            {messages.length <= 1 ? (
              /* Welcome Screen - Gemini Style */
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="max-w-4xl w-full text-center">
                  <div className="mb-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-medium text-gray-800 mb-4">
                      Hello{user ? `, ${user.name?.split(' ')[0] || 'there'}` : ''}
                    </h1>
                    <p className="text-xl text-gray-600 mb-12">
                      {user 
                        ? "I'm Fili, your AI financial kuya/ate. I remember our conversations and can help you achieve your financial goals."
                        : "I'm Fili, your AI-powered financial kuya/ate. How can I help you with your money today?"
                      }
                    </p>
                  </div>

                  {/* Enhanced Quick Action Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    <button 
                      onClick={() => setInputMessage("Help me create a budget for ₱25,000 monthly salary")}
                      className="group p-6 text-left rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100/50"
                    >
                      <Calculator className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-gray-800 mb-2">Budget Planning</h3>
                      <p className="text-sm text-gray-600">Create a 50-30-20 budget breakdown</p>
                    </button>

                    <button 
                      onClick={() => setInputMessage("What are the best savings accounts in the Philippines?")}
                      className="group p-6 text-left rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-green-50 to-emerald-100/50"
                    >
                      <Target className="w-8 h-8 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-gray-800 mb-2">Savings Goals</h3>
                      <p className="text-sm text-gray-600">Find best savings rates & accounts</p>
                    </button>

                    <button 
                      onClick={() => setInputMessage("How do I start investing in the Philippines?")}
                      className="group p-6 text-left rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-50 to-indigo-100/50"
                    >
                      <TrendingUp className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-gray-800 mb-2">Investment Basics</h3>
                      <p className="text-sm text-gray-600">Start your investment journey</p>
                    </button>

                    <button 
                      onClick={() => setInputMessage("Search for current iPhone 15 prices in Philippines")}
                      className="group p-6 text-left rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-orange-50 to-yellow-100/50"
                    >
                      <Search className="w-8 h-8 text-orange-600 mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-gray-800 mb-2">Price Search</h3>
                      <p className="text-sm text-gray-600">Find current market prices</p>
                    </button>
                  </div>

                  {!user && (
                    <div className="bg-gradient-to-r from-primary/5 to-blue-100/50 border border-primary/20 rounded-2xl p-6 text-center max-w-md mx-auto">
                      <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h3 className="text-primary font-semibold mb-2">Unlock Personalized AI Memory</h3>
                      <p className="text-gray-700 text-sm mb-4">Sign in to enable AI that remembers your goals, preferences, and financial journey</p>
                      <Link href="/auth/login">
                        <Button className="bg-primary hover:bg-primary/90">
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="max-w-4xl mx-auto p-6 space-y-8">
                {messages.slice(1).map((message) => (
                  <div key={message.id} className={`flex space-x-4 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-gray-600 to-gray-800 text-white shadow-lg' 
                        : 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg'
                    }`}>
                      {message.type === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-gray-800">
                          {message.type === 'user' ? 'You' : 'Fili'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={`prose prose-sm max-w-none ${
                        message.type === 'user' 
                          ? 'bg-gray-50 p-4 rounded-2xl rounded-tr-sm border border-gray-200' 
                          : 'bg-white border-0'
                      }`}>
                        <p className="whitespace-pre-wrap m-0 text-gray-800 leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Input Area - Bottom */}
          <div className="border-t border-gray-100 p-6 bg-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-3 mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100" asChild>
                    <span>
                      <Camera className="w-5 h-5 text-gray-600" />
                    </span>
                  </Button>
                </label>
              </div>
              
              <div className="relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask anything about your finances..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="pr-14 py-4 text-base border-gray-200 rounded-3xl focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!inputMessage.trim()}
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
                <span>Fili can make mistakes. Check important info.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Sidebar - Right Side */}
        {showTools && (
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
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
