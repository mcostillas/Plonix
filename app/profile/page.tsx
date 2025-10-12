'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { AuthGuard } from '@/components/AuthGuard'
import { User, Mail, Calendar, DollarSign, Target, Trophy, Edit, MessageCircle, Save, X, MessageSquare, Bell, Palette, Waves, Leaf, Flame, Sparkles, Moon, Flower2, Star, Rainbow, Clover, Heart, Drama } from 'lucide-react'
import { PageSpinner, Spinner } from '@/components/ui/spinner'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-hooks'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { NotificationSettingsModal } from '@/components/NotificationSettingsModal'
import { PrivacySettingsModal } from '@/components/PrivacySettingsModal'
import { DeleteAccountModal } from '@/components/DeleteAccountModal'

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}

// Colorful avatar options
const AVATAR_OPTIONS = [
  { id: 1, gradient: 'from-purple-400 via-pink-500 to-red-500', icon: Palette },
  { id: 2, gradient: 'from-blue-400 via-cyan-500 to-teal-500', icon: Waves },
  { id: 3, gradient: 'from-green-400 via-emerald-500 to-teal-500', icon: Leaf },
  { id: 4, gradient: 'from-yellow-400 via-orange-500 to-red-500', icon: Flame },
  { id: 5, gradient: 'from-pink-400 via-purple-500 to-indigo-500', icon: Sparkles },
  { id: 6, gradient: 'from-indigo-400 via-blue-500 to-purple-500', icon: Moon },
  { id: 7, gradient: 'from-rose-400 via-pink-500 to-purple-500', icon: Flower2 },
  { id: 8, gradient: 'from-amber-400 via-yellow-500 to-orange-500', icon: Star },
  { id: 9, gradient: 'from-cyan-400 via-blue-500 to-indigo-500', icon: Rainbow },
  { id: 10, gradient: 'from-lime-400 via-green-500 to-emerald-500', icon: Clover },
  { id: 11, gradient: 'from-fuchsia-400 via-pink-500 to-rose-500', icon: Heart },
  { id: 12, gradient: 'from-violet-400 via-purple-500 to-fuchsia-500', icon: Drama },
]

