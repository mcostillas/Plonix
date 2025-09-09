import { useState, useEffect } from 'react'
import { sessionManager } from '@/lib/user-session'

export function useLangChainMemory() {
  const [userId, setUserId] = useState<string>('')
  const [memoryLoaded, setMemoryLoaded] = useState(false)
  const [memoryError, setMemoryError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize user session
    const currentUserId = sessionManager.getUserId()
    setUserId(currentUserId)
    setMemoryLoaded(true)
  }, [])

  const sendMessageWithMemory = async (message: string) => {
    try {
      setMemoryError(null)
      
      const response = await fetch('/api/simple-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId
        })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response')
      }

      return {
        response: data.response,
        memorySystem: data.memorySystem,
        success: true
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setMemoryError(errorMessage)
      return {
        response: null,
        error: errorMessage,
        success: false
      }
    }
  }

  const updateUserProfile = async (profileData: {
    name?: string
    age?: number
    occupation?: string
    monthlyIncome?: number
    budgetStyle?: string
  }) => {
    try {
      // This would typically call an API endpoint to update the user profile
      // For now, we'll simulate it by sending a message to the AI
      const profileMessage = `Update my profile: ${Object.entries(profileData)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')}`
      
      return await sendMessageWithMemory(profileMessage)
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: 'Failed to update profile' }
    }
  }

  const getMemorySummary = async () => {
    try {
      // This would call a dedicated API endpoint to get memory summary
      const response = await fetch(`/api/memory-summary?userId=${userId}`)
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to get memory summary')
    } catch (error) {
      console.error('Error getting memory summary:', error)
      return null
    }
  }

  const clearMemory = async () => {
    try {
      // This would call an API endpoint to clear user memory
      const response = await fetch('/api/clear-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (response.ok) {
        return { success: true }
      }
      throw new Error('Failed to clear memory')
    } catch (error) {
      console.error('Error clearing memory:', error)
      return { success: false, error: 'Failed to clear memory' }
    }
  }

  return {
    userId,
    memoryLoaded,
    memoryError,
    sendMessageWithMemory,
    updateUserProfile,
    getMemorySummary,
    clearMemory
  }
}

// Example enhanced AI chat component with LangChain memory
export function EnhancedAIChat() {
  const { 
    userId, 
    memoryLoaded, 
    memoryError, 
    sendMessageWithMemory,
    updateUserProfile 
  } = useLangChainMemory()
  
  const [messages, setMessages] = useState<Array<{
    role: string
    content: string
    timestamp: Date
  }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)

  // Profile form state
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    occupation: '',
    monthlyIncome: '',
    budgetStyle: '50-30-20'
  })

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    setLoading(true)
    const userMessage = { 
      role: 'user', 
      content: input, 
      timestamp: new Date() 
    }
    setMessages(prev => [...prev, userMessage])
    
    const currentInput = input
    setInput('')

    try {
      const result = await sendMessageWithMemory(currentInput)
      
      if (result.success && result.response) {
        const aiMessage = { 
          role: 'assistant', 
          content: result.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(result.error || 'Failed to get response')
      }
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const profileData = {
        name: profile.name || undefined,
        age: profile.age ? parseInt(profile.age) : undefined,
        occupation: profile.occupation || undefined,
        monthlyIncome: profile.monthlyIncome ? parseFloat(profile.monthlyIncome) : undefined,
        budgetStyle: profile.budgetStyle
      }

      const result = await updateUserProfile(profileData)
      
      if (result.success) {
        setShowProfileForm(false)
        const confirmMessage = {
          role: 'assistant',
          content: '✅ Profile updated successfully! I\'ll remember this information for our future conversations.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, confirmMessage])
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!memoryLoaded) {
    return <div className="loading">Loading AI memory system...</div>
  }

  return (
    <div className="enhanced-ai-chat max-w-4xl mx-auto p-4">
      <div className="memory-status mb-4 p-3 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800">🧠 LangChain Memory Active</h3>
        <p className="text-sm text-blue-600">
          User ID: {userId} | Memory System: Enhanced with vector storage and automatic summarization
        </p>
        {memoryError && (
          <p className="text-sm text-red-600 mt-2">⚠️ Memory Error: {memoryError}</p>
        )}
      </div>

      <div className="controls mb-4 flex gap-2">
        <button
          onClick={() => setShowProfileForm(!showProfileForm)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {showProfileForm ? 'Hide' : 'Update'} Profile
        </button>
      </div>

      {showProfileForm && (
        <form onSubmit={handleProfileUpdate} className="profile-form mb-4 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-semibold mb-3">Update Your Profile</h4>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Age"
              value={profile.age}
              onChange={(e) => setProfile(prev => ({...prev, age: e.target.value}))}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Occupation"
              value={profile.occupation}
              onChange={(e) => setProfile(prev => ({...prev, occupation: e.target.value}))}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Monthly income (₱)"
              value={profile.monthlyIncome}
              onChange={(e) => setProfile(prev => ({...prev, monthlyIncome: e.target.value}))}
              className="p-2 border rounded"
            />
            <select
              value={profile.budgetStyle}
              onChange={(e) => setProfile(prev => ({...prev, budgetStyle: e.target.value}))}
              className="p-2 border rounded col-span-2"
            >
              <option value="50-30-20">50-30-20 Rule</option>
              <option value="envelope">Envelope Method</option>
              <option value="zero-based">Zero-Based Budgeting</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Update Profile
          </button>
        </form>
      )}

      <div className="messages-container max-h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-white">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            <p>👋 Kumusta! I'm your enhanced Plounix AI with advanced memory.</p>
            <p>I'll remember our conversations and learn your preferences over time!</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`message mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              <strong className="block text-sm opacity-75">
                {message.role === 'user' ? 'You' : 'Plounix AI'}
              </strong>
              <div className="mt-1 whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-50 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message mb-4 text-left">
            <div className="inline-block bg-gray-200 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span>AI is thinking with enhanced memory...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="input-area flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your finances... I'll remember our conversation!"
          disabled={loading}
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  )
}
