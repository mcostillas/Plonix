'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-hooks'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Calendar, AlertCircle, BookOpen, Trophy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationPreferences {
  bill_reminders: boolean
  budget_alerts: boolean
  learning_prompts: boolean
  achievements: boolean
  reminder_days_before: number
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
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${checked ? 'bg-primary' : 'bg-gray-200'}
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

interface NotificationSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationSettingsModal({ open, onOpenChange }: NotificationSettingsModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bill_reminders: true,
    budget_alerts: true,
    learning_prompts: true,
    achievements: true,
    reminder_days_before: 7
  })

  // Fetch preferences when modal opens
  useEffect(() => {
    if (open && user?.id) {
      fetchPreferences()
    }
  }, [open, user?.id])

  const fetchPreferences = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data && !error) {
        setPreferences({
          bill_reminders: data.bill_reminders ?? true,
          budget_alerts: data.budget_alerts ?? true,
          learning_prompts: data.learning_prompts ?? true,
          achievements: data.achievements ?? true,
          reminder_days_before: data.reminder_days_before ?? 7
        })
      }
    } catch (err) {
      console.error('Error fetching preferences:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          bill_reminders: preferences.bill_reminders,
          budget_alerts: preferences.budget_alerts,
          learning_prompts: preferences.learning_prompts,
          achievements: preferences.achievements,
          reminder_days_before: preferences.reminder_days_before,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Save error:', error)
        toast.error('Failed to save preferences')
      } else {
        toast.success('Notification preferences saved!')
        onOpenChange(false)
      }
    } catch (err) {
      console.error('Error saving preferences:', err)
      toast.error('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Customize when and how you receive notifications
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-gray-600">Loading your preferences...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Notification Types */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Notification Types</h3>
              
              <SettingToggle
                icon={<Calendar className="w-5 h-5" />}
                label="Bill Reminders"
                description="Get notified before your monthly bills are due"
                checked={preferences.bill_reminders}
                onChange={(checked) => updatePreference('bill_reminders', checked)}
              />

              <SettingToggle
                icon={<AlertCircle className="w-5 h-5" />}
                label="Budget Alerts"
                description="Alert when you're close to your spending limit"
                checked={preferences.budget_alerts}
                onChange={(checked) => updatePreference('budget_alerts', checked)}
              />

              <SettingToggle
                icon={<BookOpen className="w-5 h-5" />}
                label="Learning Prompts"
                description="Reminders to continue your financial education"
                checked={preferences.learning_prompts}
                onChange={(checked) => updatePreference('learning_prompts', checked)}
              />

              <SettingToggle
                icon={<Trophy className="w-5 h-5" />}
                label="Achievements"
                description="Celebrate when you reach savings goals"
                checked={preferences.achievements}
                onChange={(checked) => updatePreference('achievements', checked)}
              />
            </div>

            {/* Timing Settings */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-900">Timing</h3>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="reminder-days" className="text-sm font-medium text-gray-900">
                    Bill Reminder Timing
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    How many days before due date to notify you
                  </p>
                </div>
                <Select
                  value={preferences.reminder_days_before.toString()}
                  onValueChange={(value) => updatePreference('reminder_days_before', parseInt(value))}
                >
                  <SelectTrigger id="reminder-days" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
