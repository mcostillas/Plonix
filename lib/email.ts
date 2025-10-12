import nodemailer from 'nodemailer'

// Email configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

// Create reusable transporter
const transporter = nodemailer.createTransport(SMTP_CONFIG)

// Verify connection configuration
export async function verifyEmailConnection() {
  try {
    await transporter.verify()
    console.log('✅ Email server is ready to send messages')
    return true
  } catch (error) {
    console.error('❌ Email server connection failed:', error)
    return false
  }
}

// Email templates
export interface EmailTemplate {
  to: string
  subject: string
  text: string
  html: string
}

// Send email function
export async function sendEmail({ to, subject, text, html }: EmailTemplate) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP credentials not configured')
      return { success: false, error: 'SMTP credentials not configured' }
    }

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Plounix'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })

    console.log('✅ Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Pre-built email templates
export const emailTemplates = {
  // Welcome email for new users
  welcome: (userName: string, userEmail: string) => ({
    to: userEmail,
    subject: 'Welcome to Plounix! 🎉',
    text: `Hi ${userName}!\n\nWelcome to Plounix - your personal financial assistant!\n\nWe're excited to help you on your journey to financial literacy and independence.\n\nHere's what you can do:\n• Track your income and expenses\n• Set and achieve financial goals\n• Chat with our AI assistant Fili 24/7\n• Learn through interactive lessons\n• Join financial challenges\n\nGet started by exploring your dashboard!\n\nBest regards,\nThe Plounix Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { margin: 15px 0; padding-left: 25px; position: relative; }
            .feature-item:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Plounix! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName}!</h2>
              <p>We're thrilled to have you join Plounix - your personal financial assistant designed for Filipino young adults!</p>
              
              <div class="features">
                <h3>Here's what you can do:</h3>
                <div class="feature-item">Track your income and expenses effortlessly</div>
                <div class="feature-item">Set and achieve your financial goals</div>
                <div class="feature-item">Chat with Fili, our AI assistant, available 24/7</div>
                <div class="feature-item">Learn through interactive financial lessons</div>
                <div class="feature-item">Join challenges and build good money habits</div>
              </div>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard" class="button">
                  Get Started Now →
                </a>
              </center>
              
              <p>Remember, financial literacy is a journey, not a destination. We're here to support you every step of the way!</p>
              
              <div class="footer">
                <p>Best regards,<br>The Plounix Team 💚</p>
                <p style="font-size: 12px; color: #999;">You're receiving this email because you signed up for Plounix.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Bill reminder notification
  billReminder: (userName: string, userEmail: string, billName: string, amount: number, dueDay: number) => ({
    to: userEmail,
    subject: `💰 Reminder: ${billName} due soon`,
    text: `Hi ${userName}!\n\nThis is a friendly reminder that your "${billName}" bill (₱${amount.toLocaleString()}) is due on day ${dueDay} of this month.\n\nMake sure you have enough funds to cover this expense!\n\nBest regards,\nPlounix`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fffbeb; padding: 30px; border-radius: 0 0 10px 10px; }
            .bill-details { background: white; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .amount { font-size: 32px; font-weight: bold; color: #f59e0b; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Bill Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${userName}!</p>
              <p>This is a friendly reminder about an upcoming bill:</p>
              
              <div class="bill-details">
                <h3>${billName}</h3>
                <div class="amount">₱${amount.toLocaleString()}</div>
                <p>Due on day <strong>${dueDay}</strong> of this month</p>
              </div>
              
              <p>Make sure you have enough funds to cover this expense!</p>
              
              <div class="footer">
                <p>Best regards,<br>Plounix 💚</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Goal achievement congratulations
  goalAchieved: (userName: string, userEmail: string, goalName: string, goalAmount: number) => ({
    to: userEmail,
    subject: `🎉 Congratulations! You achieved your goal!`,
    text: `Hi ${userName}!\n\n🎉 CONGRATULATIONS! 🎉\n\nYou've successfully achieved your financial goal: "${goalName}" (₱${goalAmount.toLocaleString()})!\n\nThis is a huge milestone in your financial journey. Your dedication and discipline are paying off!\n\nKeep up the great work!\n\nBest regards,\nThe Plounix Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 10px 10px; }
            .goal-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 20px 0; text-align: center; }
            .achievement { font-size: 48px; margin: 20px 0; }
            .amount { font-size: 36px; font-weight: bold; color: #10b981; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="achievement">🎉 🏆 🎉</div>
              <h1>CONGRATULATIONS!</h1>
              <h2>Goal Achieved!</h2>
            </div>
            <div class="content">
              <p>Hi ${userName}!</p>
              <p>We're thrilled to celebrate this amazing milestone with you!</p>
              
              <div class="goal-card">
                <h3>${goalName}</h3>
                <div class="amount">₱${goalAmount.toLocaleString()}</div>
                <p style="color: #10b981; font-weight: bold; font-size: 18px;">✓ COMPLETED</p>
              </div>
              
              <p>This achievement is a testament to your dedication, discipline, and smart financial decisions. You're building a strong foundation for your financial future!</p>
              
              <p>What's next? Consider setting a new goal to keep the momentum going!</p>
              
              <div class="footer">
                <p>Proud of you!<br>The Plounix Team 💚</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Password reset email
  passwordReset: (userName: string, userEmail: string, resetLink: string) => ({
    to: userEmail,
    subject: 'Reset your Plounix password',
    text: `Hi ${userName}!\n\nWe received a request to reset your Plounix password.\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Plounix Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #eff6ff; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <p>Hi ${userName}!</p>
              <p>We received a request to reset your Plounix password.</p>
              
              <center>
                <a href="${resetLink}" class="button">Reset Password</a>
              </center>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
              </div>
              
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <div class="footer">
                <p>Best regards,<br>The Plounix Team 💚</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
}

// Helper function to send welcome email
export async function sendWelcomeEmail(userName: string, userEmail: string) {
  return sendEmail(emailTemplates.welcome(userName, userEmail))
}

// Helper function to send bill reminder
export async function sendBillReminder(userName: string, userEmail: string, billName: string, amount: number, dueDay: number) {
  return sendEmail(emailTemplates.billReminder(userName, userEmail, billName, amount, dueDay))
}

// Helper function to send goal achievement email
export async function sendGoalAchievedEmail(userName: string, userEmail: string, goalName: string, goalAmount: number) {
  return sendEmail(emailTemplates.goalAchieved(userName, userEmail, goalName, goalAmount))
}

// Helper function to send password reset email
export async function sendPasswordResetEmail(userName: string, userEmail: string, resetLink: string) {
  return sendEmail(emailTemplates.passwordReset(userName, userEmail, resetLink))
}
