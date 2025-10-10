'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-hooks'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Calendar, AlertCircle, BookOpen, Trophy, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationPreferences {
  bill_reminders: boolean
  budget_alerts: boolean
  learning_prompts: boolean
  achievements: boolean
  reminder_days_before: number
  email_enabled: boolean
  quiet_hours_start: number | null
  quiet_hours_end: number | null
}

interface SettingToggleProps {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function SettingToggle({ icon, label, description, checked, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3 flex-1">
        <div className="text-gray-600">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          ${checked ? 'bg-indigo-600' : 'bg-gray-200'}
        `}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}

export default function NotificationSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bill_reminders: true,
    budget_alerts: true,
    learning_prompts: true,
    achievements: true,
    reminder_days_before: 7,
    email_enabled: false,
    quiet_hours_start: null,
    quiet_hours_end: null
  })

  // Fetch user preferences
  useEffect(() => {
    if (!user?.id) return

    async function fetchPreferences() {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data, error } = await supabase
          .from('user_notification_preferences')
          .select('*')
          .eq('user_id', user!.id)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setPreferences({
            bill_reminders: data.bill_reminders,
            budget_alerts: data.budget_alerts,
            learning_prompts: data.learning_prompts,
            achievements: data.achievements,
            reminder_days_before: data.reminder_days_before,
            email_enabled: data.email_enabled,
            quiet_hours_start: data.quiet_hours_start,
            quiet_hours_end: data.quiet_hours_end
          })
        }
      } catch (error) {
        console.error('Error fetching preferences:', error)
        toast.error('Failed to load preferences')
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [user])

  // Update a single preference
  const updatePreference = (key: keyof NotificationPreferences, value: boolean | number) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  // Save preferences to database
  const savePreferences = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Upsert preferences
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      toast.success('Preferences saved successfully', {
        description: 'Your notification settings have been updated'
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences', {
        description: 'Please try again'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-2">
            Customize how and when you receive notifications
          </p>
        </div>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-indigo-600" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose which notifications you want to receive
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* In-App Notifications */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                In-App Notifications
              </h3>
              <div className="space-y-1 border rounded-lg overflow-hidden">
                <SettingToggle
                  icon={<Calendar className="w-4 h-4" />}
                  label="Bill Reminders"
                  description="Get notified before bills are due"
                  checked={preferences.bill_reminders}
                  onChange={(checked) => updatePreference('bill_reminders', checked)}
                />
                
                <div className="border-t" />
                
                <SettingToggle
                  icon={<AlertCircle className="w-4 h-4" />}
                  label="Budget Alerts"
                  description="Alerts when approaching budget limits"
                  checked={preferences.budget_alerts}
                  onChange={(checked) => updatePreference('budget_alerts', checked)}
                />
                
                <div className="border-t" />
                
                <SettingToggle
                  icon={<BookOpen className="w-4 h-4" />}
                  label="Learning Prompts"
                  description="Reminders to continue your financial education"
                  checked={preferences.learning_prompts}
                  onChange={(checked) => updatePreference('learning_prompts', checked)}
                />
                
                <div className="border-t" />
                
                <SettingToggle
                  icon={<Trophy className="w-4 h-4" />}
                  label="Achievement Celebrations"
                  description="Notifications when you reach milestones"
                  checked={preferences.achievements}
                  onChange={(checked) => updatePreference('achievements', checked)}
                />
              </div>
            </div>

            {/* Timing Preferences */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Timing
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reminder-days" className="text-sm font-medium text-gray-700">
                    Bill Reminder (days before due date)
                  </Label>
                  <Select 
                    value={String(preferences.reminder_days_before)} 
                    onValueChange={(value) => updatePreference('reminder_days_before', Number(value))}
                  >
                    <SelectTrigger id="reminder-days" className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day before</SelectItem>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="7">7 days before</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    You'll be notified this many days before your bills are due
                  </p>
                </div>
              </div>
            </div>

            {/* Email Notifications (Phase 4) */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Email Notifications <span className="text-xs font-normal text-gray-500">(Coming Soon)</span>
              </h3>
              <div className="border rounded-lg overflow-hidden opacity-50 pointer-events-none">
                <SettingToggle
                  icon={<Bell className="w-4 h-4" />}
                  label="Email Notifications"
                  description="Receive important reminders via email"
                  checked={preferences.email_enabled}
                  onChange={(checked) => updatePreference('email_enabled', checked)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Email notifications will be available in a future update
              </p>
            </div>

            {/* Save Button */}
            <div className="border-t pt-6">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={savePreferences}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Bell className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    About Notifications
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Notifications help you stay on track with your financial goals. 
                    You can change these settings anytime. We'll only send you 
                    helpful, relevant updates based on your activity.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Notification Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {[preferences.bill_reminders, preferences.budget_alerts, preferences.learning_prompts, preferences.achievements].filter(Boolean).length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Active notification types</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{preferences.reminder_days_before}</p>
                <p className="text-xs text-gray-600 mt-1">Days before bill reminder</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
