interface UserSession {
  userId: string
  sessionId: string
  startTime: Date
  lastActivity: Date
  isActive: boolean
}

export class UserSessionManager {
  private static instance: UserSessionManager
  private sessions: Map<string, UserSession> = new Map()

  static getInstance(): UserSessionManager {
    if (!UserSessionManager.instance) {
      UserSessionManager.instance = new UserSessionManager()
    }
    return UserSessionManager.instance
  }

  // Generate or retrieve user ID
  getUserId(): string {
    // Check if user ID exists in localStorage
    if (typeof window !== 'undefined') {
      let userId = localStorage.getItem('plounix_user_id')
      
      if (!userId) {
        // Generate new user ID
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('plounix_user_id', userId)
      }
      
      return userId
    }
    
    // Fallback for server-side or if localStorage is not available
    return 'default_user'
  }

  // Create new session
  createSession(userId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const session: UserSession = {
      userId,
      sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      isActive: true
    }

    this.sessions.set(sessionId, session)
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('plounix_session_id', sessionId)
    }

    return sessionId
  }

  // Get current session
  getCurrentSession(): UserSession | null {
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('plounix_session_id')
      if (sessionId && this.sessions.has(sessionId)) {
        const session = this.sessions.get(sessionId)!
        session.lastActivity = new Date()
        return session
      }
    }
    return null
  }

  // Update session activity
  updateActivity(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
    }
  }

  // End session
  endSession(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.isActive = false
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('plounix_session_id')
    }
  }

  // Clean up inactive sessions (older than 24 hours)
  cleanupSessions() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    this.sessions.forEach((session, sessionId) => {
      if (session.lastActivity < oneDayAgo) {
        this.sessions.delete(sessionId)
      }
    })
  }
}

export const sessionManager = UserSessionManager.getInstance()
