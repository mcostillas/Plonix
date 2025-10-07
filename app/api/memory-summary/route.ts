import { NextRequest, NextResponse } from 'next/server'
// import { langchainMemory } from '@/lib/langchain-memory'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const memorySummary = { totalMemories: 0, recentActivity: null, keyTopics: [], status: 'disabled' }

    return NextResponse.json({ 
      success: true,
      memorySummary,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Memory Summary API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to get memory summary',
      success: false 
    }, { status: 500 })
  }
}
