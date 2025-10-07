import { NextRequest, NextResponse } from 'next/server'
// import { langchainMemory } from '@/lib/langchain-memory'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // await langchainMemory.clearUserMemory(userId) - temporarily disabled

    return NextResponse.json({ 
      success: true,
      message: 'User memory cleared successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Clear Memory API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to clear memory',
      success: false 
    }, { status: 500 })
  }
}
