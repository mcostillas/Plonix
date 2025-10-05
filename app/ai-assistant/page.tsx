'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, User as UserIcon, Bot, Plus, MessageSquare, Settings, Trash2, MoreHorizontal, Search, Sparkles, ArrowUp, Paperclip, Shield, Menu, X, ChevronLeft, ChevronRight, LogOut, Moon, Sun, Languages, History, Camera, Receipt, Upload, FileImage, X as XIcon, AlertTriangle } from 'lucide-react'
import { auth, onAuthStateChange, type User } from '@/lib/auth'
import { Navbar } from '@/components/ui/navbar'
import { AuthGuard } from '@/components/AuthGuard'
import ReactMarkdown from 'react-markdown'
import { supabase } from '@/lib/supabase'
import { LogoutModal, useLogoutModal } from '@/components/ui/logout-modal'
import { DeleteChatModal, ClearHistoryModal, DeleteCompletedModal } from '@/components/ui/confirmation-modal'
import { useRouter } from 'next/navigation'

export default function AIAssistantPage() {
  return (
    <AuthGuard>
      <AIAssistantContent />
    </AuthGuard>
  )
}

function AIAssistantContent() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  // Chat history state - starts with one default chat with unique session ID
  const defaultSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const [currentChatId, setCurrentChatId] = useState(defaultSessionId)
  
  const [inputMessage, setInputMessage] = useState('')
  const [uploadedReceipt, setUploadedReceipt] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoutModal = useLogoutModal()
  
  // Modal states for deletion confirmations
  const [deleteChatModalOpen, setDeleteChatModalOpen] = useState(false)
  const [clearHistoryModalOpen, setClearHistoryModalOpen] = useState(false)
  const [deleteCompletedModalOpen, setDeleteCompletedModalOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  
  const [chats, setChats] = useState([
    {
      id: defaultSessionId,
      title: 'New Chat',
      lastMessage: '',
      timestamp: new Date(),
      messages: [
        {
          id: 1,
          type: 'bot',
          content: 'Kumusta! I\'m Fili, your AI-powered financial kuya/ate assistant! I can help you with budgeting, savings plans, investment advice, and all things related to money management for Filipino youth. Ask me anything about your financial goals!',
          timestamp: new Date()
        }
      ]
    }
  ])

  const [messages, setMessages] = useState(chats[0].messages)

  // Load chat history from database - group by session_id
  const loadChatHistory = async (userId: string) => {
    try {
      console.log('📥 Loading chat history for user:', userId)
      
      // Get all messages for THIS SPECIFIC USER only
      // Filter by user_id to show only this user's chats
      const { data: messages, error } = await (supabase as any)
        .from('chat_history')
        .select('*')
        .eq('user_id', userId) // ← Filter by user_id!
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error loading chat history:', error)
        return
      }

      if (!messages || messages.length === 0) {
        console.log('⚠️ No chat history found in database')
        return
      }

      console.log(`📚 Loaded ${messages.length} TOTAL messages from database`)
      
      // Debug: Show unique session IDs
      const uniqueSessions = Array.from(new Set(messages.map((m: any) => m.session_id)))
      console.log(`🔑 Found ${uniqueSessions.length} unique session IDs:`, uniqueSessions)
      
      // Debug: Show sample messages
      console.log('� Sample messages:', messages.slice(0, 3).map((m: any) => ({
        session: m.session_id,
        type: m.message_type,
        preview: m.content.substring(0, 50)
      })))

      // Group messages by session_id
      const sessionGroups = messages.reduce((groups: any, msg: any) => {
        const sessionId = msg.session_id
        if (!groups[sessionId]) {
          groups[sessionId] = []
        }
        groups[sessionId].push(msg)
        return groups
      }, {})

      // Convert each session to a chat object
      const loadedChats = Object.entries(sessionGroups).map(([sessionId, sessionMessages]: [string, any]) => {
        const chatMessages = sessionMessages.map((msg: any, index: number) => ({
          id: index + 1,
          type: msg.message_type === 'human' ? 'user' : 'bot',
          content: msg.content,
          timestamp: new Date(msg.created_at)
        }))

        // Generate title from first user message
        const firstUserMessage = chatMessages.find((m: any) => m.type === 'user')
        const chatTitle = firstUserMessage 
          ? generateChatTitle(firstUserMessage.content)
          : 'Conversation'

        return {
          id: sessionId,
          title: chatTitle,
          lastMessage: chatMessages[chatMessages.length - 1]?.content || '',
          timestamp: new Date(sessionMessages[sessionMessages.length - 1]?.created_at),
          messages: [
            {
              id: 0,
              type: 'bot',
              content: 'Kumusta! I\'m Fili, your AI-powered financial kuya/ate assistant! I can help you with budgeting, savings plans, investment advice, and all things related to money management for Filipino youth. Ask me anything about your financial goals!',
              timestamp: new Date()
            },
            ...chatMessages
          ]
        }
      })

      // Sort by most recent first
      loadedChats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      console.log(`✅ Loaded ${loadedChats.length} chat sessions`)
      console.log('📋 Chat sessions:', loadedChats.map(c => ({
        id: c.id,
        title: c.title,
        messageCount: c.messages.length,
        lastMessage: c.lastMessage.substring(0, 30) + '...'
      })))

      if (loadedChats.length > 0) {
        // Load past chats into sidebar but DON'T switch to them
        // Always keep the current new chat active (like ChatGPT)
        setChats([chats[0], ...loadedChats]) // Keep new chat at top, add history below
        console.log(`📌 Starting with new chat (keeping ${loadedChats.length} in sidebar)`)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  // Authentication effect
  useEffect(() => {
    auth.getCurrentUser().then((result) => {
      setUser(result.user)
      setIsLoading(false)
      
      // Load chat history if user is authenticated
      if (result.user) {
        loadChatHistory(result.user.id)
      }
    })

    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      setIsLoading(false)
      
      // Load chat history when user logs in
      if (user) {
        loadChatHistory(user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await auth.signOut()
      // Clear cached data BUT preserve Remember Me credentials
      if (typeof window !== 'undefined') {
        // Save Remember Me data before clearing
        const savedEmail = localStorage.getItem('plounix_saved_email')
        const savedPassword = localStorage.getItem('plounix_saved_password')
        const rememberMe = localStorage.getItem('plounix_remember_me')
        
        // Clear all storage
        localStorage.clear()
        sessionStorage.clear()
        
        // Restore Remember Me data if it existed
        if (rememberMe === 'true' && savedEmail) {
          localStorage.setItem('plounix_saved_email', savedEmail)
          localStorage.setItem('plounix_saved_password', savedPassword || '')
          localStorage.setItem('plounix_remember_me', 'true')
        }
      }
      // Close modal and redirect
      logoutModal.close()
      setSettingsOpen(false)
      router.push('/auth/login?message=logged-out')
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: force redirect even if signOut fails
      logoutModal.close()
      setSettingsOpen(false)
      router.push('/auth/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Create new chat with unique session ID
  const createNewChat = () => {
    // Generate unique session ID (UUID-like)
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const newChat = {
      id: sessionId,
      title: 'New Chat',
      lastMessage: '',
      timestamp: new Date(),
      messages: [
        {
          id: 1,
          type: 'bot',
          content: 'Hello! I\'m Fili, your AI financial assistant. How can I help you with your money matters today?',
          timestamp: new Date()
        }
      ]
    }
    setChats([newChat, ...chats])
    setCurrentChatId(newChat.id)
    setMessages(newChat.messages)
    console.log('✨ Created new chat with session ID:', sessionId)
  }

  // Switch to different chat
  const switchChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages)
    }
  }

  // Open delete chat modal
  const openDeleteChatModal = (chatId: string) => {
    if (!user) return
    if (chats.length <= 1) return // Keep at least one chat
    setChatToDelete(chatId)
    setDeleteChatModalOpen(true)
  }

  // Delete chat (called after modal confirmation)
  const confirmDeleteChat = async () => {
    if (!user || !chatToDelete) return
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('session_id', chatToDelete)
        .eq('user_id', user.id) // Safety check: only delete own messages
      
      if (error) {
        console.error('❌ Error deleting chat from database:', error)
        alert('Failed to delete chat from database. Please try again.')
        return
      }
      
      console.log('✅ Chat deleted from database:', chatToDelete)
      
      // Delete from state
      const updatedChats = chats.filter(c => c.id !== chatToDelete)
      setChats(updatedChats)
      
      if (currentChatId === chatToDelete) {
        setCurrentChatId(updatedChats[0].id)
        setMessages(updatedChats[0].messages)
      }
      
      // Clear the chatToDelete state
      setChatToDelete(null)
    } catch (error) {
      console.error('❌ Error deleting chat:', error)
      alert('Failed to delete chat. Please try again.')
    }
  }

  // Clear all chat history (called after modal confirmation)
  const confirmClearAllHistory = async () => {
    if (!user) return
    
    try {
      // Delete all chat history from database
      const { error: chatError } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id)
      
      if (chatError) {
        console.error('❌ Error deleting chat history:', chatError)
        alert('Failed to delete chat history. Please try again.')
        return
      }
      
      // Optionally delete memories (commented out by default to preserve learning)
      // const { error: memoryError } = await supabase
      //   .from('user_memories')
      //   .delete()
      //   .eq('user_id', user.id)
      // 
      // if (memoryError) {
      //   console.error('❌ Error deleting memories:', memoryError)
      // }
      
      console.log('✅ All chat history cleared for user:', user.id)
      
      // Reset to fresh state
      const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setChats([{
        id: newSessionId,
        title: 'New Chat',
        timestamp: new Date(),
        lastMessage: 'Ask me anything about personal finance...',
        messages: []
      }])
      setCurrentChatId(newSessionId)
      setMessages([])
      
      // Show success modal instead of alert
      setDeleteCompletedModalOpen(true)
    } catch (error) {
      console.error('❌ Error clearing history:', error)
      alert('Failed to clear history. Please try again.')
    }
  }

  // Handle receipt file upload
  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, WebP) or PDF')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setUploadedReceipt(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setReceiptPreview(null) // PDF preview not shown
    }

    console.log('📸 Receipt uploaded:', file.name)
  }

  // Clear receipt upload
  const clearReceiptUpload = () => {
    setUploadedReceipt(null)
    setReceiptPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Process receipt with OCR
  const processReceipt = async () => {
    if (!uploadedReceipt) return

    setIsProcessingReceipt(true)
    
    try {
      const formData = new FormData()
      formData.append('receipt', uploadedReceipt)

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = {}
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers,
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        // Add receipt data as a message
        const receiptMessage = {
          id: Date.now(),
          type: 'bot',
          content: `📸 **Receipt Scanned Successfully!**\n\n` +
                   `**Merchant:** ${data.merchant || 'Unknown'}\n` +
                   `**Amount:** ₱${data.amount || '0.00'}\n` +
                   `**Date:** ${data.date || 'Not found'}\n` +
                   `**Category:** ${data.category || 'General'}\n\n` +
                   `Would you like me to save this as a transaction?`,
          timestamp: new Date()
        }

        setMessages([...messages, receiptMessage])
        clearReceiptUpload()
      } else {
        throw new Error(data.error || 'Failed to process receipt')
      }
    } catch (error) {
      console.error('Receipt processing error:', error)
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: '❌ Sorry, I had trouble reading that receipt. Please make sure the image is clear and try again, or you can manually enter the transaction details.',
        timestamp: new Date()
      }
      setMessages([...messages, errorMessage])
    } finally {
      setIsProcessingReceipt(false)
    }
  }

  // Generate smart chat title from user message (ChatGPT-style)
  const generateChatTitle = (message: string): string => {
    const lowerMsg = message.toLowerCase()
    
    // Detect specific financial topics and create contextual titles
    
    // Price inquiries
    if (lowerMsg.match(/how much|price|cost|magkano/i)) {
      const itemMatch = message.match(/(?:how much|price|cost|magkano).+?(?:is|for|ng)?\s+(.+?)(?:\?|$)/i)
      if (itemMatch) {
        const item = itemMatch[1].trim().split(' ').slice(0, 4).join(' ')
        return `Price of ${item.charAt(0).toUpperCase() + item.slice(1)}`
      }
      return 'Price Inquiry'
    }
    
    // Budget planning
    if (lowerMsg.match(/budget|spending|expenses|gastos/i)) {
      return 'Budget Planning'
    }
    
    // Savings goals
    if (lowerMsg.match(/save|saving|ipon|savings goal/i)) {
      if (lowerMsg.match(/₱[\d,]+/)) {
        const amount = message.match(/₱[\d,]+/)?.[0]
        return `Savings Goal ${amount}`
      }
      return 'Savings Plan'
    }
    
    // Investment
    if (lowerMsg.match(/invest|investment|stocks|crypto|bonds/i)) {
      return 'Investment Advice'
    }
    
    // Income
    if (lowerMsg.match(/income|salary|earn|sweldo|kita/i)) {
      return 'Income Discussion'
    }
    
    // Debt/loans
    if (lowerMsg.match(/debt|loan|utang|borrow|credit card/i)) {
      return 'Debt Management'
    }
    
    // Banking
    if (lowerMsg.match(/bank|gcash|paymaya|bdo|bpi/i)) {
      return 'Banking & Payments'
    }
    
    // Emergency fund
    if (lowerMsg.match(/emergency fund|emergency saving/i)) {
      return 'Emergency Fund'
    }
    
    // Side hustle
    if (lowerMsg.match(/side hustle|extra income|raket|sideline/i)) {
      return 'Side Hustle Ideas'
    }
    
    // Generic financial advice
    if (lowerMsg.match(/advice|help|tips|suggest/i)) {
      return 'Financial Advice'
    }
    
    // Default: Extract key topic words
    // Remove common question words and get the core topic
    const cleaned = message
      .toLowerCase()
      .replace(/^(hi|hello|hey|kumusta|how|what|when|where|why|can you|should|could|would|i want to|i need to|help me with|tell me about|explain|show me|please)\s+/i, '')
      .replace(/\?+$/g, '')
      .trim()
    
    // Get first 3-5 meaningful words
    const words = cleaned.split(/\s+/).filter(word => word.length > 2)
    const mainTopic = words.slice(0, 5).join(' ')
    
    // Capitalize first letter of each word
    const titleCase = mainTopic
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    // Limit to 50 characters and add ellipsis if needed
    if (titleCase.length > 50) {
      return titleCase.slice(0, 50).trim() + '...'
    }
    
    return titleCase || 'General Inquiry'
  }

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim()) return
    
    // Capture the message and clear input immediately to prevent duplicates
    const messageToSend = inputMessage.trim()
    setInputMessage('') // Clear input right away
    
    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    }
    
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    
    // Update chat title if it's the first user message (generate smart title)
    const currentChat = chats.find(c => c.id === currentChatId)
    if (currentChat && currentChat.title === 'New Chat') {
      // Generate a smart title from the first message
      const smartTitle = generateChatTitle(messageToSend)
      const updatedChats = chats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, title: smartTitle, lastMessage: messageToSend }
          : chat
      )
      setChats(updatedChats)
    }
    
    // Show loading message
    const loadingMessage = {
      id: Date.now(),
      type: 'bot',
      content: 'Thinking...',
      timestamp: new Date()
    }
    setMessages([...updatedMessages, loadingMessage])
    
    try {
      // Get auth token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      // Check if session is getting too long and auto-rotate to new session
      const MAX_MESSAGES_PER_SESSION = 150 // Warning threshold
      const FORCE_NEW_SESSION_AT = 200 // Hard limit
      
      let messagesToUse = updatedMessages
      let sessionIdToUse = currentChatId
      
      if (updatedMessages.length >= FORCE_NEW_SESSION_AT) {
        // Auto-create new session when limit reached
        console.log('⚠️ Session too long (200+ messages), auto-rotating to new session')
        const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        const newChat = {
          id: newSessionId,
          title: 'New Chat (Continued)',
          timestamp: new Date(),
          lastMessage: messageToSend,
          messages: [newMessage] // Start fresh with just the current message
        }
        setChats([newChat, ...chats])
        setCurrentChatId(newSessionId)
        sessionIdToUse = newSessionId
        messagesToUse = [newMessage] // Fresh start
        
        // Remove loading message and update with new session
        setMessages([newMessage])
      } else if (updatedMessages.length >= MAX_MESSAGES_PER_SESSION) {
        // Show warning but allow continuation
        console.log(`⚠️ Chat session has ${updatedMessages.length} messages. Consider starting a new chat for better performance.`)
      }
      
      // Use ai-chat endpoint which has memory system
      // Pass the current chat session ID and recent messages for context
      // Include last 5 messages for conversation continuity
      const recentMessages = messagesToUse.slice(-5).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: messageToSend,
          sessionId: sessionIdToUse, // Use the appropriate session ID (may be new if rotated)
          recentMessages: recentMessages // Pass recent chat history for context
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
            ? { ...chat, messages: finalMessages, lastMessage: messageToSend, timestamp: new Date() }
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
        content: 'Sorry, I\'m having trouble connecting right now. But I can still help! For budgeting, try the 50-30-20 rule: 50% for needs, 30% for wants, 20% for savings. What specific financial topic would you like to discuss?',
        timestamp: new Date()
      }
      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)
    }
    // Input already cleared at the start of function
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="ai assistant" />
      
      <div className="h-[calc(100vh-80px)] flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col shadow-lg relative`}>
          {/* Sidebar Toggle Button - Floating */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-md transition-all duration-200 hover:scale-110"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            )}
          </button>

          {/* Sidebar Header with Branding */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-primary/5 to-blue-50">
            {sidebarOpen ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 px-2">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">Fili</h2>
                    <p className="text-xs text-gray-500">Financial Assistant</p>
                  </div>
                </div>

                {/* New Chat Button */}
                <Button 
                  onClick={createNewChat}
                  className="w-full justify-center bg-primary hover:bg-primary/90 text-white transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="font-medium">New Chat</span>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                <Button 
                  onClick={createNewChat}
                  className="w-10 h-10 p-0 bg-primary hover:bg-primary/90 text-white transition-all duration-200 shadow-sm"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
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
                        openDeleteChatModal(chat.id)
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
          <div className="p-4 border-t border-gray-100 bg-gradient-to-t from-gray-50 to-white">
            {sidebarOpen ? (
              <>
                {/* User Profile Card */}
                <div className="flex items-center space-x-3 mb-3 p-3 bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl border border-primary/10 shadow-sm">
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
                  onClick={() => setSettingsOpen(true)}
                  className="w-full justify-start text-gray-600 hover:text-primary hover:bg-primary/5 transition-all duration-200"
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
                  onClick={() => setSettingsOpen(true)}
                  className="w-8 h-8 p-0 text-gray-600 hover:text-primary hover:bg-primary/10 transition-all duration-200 rounded-lg"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Settings Modal */}
        {settingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSettingsOpen(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettingsOpen(false)}
                  className="w-8 h-8 p-0 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* User Info Section */}
                <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl p-4 border border-primary/10">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user?.name || 'User'}</h3>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  <div className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                    Premium Member
                  </div>
                </div>

                {/* Settings Options */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Preferences</h3>
                  
                  {/* Theme Setting */}
                  <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-all">
                        <Sun className="w-4 h-4 text-gray-600 group-hover:text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">Appearance</p>
                        <p className="text-xs text-gray-500">Light mode</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Language Setting */}
                  <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-all">
                        <Languages className="w-4 h-4 text-gray-600 group-hover:text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">Language</p>
                        <p className="text-xs text-gray-500">English (Taglish)</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Clear History */}
                  <button 
                    onClick={() => setClearHistoryModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-red-50 transition-all">
                        <History className="w-4 h-4 text-gray-600 group-hover:text-red-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">Clear chat history</p>
                        <p className="text-xs text-gray-500">Delete all conversations</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Account Actions */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Account</h3>
                  
                  {/* Logout Button */}
                  <button 
                    onClick={logoutModal.open}
                    className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-all">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-red-600 text-sm">Log out</p>
                        <p className="text-xs text-gray-500">Sign out of your account</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                {/* App Info */}
                <div className="pt-4 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-400">Plounix AI Assistant v1.0</p>
                  <p className="text-xs text-gray-400 mt-1">Made with ❤️ for Filipino youth</p>
                </div>
              </div>
            </div>
          </div>
        )}      {/* Main Chat Area */}
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
              <h1 className="font-bold text-gray-900 text-lg">Fili</h1>
              <div className="text-sm text-gray-500 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span>Financial Assistant • Ready to help</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {user && (
              <div className="hidden sm:flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm border border-blue-200 shadow-sm">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Memory Active</span>
              </div>
            )}
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
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Welcome to Fili!</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Your personal financial kuya/ate assistant. I'm Fili, and I can help you with budgeting, 
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
                      <div className="whitespace-pre-wrap text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-strong:text-gray-900 prose-p:text-gray-700">
                        <ReactMarkdown 
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-sm">{children}</li>
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {/* Long Session Warning */}
            {messages.length >= 150 && messages.length < 200 && (
              <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-900">
                    Long conversation detected ({messages.length} messages)
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Consider starting a new chat for better performance. Your conversation will auto-rotate at 200 messages.
                  </p>
                </div>
                <Button
                  onClick={createNewChat}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3"
                >
                  New Chat
                </Button>
              </div>
            )}
            
            {/* Receipt Preview */}
            {receiptPreview && (
              <div className="mb-3 relative inline-block">
                <div className="relative rounded-lg overflow-hidden border-2 border-primary/20 shadow-md">
                  <img 
                    src={receiptPreview} 
                    alt="Receipt preview" 
                    className="h-32 w-auto object-contain bg-gray-50"
                  />
                  <button
                    onClick={clearReceiptUpload}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <Button
                    onClick={processReceipt}
                    disabled={isProcessingReceipt}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white text-xs"
                  >
                    {isProcessingReceipt ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Receipt className="w-3.5 h-3.5 mr-1" />
                        Scan Receipt
                      </>
                    )}
                  </Button>
                  <span className="text-xs text-gray-500">{uploadedReceipt?.name}</span>
                </div>
              </div>
            )}

            {/* Character counter */}
            {inputMessage.length > 0 && (
              <div className="flex justify-end mb-2">
                <span className={`text-xs font-medium ${
                  inputMessage.length > 2000 
                    ? 'text-red-500' 
                    : inputMessage.length > 1800 
                    ? 'text-orange-500' 
                    : 'text-gray-400'
                }`}>
                  {inputMessage.length} / 2000
                </span>
              </div>
            )}
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <div className={`relative bg-gray-50 rounded-2xl border transition-all duration-200 ${
                  inputMessage.length > 2000 
                    ? 'border-red-500 focus-within:border-red-500' 
                    : 'border-gray-200 focus-within:border-primary/50'
                } focus-within:bg-white`}>
                  <Input
                    value={inputMessage}
                    onChange={(e) => {
                      const newValue = e.target.value
                      if (newValue.length <= 2000) {
                        setInputMessage(newValue)
                      }
                    }}
                    placeholder="Ask FILI about budgeting, investments, savings, or any financial question..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (inputMessage.trim() && inputMessage.length <= 2000) {
                          sendMessage()
                        }
                      }
                    }}
                    className="border-0 bg-transparent pr-20 py-5 px-6 resize-none focus:ring-0 focus:outline-none placeholder:text-gray-400 text-gray-800 rounded-2xl text-base"
                  />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                      
                      {/* Receipt upload button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 transition-colors group"
                        title="Upload receipt"
                      >
                        <Receipt className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                      </Button>
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || inputMessage.length > 2000}
                      size="sm"
                      className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                        inputMessage.trim() && inputMessage.length <= 2000
                          ? 'bg-primary hover:bg-primary/90 text-white shadow-sm' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      title={inputMessage.length > 2000 ? 'Message too long' : 'Send message'}
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

      {/* Logout Modal */}
      <LogoutModal
        isOpen={logoutModal.isOpen}
        onClose={logoutModal.close}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />

      {/* Delete Chat Modal */}
      <DeleteChatModal
        isOpen={deleteChatModalOpen}
        onClose={() => {
          setDeleteChatModalOpen(false)
          setChatToDelete(null)
        }}
        onConfirm={confirmDeleteChat}
        chatTitle={chats.find(c => c.id === chatToDelete)?.title}
      />

      {/* Clear History Modal */}
      <ClearHistoryModal
        isOpen={clearHistoryModalOpen}
        onClose={() => setClearHistoryModalOpen(false)}
        onConfirm={confirmClearAllHistory}
      />

      {/* Delete Completed Success Modal */}
      <DeleteCompletedModal
        isOpen={deleteCompletedModalOpen}
        onClose={() => setDeleteCompletedModalOpen(false)}
      />
    </div>
    </div>
  )
}
