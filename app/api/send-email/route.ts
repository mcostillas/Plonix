import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, verifyEmailConnection, sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, to, userName } = body

    // Verify email connection first
    const isConnected = await verifyEmailConnection()
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Email server connection failed. Check your SMTP configuration.' },
        { status: 500 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'test':
        // Send a simple test email
        const testResult = await sendEmail({
          to: to || process.env.SMTP_USER!,
          subject: 'Plounix Email Test ✅',
          text: 'If you received this email, your SMTP configuration is working correctly!',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb; border-radius: 10px;">
              <h2 style="color: #10b981;">✅ Email Test Successful!</h2>
              <p>If you're reading this, your SMTP configuration is working correctly.</p>
              <p>You can now send emails from your Plounix application!</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #666; font-size: 14px;">Sent from Plounix - Your Financial Assistant</p>
            </div>
          `,
        })

        return NextResponse.json(testResult)

      case 'welcome':
        // Send welcome email
        if (!to || !userName) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: to, userName' },
            { status: 400 }
          )
        }

        const welcomeResult = await sendWelcomeEmail(userName, to)
        return NextResponse.json(welcomeResult)

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: test, welcome' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check email configuration status
export async function GET() {
  const isConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  )

  if (!isConfigured) {
    return NextResponse.json({
      configured: false,
      message: 'SMTP credentials are not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file.',
    })
  }

  const isConnected = await verifyEmailConnection()

  return NextResponse.json({
    configured: true,
    connected: isConnected,
    message: isConnected
      ? 'Email server is ready!'
      : 'SMTP configured but connection failed. Check your credentials.',
    config: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: `${process.env.SMTP_FROM_NAME || 'Plounix'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    },
  })
}
