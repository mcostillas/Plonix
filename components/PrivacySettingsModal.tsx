'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-hooks'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Shield, Eye, Database, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface PrivacyPreferences {
  data_sharing: boolean
  ai_learning: boolean
  analytics: boolean
}

interface SettingToggleProps {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  warning?: boolean
}

function SettingToggle({ icon, label, description, checked, onChange, warning }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3 flex-1">
        <div className={warning ? "text-orange-600" : "text-gray-600"}>
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

interface PrivacySettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacySettingsModal({ open, onOpenChange }: PrivacySettingsModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clearingAll, setClearingAll] = useState(false)
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false)
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    data_sharing: false,
    ai_learning: true,
    analytics: true
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
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data && !error && (data as any).preferences) {
        const prefs = (data as any).preferences
        setPreferences({
          data_sharing: prefs.data_sharing ?? false,
          ai_learning: prefs.ai_learning ?? true,
          analytics: prefs.analytics ?? true
        })
      }
    } catch (err) {
      console.error('Error fetching privacy preferences:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      // Get current preferences
      const { data: currentData } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle()

      const currentPrefs = (currentData as any)?.preferences || {}

      // Update preferences
      const { error } = await (supabase
        .from('user_profiles')
        .upsert as any)({
        user_id: user.id,
        preferences: {
          ...currentPrefs,
          data_sharing: preferences.data_sharing,
          ai_learning: preferences.ai_learning,
          analytics: preferences.analytics
        },
        updated_at: new Date().toISOString()
      })

      if (error) {
        console.error('Save error:', error)
        toast.error('Failed to save privacy settings')
      } else {
        toast.success('Privacy settings saved!')
        onOpenChange(false)
      }
    } catch (err) {
      console.error('Error saving privacy settings:', err)
      toast.error('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const handleClearAllData = async () => {
    if (!user?.id) return

    setClearingAll(true)
    try {
      // Clear all user data for a fresh start
      const errors: string[] = []

      // 1. Clear transactions
      const { error: transError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
      if (transError) errors.push('transactions')

      // 2. Clear goals
      const { error: goalsError } = await supabase
        .from('goals')
        .delete()
        .eq('user_id', user.id)
      if (goalsError) errors.push('goals')

      // 3. Clear chat history
      const { error: chatError } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id)
      if (chatError) errors.push('chat history')

      // 4. Clear financial memories
      const { error: memoriesError } = await supabase
        .from('financial_memories')
        .delete()
        .eq('user_id', user.id)
      if (memoriesError) errors.push('AI memories')

      // 5. Clear monthly bills/scheduled payments
      const { error: billsError } = await supabase
        .from('scheduled_payments')
        .delete()
        .eq('user_id', user.id)
      if (billsError) errors.push('monthly bills')

      // 6. Clear learning reflections
      const { error: learningError } = await supabase
        .from('learning_reflections')
        .delete()
        .eq('user_id', user.id)
      if (learningError) errors.push('learning progress')

      // 7. Clear user challenges
      const { error: challengesError } = await supabase
        .from('user_challenges')
        .delete()
        .eq('user_id', user.id)
      if (challengesError) errors.push('challenges')

      // 8. Reset user profile (keep user_id and email, clear other data)
      const { error: profileError } = await (supabase
        .from('user_profiles')
        .update as any)({
          name: null,
          age: null,
          monthly_income: null,
          profile_picture: null,
          preferences: {},
          financial_data: {},
          ai_insights: {},
          persona_data: {},
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      if (profileError) errors.push('profile data')

      if (errors.length > 0) {
        toast.error(`Failed to clear some data: ${errors.join(', ')}`)
      } else {
        toast.success('All your data has been cleared! You have a fresh start.', {
          description: 'Your account is still active. You can start adding new data anytime.'
        })
        setShowClearAllConfirm(false)
        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (err) {
      console.error('Error clearing all data:', err)
      toast.error('An error occurred while clearing data')
    } finally {
      setClearingAll(false)
    }
  }

  const updatePreference = <K extends keyof PrivacyPreferences>(
    key: K,
    value: PrivacyPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-3 md:p-6">
        <DialogHeader className="space-y-1 md:space-y-1.5">
          <DialogTitle className="flex items-center gap-1 md:gap-2 text-base md:text-lg">
            <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            Privacy & Data Settings
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Control how your data is used and stored
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-primary mb-3 md:mb-4" />
            <p className="text-xs md:text-sm text-gray-600">Loading your settings...</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-6">
            {/* Privacy Settings */}
            <div className="space-y-2">
              <h3 className="text-[10px] md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">Privacy Controls</h3>
              
              <SettingToggle
                icon={<Eye className="w-5 h-5" />}
                label="Data Sharing"
                description="Share anonymized data to improve Plounix for everyone"
                checked={preferences.data_sharing}
                onChange={(checked) => updatePreference('data_sharing', checked)}
              />

              <SettingToggle
                icon={<Database className="w-5 h-5" />}
                label="AI Learning"
                description="Allow AI to learn from your interactions for better advice"
                checked={preferences.ai_learning}
                onChange={(checked) => updatePreference('ai_learning', checked)}
              />

              <SettingToggle
                icon={<Shield className="w-5 h-5" />}
                label="Analytics"
                description="Help us improve by sharing usage statistics"
                checked={preferences.analytics}
                onChange={(checked) => updatePreference('analytics', checked)}
              />
            </div>

            {/* Data Management */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-900">Data Management</h3>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-900 mb-1">
                      Clear All Data - Fresh Start
                    </h4>
                    <p className="text-xs text-red-700 mb-3">
                      <strong> DANGER ZONE:</strong> Delete ALL your data including transactions, goals, 
                      learning progress, challenges, and AI memory. This gives you a completely fresh start. 
                      Your account will remain active but all data will be permanently deleted.
                    </p>
                    
                    {!showClearAllConfirm ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowClearAllConfirm(true)}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All My Data
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-red-900">
                          Are you absolutely sure? This will delete:
                        </p>
                        <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc">
                          <li>All transactions (income & expenses)</li>
                          <li>All financial goals</li>
                          <li>All AI chat history and memories</li>
                          <li>Monthly bills and scheduled payments</li>
                          <li>Learning progress and reflections</li>
                          <li>Challenge participation</li>
                          <li>Profile data (name, age, income)</li>
                        </ul>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleClearAllData}
                            disabled={clearingAll}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {clearingAll ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Clearing Everything...
                              </>
                            ) : (
                              'Yes, Delete Everything'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowClearAllConfirm(false)}
                            disabled={clearingAll}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      Your Data is Protected
                    </h4>
                    <p className="text-xs text-blue-700">
                      All your financial data is encrypted and stored securely. We never share your 
                      personal information with third parties. You can export or delete your data at any time.
                    </p>
                  </div>
                </div>
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
                  'Save Settings'
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
