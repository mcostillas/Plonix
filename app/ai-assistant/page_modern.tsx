'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  Send, User as UserIcon, Bot, Plus, MessageSquare, MoreHorizontal, 
  Search, Trash2, Edit3, Share, Settings, History, Menu, X, 
  Sparkles, Globe, Shield, Camera, Paperclip 
} from 'lucide-react'
import { auth, onAuthStateChange, type User } from '@/lib/auth'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface ChatHistory {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messages: Message[]
}

export default function ModernAIAssistantPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  // Initialize welcome message
  useEffect(() => {
    if (!currentChatId && chatHistory.length === 0) {
      startNewChat(true)
    }
  }, [])

  const startNewChat = (isInitial = false) => {
    const newChatId = `chat_${Date.now()}`
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'bot',
      content: user 
        ? `Welcome back, ${user.name}! 👋 I'm your AI financial assistant. I can help you with budgeting, saving, investing, and any money-related questions. What would you like to work on today?`
        : `Kumusta! 👋 I'm your AI-powered financial assistant! I can help you with budgeting, savings plans, investment advice, and all things money management for Filipino youth. Ask me anything!`,
      timestamp: new Date()
    }

    const newChat: ChatHistory = {
      id: newChatId,
      title: isInitial ? 'Welcome Chat' : 'New Conversation',
      lastMessage: welcomeMessage.content.substring(0, 50) + '...',
      timestamp: new Date(),
      messages: [welcomeMessage]
    }

    setChatHistory(prev => [newChat, ...prev])
    setCurrentChatId(newChatId)
    setMessages([welcomeMessage])
  }

  const selectChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages)
    }
  }

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(c => c.id !== chatId))
    if (currentChatId === chatId) {
      setCurrentChatId(null)
      setMessages([])
      if (chatHistory.length > 1) {
        const remainingChats = chatHistory.filter(c => c.id !== chatId)
        selectChat(remainingChats[0].id)
      }
    }
  }

  const updateChatTitle = (chatId: string, message: string) => {
    const title = message.length > 30 ? message.substring(0, 30) + '...' : message
    setChatHistory(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, title }
        : chat
    ))
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return
    
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }
    
    // Update current chat if exists, otherwise create new
    if (!currentChatId) {
      startNewChat()
    }
    
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    
    // Update chat history with user message
    setChatHistory(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { 
            ...chat, 
            messages: updatedMessages,
            lastMessage: inputMessage.substring(0, 50) + '...',
            timestamp: new Date()
          }
        : chat
    ))

    // Update title if it's the first user message
    if (messages.length <= 1) {
      updateChatTitle(currentChatId!, inputMessage)
    }
    
    setInputMessage('')
    setIsTyping(true)
    
    try {
      // Call AI API
      const response = await fetch('/api/simple-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage })
      })
      
      const data = await response.json()
      
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        type: 'bot',
        content: data.success ? data.response : getRandomFallbackResponse(),
        timestamp: new Date()
      }
      
      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)
      
      // Update chat history with AI response
      setChatHistory(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: finalMessages,
              lastMessage: aiMessage.content.substring(0, 50) + '...',
              timestamp: new Date()
            }
          : chat
      ))
      
    } catch (error) {
      console.error('AI Error:', error)
      
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        type: 'bot',
        content: getRandomFallbackResponse(),
        timestamp: new Date()
      }
      
      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)
      
      setChatHistory(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: finalMessages }
          : chat
      ))
    } finally {
      setIsTyping(false)
    }
  }

  const getRandomFallbackResponse = () => {
    const responses = [
      "I'm temporarily offline, but I can still help! For budgeting, try the 50-30-20 rule: 50% needs, 30% wants, 20% savings. What's your monthly income?",
      "AI connection failed, pero I have backup knowledge! What specific financial topic would you like to discuss - budgeting, saving, or investing?",
      "My brain is resting, but I can still guide you! Are you looking to create a budget, save for a goal, or learn about investments?",
      "Technical hiccup lang! Let's focus on your financial goals. What's one money challenge you're facing right now?"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-gray-900 text-white flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-white">Plonix AI</h1>
                <p className="text-xs text-gray-400">Financial Assistant</p>
              </div>
            </div>
            <Button
              onClick={() => setSidebarOpen(false)}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={() => startNewChat()}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={`group flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                  currentChatId === chat.id 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteChat(chat.id)
                    }}
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          {user ? (
            <div className="flex items-center space-x-3 p-2 bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-400">Memory Enabled</p>
              </div>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full text-gray-300 hover:text-white justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Enable Memory
              </Button>
            </Link>
          )}
          
          <Button variant="ghost" className="w-full text-gray-300 hover:text-white justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!sidebarOpen && (
              <Button
                onClick={() => setSidebarOpen(true)}
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Financial AI Assistant</h2>
                <p className="text-sm text-gray-500 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online • Ready to help with your finances
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex space-x-4 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                    : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
                }`}>
                  {message.type === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`flex-1 max-w-2xl ${message.type === 'user' ? 'flex flex-col items-end' : ''}`}>
                  <div className={`p-4 rounded-2xl ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white rounded-tr-sm' 
                      : 'bg-white text-gray-900 rounded-tl-sm shadow-sm border border-gray-100'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <span className="text-xs text-gray-400 mt-2 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex space-x-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end space-x-3">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                <Paperclip className="w-5 h-5" />
              </Button>
              
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about budgeting, saving, investing... anything finance-related!"
                  className="w-full p-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-32"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '48px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px'
                  }}
                />
                
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  size="icon"
                  className="absolute right-2 bottom-2 w-8 h-8 rounded-full"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <p>💡 Try: "Budget my ₱25k salary" or "Best savings account for students"</p>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
