'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, XCircle, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

export default function EmailTestPage() {
  const [loading, setLoading] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [status, setStatus] = useState<any>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Check email configuration status
  const checkStatus = async () => {
    setCheckingStatus(true)
    try {
      const response = await fetch('/api/send-email')
      const data = await response.json()
      setStatus(data)
      
      if (data.configured && data.connected) {
        toast.success('Email system is configured and ready!')
      } else if (data.configured && !data.connected) {
        toast.error('Email configured but connection failed. Check your credentials.')
      } else {
        toast.error('Email not configured. Check your .env file.')
      }
    } catch (error) {
      toast.error('Failed to check email status')
      console.error(error)
    } finally {
      setCheckingStatus(false)
    }
  }

  // Send test email
  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          to: testEmail,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Test email sent to ${testEmail}!`)
      } else {
        toast.error(`Failed: ${data.error}`)
      }
    } catch (error) {
      toast.error('Failed to send email')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Send welcome email
  const sendWelcomeEmail = async () => {
    if (!testEmail || !userName) {
      toast.error('Please enter both email and name')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'welcome',
          to: testEmail,
          userName: userName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Welcome email sent to ${testEmail}!`)
      } else {
        toast.error(`Failed: ${data.error}`)
      }
    } catch (error) {
      toast.error('Failed to send welcome email')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Mail className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            Email System Test
          </h1>
          <p className="text-gray-600">
            Test your Gmail SMTP configuration for Plounix
          </p>
        </div>

        {/* Configuration Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Configuration Status
            </CardTitle>
            <CardDescription>
              Check if your email system is properly configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={checkStatus}
              disabled={checkingStatus}
              className="w-full"
            >
              {checkingStatus && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Check Status
            </Button>

            {status && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  {status.configured ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    {status.configured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>

                {status.configured && (
                  <div className="flex items-center gap-2 text-sm">
                    {status.connected ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {status.connected ? 'Connected' : 'Connection Failed'}
                    </span>
                  </div>
                )}

                {status.config && (
                  <div className="bg-gray-50 p-4 rounded-lg text-xs space-y-1">
                    <p><strong>Host:</strong> {status.config.host}</p>
                    <p><strong>Port:</strong> {status.config.port}</p>
                    <p><strong>User:</strong> {status.config.user}</p>
                    <p><strong>From:</strong> {status.config.from}</p>
                  </div>
                )}

                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  {status.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Email Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Send Test Email
            </CardTitle>
            <CardDescription>
              Send a simple test email to verify everything works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Recipient Email</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="your.email@gmail.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <Button
              onClick={sendTestEmail}
              disabled={loading || !testEmail}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Test Email
            </Button>
          </CardContent>
        </Card>

        {/* Welcome Email Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Send Welcome Email
            </CardTitle>
            <CardDescription>
              Test the welcome email template with name personalization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">User Name</Label>
                <Input
                  id="user-name"
                  type="text"
                  placeholder="John Doe"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome-email">Email Address</Label>
                <Input
                  id="welcome-email"
                  type="email"
                  placeholder="john@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={sendWelcomeEmail}
              disabled={loading || !testEmail || !userName}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Welcome Email
            </Button>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">📖 Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-900">
            <p className="font-medium">To set up email functionality:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Enable 2-Step Verification on your Gmail account</li>
              <li>Generate an App Password at: myaccount.google.com/apppasswords</li>
              <li>Add SMTP credentials to your .env.local file</li>
              <li>Restart your development server</li>
              <li>Click "Check Status" above to verify</li>
            </ol>
            <p className="text-xs mt-4">
              📄 Full guide: <code className="bg-amber-100 px-2 py-1 rounded">/docs/EMAIL_SETUP_GUIDE.md</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
