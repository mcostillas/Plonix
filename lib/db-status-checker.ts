import { supabase } from './supabase'

export interface DatabaseStatus {
  isConnected: boolean
  hasVectorExtension: boolean
  tables: {
    chat_history: boolean
    financial_memories: boolean
    user_profiles: boolean
    profiles: boolean
  }
  functions: {
    match_financial_memories: boolean
    clear_user_memory: boolean
  }
  errors: string[]
}

export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    isConnected: false,
    hasVectorExtension: false,
    tables: {
      chat_history: false,
      financial_memories: false,
      user_profiles: false,
      profiles: false
    },
    functions: {
      match_financial_memories: false,
      clear_user_memory: false
    },
    errors: []
  }

  try {
    // Test basic connection
    const { data: connectionTest, error: connError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1)

    if (connError) {
      status.errors.push(`Connection failed: ${connError.message}`)
      return status
    }

    status.isConnected = true

    // Check for vector extension
    const { data: extensions, error: extError } = await (supabase as any)
      .rpc('sql', { 
        query: "SELECT extname FROM pg_extension WHERE extname = 'vector'" 
      })

    if (!extError && extensions && extensions.length > 0) {
      status.hasVectorExtension = true
    }

    // Check tables exist
    const tableNames = Object.keys(status.tables)
    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(0)

        if (!error) {
          status.tables[tableName as keyof typeof status.tables] = true
        }
      } catch (err) {
        // Table doesn't exist or no access
        status.errors.push(`Table ${tableName} not accessible`)
      }
    }

    // Check functions exist (simplified check)
    try {
      const { data: functions, error: funcError } = await (supabase as any)
        .rpc('sql', { 
          query: "SELECT routine_name FROM information_schema.routines WHERE routine_name IN ('match_financial_memories', 'clear_user_memory')" 
        })

      if (!funcError && functions) {
        (functions as any[]).forEach((func: any) => {
          if (func.routine_name === 'match_financial_memories') {
            status.functions.match_financial_memories = true
          }
          if (func.routine_name === 'clear_user_memory') {
            status.functions.clear_user_memory = true
          }
        })
      }
    } catch (err) {
      status.errors.push('Could not check functions')
    }

  } catch (error) {
    status.errors.push(`Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return status
}

export async function testUserMemoryOperations(userId: string): Promise<{
  canStoreChatHistory: boolean
  canStoreVectorMemory: boolean
  canRetrieveMemory: boolean
  errors: string[]
}> {
  const testResult = {
    canStoreChatHistory: false,
    canStoreVectorMemory: false,
    canRetrieveMemory: false,
    errors: [] as string[]
  }

  try {
    // Test chat history storage
    const testMessage = {
      session_id: userId,
      message_type: 'human',
      content: 'Test message for memory system',
      metadata: { test: true }
    }

    const { data: chatData, error: chatError } = await (supabase as any)
      .from('chat_history')
      .insert(testMessage)
      .select()

    if (!chatError && chatData) {
      testResult.canStoreChatHistory = true

      // Clean up test data
      await supabase
        .from('chat_history')
        .delete()
        .eq('session_id', userId)
        .eq('metadata->test', true)
    } else {
      testResult.errors.push(`Chat history test failed: ${chatError?.message || 'Unknown error'}`)
    }

    // Test retrieval
    const { data: retrieveData, error: retrieveError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('session_id', userId)
      .limit(1)

    if (!retrieveError) {
      testResult.canRetrieveMemory = true
    } else {
      testResult.errors.push(`Memory retrieval test failed: ${retrieveError.message}`)
    }

    // Test financial memories (if vector extension is available)
    const testMemory = {
      user_id: userId,
      content: 'Test financial memory content',
      metadata: { test: true, type: 'test' }
    }

    const { data: memoryData, error: memoryError } = await (supabase as any)
      .from('financial_memories')
      .insert(testMemory)
      .select()

    if (!memoryError && memoryData) {
      testResult.canStoreVectorMemory = true

      // Clean up test data
      await supabase
        .from('financial_memories')
        .delete()
        .eq('user_id', userId)
        .eq('metadata->test', true)
    } else {
      testResult.errors.push(`Vector memory test failed: ${memoryError?.message || 'Unknown error'}`)
    }

  } catch (error) {
    testResult.errors.push(`Memory operations test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return testResult
}

export function generateSetupInstructions(status: DatabaseStatus): string[] {
  const instructions: string[] = []

  if (!status.isConnected) {
    instructions.push("❌ Fix Supabase connection - check your .env.local file for correct SUPABASE_URL and SUPABASE_ANON_KEY")
  }

  if (!status.hasVectorExtension) {
    instructions.push("⚠️  Enable vector extension in Supabase SQL Editor: CREATE EXTENSION IF NOT EXISTS vector;")
  }

  Object.entries(status.tables).forEach(([table, exists]) => {
    if (!exists) {
      instructions.push(`❌ Create table '${table}' - run the appropriate SQL schema from docs/`)
    }
  })

  Object.entries(status.functions).forEach(([func, exists]) => {
    if (!exists) {
      instructions.push(`❌ Create function '${func}' - run langchain-vector-schema.sql`)
    }
  })

  if (instructions.length === 0) {
    instructions.push("✅ Database setup looks good! Your AI memory system should be working.")
  }

  return instructions
}