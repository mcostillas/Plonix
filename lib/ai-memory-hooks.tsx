import { useState, useEffect } from 'react'
import { sessionManager } from '@/lib/user-session'

export function useAIMemory() {
  const [userId, setUserId] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Initialize user session
    const currentUserId = sessionManager.getUserId()
    setUserId(currentUserId)

    let currentSession = sessionManager.getCurrentSession()
    if (!currentSession) {
      const newSessionId = sessionManager.createSession(currentUserId)
      setSessionId(newSessionId)
    } else {
      setSessionId(currentSession.sessionId)
    }

    // Update activity on component mount
    if (currentSession) {
      sessionManager.updateActivity(currentSession.sessionId)
    }

    // Cleanup sessions periodically
    sessionManager.cleanupSessions()
  }, [])

  const updateActivity = () => {
    if (sessionId) {
      sessionManager.updateActivity(sessionId)
    }
  }

  const endSession = () => {
    if (sessionId) {
      sessionManager.endSession(sessionId)
      setSessionId('')
    }
  }

  return {
    userId,
    sessionId,
    updateActivity,
    endSession
  }
}

// Example AI Chat Component with Memory
export function AIChat() {
  const { userId, updateActivity } = useAIMemory()
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    setLoading(true)
    updateActivity() // Update user activity

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const response = await fetch('/api/simple-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          userId: userId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const aiMessage = { role: 'assistant', content: data.response }
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <strong>{message.role === 'user' ? 'You' : 'Plounix AI'}:</strong>
            <p>{message.content}</p>
          </div>
        ))}
        {loading && <div className="loading">AI is thinking...</div>}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your finances..."
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
      
      <div className="user-info">
        <small>User ID: {userId}</small>
      </div>
    </div>
  )
}
