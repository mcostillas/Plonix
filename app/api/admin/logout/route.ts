import { NextResponse } from 'next/server'
import { clearAdminSession, getAdminSession, logAdminActivity } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const session = await getAdminSession()

    if (session) {
      // Log logout activity
      await logAdminActivity({
        username: session.username,
        action: 'Admin logout',
        actionType: 'read',
        targetType: 'system',
      })
    }

    await clearAdminSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
