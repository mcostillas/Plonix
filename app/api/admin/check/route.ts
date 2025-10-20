import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient, setAdminSession, logAdminActivity } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 Admin check attempt:', { email, hasPassword: !!password })

    // Try to find admin by username (email field contains username for admin)
    const supabase = await createAdminClient()

    const { data: admin, error } = await supabase
      .from('admin_credentials')
      .select('username, password_hash, email, is_active')
      .eq('username', email) // Using email field as username
      .single()

    console.log('📊 Database query result:', { 
      found: !!admin, 
      error: error?.message,
      username: admin?.username 
    })

    if (error || !admin) {
      console.log('❌ Admin not found in database')
      return NextResponse.json(
        { isAdmin: false, message: 'Not an admin account' },
        { status: 200 }
      )
    }

    // Check if admin is active
    if (!admin.is_active) {
      return NextResponse.json(
        { isAdmin: false, message: 'Admin account deactivated' },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)

    console.log('🔐 Password verification:', { isValid: isValidPassword })

    if (!isValidPassword) {
      console.log('❌ Invalid password')
      return NextResponse.json(
        { isAdmin: false, message: 'Invalid credentials' },
        { status: 200 }
      )
    }

    // Update last login
    await supabase
      .from('admin_credentials')
      .update({ last_login: new Date().toISOString() })
      .eq('username', email)

    // Set admin session cookie
    const session = {
      username: admin.username,
      email: admin.email || '',
      loginTime: new Date().toISOString(),
    }

    await setAdminSession(session)

    // Log activity
    await logAdminActivity({
      username: admin.username,
      action: 'Admin login',
      actionType: 'read',
      targetType: 'system',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    console.log('✅ Admin login successful!')

    return NextResponse.json({
      isAdmin: true,
      username: admin.username,
      redirectTo: '/admin',
    })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { isAdmin: false, message: 'Error checking admin status' },
      { status: 500 }
    )
  }
}
