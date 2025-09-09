import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database setup...')
    
    // Test 1: Check if tables exist
    const { data: chatHistoryTest, error: chatError } = await supabase
      .from('chat_history')
      .select('count')
      .limit(1)
    
    const { data: memoriesTest, error: memoriesError } = await supabase
      .from('financial_memories')
      .select('count')
      .limit(1)

    // Test 2: Check vector extension (if user has proper permissions)
    const { data: vectorTest, error: vectorError } = await supabase
      .rpc('match_financial_memories', {
        query_embedding: Array(1536).fill(0), // Dummy vector
        match_count: 1
      })

    const results = {
      timestamp: new Date().toISOString(),
      tests: {
        chat_history_table: {
          status: chatError ? 'FAIL' : 'PASS',
          error: chatError?.message
        },
        financial_memories_table: {
          status: memoriesError ? 'FAIL' : 'PASS', 
          error: memoriesError?.message
        },
        vector_function: {
          status: vectorError ? 'FAIL' : 'PASS',
          error: vectorError?.message
        }
      },
      summary: {
        database_ready: !chatError && !memoriesError && !vectorError,
        langchain_memory_compatible: !chatError && !memoriesError,
        vector_search_ready: !vectorError
      }
    }

    console.log('🧪 Test Results:', results)

    return NextResponse.json(results)
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
