// Debug script to check chat sessions for costillasmarcmaurice@gmail.com
const { createClient } = require('@supabase/supabase-js')

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function debugSessions() {
  try {
    console.log('🔍 Looking up user by email...')
    
    // Get user ID from auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }
    
    const user = authData.users.find(u => u.email === 'costillasmarcmaurice@gmail.com')
    
    if (!user) {
      console.error('❌ User not found with email: costillasmarcmaurice@gmail.com')
      return
    }
    
    console.log('✅ Found user:', user.id)
    console.log('📧 Email:', user.email)
    console.log('📅 Created:', user.created_at)
    console.log('')
    
    // Get all chat messages for this user
    console.log('🔍 Fetching chat history...')
    const { data: messages, error: messagesError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    
    if (messagesError) {
      console.error('❌ Messages error:', messagesError)
      return
    }
    
    console.log(`📚 Found ${messages.length} total messages`)
    console.log('')
    
    // Group by session_id
    const sessions = {}
    messages.forEach(msg => {
      if (!sessions[msg.session_id]) {
        sessions[msg.session_id] = []
      }
      sessions[msg.session_id].push(msg)
    })
    
    console.log(`🔑 Found ${Object.keys(sessions).length} unique session IDs:`)
    console.log('')
    
    // Display each session
    Object.entries(sessions).forEach(([sessionId, msgs], index) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`📊 SESSION ${index + 1}: ${sessionId}`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`💬 Message count: ${msgs.length}`)
      console.log(`🕐 First message: ${msgs[0].created_at}`)
      console.log(`🕐 Last message: ${msgs[msgs.length - 1].created_at}`)
      console.log(`\n📝 Messages:`)
      
      msgs.forEach((msg, i) => {
        const icon = msg.message_type === 'human' ? '👤' : '🤖'
        const preview = msg.content.length > 80 
          ? msg.content.substring(0, 80) + '...'
          : msg.content
        console.log(`  ${i + 1}. ${icon} [${msg.message_type}] ${preview}`)
      })
    })
    
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Total sessions: ${Object.keys(sessions).length}`)
    console.log(`Total messages: ${messages.length}`)
    console.log(`Avg messages per session: ${(messages.length / Object.keys(sessions).length).toFixed(1)}`)
    
    // Check if there are sessions that should be split
    Object.entries(sessions).forEach(([sessionId, msgs]) => {
      if (msgs.length > 20) {
        console.log(`\n⚠️ WARNING: Session ${sessionId} has ${msgs.length} messages (might need splitting)`)
      }
    })
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugSessions()
