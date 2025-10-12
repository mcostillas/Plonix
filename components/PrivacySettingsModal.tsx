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
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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

  const handleClearData = async () => {
    if (!user?.id) return

    setDeleting(true)
    try {
      // Clear AI memory and chat history
      const { error: memoryError } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id)

      if (memoryError) throw memoryError

      const { error: crossSessionError } = await supabase
        .from('financial_memories')
        .delete()
        .eq('user_id', user.id)

      if (crossSessionError) throw crossSessionError

      toast.success('Your AI data has been cleared!')
      setShowDeleteConfirm(false)
    } catch (err) {
      console.error('Error clearing data:', err)
      toast.error('Failed to clear data')
    } finally {
      setDeleting(false)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy & Data Settings
          </DialogTitle>
          <DialogDescription>
            Control how your data is used and stored
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-gray-600">Loading your settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Privacy Settings */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Privacy Controls</h3>
              
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
              
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-orange-900 mb-1">
                      Clear AI Memory
                    </h4>
                    <p className="text-xs text-orange-700 mb-3">
                      Delete all AI chat history and learned preferences. This action cannot be undone.
                      Your financial data (transactions, goals) will NOT be affected.
                    </p>
                    
                    {!showDeleteConfirm ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear AI Data
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleClearData}
                          disabled={deleting}
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Clearing...
                            </>
                          ) : (
                            'Confirm Delete'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleting}
                        >
                          Cancel
                        </Button>
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
