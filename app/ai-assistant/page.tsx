'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { Send, User, Bot, PlusCircle, Calculator, TrendingUp, PieChart, Target, FileText, Paperclip, Camera, Upload, Search, Globe, ArrowRight, Shield } from 'lucide-react'
import { goalManager } from '@/lib/goal-manager'
import { WebSearchService } from '@/lib/web-search'
import { FinancialDataService } from '@/lib/financial-apis'
import { missionTracker } from '@/lib/mission-tracker'

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Kumusta! I\'m your financial kuya/ate AI assistant. Ano ang gusto mong malaman about money management today? I can also help you analyze your financial data using our tools!',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [showTools, setShowTools] = useState(false)
  const [webSearchService] = useState(() => new WebSearchService())
  const [financialDataService] = useState(() => new FinancialDataService())

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
    
    setMessages([...messages, newMessage])
    
    // Show loading message
    const loadingMessage = {
      id: messages.length + 1.5,
      type: 'bot',
      content: '🔍 Searching the web for current information...',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, loadingMessage])
    
    // Enhanced AI with Google Custom Search
    setTimeout(async () => {
      let aiResponse = ''
      
      // Check for mission-related updates first
      const missionUpdates = missionTracker.updateMissionFromAI(inputMessage, '')
      const missionResponse = missionTracker.generateAIResponse(missionUpdates)
      
      if (missionResponse) {
        aiResponse = missionResponse + '\n\n'
      }
      
      // Check if user wants to search a specific website
      if (inputMessage.toLowerCase().includes('search') && inputMessage.toLowerCase().includes('site:')) {
        try {
          const siteMatch = inputMessage.match(/site:([^\s]+)/)
          const queryMatch = inputMessage.replace(/site:[^\s]+/, '').trim()
          
          if (siteMatch && queryMatch) {
            const results = await webSearchService.searchSpecificSite(siteMatch[1], queryMatch)
            
            if (results.length > 0) {
              aiResponse += `🔍 **Search Results from ${siteMatch[1]}:**

${results.slice(0, 3).map((result, index) => `
**${index + 1}. ${result.title}**
${result.snippet}
🔗 Source: ${result.displayLink}
[Read more](${result.link})
`).join('\n')}

Based on this information, how can I help you with your financial planning? 💡`
            } else {
              aiResponse += `I searched ${siteMatch[1]} but couldn't find specific results for "${queryMatch}". Try a different search term or let me help with general financial advice!`
            }
          }
        } catch (error) {
          aiResponse += 'I had trouble searching that specific site. Google Custom Search might be at its daily limit. Let me help you with my financial knowledge instead!'
        }
      }
      
      // Check for price searches with better results
      else if (inputMessage.toLowerCase().includes('price') || inputMessage.toLowerCase().includes('cost') || inputMessage.toLowerCase().includes('how much')) {
        try {
          const priceResults = await webSearchService.getCurrentPrice(inputMessage)
          
          if (priceResults.length > 0) {
            aiResponse += `💰 **Current Price Information (via Google Search):**

${priceResults.map((result, index) => `
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
            aiResponse += `I searched for current prices but didn't find specific results. This might be because:
• Google Custom Search daily limit reached (100 searches/day)
• The item might be too specific
• Try rephrasing your search

I can still help you create a savings plan! What's your estimated target amount and timeline? 💡`
          }
        } catch (error) {
          aiResponse += 'Google Search is temporarily unavailable (might have reached daily limit). However, I can still help you with budgeting and savings strategies! What\'s your target amount?'
        }
      }
      
      // Financial news search
      else if (inputMessage.toLowerCase().includes('news') || inputMessage.toLowerCase().includes('latest') || inputMessage.toLowerCase().includes('current')) {
        try {
          const newsResults = await webSearchService.searchFinancialNews()
          
          if (newsResults.length > 0) {
            aiResponse += `📰 **Latest Philippine Financial News:**

${newsResults.map((result, index) => `
**${index + 1}. ${result.title}**
${result.snippet}
📍 ${result.displayLink}
🔗 [Read full article](${result.link})
`).join('\n')}

How does this news affect your financial planning? I can help you adjust your strategy based on current events! 📈`
          } else {
            aiResponse += 'I couldn\'t fetch the latest financial news right now. Google Search might be at its daily limit. Let me help you with timeless financial strategies instead!'
          }
        } catch (error) {
          aiResponse += 'Financial news search is temporarily unavailable. Let me help you with proven financial strategies that work regardless of current events!'
        }
      }
      
      // Bank rates with real search
      else if (inputMessage.toLowerCase().includes('bank') || inputMessage.toLowerCase().includes('savings account') || inputMessage.toLowerCase().includes('interest')) {
        try {
          const bankResults = await webSearchService.getBankRates()
          
          if (bankResults.length > 0) {
            aiResponse += `🏦 **Latest Bank Rates (via Google Search):**

${bankResults.map((result, index) => `
**${index + 1}. ${result.title}**
${result.snippet}
📍 ${result.displayLink}
🔗 [View current rates](${result.link})
`).join('\n')}

**Quick Comparison (General Ranges):**
• Digital Banks: 4-6% annually (CIMB, ING, Tonik)
• Traditional Banks: 0.25-0.5% annually (BPI, BDO)
• All are PDIC-insured up to ₱500,000

Want me to help you choose the best bank for your needs? 💰`
          } else {
            aiResponse += `I searched for current bank rates but didn't get specific results. Here's what I generally know:

**Digital Banks (Higher Rates):**
• CIMB Bank: Up to 4% annually
• ING Bank: Up to 2.5% annually  
• Tonik Bank: Up to 6% annually

**Traditional Banks (Lower Rates):**
• BPI, BDO, Metrobank: 0.25-0.5%

All are PDIC-insured. Want me to help you compare features? 🏦`
          }
        } catch (error) {
          aiResponse += 'Bank rate search is temporarily unavailable, but I can share general rate information and help you choose the right bank for your needs!'
        }
      }
      
      // General web search for financial topics
      else if (inputMessage.toLowerCase().includes('search') || inputMessage.toLowerCase().includes('find') || inputMessage.toLowerCase().includes('latest')) {
        try {
          const searchResults = await webSearchService.searchWeb(`${inputMessage} Philippines financial`)
          
          if (searchResults.length > 0) {
            aiResponse += `🔍 **Web Search Results:**

Here's the latest information I found:

${searchResults.slice(0, 3).map((result, index) => `
**${index + 1}. ${result.title}**
${result.snippet}
🔗 [Read more](${result.link})
`).join('\n')}

Based on this information, how can I help you with your financial planning? I can create budgets, savings goals, or investment strategies! 💼`
          } else {
            aiResponse += 'I searched the web but couldn\'t find specific results. Let me help you with my financial knowledge instead!'
          }
        } catch (error) {
          aiResponse += 'Web search is temporarily unavailable, but I can still help with financial advice using my knowledge base!'
        }
      }
      
      // Check for investment queries with real data
      else if (inputMessage.toLowerCase().includes('invest') || inputMessage.toLowerCase().includes('stock')) {
        try {
          const marketData = await financialDataService.getPSEData()
          const exchangeRate = await financialDataService.getExchangeRates()
          
          aiResponse += `📈 **Latest Investment Information:**

**Philippine Stock Exchange (PSE):**
• Current index: ${marketData.index}
• Market trend: ${marketData.trend}
• USD to PHP: ₱${exchangeRate.usdToPhp}

**Best Investment Options for Beginners:**
• **Mutual Funds:** BPI, BDO (₱1,000 minimum)
• **UITFs:** Bank-managed, lower fees
• **COL Financial:** Direct stock trading
• **GInvest (GCash):** Micro-investing, ₱50 minimum

**Current Market Context:**
• Treasury Bills: ~5.75% annually
• Inflation Rate: ~3.2%
• Digital Bank Savings: 4-6% annually

Want me to create a personalized investment plan based on your income and risk tolerance? 🎯`
        } catch (error) {
          aiResponse += 'I\'m having trouble getting live market data, but here\'s what I know about investing for Filipino youth...'
        }
      }
      
      // Default responses with enhanced context
      else {
        const enhancedResponses = [
          'Ay, good question yan! For budgeting, I suggest the 50-30-20 rule. With your income, allocate 50% for needs, 30% for wants, and 20% for savings. I can search for current bank rates to help you choose the best savings account!',
          'Uy, I can help you with that! I have access to current financial data and can search the web for the latest information. What specific topic would you like me to research?',
          'Perfect timing to ask! I can search for current prices, bank rates, investment options, or any financial topic. Just say "search for [topic]" and I\'ll find the latest information!',
          'Talaga! I can help you find current information about any financial topic. Try asking me to "search for current CIMB bank rates" or "find iPhone 15 prices in Philippines" for real-time data!'
        ]
        aiResponse += enhancedResponses[Math.floor(Math.random() * enhancedResponses.length)]
      }
      
      // If we detected spending/mission activity, add mission context
      if (inputMessage.toLowerCase().includes('spent') || 
          inputMessage.toLowerCase().includes('cooked') ||
          inputMessage.toLowerCase().includes('jeepney')) {
        
        if (!missionResponse) {
          aiResponse += "I noticed you mentioned some spending/activity! If you're on any missions, I can help track your progress. Just tell me about your daily expenses or activities! 📊"
        }
      }
      
      // Remove loading message and add real response
      const aiMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: aiResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev.filter(msg => msg.id !== messages.length + 1.5), aiMessage])
    }, 2000) // Longer delay to simulate web search
    
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
      fileInput.onchange = handleImageUpload
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
                    Your personal kuya/ate with web search • Always online
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <Globe className="w-4 h-4" />
                  <span>Web Search Enabled</span>
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

          {/* Enhanced Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white/50 to-transparent">
            {messages.map((message) => (
              <div key={message.id} className={`flex space-x-4 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-gray-600 to-gray-800 text-white' 
                    : 'bg-gradient-to-br from-primary to-blue-600 text-white'
                }`}>
                  {message.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
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
                  placeholder="Ask me anything... Try 'search for iPhone price' or 'create budget for ₱25,000'"
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
                💡 Try: "search iPhone price", "budget my ₱20k salary", or upload receipt photos
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
                <h3 className="font-bold text-lg mb-2 text-gray-900">Financial Analysis Tools</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enhanced AI tools for comprehensive financial analysis
                </p>
              </div>
              
              <div className="space-y-3">
                {financialTools.map((tool, index) => (
                  <Card 
                    key={index} 
                    className="p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 group border border-gray-100"
                    onClick={() => useTool(tool)}
                  >
                    <div className="flex items-start space-x-3">
                      <tool.icon className="w-6 h-6 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">{tool.name}</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{tool.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                ))}
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
