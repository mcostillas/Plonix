'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-hooks'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Loader2, Heart, Trash2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const DELETE_REASONS = [
  { value: 'not_using', label: 'Not using the app anymore' },
  { value: 'privacy', label: 'Privacy concerns' },
  { value: 'better_alternative', label: 'Found a better alternative' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'too_complicated', label: 'Too complicated to use' },
  { value: 'technical_issues', label: 'Technical issues or bugs' },
  { value: 'cost', label: 'Cost concerns' },
  { value: 'other', label: 'Other reason' },
]

interface DeleteAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAccountModal({ open, onOpenChange }: DeleteAccountModalProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<'reason' | 'confirm'>('reason')
  const [deleting, setDeleting] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [otherReason, setOtherReason] = useState('')

  const handleDelete = async () => {
    if (!user?.id) return

    setDeleting(true)
    try {
      // Delete all user data
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

      // 8. Clear notification preferences
      const { error: notifError } = await supabase
        .from('user_notification_preferences')
        .delete()
        .eq('user_id', user.id)
      if (notifError) errors.push('notification preferences')

      // 9. Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id)
      if (profileError) errors.push('profile')

      if (errors.length > 0) {
        toast.error(`Failed to delete some data: ${errors.join(', ')}`)
        setDeleting(false)
        return
      }

      // 10. Delete authentication account
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
      
      if (authError) {
        console.error('Auth deletion error:', authError)
        // Even if admin delete fails, sign out the user
      }

      toast.success('Your account has been deleted. We\'re sad to see you go! 💔')
      
      // Sign out and redirect
      await signOut()
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      console.error('Error deleting account:', err)
      toast.error('An error occurred while deleting your account')
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (!deleting) {
      setStep('reason')
      setSelectedReason('')
      setOtherReason('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-3 md:p-6">
        <DialogHeader className="space-y-1 md:space-y-1.5">
          <DialogTitle className="flex items-center gap-1 md:gap-2 text-base md:text-lg">
            <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
            We're Sad to See You Go
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Your financial journey matters to us
          </DialogDescription>
        </DialogHeader>

        {step === 'reason' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Before you go...
                  </h4>
                  <p className="text-xs text-blue-700">
                    We'd love to know why you're leaving. Your feedback helps us improve Plounix 
                    for everyone. This is optional but greatly appreciated!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Why are you deleting your account? (Optional)
              </Label>
              <div className="space-y-2">
                {DELETE_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => setSelectedReason(reason.value)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all text-left ${
                      selectedReason === reason.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedReason === reason.value
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {selectedReason === reason.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="flex-1 text-sm font-normal text-gray-900">
                      {reason.label}
                    </span>
                    {selectedReason === reason.value && (
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {selectedReason === 'other' && (
                <div className="mt-3">
                  <Textarea
                    placeholder="Please tell us more..."
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-900 mb-1">
                    Before you continue
                  </h4>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• All your financial data will be permanently deleted</li>
                    <li>• Your goals, transactions, and progress cannot be recovered</li>
                    <li>• Your AI chat history and learning progress will be lost</li>
                    <li>• Your account cannot be restored after deletion</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setStep('confirm')}
                variant="destructive"
                className="flex-1"
              >
                Continue to Delete
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Never Mind
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-900 mb-2">
                    ⚠️ FINAL WARNING - This Cannot Be Undone
                  </h4>
                  <p className="text-sm text-red-800 font-semibold mb-3">
                    Are you absolutely sure you want to delete your account?
                  </p>
                  <p className="text-xs text-red-700 mb-3">
                    This will permanently delete:
                  </p>
                  <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc">
                    <li>All transactions (income & expenses)</li>
                    <li>All financial goals and progress</li>
                    <li>All AI chat history and personalized advice</li>
                    <li>Monthly bills and scheduled payments</li>
                    <li>Learning progress and achievements</li>
                    <li>Challenge participation and rewards</li>
                    <li>Your entire account and profile</li>
                  </ul>
                </div>
              </div>
            </div>

            {selectedReason && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">You selected:</p>
                <p className="text-sm text-gray-800 font-medium">
                  {DELETE_REASONS.find(r => r.value === selectedReason)?.label}
                </p>
                {selectedReason === 'other' && otherReason && (
                  <p className="text-sm text-gray-700 italic mt-2">"{otherReason}"</p>
                )}
                <p className="text-xs text-gray-500 mt-2">Thank you for sharing this with us. 💙</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleDelete}
                disabled={deleting}
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting Account...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Yes, Delete My Account
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('reason')}
                disabled={deleting}
                className="flex-1"
              >
                Go Back
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500 pt-2">
              We hope to see you again someday. Take care! 💚
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
