'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, User as UserIcon, Bot, Plus, MessageSquare, Settings, Trash2, MoreHorizontal, Search, Sparkles, ArrowUp, Paperclip, Shield } from 'lucide-react'
import { auth, onAuthStateChange, type User } from '@/lib/auth'
import { Navbar } from '@/components/ui/navbar'

export default function AIAssistantPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentChatId, setCurrentChatId] = useState('1')
  const [inputMessage, setInputMessage] = useState('')
  
  // Chat history state
  const [chats, setChats] = useState([
    {
      id: '1',
      title: 'Budget Planning Help',
      lastMessage: 'How should I budget my ₱25,000 salary?',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      messages: [
        {
          id: 1,
          type: 'bot',
          content: 'Kumusta! I\'m your AI-powered financial kuya/ate assistant! 🤖 I can help you with budgeting, savings plans, investment advice, and all things related to money management for Filipino youth. Ask me anything about your financial goals!',
          timestamp: new Date()
        }
      ]
    },
    {
      id: '2',
      title: 'Investment Advice',
      lastMessage: 'Best investments for beginners?',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      messages: []
    },
    {
      id: '3',
      title: 'Emergency Fund Setup',
      lastMessage: 'How much should I save for emergencies?',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      messages: []
    }
  ])

  const [messages, setMessages] = useState(chats[0].messages)

  // Authentication effect
  useEffect(() => {
    auth.getCurrentUser().then((result) => {
      setUser(result.user)
      setIsLoading(false)
    })

    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Create new chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      lastMessage: '',
      timestamp: new Date(),
      messages: [
        {
          id: 1,
          type: 'bot',
          content: 'Hello! I\'m your AI financial assistant. How can I help you with your money matters today? 🤖',
          timestamp: new Date()
        }
      ]
    }
    setChats([newChat, ...chats])
    setCurrentChatId(newChat.id)
    setMessages(newChat.messages)
  }

  // Switch to different chat
  const switchChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages)
    }
  }

  // Delete chat
  const deleteChat = (chatId: string) => {
    if (chats.length <= 1) return // Keep at least one chat
    
    const updatedChats = chats.filter(c => c.id !== chatId)
    setChats(updatedChats)
    
    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats[0].id)
      setMessages(updatedChats[0].messages)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim()) return
    
    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }
    
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    
    // Update chat title if it's the first user message
    const currentChat = chats.find(c => c.id === currentChatId)
    if (currentChat && currentChat.title === 'New Chat') {
      const updatedChats = chats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, title: inputMessage.slice(0, 30) + '...', lastMessage: inputMessage }
          : chat
      )
      setChats(updatedChats)
    }
    
    // Show loading message
    const loadingMessage = {
      id: Date.now(),
      type: 'bot',
      content: '🤔 Thinking...',
      timestamp: new Date()
    }
    setMessages([...updatedMessages, loadingMessage])
    
    try {
      const response = await fetch('/api/simple-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        }
        const finalMessages = [...updatedMessages, aiMessage]
        setMessages(finalMessages)
        
        // Update chat messages
        const updatedChats = chats.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: finalMessages, lastMessage: inputMessage, timestamp: new Date() }
            : chat
        )
        setChats(updatedChats)
      } else {
        throw new Error(data.error || 'AI request failed')
      }
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: '⚠️ Sorry, I\'m having trouble connecting right now. But I can still help! For budgeting, try the 50-30-20 rule: 50% for needs, 30% for wants, 20% for savings. What specific financial topic would you like to discuss?',
        timestamp: new Date()
      }
      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)
    }
    
    setInputMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="ai assistant" />
      
      <div className="h-[calc(100vh-80px)] flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col shadow-lg`}>
          {/* Sidebar Toggle & Branding */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            {/* Plounix AI Branding - Clickable to toggle */}
            {sidebarOpen && (
              <div className="flex items-center space-x-3 mb-4 px-2">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="relative group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                </button>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">FILI</h2>
                  <p className="text-xs text-gray-500">Financial Assistant</p>
                </div>
              </div>
            )}

            {!sidebarOpen && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="relative group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                </button>
              </div>
            )}

            {/* New Chat Button */}
            <Button 
              onClick={createNewChat}
              className={`${sidebarOpen ? 'w-full justify-center' : 'w-8 h-8 p-0 justify-center'} bg-primary hover:bg-primary/90 text-white transition-all duration-200 shadow-sm`}
            >
              <Plus className="w-4 h-4" />
              {sidebarOpen && <span className="ml-2 font-medium">New Chat</span>}
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-3 bg-gradient-to-b from-gray-50/30 to-white">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => switchChat(chat.id)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 mb-2 transition-all duration-200 border ${
                  currentChatId === chat.id ? 'bg-primary/5 border-primary/20 shadow-sm' : 'border-transparent hover:border-gray-200'
                } ${!sidebarOpen ? 'justify-center' : ''}`}
              >
                {sidebarOpen ? (
                  <>
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentChatId === chat.id ? 'text-primary' : 'text-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${currentChatId === chat.id ? 'text-primary' : 'text-gray-800'}`}>
                          {chat.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteChat(chat.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 h-6 w-6 p-0 transition-all duration-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <div className="flex justify-center">
                    <MessageSquare className={`w-4 h-4 ${currentChatId === chat.id ? 'text-primary' : 'text-gray-400'}`} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            {sidebarOpen ? (
              <>
                <div className="flex items-center space-x-3 mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-gray-800">
                      {user?.name || user?.email?.split('@')[0] || 'Guest User'}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {user ? 'Premium Member' : 'Free Tier'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">FILI</h1>
              <div className="text-sm text-gray-500 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span>Financial Assistant • Ready to help</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Online</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 1 ? (
            // Welcome Screen
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Welcome to Plounix AI!</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Your personal financial kuya/ate assistant powered by AI. I can help you with budgeting, 
                  investing, saving strategies, and all things money management designed for Filipino youth.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {[
                    "How should I budget my ₱25,000 salary?",
                    "Best investment options for beginners?",
                    "Help me create an emergency fund plan",
                    "Compare bank savings account rates"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(suggestion)}
                      className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors border border-gray-200 hover:border-primary/30"
                    >
                      <div className="flex items-center space-x-3">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
              {messages.slice(1).map((message, index) => (
                <div key={message.id} className={`flex space-x-4 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.type === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`flex-1 max-w-3xl ${message.type === 'user' ? 'flex flex-col items-end' : ''}`}>
                    <div className={`p-4 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-primary text-white rounded-br-sm' 
                        : 'bg-gray-50 text-gray-800 rounded-bl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <div className="relative bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-primary/50 focus-within:bg-white transition-all duration-200">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask FILI about budgeting, investments, savings, or any financial question..."
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    className="border-0 bg-transparent pr-16 py-4 px-4 resize-none focus:ring-0 focus:outline-none placeholder:text-gray-400 text-gray-800 rounded-2xl"
                  />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Paperclip className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim()}
                      size="sm"
                      className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                        inputMessage.trim() 
                          ? 'bg-primary hover:bg-primary/90 text-white shadow-sm' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3" />
                  <span>Your conversations are private and secure</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`${inputMessage.length > 1800 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {inputMessage.length}/2000
                </span>
                <span className="text-gray-300">•</span>
                <Link href="/learning" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Learn Finance →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