function ProfileContent() {
  const { user } = useAuth()
  
  // Profile state
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false)
  const [privacySettingsOpen, setPrivacySettingsOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    age: '',
    monthlyIncome: '',
    profilePicture: ''
  })
  
  // Stats state
  const [stats, setStats] = useState({
    totalSaved: 0,
    goalsCompleted: 0,
    totalGoals: 0,
    learningStreak: 0,
    totalConversations: 0,
    totalMessages: 0,
    // receiptsScanned: 0 // TODO: Re-enable with image API
  })
  
  // Goals state
  const [goals, setGoals] = useState<any[]>([])

  // Fetch user profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return
      
      setLoading(true)
      try {
        // Fetch user profile from user_profiles table
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        // Priority: user_profiles.name -> auth.name -> email username
        const displayName = (profile as any)?.name || user.name || user.email?.split('@')[0] || ''

        if (profile && !error) {
          setProfileData({
            name: displayName,
            email: user.email || '',
            age: (profile as any).age?.toString() || '',
            monthlyIncome: (profile as any).monthly_income?.toString() || '',
            profilePicture: (profile as any).profile_picture || ''
          })
        } else {
          // If no profile exists, use auth data
          setProfileData({
            name: displayName,
            email: user.email || '',
            age: '',
            monthlyIncome: '',
            profilePicture: ''
          })
        }

        // Fetch goals
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)

        if (goalsData) {
          setGoals(goalsData as any[])
        }

        // Calculate stats
        await calculateStats()
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  // Calculate user stats
  const calculateStats = async () => {
    if (!user?.id) return

    try {
      // Get all transactions for total saved calculation
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, transaction_type')
        .eq('user_id', user.id)

      let totalIncome = 0
      let totalExpenses = 0

      transactions?.forEach((tx: any) => {
        if (tx.transaction_type === 'income') {
          totalIncome += tx.amount
        } else if (tx.transaction_type === 'expense') {
          totalExpenses += tx.amount
        }
      })

      // Get goals stats
      const { data: allGoals } = await supabase
        .from('goals')
        .select('status')
        .eq('user_id', user.id)

      const completedGoals = allGoals?.filter((g: any) => g.status === 'completed').length || 0
      const totalGoals = allGoals?.length || 0

      // Get chat history stats
      const { data: chatHistory } = await supabase
        .from('chat_history')
        .select('id, session_id, content')
        .eq('user_id', user.id)

      // Count unique conversations (sessions)
      const uniqueSessions = chatHistory 
        ? new Set(chatHistory.map((msg: any) => msg.session_id)).size 
        : 0

      setStats({
        totalSaved: totalIncome - totalExpenses,
        goalsCompleted: completedGoals,
        totalGoals: totalGoals,
        learningStreak: 0, // TODO: Implement streak calculation
        totalConversations: uniqueSessions,
        totalMessages: chatHistory?.length || 0,
        // receiptsScanned: 0 // TODO: Re-enable with image API
      })
    } catch (err) {
      console.error('Error calculating stats:', err)
    }
  }

  // Handle avatar selection
  const handleAvatarSelect = async (avatarId: number) => {
    if (!user?.id) {
      console.error('No user ID found')
      toast.error('User not authenticated')
      return
    }

    console.log('Selecting avatar:', avatarId)
    console.log('User ID:', user.id)

    setSaving(true)
    try {
      // Store avatar as "avatar-{id}" format
      const avatarValue = `avatar-${avatarId}`
      
      // Use upsert which handles both insert and update
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          profile_picture: avatarValue,
          name: profileData.name || null,
          age: profileData.age ? parseInt(profileData.age) : null,
          monthly_income: profileData.monthlyIncome ? parseFloat(profileData.monthlyIncome) : null,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'user_id'
        })
        .select()

      console.log('Upsert result - data:', data, 'error:', error)

      if (error) {
        console.error('Database error:', error)
        toast.error('Failed to update avatar', {
          description: error.message
        })
      } else {
        console.log('Avatar updated successfully!')
        setProfileData({ ...profileData, profilePicture: avatarValue })
        setShowAvatarSelector(false)
        toast.success('Avatar updated successfully')
      }
    } catch (err: any) {
      console.error('Error updating avatar:', err)
      toast.error('An error occurred', {
        description: err.message
      })
    } finally {
      setSaving(false)
    }
  }

  // Get avatar gradient by ID
  const getAvatarGradient = (profilePicture: string) => {
    if (profilePicture?.startsWith('avatar-')) {
      const avatarId = parseInt(profilePicture.replace('avatar-', ''))
      return AVATAR_OPTIONS.find(a => a.id === avatarId)
    }
    return null
  }

  // Handle profile update
  const handleSaveProfile = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          name: profileData.name,
          age: profileData.age ? parseInt(profileData.age) : null,
          monthly_income: profileData.monthlyIncome ? parseFloat(profileData.monthlyIncome) : null,
          profile_picture: profileData.profilePicture,
          updated_at: new Date().toISOString()
        } as any)

      if (error) {
        toast.error('Failed to save profile', {
          description: error.message
        })
      } else {
        toast.success('Profile updated successfully')
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      toast.error('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="profile" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Spinner size="xl" color="primary" className="mx-auto mb-4" />
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TODO: Dark mode under works - will be implemented next time
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="profile" />

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-4 md:mb-8">
          <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-6">
              {/* Profile Picture */}
              <div className="relative group">
                {(() => {
                  const avatarData = getAvatarGradient(profileData.profilePicture)
                  
                  if (avatarData) {
                    // Show colorful gradient avatar
                    const IconComponent = avatarData.icon
                    return (
                      <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${avatarData.gradient} flex items-center justify-center border-2 md:border-4 border-gray-200 shadow-lg`}>
                        <IconComponent className="w-8 h-8 md:w-12 md:h-12 text-white" strokeWidth={1.5} />
                      </div>
                    )
                  } else if (profileData.profilePicture && !profileData.profilePicture.startsWith('avatar-')) {
                    // Show uploaded image (legacy support)
                    return (
                      <img
                        src={profileData.profilePicture}
                        alt="Profile"
                        className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border-2 md:border-4 border-gray-200"
                      />
                    )
                  } else {
                    // Show default avatar
                    return (
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center border-2 md:border-4 border-gray-200">
                        <User className="w-8 h-8 md:w-12 md:h-12 text-white" />
                      </div>
                    )
                  }
                })()}
                
                {/* Change Avatar Button */}
                {isEditing && (
                  <button
                    onClick={() => setShowAvatarSelector(true)}
                    className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-2 shadow-lg transition-colors"
                    title="Change avatar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                    {profileData.name || 'Your Name'}
                  </h1>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="h-7 md:h-9 text-[10px] md:text-sm"
                    >
                      <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-1 md:gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        size="sm"
                        className="h-7 md:h-9 text-[10px] md:text-sm"
                      >
                        {saving ? (
                          <>
                            <Spinner size="sm" className="mr-1 md:mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        disabled={saving}
                        variant="outline"
                        size="sm"
                        className="h-7 md:h-9 text-[10px] md:text-sm"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs md:text-base text-gray-600 flex items-center justify-center md:justify-start gap-1 md:gap-2">
                  <Mail className="w-3 h-3 md:w-4 md:h-4" />
                  {profileData.email}
                </p>
                <p className="text-gray-500 text-[10px] md:text-sm mt-0.5 md:mt-1">
                  Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 md:gap-4 text-center w-full md:w-auto">
                <div className="bg-gray-100 rounded-lg p-2 md:p-3">
                  <p className="text-sm md:text-2xl font-bold text-gray-900">₱{stats.totalSaved.toLocaleString()}</p>
                  <p className="text-[8px] md:text-xs text-gray-600">Total Saved</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-2 md:p-3">
                  <p className="text-sm md:text-2xl font-bold text-gray-900">{stats.goalsCompleted}</p>
                  <p className="text-[8px] md:text-xs text-gray-600">Goals Done</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-2 md:p-3">
                  <p className="text-sm md:text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
                  <p className="text-[8px] md:text-xs text-gray-600">AI Chats</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-3 md:gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-3 md:space-y-6">
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-base md:text-lg">Personal Information</CardTitle>
                <CardDescription className="text-xs md:text-sm">Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6 pt-0">
                <div className="grid md:grid-cols-2 gap-2 md:gap-4">
                  <div>
                    <label className="text-[10px] md:text-sm font-medium text-gray-700 block mb-1 md:mb-2">Full Name</label>
                    {isEditing ? (
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Enter your name"
                        className="h-8 md:h-10 text-xs md:text-base"
                      />
                    ) : (
                      <p className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-base text-gray-900">{profileData.name || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] md:text-sm font-medium text-gray-700 block mb-1 md:mb-2">Email</label>
                    <p className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-base text-gray-900">{profileData.email}</p>
                    <p className="text-[9px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Email cannot be changed</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-2 md:gap-4">
                  <div>
                    <label className="text-[10px] md:text-sm font-medium text-gray-700 block mb-1 md:mb-2">Age</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                        placeholder="Enter your age"
                        min="1"
                        max="120"
                        className="h-8 md:h-10 text-xs md:text-base"
                      />
                    ) : (
                      <p className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-base text-gray-900">{profileData.age ? `${profileData.age} years old` : 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] md:text-sm font-medium text-gray-700 block mb-1 md:mb-2">Monthly Income (₱)</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={profileData.monthlyIncome}
                        onChange={(e) => setProfileData({ ...profileData, monthlyIncome: e.target.value })}
                        placeholder="Enter monthly income"
                        min="0"
                        className="h-8 md:h-10 text-xs md:text-base"
                      />
                    ) : (
                      <p className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-base text-gray-900">
                        {profileData.monthlyIncome ? `₱${parseFloat(profileData.monthlyIncome).toLocaleString()}` : 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Goals */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-base md:text-lg">Financial Goals</CardTitle>
                <CardDescription className="text-xs md:text-sm">Your active savings goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-4 p-3 md:p-6 pt-0">
                {goals.length > 0 ? (
                  <div className="space-y-2 md:space-y-4">
                    {goals.map((goal) => {
                      const progress = (goal.current_amount / goal.target_amount) * 100
                      return (
                        <div key={goal.id} className="p-2 md:p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1 md:mb-2">
                            <div>
                              <h4 className="font-medium text-[10px] md:text-base text-gray-900 line-clamp-1">{goal.name}</h4>
                              <p className="text-[8px] md:text-sm text-gray-600">₱{goal.target_amount.toLocaleString()} target</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[10px] md:text-base text-primary">₱{goal.current_amount.toLocaleString()}</p>
                              <p className="text-[7px] md:text-xs text-gray-600">{progress.toFixed(0)}% complete</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 md:h-2">
                            <div
                              className="bg-primary h-1 md:h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 md:py-8">
                    <Target className="w-8 h-8 md:w-12 md:h-12 text-gray-300 mx-auto mb-2 md:mb-3" />
                    <p className="text-[10px] md:text-base text-gray-500 mb-2 md:mb-4">No active goals yet</p>
                    <Button
                      onClick={() => window.location.href = '/goals'}
                      variant="outline"
                      className="h-6 md:h-9 text-[8px] md:text-sm"
                    >
                      Create Your First Goal
                    </Button>
                  </div>
                )}
                {goals.length > 0 && (
                  <Button
                    onClick={() => window.location.href = '/goals'}
                    variant="outline"
                    className="w-full h-6 md:h-9 text-[8px] md:text-sm"
                  >
                    <Target className="w-2 h-2 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Manage All Goals
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats & Achievements */}
          <div className="space-y-3 md:space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-base md:text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-4 p-3 md:p-6 pt-0">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-6 h-6 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[10px] md:text-base text-gray-900">AI Conversations</p>
                    <p className="text-[8px] md:text-sm text-gray-600">{stats.totalMessages} messages sent</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-6 h-6 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center">
                    <Target className="w-3 h-3 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[10px] md:text-base text-gray-900">Goals Completed</p>
                    <p className="text-[8px] md:text-sm text-gray-600">{stats.goalsCompleted} of {stats.totalGoals} goals</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-6 h-6 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center">
                    <DollarSign className="w-3 h-3 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[10px] md:text-base text-gray-900">Total Saved</p>
                    <p className="text-[8px] md:text-sm text-gray-600">₱{stats.totalSaved.toLocaleString()}</p>
                  </div>
                </div>

                {stats.goalsCompleted > 0 && (
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-6 h-6 md:w-10 md:h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-3 h-3 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[10px] md:text-base text-gray-900">Achievement Unlocked</p>
                      <p className="text-[8px] md:text-sm text-gray-600">Goal Crusher 🎯</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-base md:text-lg">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3 p-3 md:p-6 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Calendar className="w-3 h-3 md:w-5 md:h-5 text-gray-400" />
                    <span className="text-[10px] md:text-sm font-medium text-gray-900">Member Since</span>
                  </div>
                  <span className="text-[10px] md:text-sm text-gray-600">
                    {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <MessageSquare className="w-3 h-3 md:w-5 md:h-5 text-gray-400" />
                    <span className="text-[10px] md:text-sm font-medium text-gray-900">AI Messages</span>
                  </div>
                  <span className="text-[10px] md:text-sm font-semibold text-primary">{stats.totalMessages}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Target className="w-3 h-3 md:w-5 md:h-5 text-gray-400" />
                    <span className="text-[10px] md:text-sm font-medium text-gray-900">Active Goals</span>
                  </div>
                  <span className="text-[10px] md:text-sm font-semibold text-primary">{stats.totalGoals}</span>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-base md:text-lg">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3 p-3 md:p-6 pt-0">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-7 md:h-10 text-[10px] md:text-sm"
                  onClick={() => setNotificationSettingsOpen(true)}
                >
                  <Bell className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Notification Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-7 md:h-10 text-[10px] md:text-sm"
                  onClick={() => setPrivacySettingsOpen(true)}
                >
                  <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Privacy Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-7 md:h-10 text-[10px] md:text-sm text-red-600 hover:text-red-700"
                  onClick={() => setDeleteAccountOpen(true)}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notification Settings Modal */}
        <NotificationSettingsModal
          open={notificationSettingsOpen}
          onOpenChange={setNotificationSettingsOpen}
        />

        {/* Privacy Settings Modal */}
        <PrivacySettingsModal
          open={privacySettingsOpen}
          onOpenChange={setPrivacySettingsOpen}
        />

        {/* Delete Account Modal */}
        <DeleteAccountModal
          open={deleteAccountOpen}
          onOpenChange={setDeleteAccountOpen}
        />

        {/* Avatar Selector Modal */}
        {showAvatarSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-white rounded-lg p-3 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3 md:mb-6">
                <h2 className="text-base md:text-2xl font-bold text-gray-900">Choose Your Avatar</h2>
                <button
                  onClick={() => setShowAvatarSelector(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
                {AVATAR_OPTIONS.map((avatar) => {
                  const isSelected = profileData.profilePicture === `avatar-${avatar.id}`
                  const IconComponent = avatar.icon
                  return (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarSelect(avatar.id)}
                      disabled={saving}
                      className={`
                        relative aspect-square rounded-full bg-gradient-to-br ${avatar.gradient}
                        flex items-center justify-center
                        transition-all duration-200 hover:scale-110
                        ${isSelected ? 'ring-2 md:ring-4 ring-primary ring-offset-1 md:ring-offset-2' : 'hover:ring-2 hover:ring-gray-300'}
                        ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <IconComponent className="w-4 h-4 md:w-8 md:h-8 text-white" strokeWidth={1.5} />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 md:w-6 md:h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-3 md:mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAvatarSelector(false)}
                  className="h-7 md:h-9 text-[10px] md:text-sm"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
