// Script to split consolidated chat sessions into proper separate sessions
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const USER_EMAIL = 'costillasmarcmaurice@gmail.com'

async function splitSessions() {
  try {
    console.log('🔍 Looking up user...')
    const { data: authData } = await supabase.auth.admin.listUsers()
    const user = authData.users.find(u => u.email === USER_EMAIL)
    
    if (!user) {
      console.error('❌ User not found')
      return
    }
    
    console.log('✅ Found user:', user.id)
    
    // Get all messages
    const { data: messages, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('❌ Error:', error)
      return
    }
    
    console.log(`📚 Found ${messages.length} messages`)
    
    // Strategy: Split into sessions based on conversation breaks
    // A new session starts when:
    // 1. More than 10 minutes gap between messages
    // 2. User introduces themselves again
    // 3. Repeated questions (same question in different context)
    
    const sessions = []
    let currentSession = null
    let lastMessageTime = null
    
    messages.forEach((msg, index) => {
      const msgTime = new Date(msg.created_at)
      const isHuman = msg.message_type === 'human'
      const content = msg.content.toLowerCase()
      
      // Check for conversation break indicators
      const isIntroduction = isHuman && (
        content.includes('my name is') || 
        content.includes('hi there') ||
        content.includes('hello there')
      )
      
      const timeSinceLastMessage = lastMessageTime 
        ? (msgTime - lastMessageTime) / 1000 / 60 // minutes
        : 0
      
      const shouldStartNewSession = 
        !currentSession || // First message
        timeSinceLastMessage > 10 || // More than 10 min gap
        (isIntroduction && currentSession.messages.length > 2) // Re-introduction in ongoing chat
      
      if (shouldStartNewSession) {
        // Start new session
        const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        currentSession = {
          id: sessionId,
          messages: []
        }
        sessions.push(currentSession)
        console.log(`🆕 Starting new session: ${sessionId} (message ${index + 1})`)
      }
      
      currentSession.messages.push({
        ...msg,
        new_session_id: currentSession.id
      })
      
      lastMessageTime = msgTime
    })
    
    console.log(`\n✅ Split into ${sessions.length} sessions:`)
    sessions.forEach((session, i) => {
      const firstHuman = session.messages.find(m => m.message_type === 'human')
      const preview = firstHuman ? firstHuman.content.substring(0, 50) : 'No human message'
      console.log(`  ${i + 1}. ${session.id} - ${session.messages.length} messages - "${preview}..."`)
    })
    
    // Ask for confirmation
    console.log('\n⚠️  This will:')
    console.log('   1. Delete all existing messages for this user')
    console.log('   2. Re-insert them with new session IDs')
    console.log(`   3. Split ${messages.length} messages into ${sessions.length} separate conversations`)
    console.log('\nDo you want to proceed? (Type YES to confirm)')
    
    // Wait for user input
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    readline.question('\nYour answer: ', async (answer) => {
      if (answer.trim().toUpperCase() === 'YES') {
        console.log('\n🔄 Processing...')
        
        // Delete old messages
        console.log('🗑️  Deleting old messages...')
        const { error: deleteError } = await supabase
          .from('chat_history')
          .delete()
          .eq('user_id', user.id)
        
        if (deleteError) {
          console.error('❌ Delete error:', deleteError)
          readline.close()
          return
        }
        
        console.log('✅ Old messages deleted')
        
        // Insert new messages with proper session IDs
        console.log('📝 Inserting messages with new session IDs...')
        
        const newMessages = []
        sessions.forEach(session => {
          session.messages.forEach(msg => {
            newMessages.push({
              user_id: msg.user_id,
              session_id: msg.new_session_id,
              message_type: msg.message_type,
              content: msg.content,
              created_at: msg.created_at
            })
          })
        })
        
        // Insert in batches of 100
        for (let i = 0; i < newMessages.length; i += 100) {
          const batch = newMessages.slice(i, i + 100)
          const { error: insertError } = await supabase
            .from('chat_history')
            .insert(batch)
          
          if (insertError) {
            console.error('❌ Insert error:', insertError)
            readline.close()
            return
          }
          
          console.log(`  ✅ Inserted ${Math.min(i + 100, newMessages.length)}/${newMessages.length} messages`)
        }
        
        console.log('\n🎉 SUCCESS! Chat sessions have been split!')
        console.log(`   Old: 1 session with ${messages.length} messages`)
        console.log(`   New: ${sessions.length} sessions`)
        
      } else {
        console.log('❌ Operation cancelled')
      }
      
      readline.close()
    })
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

splitSessions()
