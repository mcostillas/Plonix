'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { AuthGuard } from '@/components/AuthGuard'
import { User, Mail, Calendar, DollarSign, Target, Trophy, Edit, MessageCircle, Save, X, Upload, Camera, MessageSquare, Bell } from 'lucide-react'
import { PageSpinner, Spinner } from '@/components/ui/spinner'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-hooks'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { NotificationSettingsModal } from '@/components/NotificationSettingsModal'

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}

function ProfileContent() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Profile state
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false)
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
    receiptsScanned: 0
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
        .select('id, message')
        .eq('user_id', user.id)

      setStats({
        totalSaved: totalIncome - totalExpenses,
        goalsCompleted: completedGoals,
        totalGoals: totalGoals,
        learningStreak: 0, // TODO: Implement streak calculation
        totalConversations: 0, // TODO: Count unique sessions
        totalMessages: chatHistory?.length || 0,
        receiptsScanned: 0 // TODO: Implement receipt tracking
      })
    } catch (err) {
      console.error('Error calculating stats:', err)
    }
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

  // Handle profile picture upload
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file'
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Image size should be less than 5MB'
      })
      return
    }

    setSaving(true)
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `profile-pictures/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error('Failed to upload image', {
          description: uploadError.message
        })
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile data state with the URL
      setProfileData({ ...profileData, profilePicture: publicUrl })

      // Save to database immediately
      const { error: dbError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          profile_picture: publicUrl,
          updated_at: new Date().toISOString()
        } as any)

      if (dbError) {
        console.error('Database error:', dbError)
        toast.error('Failed to save profile picture', {
          description: dbError.message
        })
      } else {
        toast.success('Profile picture updated successfully')
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err)
      toast.error('An error occurred while uploading')
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="profile" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture */}
              <div className="relative">
                {profileData.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center border-4 border-gray-200">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-2 shadow-lg transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profileData.name || 'Your Name'}
                  </h1>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        size="sm"
                      >
                        {saving ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        disabled={saving}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {profileData.email}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-900">₱{stats.totalSaved.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Total Saved</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-900">{stats.goalsCompleted}</p>
                  <p className="text-xs text-gray-600">Goals Done</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
                  <p className="text-xs text-gray-600">AI Chats</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Full Name</label>
                    {isEditing ? (
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className="px-3 py-2 text-gray-900">{profileData.name || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
                    <p className="px-3 py-2 text-gray-900">{profileData.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Age</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                        placeholder="Enter your age"
                        min="1"
                        max="120"
                      />
                    ) : (
                      <p className="px-3 py-2 text-gray-900">{profileData.age ? `${profileData.age} years old` : 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Monthly Income (₱)</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={profileData.monthlyIncome}
                        onChange={(e) => setProfileData({ ...profileData, monthlyIncome: e.target.value })}
                        placeholder="Enter monthly income"
                        min="0"
                      />
                    ) : (
                      <p className="px-3 py-2 text-gray-900">
                        {profileData.monthlyIncome ? `₱${parseFloat(profileData.monthlyIncome).toLocaleString()}` : 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Your active savings goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.map((goal) => {
                      const progress = (goal.current_amount / goal.target_amount) * 100
                      return (
                        <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{goal.name}</h4>
                              <p className="text-sm text-gray-600">₱{goal.target_amount.toLocaleString()} target</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">₱{goal.current_amount.toLocaleString()}</p>
                              <p className="text-xs text-gray-600">{progress.toFixed(0)}% complete</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No active goals yet</p>
                    <Button
                      onClick={() => window.location.href = '/goals'}
                      variant="outline"
                    >
                      Create Your First Goal
                    </Button>
                  </div>
                )}
                {goals.length > 0 && (
                  <Button
                    onClick={() => window.location.href = '/goals'}
                    variant="outline"
                    className="w-full"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Manage All Goals
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats & Achievements */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">AI Conversations</p>
                    <p className="text-sm text-gray-600">{stats.totalMessages} messages sent</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Goals Completed</p>
                    <p className="text-sm text-gray-600">{stats.goalsCompleted} of {stats.totalGoals} goals</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Total Saved</p>
                    <p className="text-sm text-gray-600">₱{stats.totalSaved.toLocaleString()}</p>
                  </div>
                </div>

                {stats.goalsCompleted > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Achievement Unlocked</p>
                      <p className="text-sm text-gray-600">Goal Crusher 🎯</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Member Since</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">AI Messages</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{stats.totalMessages}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Active Goals</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{stats.totalGoals}</span>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setNotificationSettingsOpen(true)}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
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
      </div>
    </div>
  )
}
