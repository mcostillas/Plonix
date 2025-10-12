'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, User as UserIcon, Bot, Plus, MessageSquare, Settings, Trash2, MoreHorizontal, Search, Sparkles, ArrowUp, Paperclip, Shield, Menu, X, ChevronLeft, ChevronRight, LogOut, Moon, Sun, Languages, History, Camera, Receipt, Upload, FileImage, X as XIcon, AlertTriangle, Mic, MicOff, Palette, Waves, Leaf, Flame, Sparkles as SparklesIcon, Moon as MoonIcon, Flower2, Star, Rainbow, Clover, Heart, Drama } from 'lucide-react'
import { auth, onAuthStateChange, type User } from '@/lib/auth'
import { Navbar } from '@/components/ui/navbar'
import { AuthGuard } from '@/components/AuthGuard'
import { PageLoader } from '@/components/ui/page-loader'
import ReactMarkdown from 'react-markdown'
import { supabase } from '@/lib/supabase'
import { LogoutModal, useLogoutModal } from '@/components/ui/logout-modal'
import { DeleteChatModal, ClearHistoryModal } from '@/components/ui/confirmation-modal'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import TextareaAutosize from 'react-textarea-autosize'
import { Spinner, PageSpinner } from '@/components/ui/spinner'
// TODO: Dark mode under works - Theme toggle temporarily disabled
// import { useTheme } from '@/components/ThemeProvider'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"

export default function AIAssistantPage() {
  return (
    <AuthGuard>
      <AIAssistantContent />
    </AuthGuard>
  )
}

// Colorful avatar options (matching profile page)
const AVATAR_OPTIONS = [
  { id: 1, gradient: 'from-purple-400 via-pink-500 to-red-500', icon: Palette },
  { id: 2, gradient: 'from-blue-400 via-cyan-500 to-teal-500', icon: Waves },
  { id: 3, gradient: 'from-green-400 via-emerald-500 to-teal-500', icon: Leaf },
  { id: 4, gradient: 'from-yellow-400 via-orange-500 to-red-500', icon: Flame },
  { id: 5, gradient: 'from-pink-400 via-purple-500 to-indigo-500', icon: SparklesIcon },
  { id: 6, gradient: 'from-indigo-400 via-blue-500 to-purple-500', icon: MoonIcon },
  { id: 7, gradient: 'from-rose-400 via-pink-500 to-purple-500', icon: Flower2 },
  { id: 8, gradient: 'from-amber-400 via-yellow-500 to-orange-500', icon: Star },
  { id: 9, gradient: 'from-cyan-400 via-blue-500 to-indigo-500', icon: Rainbow },
  { id: 10, gradient: 'from-lime-400 via-green-500 to-emerald-500', icon: Clover },
  { id: 11, gradient: 'from-fuchsia-400 via-pink-500 to-rose-500', icon: Heart },
  { id: 12, gradient: 'from-violet-400 via-purple-500 to-fuchsia-500', icon: Drama },
]

// Get avatar gradient by ID
const getAvatarGradient = (profilePicture: string) => {
  if (profilePicture?.startsWith('avatar-')) {
    const avatarId = parseInt(profilePicture.replace('avatar-', ''))
    return AVATAR_OPTIONS.find(a => a.id === avatarId)
  }
  return null
}

