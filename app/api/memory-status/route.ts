import { NextRequest, NextResponse } from 'next/server'
import { 
  getUserProfile, 
  updateUserProfile, 
  clearUserMemory, 
  getUserMemoryVariables 
} from '@/lib/authenticated-memory'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const profile = await getUserProfile(user.id)
    const memoryVariables = await getUserMemoryVariables(user.id)

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      profile: profile,
      hasMemory: !!memoryVariables?.history?.length,
      memoryCount: memoryVariables?.history?.length || 0,
      message: 'User memory system is working!'
    })

  } catch (error) {
    console.error('Memory status error:', error)
    return NextResponse.json({
      error: 'Failed to check memory status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { action, data } = await request.json()

    if (action === 'update_profile') {
      await updateUserProfile(user.id, data)
      return NextResponse.json({ success: true, message: 'Profile updated' })
    }

    if (action === 'clear_memory') {
      await clearUserMemory(user.id)
      return NextResponse.json({ success: true, message: 'Memory cleared' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Memory action error:', error)
    return NextResponse.json({
      error: 'Memory action failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await clearUserMemory(user.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'All user memory and data cleared successfully' 
    })

  } catch (error) {
    console.error('Memory clear error:', error)
    return NextResponse.json({
      error: 'Failed to clear memory',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}