function AIAssistantContent() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string>('')
  // TODO: Dark mode under works - Theme toggle temporarily disabled
  // const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState<'en' | 'tl' | 'taglish'>('taglish')
  
  // Get or create session ID - persist in sessionStorage so it survives page navigation
  const getOrCreateSessionId = () => {
    if (typeof window === 'undefined') return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    // Check if there's an existing session ID in sessionStorage
    const existingSessionId = sessionStorage.getItem('plounix_current_chat_session')
    if (existingSessionId) {
      console.log('📌 Found persisted session ID:', existingSessionId)
      return existingSessionId
    }
    
    // Create new session ID and store it
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    console.log('✨ Created new session ID:', newSessionId)
    sessionStorage.setItem('plounix_current_chat_session', newSessionId)
    return newSessionId
  }
  
  // Initialize with empty string - will be set by loadChatHistory or getOrCreateSessionId
  const [currentChatId, setCurrentChatId] = useState('')
  
  // Track if we're currently restoring a session to prevent race conditions
  const [isRestoringSession, setIsRestoringSession] = useState(false)
  
  const [inputMessage, setInputMessage] = useState('')
  // TODO: Re-enable with image API
  // const [uploadedReceipt, setUploadedReceipt] = useState<File | null>(null)
  // const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  // const [isProcessingReceipt, setIsProcessingReceipt] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoutModal = useLogoutModal()
  
  // Modal states for deletion confirmations
  const [deleteChatModalOpen, setDeleteChatModalOpen] = useState(false)
  const [clearHistoryModalOpen, setClearHistoryModalOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  
  // Start with empty chats and messages - will be populated by loadChatHistory
  const [chats, setChats] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])

  // Load chat history from database - group by session_id
  const loadChatHistory = async (userId: string) => {
    setIsChatHistoryLoading(true)
    
    // Check what's in sessionStorage BEFORE loading
    const existingSessionId = typeof window !== 'undefined' 
      ? sessionStorage.getItem('plounix_current_chat_session')
      : null
    console.log('🔍 BEFORE loading - sessionStorage has:', existingSessionId)
    
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
        setIsChatHistoryLoading(false)
        return
      }

      if (!messages || messages.length === 0) {
        console.log('⚠️ No chat history found in database')
        // Still need to check for persisted session and set loading to false
        const persistedSessionId = typeof window !== 'undefined' 
          ? sessionStorage.getItem('plounix_current_chat_session')
          : null
        
        if (persistedSessionId) {
          // Session exists but no messages yet
          console.log('🆕 Restoring empty session:', persistedSessionId)
          const welcomeMessage = {
            id: 1,
            type: 'bot',
            content: 'Kumusta! I\'m Fili, your AI-powered financial kuya/ate assistant! I can help you with budgeting, savings plans, investment advice, and all things related to money management for Filipino youth. Ask me anything about your financial goals!',
            timestamp: new Date()
          }
          const emptyChat = {
            id: persistedSessionId,
            title: 'New Chat',
            lastMessage: '',
            timestamp: new Date(),
            messages: [welcomeMessage]
          }
          setChats([emptyChat])
          setCurrentChatId(persistedSessionId)
          setMessages([welcomeMessage])
        } else {
          // No persisted session and no history - create first chat
          console.log('📝 Creating first chat')
          const newSessionId = getOrCreateSessionId()
          const welcomeMessage = {
            id: 1,
            type: 'bot',
            content: 'Kumusta! I\'m Fili, your AI-powered financial kuya/ate assistant! I can help you with budgeting, savings plans, investment advice, and all things related to money management for Filipino youth. Ask me anything about your financial goals!',
            timestamp: new Date()
          }
          const newChat = {
            id: newSessionId,
            title: 'New Chat',
            lastMessage: '',
            timestamp: new Date(),
            messages: [welcomeMessage]
          }
          setChats([newChat])
          setCurrentChatId(newSessionId)
          setMessages([welcomeMessage])
        }
        
        setIsChatHistoryLoading(false)
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

      // Check if we have a persisted session ID to restore
      const persistedSessionId = typeof window !== 'undefined' 
        ? sessionStorage.getItem('plounix_current_chat_session')
        : null
      
      console.log('🔍 Persisted session ID:', persistedSessionId)
      console.log('📚 Loaded chats count:', loadedChats.length)
      
      if (persistedSessionId) {
        // We have a persisted session - ALWAYS try to restore it
        const persistedChat = loadedChats.find(c => c.id === persistedSessionId)
        
        if (persistedChat) {
          // Found the session with messages in database
          console.log('✅ Restoring session with messages:', persistedSessionId)
          setChats(loadedChats)
          setCurrentChatId(persistedChat.id)
          setMessages(persistedChat.messages)
        } else {
          // Session ID exists but no messages in database yet (fresh chat)
          // This happens when you start a chat and navigate away before sending a message
          console.log('🆕 Restoring empty session:', persistedSessionId)
          const welcomeMessage = {
            id: 1,
            type: 'bot',
            content: 'Kumusta! I\'m Fili, your AI-powered financial kuya/ate assistant! I can help you with budgeting, savings plans, investment advice, and all things related to money management for Filipino youth. Ask me anything about your financial goals!',
            timestamp: new Date()
          }
          const emptyChat = {
            id: persistedSessionId, // Use the EXISTING session ID, don't create new one
            title: 'New Chat',
            lastMessage: '',
            timestamp: new Date(),
            messages: [welcomeMessage]
          }
          setChats([emptyChat, ...loadedChats])
          setCurrentChatId(persistedSessionId)
          setMessages([welcomeMessage])
        }
      } else if (loadedChats.length > 0) {
        // No persisted session, but we have history - load the most recent chat
        console.log('📌 No persisted session, loading most recent chat')
        const mostRecentChat = loadedChats[0]
        setChats(loadedChats)
        setCurrentChatId(mostRecentChat.id)
        setMessages(mostRecentChat.messages)
      } else {
        // No persisted session and no history - create first chat
        console.log('📝 No chat history found, creating first chat')
        const newSessionId = getOrCreateSessionId()
        const welcomeMessage = {
          id: 1,
          type: 'bot',
          content: 'Kumusta! I\'m Fili, your AI-powered financial kuya/ate assistant! I can help you with budgeting, savings plans, investment advice, and all things related to money management for Filipino youth. Ask me anything about your financial goals!',
          timestamp: new Date()
        }
        const newChat = {
          id: newSessionId,
          title: 'New Chat',
          lastMessage: '',
          timestamp: new Date(),
          messages: [welcomeMessage]
        }
        setChats([newChat])
        setCurrentChatId(newSessionId)
        setMessages([welcomeMessage])
      }
      
      setIsChatHistoryLoading(false)
    } catch (error) {
      console.error('Failed to load chat history:', error)
      // On error, still create a default chat
      const newSessionId = getOrCreateSessionId()
      const welcomeMessage = {
        id: 1,
        type: 'bot',
        content: 'Kumusta! I\'m Fili, your AI-powered financial kuya/ate assistant! I can help you with budgeting, savings plans, investment advice, and all things related to money management for Filipino youth. Ask me anything about your financial goals!',
        timestamp: new Date()
      }
      setChats([{
        id: newSessionId,
        title: 'New Chat',
        lastMessage: '',
        timestamp: new Date(),
        messages: [welcomeMessage]
      }])
      setCurrentChatId(newSessionId)
      setMessages([welcomeMessage])
      setIsChatHistoryLoading(false)
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
        // Fetch profile picture on initial load
        fetchProfilePicture(result.user.id)
      }
    })

    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      setIsLoading(false)
      
      // Load chat history when user logs in
      if (user) {
        loadChatHistory(user.id)
        // Fetch profile picture
        fetchProfilePicture(user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch profile picture and preferences
  const fetchProfilePicture = async (userId: string) => {
    try {
      console.log('🖼️ Fetching profile picture and preferences for user:', userId)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('profile_picture, preferences')
        .eq('user_id', userId)
        .maybeSingle()
      
      console.log('🖼️ Profile data:', data, 'error:', error)
      
      if (data) {
        setProfilePicture((data as any).profile_picture || '')
        console.log('✅ Profile picture set to:', (data as any).profile_picture)
        
        // Load theme and language preferences
        const prefs = (data as any).preferences || {}
        if (prefs.language) {
          setLanguage(prefs.language)
          console.log('✅ Language preference loaded:', prefs.language)
        }
      }
    } catch (err) {
      console.error('❌ Error fetching profile data:', err)
    }
  }

  // Save language preference
  const saveLanguagePreference = async (newLanguage: 'en' | 'tl' | 'taglish') => {
    console.log('💾 saveLanguagePreference called with:', newLanguage)
    console.log('💾 Current user:', user)
    
    if (!user?.id) {
      console.error('❌ No user ID available')
      toast.error('User not logged in')
      return
    }
    
    try {
      console.log('💾 Fetching current preferences for user:', user.id)
      // First get current preferences
      const { data: currentData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (fetchError) {
        console.error('❌ Error fetching preferences:', fetchError)
        throw fetchError
      }
      
      console.log('💾 Current preferences:', currentData)
      const currentPrefs = (currentData as any)?.preferences || {}
      console.log('💾 Merged preferences will be:', { ...currentPrefs, language: newLanguage })
      
      // Update with new language
      const { error: updateError } = await (supabase
        .from('user_profiles')
        .upsert as any)({
        user_id: user.id,
        preferences: {
          ...currentPrefs,
          language: newLanguage
        },
        updated_at: new Date().toISOString()
      })
      
      if (updateError) {
        console.error('❌ Error updating preferences:', updateError)
        throw updateError
      }
      
      console.log('✅ Language preference saved successfully!')
    } catch (err) {
      console.error('❌ Error saving language preference:', err)
      toast.error('Failed to save language preference')
      throw err
    }
  }

  // TODO: Dark mode under works - Theme toggle temporarily disabled
  // Apply theme to document
  // useEffect(() => {
  //   // Theme is now handled by ThemeProvider
  //   console.log('🎨 Current theme:', theme)
  // }, [theme])

  // Refresh profile picture and restore chat session when page becomes visible (user returns from another tab or page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id && !isRestoringSession) {
        console.log('👁️ Page visible again - checking session restoration')
        
        // Refresh profile picture
        fetchProfilePicture(user.id)
        
        // Restore chat session from sessionStorage
        const persistedSessionId = sessionStorage.getItem('plounix_current_chat_session')
        console.log('🔍 Persisted session from storage:', persistedSessionId)
        console.log('🔍 Current active session:', currentChatId)
        console.log('🔍 Chats loaded in memory:', chats.length)
        
        if (persistedSessionId && persistedSessionId !== currentChatId) {
          console.log('🔄 Session mismatch detected - restoring:', persistedSessionId)
          setIsRestoringSession(true)
          
          // Find the chat in the current chats array
          const persistedChat = chats.find(c => c.id === persistedSessionId)
          
          if (persistedChat) {
            // Chat exists in memory, restore it
            console.log('✅ Chat found in memory, restoring')
            setCurrentChatId(persistedChat.id)
            setMessages(persistedChat.messages)
          } else {
            // CRITICAL FIX: Chat not in memory
            // Don't call loadChatHistory() because it will wipe out in-memory sessions!
            // Instead, check if this is a session that exists in database but not loaded
            console.log('⚠️ Chat not in memory - checking database without wiping current chats')
            
            // Fetch only this specific session from database
            supabase
              .from('chat_history')
              .select('*')
              .eq('user_id', user.id)
              .eq('session_id', persistedSessionId)
              .order('created_at', { ascending: true })
              .then(({ data: messages, error }) => {
                if (error) {
                  console.error('❌ Error fetching session:', error)
                  // Session doesn't exist in database, it must be a new session
                  // Keep current chats as-is
                  return
                }
                
                if (messages && messages.length > 0) {
                  // Session exists in database, add it to chats
                  console.log('📥 Session found in database with', messages.length, 'messages')
                  
                  const chatMessages = messages.map((msg: any, index: number) => ({
                    id: index + 1,
                    type: msg.message_type === 'human' ? 'user' : 'bot',
                    content: msg.content,
                    timestamp: new Date(msg.created_at)
                  }))
                  
                  const firstUserMessage = chatMessages.find((m: any) => m.type === 'user')
                  const chatTitle = firstUserMessage 
                    ? generateChatTitle(firstUserMessage.content)
                    : 'Conversation'
                  
                  const lastMessageTimestamp = messages.length > 0 
                    ? new Date((messages[messages.length - 1] as any).created_at)
                    : new Date()
                  
                  const restoredChat = {
                    id: persistedSessionId,
                    title: chatTitle,
                    lastMessage: chatMessages[chatMessages.length - 1]?.content || '',
                    timestamp: lastMessageTimestamp,
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
                  
                  // Add this chat to the list if it's not already there
                  const chatExists = chats.some(c => c.id === persistedSessionId)
                  if (!chatExists) {
                    console.log('➕ Adding database session to chats list')
                    setChats([restoredChat, ...chats])
                  } else {
                    console.log('♻️ Updating existing chat with database data')
                    setChats(chats.map(c => c.id === persistedSessionId ? restoredChat : c))
                  }
                  
                  setCurrentChatId(persistedSessionId)
                  setMessages(restoredChat.messages)
                } else {
                  // No messages in database - this is a new session that hasn't been saved yet
                  // It should already be in the chats array, just switch to it
                  console.log('🆕 Empty session - keeping current chats as-is')
                }
                
                // Reset restoration flag
                setIsRestoringSession(false)
              })
          }
        } else {
          console.log('✅ Session already active or no mismatch')
          setIsRestoringSession(false)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user?.id, currentChatId, chats, isRestoringSession])

  // Sync currentChatId to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && currentChatId) {
      console.log('💾 Saving session ID to sessionStorage:', currentChatId)
      sessionStorage.setItem('plounix_current_chat_session', currentChatId)
    }
  }, [currentChatId])

  // Additional safety check: Restore session after chats are loaded
  useEffect(() => {
    if (!isChatHistoryLoading && chats.length > 0 && !currentChatId) {
      const persistedSessionId = sessionStorage.getItem('plounix_current_chat_session')
      console.log('🔍 Post-load session check - persisted:', persistedSessionId, 'current:', currentChatId)
      
      if (persistedSessionId) {
        const persistedChat = chats.find(c => c.id === persistedSessionId)
        if (persistedChat) {
          console.log('✅ Restoring session post-load:', persistedSessionId)
          setCurrentChatId(persistedSessionId)
          setMessages(persistedChat.messages)
        } else if (chats.length > 0) {
          console.log('⚠️ Persisted session not found, using most recent')
          setCurrentChatId(chats[0].id)
          setMessages(chats[0].messages)
        }
      } else if (chats.length > 0 && !currentChatId) {
        console.log('📌 No persisted session, setting to most recent')
        setCurrentChatId(chats[0].id)
        setMessages(chats[0].messages)
        sessionStorage.setItem('plounix_current_chat_session', chats[0].id)
      }
    }
  }, [isChatHistoryLoading, chats, currentChatId])

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
    setCurrentChatId(sessionId)
    setMessages(newChat.messages)
    
    // CRITICAL: Immediately persist the new session ID to sessionStorage
    sessionStorage.setItem('plounix_current_chat_session', sessionId)
    console.log('✨ Created new chat with session ID:', sessionId)
    console.log('💾 Persisted to sessionStorage')
  }

  // Switch to different chat
  const switchChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages)
      // CRITICAL: Persist the switched session ID
      sessionStorage.setItem('plounix_current_chat_session', chatId)
      console.log('🔄 Switched to chat:', chatId)
      console.log('💾 Updated sessionStorage')
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
        toast.error('Failed to delete chat. Please try again.')
        return
      }
      
      console.log('✅ Chat deleted from database:', chatToDelete)
      
      // Delete from state
      const updatedChats = chats.filter(c => c.id !== chatToDelete)
      setChats(updatedChats)
      
      if (currentChatId === chatToDelete) {
        // If deleting current chat, switch to another chat or create new one
        if (updatedChats.length > 0) {
          setCurrentChatId(updatedChats[0].id)
          setMessages(updatedChats[0].messages)
        } else {
          // No chats left, create a new one
          createNewChat()
        }
      }
      
      // Clear the chatToDelete state
      setChatToDelete(null)
      
      // Show success toast
      toast.success('Chat deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting chat:', error)
      toast.error('Failed to delete chat. Please try again.')
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
        toast.error('Failed to delete chat history. Please try again.')
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
      
      // Reset to fresh state with welcome message
      const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const welcomeMessage = {
        id: 1,
        type: 'bot',
        content: 'Kumusta! I\'m Fili, your AI-powered financial kuya/ate assistant! I can help you with budgeting, savings plans, investment advice, and all things related to money management for Filipino youth. Ask me anything about your financial goals!',
        timestamp: new Date()
      }
      
      setChats([{
        id: newSessionId,
        title: 'New Chat',
        timestamp: new Date(),
        lastMessage: '',
        messages: [welcomeMessage]
      }])
      setCurrentChatId(newSessionId)
      setMessages([welcomeMessage])
      
      // Show success toast
      toast.success('Chat history cleared successfully')
    } catch (error) {
      console.error('❌ Error clearing history:', error)
      toast.error('Failed to clear history. Please try again.')
    }
  }

  // TODO: Re-enable receipt functions with image API integration
  /*
  // Handle receipt file upload
  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, WebP) or PDF')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
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
    
    // Add processing message
    const processingMessage = {
      id: Date.now(),
      type: 'bot',
      content: '🔍 **Analyzing your receipt...**\n\nI\'m using OCR (Optical Character Recognition) to read the text from your image. This may take a few seconds.',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, processingMessage])
    
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
      let errorMessage = '❌ Sorry, I had trouble reading that receipt. Please make sure the image is clear and try again, or you can manually enter the transaction details.'
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '🌐 Network error. Please check your internet connection and try again.'
        } else if (error.message.includes('401') || error.message.includes('authentication')) {
          errorMessage = '🔐 Authentication error. Please refresh the page and try again.'
        } else if (error.message.includes('413') || error.message.includes('too large')) {
          errorMessage = '📁 File too large. Please use an image smaller than 10MB.'
        }
      }
      
      const botErrorMessage = {
        id: Date.now(),
        type: 'bot',
        content: errorMessage + '\n\n💡 **Tips for better scanning:**\n• Use good lighting\n• Keep the receipt flat\n• Ensure text is clearly visible\n• Try JPG or PNG format',
        timestamp: new Date()
      }
      setMessages([...messages, botErrorMessage])
    } finally {
      setIsProcessingReceipt(false)
    }
  }
  */

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setAudioChunks(chunks)
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Could not access microphone. Please grant permission and try again.')
    }
  }

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      setIsRecording(false)
      setIsTranscribing(true)
    }
  }

  // Transcribe audio using Whisper API
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.text) {
        setInputMessage(prev => prev + (prev ? ' ' : '') + data.text)
      } else {
        throw new Error(data.error || 'Transcription failed')
      }
    } catch (error) {
      console.error('Transcription error:', error)
      toast.error('Failed to transcribe audio. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
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
    
    // Show loading message with special flag
    const loadingMessage = {
      id: Date.now(),
      type: 'bot',
      content: 'Thinking...',
      timestamp: new Date(),
      isLoading: true // Special flag to show loading animation
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
          recentMessages: recentMessages, // Pass recent chat history for context
          language: language // Pass user's language preference
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
        
        // Update chat messages - CRITICAL: Check if chat exists first
        const currentChatExists = chats.some(chat => chat.id === currentChatId)
        let updatedChats
        
        if (currentChatExists) {
          // Chat exists in array, update it
          updatedChats = chats.map(chat => 
            chat.id === currentChatId 
              ? { ...chat, messages: finalMessages, lastMessage: messageToSend, timestamp: new Date() }
              : chat
          )
        } else {
          // Chat doesn't exist in array yet (new session), add it
          console.log('🆕 Adding new chat to chats array:', currentChatId)
          const chatTitle = generateChatTitle(messageToSend)
          updatedChats = [
            {
              id: currentChatId,
              title: chatTitle,
              messages: finalMessages,
              lastMessage: messageToSend,
              timestamp: new Date()
            },
            ...chats
          ]
        }
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
      
      // Update chat messages even on error to persist the user's message - CRITICAL: Check if chat exists first
      const currentChatExists = chats.some(chat => chat.id === currentChatId)
      let updatedChats
      
      if (currentChatExists) {
        // Chat exists in array, update it
        updatedChats = chats.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: finalMessages, lastMessage: messageToSend, timestamp: new Date() }
            : chat
        )
      } else {
        // Chat doesn't exist in array yet (new session), add it
        console.log('🆕 Adding new chat to chats array (error case):', currentChatId)
        const chatTitle = generateChatTitle(messageToSend)
        updatedChats = [
          {
            id: currentChatId,
            title: chatTitle,
            messages: finalMessages,
            lastMessage: messageToSend,
            timestamp: new Date()
          },
          ...chats
        ]
      }
      setChats(updatedChats)
    }
    // Input already cleared at the start of function
  }

  if (isLoading) {
    return <PageSpinner message="Loading AI Assistant..." />
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden transition-colors duration-200">
      <Navbar currentPage="ai assistant" />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-16'} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg relative`}>
          {/* Sidebar Toggle Button - Floating */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-green-50 hover:border-green-300 shadow-md transition-all duration-200 hover:scale-110"
                >
                  {sidebarOpen ? (
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Sidebar Header */}
          <div className="p-3">
            {sidebarOpen ? (
              <div className="space-y-2">
                {/* New Chat Button */}
                <Button 
                  onClick={createNewChat}
                  variant="ghost"
                  className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-800 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-3" />
                  <span className="font-medium">New chat</span>
                </Button>

                {/* Search Chats Button */}
                <Button 
                  variant="ghost"
                  className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-800 transition-all duration-200"
                >
                  <Search className="w-4 h-4 mr-3" />
                  <span className="font-medium">Search chats</span>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 w-full">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={createNewChat}
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>New chat</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 mx-auto"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Search chats</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          <Separator />

          {/* Chat History */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {sidebarOpen && (
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Chats</h3>
              </div>
            )}
            <ScrollArea className="flex-1 px-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => switchChat(chat.id)}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 hover:border hover:border-green-200 dark:hover:border-green-800 mb-1 transition-all duration-200 ${
                    currentChatId === chat.id ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : ''
                  } ${!sidebarOpen ? 'justify-center' : ''}`}
                >
                  {sidebarOpen ? (
                    <>
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentChatId === chat.id ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${currentChatId === chat.id ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                            {chat.title}
                          </p>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center w-full">
                            <MessageSquare className={`w-4 h-4 ${currentChatId === chat.id ? 'text-gray-900' : 'text-gray-500'}`} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{chat.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>

          <Separator />

          {/* Sidebar Footer */}
          <div className="p-3">
            {sidebarOpen ? (
              <div className="space-y-1">
                {/* User Profile */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all duration-200 h-12"
                  onClick={() => setSettingsOpen(true)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {(() => {
                      const avatarData = getAvatarGradient(profilePicture)
                      console.log('🎨 AI Sidebar - profilePicture:', profilePicture, 'avatarData:', avatarData)
                      
                      if (avatarData) {
                        // Show colorful gradient avatar
                        const IconComponent = avatarData.icon
                        return (
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarData.gradient} flex items-center justify-center`}>
                            <IconComponent className="w-4 h-4 text-white" strokeWidth={1.5} />
                          </div>
                        )
                      } else if (profilePicture && !profilePicture.startsWith('avatar-')) {
                        // Show uploaded image (legacy support)
                        return (
                          <img
                            src={profilePicture}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )
                      } else {
                        // Show default avatar
                        return (
                          <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                          </div>
                        )
                      }
                    })()}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                        {user?.name || user?.email?.split('@')[0] || 'Guest User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">View settings</p>
                    </div>
                  </div>
                  <Settings className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 w-full">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSettingsOpen(true)}
                        className="w-10 h-10 mx-auto"
                      >
                        {(() => {
                          const avatarData = getAvatarGradient(profilePicture)
                          
                          if (avatarData) {
                            // Show colorful gradient avatar
                            const IconComponent = avatarData.icon
                            return (
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarData.gradient} flex items-center justify-center`}>
                                <IconComponent className="w-4 h-4 text-white" strokeWidth={1.5} />
                              </div>
                            )
                          } else if (profilePicture && !profilePicture.startsWith('avatar-')) {
                            // Show uploaded image (legacy support)
                            return (
                              <img
                                src={profilePicture}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )
                          } else {
                            // Show default avatar
                            return (
                              <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-white" />
                              </div>
                            )
                          }
                        })()}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{user?.name || 'User settings'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>

        {/* Settings Modal */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Settings
              </DialogTitle>
              <DialogDescription>
                Manage your account and preferences
              </DialogDescription>
            </DialogHeader>

            {/* Modal Content */}
            <div className="space-y-6">
                {/* User Info Section */}
                {/* <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl p-4 border border-primary/10">
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

                <Separator /> */}

                {/* Settings Options */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Preferences</h3>
                  
                  {/* TODO: Dark mode under works - Theme toggle temporarily disabled */}
                  {/* Theme Setting */}
                  {/* <button 
                    onClick={async () => {
                      try {
                        console.log('🎨 Theme button clicked, current theme:', theme)
                        const newTheme = theme === 'light' ? 'dark' : 'light'
                        console.log('🎨 Switching to theme:', newTheme)
                        setTheme(newTheme)
                        toast.success(`Theme changed to ${newTheme} mode`)
                      } catch (error) {
                        console.error('🎨 Error in theme button:', error)
                        toast.error('Failed to change theme')
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-all">
                        {theme === 'light' ? (
                          <Sun className="w-4 h-4 text-gray-600 group-hover:text-primary" />
                        ) : (
                          <Moon className="w-4 h-4 text-gray-600 group-hover:text-primary" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">Appearance</p>
                        <p className="text-xs text-gray-500 capitalize">{theme} mode</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button> */}

                  {/* Language Setting */}
                  <button 
                    onClick={async () => {
                      try {
                        console.log('🌐 Language button clicked, current language:', language)
                        const languages: Array<'en' | 'tl' | 'taglish'> = ['taglish', 'en', 'tl']
                        const currentIndex = languages.indexOf(language)
                        const nextLanguage = languages[(currentIndex + 1) % languages.length]
                        console.log('🌐 Switching to language:', nextLanguage)
                        setLanguage(nextLanguage)
                        console.log('🌐 Calling saveLanguagePreference...')
                        await saveLanguagePreference(nextLanguage)
                        console.log('🌐 Language saved successfully!')
                        const languageNames = {
                          'taglish': 'English (Taglish)',
                          'en': 'English',
                          'tl': 'Tagalog'
                        }
                        toast.success(`Language changed to ${languageNames[nextLanguage]}`)
                      } catch (error) {
                        console.error('🌐 Error in language button:', error)
                        toast.error('Failed to change language')
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-all">
                        <Languages className="w-4 h-4 text-gray-600 group-hover:text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">Language</p>
                        <p className="text-xs text-gray-500">
                          {language === 'taglish' ? 'English (Taglish)' : language === 'en' ? 'English' : 'Tagalog'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Clear History */}
                  <button 
                    onClick={() => {
                      setSettingsOpen(false)
                      // Small delay to allow settings modal to close smoothly
                      setTimeout(() => setClearHistoryModalOpen(true), 100)
                    }}
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

                <Separator />

                {/* Account Actions */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Account</h3>
                  
                  {/* Logout Button */}
                  <button 
                    onClick={() => {
                      setSettingsOpen(false)
                      // Small delay to allow settings modal to close smoothly
                      setTimeout(() => logoutModal.open(), 100)
                    }}
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

              <Separator />

              {/* App Info */}
              <div className="text-center">
                <p className="text-xs text-gray-400">Plounix AI Assistant v1.0</p>
                <p className="text-xs text-gray-400 mt-1">Made with ❤️ for Filipino youth</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-2 md:p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="relative">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-primary to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm md:text-base">Fili</h1>
              <div className="text-[10px] md:text-xs text-gray-500 flex items-center">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full mr-1 md:mr-1.5 animate-pulse"></div>
                <span className="hidden sm:inline">Financial Assistant • Ready to help</span>
                <span className="sm:hidden">Ready to help</span>
              </div>
            </div>
          </div>

        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          {isChatHistoryLoading ? (
            // Loading State
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <PageSpinner />
              </div>
            </div>
          ) : messages.length === 0 || messages.length === 1 ? (
            // Welcome Screen
            <div className="flex items-center justify-center h-full p-3 md:p-6">
              <div className="text-center max-w-3xl">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
                  <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-gray-100">Welcome to Fili</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-8 leading-relaxed text-xs md:text-sm lg:text-base px-2">
                  Hi there! I'm Fili, your personal AI financial coach designed specifically for Filipino youth. 
                  Whether you're managing your first allowance, planning your first budget, or dreaming about your financial future, 
                  I'm here to guide you every step of the way. Ask me anything about budgeting, saving, investing, or managing your money!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {[
                    "How can I start saving with my ₱5,000 weekly allowance?",
                    "What's the best way to build an emergency fund as a student?",
                    "Help me understand the 50-30-20 budgeting rule",
                    "What should I do with my first salary of ₱20,000?"
                  ].map((suggestion, index) => (
                    <Card
                      key={index}
                      className="p-2 md:p-3 cursor-pointer hover:bg-gray-50 hover:border-primary/40 transition-all duration-200 group"
                      onClick={() => setInputMessage(suggestion)}
                    >
                      <div className="flex items-start gap-2 text-left">
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                          <MessageSquare className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-500 group-hover:text-primary" />
                        </div>
                        <span className="text-[11px] md:text-xs lg:text-sm text-gray-700 leading-relaxed flex-1">{suggestion}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
              {messages.slice(1).map((message, index) => (
                <div key={message.id} className={`flex gap-2 md:gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 pt-1">
                    {message.type === 'user' ? (
                      // User avatar - show colorful gradient if selected
                      (() => {
                        const avatarData = getAvatarGradient(profilePicture)
                        
                        if (avatarData) {
                          // Show colorful gradient avatar
                          const IconComponent = avatarData.icon
                          return (
                            <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br ${avatarData.gradient} flex items-center justify-center`}>
                              <IconComponent className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" strokeWidth={1.5} />
                            </div>
                          )
                        } else if (profilePicture && !profilePicture.startsWith('avatar-')) {
                          // Show uploaded image (legacy support)
                          return (
                            <img
                              src={profilePicture}
                              alt="Profile"
                              className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover"
                            />
                          )
                        } else {
                          // Show default avatar
                          return (
                            <div className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center bg-primary text-white">
                              <UserIcon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            </div>
                          )
                        }
                      })()
                    ) : (
                      // Bot avatar
                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <Bot className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </div>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 space-y-1 md:space-y-1.5 ${message.type === 'user' ? 'flex flex-col items-end' : ''}`}>
                    {/* Sender Name */}
                    <div className={`text-[11px] md:text-xs font-semibold text-gray-900 dark:text-gray-100 ${message.type === 'user' ? 'text-right' : ''}`}>
                      {message.type === 'user' ? 'You' : 'Fili'}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[85%]' 
                          : 'bg-muted rounded-lg px-3 py-2 text-foreground max-w-[85%]'
                      }`}>
                        {/* Show loading animation if message has isLoading flag */}
                        {message.isLoading ? (
                          <div className="flex items-center py-2 px-3 md:py-2.5 md:px-4">
                            <div className="flex space-x-1">
                              <div 
                                className="w-2 h-2 md:w-2.5 md:h-2.5 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0s' }}
                              ></div>
                              <div 
                                className="w-2 h-2 md:w-2.5 md:h-2.5 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0.2s' }}
                              ></div>
                              <div 
                                className="w-2 h-2 md:w-2.5 md:h-2.5 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0.4s' }}
                              ></div>
                            </div>
                          </div>
                        ) : message.type === 'user' ? (
                          // Simple text for user messages - no markdown
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </div>
                        ) : (
                          // Markdown for bot messages
                          <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown 
                              components={{
                                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                ul: ({ children }) => <ul className="list-disc ml-4 my-3 space-y-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal ml-4 my-3 space-y-2">{children}</ol>,
                                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-3">{children}</h3>,
                                a: ({ href, children }) => (
                                  <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 underline font-medium"
                                  >
                                    {children}
                                  </a>
                                ),
                                code: ({ children }) => <code className="bg-gray-800 text-gray-100 px-1.5 py-0.5 rounded text-sm">{children}</code>,
                                pre: ({ children }) => <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-3">{children}</pre>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`text-[10px] md:text-xs text-gray-400 px-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-2 md:p-3 lg:p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {/* Long Session Warning */}
            {messages.length >= 150 && messages.length < 200 && (
              <div className="mb-2 md:mb-3 p-2 md:p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start space-x-2 md:space-x-3">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-semibold text-orange-900">
                    Long conversation detected ({messages.length} messages)
                  </p>
                  <p className="text-[10px] md:text-xs text-orange-700 mt-0.5 md:mt-1">
                    Consider starting a new chat for better performance. Auto-rotates at 200 messages.
                  </p>
                </div>
                <Button
                  onClick={createNewChat}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] md:text-xs px-2 md:px-3 h-7 md:h-8"
                >
                  New Chat
                </Button>
              </div>
            )}
            
            {/* TODO: Re-enable receipt preview with image API */}
            {/* {receiptPreview && (
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
                        <Spinner size="xs" className="mr-2" />
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
            )} */}

            {/* Character counter */}
            {inputMessage.length > 0 && (
              <div className="flex justify-end mb-1 md:mb-1.5">
                <span className={`text-[10px] md:text-xs font-medium ${
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
            <div className="flex items-end space-x-2 md:space-x-3">
              <div className="flex-1">
                <InputGroup className="rounded-full">
                  {/* Hidden file input */}
                  {/* TODO: Re-enable receipt upload with image API integration */}
                  {/* <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                  
                  <InputGroupAddon align="center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors group"
                      title="Upload receipt"
                    >
                      <Receipt className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                    </Button>
                  </InputGroupAddon> */}
                  
                  <TextareaAutosize
                    data-slot="input-group-control"
                    value={inputMessage}
                    onChange={(e) => {
                      const newValue = e.target.value
                      if (newValue.length <= 2000) {
                        setInputMessage(newValue)
                      }
                    }}
                    placeholder={
                      isRecording 
                        ? "Listening..." 
                        : isTranscribing 
                        ? "Transcribing..." 
                        : "Type your message..."
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (inputMessage.trim() && inputMessage.length <= 2000) {
                          sendMessage()
                        }
                      }
                    }}
                    minRows={1}
                    maxRows={6}
                    className="flex items-center field-sizing-content min-h-[32px] md:min-h-[36px] w-full resize-none rounded-full bg-transparent px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm transition-[color,box-shadow] outline-none placeholder:text-gray-400 leading-normal"
                    disabled={isTranscribing}
                  />
                  
                  {/* Voice and Send buttons - Right side */}
                  <InputGroupAddon align="center">
                    <div className="flex items-center gap-0.5 md:gap-1">
                      {/* Microphone button */}
                      <Button
                        onClick={toggleRecording}
                        variant="ghost"
                        size="sm"
                        disabled={isTranscribing}
                        className={`h-7 w-7 md:h-8 md:w-8 p-0 rounded-full transition-colors ${
                          isRecording 
                            ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                            : isTranscribing
                            ? 'bg-blue-100 text-blue-600'
                            : 'hover:bg-primary/10'
                        }`}
                        title={
                          isRecording 
                            ? 'Stop recording' 
                            : isTranscribing 
                            ? 'Transcribing...' 
                            : 'Start voice input'
                        }
                      >
                        {isRecording ? (
                          <MicOff className="w-3.5 h-3.5 md:w-4 md:h-4 animate-pulse" />
                        ) : isTranscribing ? (
                          <Spinner size="sm" className="text-blue-600" />
                        ) : (
                          <Mic className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-primary" />
                        )}
                      </Button>
                      
                      {/* Send button */}
                      <Button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || inputMessage.length > 2000}
                        className="h-7 w-7 md:h-8 md:w-8 p-0 rounded-full" 
                        size="sm" 
                        variant="default"
                        title={inputMessage.length > 2000 ? 'Message too long' : 'Send message'}
                      >
                        <ArrowUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 md:gap-2 mt-2 md:mt-2.5 text-xs text-gray-500">
              <div className="flex items-center space-x-1.5 sm:space-x-3">
                <Shield className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                <span className="text-[9px] md:text-[10px]">Private & secure</span>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                <span className={`text-[9px] md:text-[10px] ${inputMessage.length > 1800 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {inputMessage.length}/2000
                </span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <Link href="/learning" className="text-primary hover:text-primary/80 font-medium transition-colors text-[9px] md:text-[10px] whitespace-nowrap">
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
    </div>
    </div>
  )
}