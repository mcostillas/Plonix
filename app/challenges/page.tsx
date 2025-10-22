'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { AuthGuard } from '@/components/AuthGuard'
import { Trophy, Calendar, Users, Target, TrendingUp, PiggyBank, Coffee, BookOpen, Flame, GraduationCap, Briefcase, CheckCircle, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Challenge } from '@/types/challenges'
import { supabase } from '@/lib/supabase'
import { JoinChallengeSuccessModal, ChallengeCanceledModal } from '@/components/ui/success-modal'
import { AlreadyJoinedModal } from '@/components/ui/info-modal'
import { CancelChallengeModal } from '@/components/ui/confirmation-modal'

export default function ChallengesPage() {
  return (
    <AuthGuard>
      <ChallengesContent />
    </AuthGuard>
  )
}

function ChallengesContent() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([])
  const [userChallengeMap, setUserChallengeMap] = useState<{[key: string]: string}>({}) // Maps challenge_id to user_challenge_id
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    completed: 0,
    totalSaved: 0,
    totalMembers: 0
  })
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [successChallengeTitle, setSuccessChallengeTitle] = useState('')
  const [alreadyJoinedModalOpen, setAlreadyJoinedModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelingChallengeId, setCancelingChallengeId] = useState<string | null>(null)
  const [cancelingChallengeTitle, setCancelingChallengeTitle] = useState('')
  const [canceledModalOpen, setCanceledModalOpen] = useState(false)
  const [partialPointsEarned, setPartialPointsEarned] = useState<number>(0)
  const [isCanceling, setIsCanceling] = useState(false)

  useEffect(() => {
    async function loadData() {
      await fetchChallenges() // Wait for challenges first
      await fetchUserStats()   // Then fetch stats (which needs challenges data)
    }
    loadData()
  }, [])

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges')
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Challenges data from API:', data.challenges)
        console.log('📊 Sample challenge participants:', data.challenges[0]?.total_participants)
        setChallenges(data.challenges || [])
      }
    } catch (error) {
      console.error('Error fetching challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    console.log('🔍 Fetching user stats...')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch global stats from API endpoint (bypasses RLS)
      console.log('🌐 Calling /api/challenges/stats for global statistics...')
      try {
        const response = await fetch('/api/challenges/stats')
        if (response.ok) {
          const globalStats = await response.json()
          console.log('✅ Global stats received:', globalStats)
          
          // Use global stats for members count
          const globalMembers = globalStats.totalMembers || 0
          const globalCompleted = globalStats.completedChallenges || 0
          
          console.log('📊 Global members (bypassing RLS):', globalMembers)
          console.log('📊 Global completed challenges:', globalCompleted)
          
          if (user) {
            console.log('✅ User authenticated:', user.id)
            const { data: userChallenges, error: userChallengesError } = await supabase
              .from('user_challenges')
              .select('id, status, points_earned, challenge_id')
              .eq('user_id', user.id)

            if (userChallengesError) {
              console.error('❌ Error fetching user challenges:', userChallengesError)
            }

            if (userChallenges) {
              console.log('📊 User challenges found:', userChallenges.length)
              console.log('📊 User challenges data:', userChallenges)
              
              const completed = userChallenges.filter((uc: any) => uc.status === 'completed').length
              const active = userChallenges.filter((uc: any) => uc.status === 'active').length
              const totalSaved = userChallenges.reduce((sum: number, uc: any) => sum + (uc.points_earned || 0), 0) * 10 // Points to peso estimate
              
              console.log('✅ User\'s completed challenges:', completed)
              console.log('🔄 User\'s active challenges:', active)
              console.log('💰 Total saved estimate:', totalSaved)
              
              // Get all active challenge IDs and create mapping
              const activeChallengeIds = userChallenges
                .filter((uc: any) => uc.status === 'active')
                .map((uc: any) => uc.challenge_id)
              
              const challengeMapping: {[key: string]: string} = {}
              userChallenges
                .filter((uc: any) => uc.status === 'active')
                .forEach((uc: any) => {
                  challengeMapping[uc.challenge_id] = uc.id
                })
              
              setJoinedChallenges(activeChallengeIds)
              setUserChallengeMap(challengeMapping)
              
              // Use global stats for accurate member count
              setStats({
                completed,
                totalSaved,
                totalMembers: globalMembers // From API (bypasses RLS)
              })
            }
          } else {
            console.log('⚠️ No user logged in, using global stats only')
            setStats({
              completed: 0,
              totalSaved: 0,
              totalMembers: globalMembers // From API
            })
          }
        } else {
          console.error('❌ Failed to fetch global stats from API:', response.status)
          throw new Error('API returned error status')
        }
      } catch (apiError) {
        console.error('❌ Error calling stats API, falling back to showing 0:', apiError)
        console.warn('⚠️ WARNING: Could not fetch global stats from API')
        console.warn('⚠️ This is likely due to RLS policies blocking client-side queries')
        console.warn('⚠️ Check if SUPABASE_SERVICE_ROLE_KEY is configured in .env.local')
        
        setStats({
          completed: 0,
          totalSaved: 0,
          totalMembers: 0 // Will show 0 until API works
        })
      }
    } catch (error) {
      console.error('❌ Error in fetchUserStats:', error)
      setStats({
        completed: 0,
        totalSaved: 0,
        totalMembers: 0
      })
    }
  }

  const joinChallenge = async (challenge: Challenge) => {
    if (joinedChallenges.includes(challenge.id) || joiningId) return
    
    const challengeId = challenge.id
    setJoiningId(challengeId)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Please login to join challenges')
        return
      }

      const response = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setJoinedChallenges([...joinedChallenges, challengeId])
        await fetchUserStats() // Refresh stats
        // Show success modal
        setSuccessChallengeTitle(challenge.title)
        setSuccessModalOpen(true)
      } else {
        const error = await response.json()
        // Check if already joined
        if (error.error?.includes('already have an active instance')) {
          setAlreadyJoinedModalOpen(true)
        } else {
          alert(error.error || 'Failed to join challenge')
        }
      }
    } catch (error) {
      console.error('Error joining challenge:', error)
      alert('Failed to join challenge')
    } finally {
      setJoiningId(null)
    }
  }

  const cancelChallenge = async (challengeId: string, challengeTitle: string) => {
    const userChallengeId = userChallengeMap[challengeId]
    if (!userChallengeId) return

    setCancelingChallengeId(challengeId)
    setCancelingChallengeTitle(challengeTitle)
    setCancelModalOpen(true)
  }

  const handleCancelChallenge = async () => {
    if (!cancelingChallengeId) return
    
    const userChallengeId = userChallengeMap[cancelingChallengeId]
    if (!userChallengeId) return
    
    setIsCanceling(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/challenges/${userChallengeId}/abandon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setPartialPointsEarned(result.partialPoints || 0)
        
        // Remove from joined challenges
        setJoinedChallenges(joinedChallenges.filter(id => id !== cancelingChallengeId))
        
        await fetchUserStats() // Refresh stats
        setCancelModalOpen(false)
        setCanceledModalOpen(true)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to cancel challenge')
      }
    } catch (error) {
      console.error('Error canceling challenge:', error)
      alert('Failed to cancel challenge')
    } finally {
      setIsCanceling(false)
      setCancelingChallengeId(null)
      setCancelingChallengeTitle('')
    }
  }

  // Categorize challenges based on title/description keywords
  const studentChallenges = challenges.filter(c => 
    c.title.includes('Daily Challenge') || 
    c.title.includes('Load Smart') || 
    c.title.includes('Transport Budget') ||
    c.duration_days <= 14
  )

  const graduateChallenges = challenges.filter(c => 
    c.title.includes('Salary') || 
    c.title.includes('Emergency Fund') || 
    c.title.includes('Investment') ||
    c.duration_days >= 30
  )

  const popularChallenges = challenges.filter(c => 
    c.title.includes('No-Spend') || 
    c.title.includes('Lutong Bahay') ||
    (c.total_participants > 1500)
  )

  // Icon mapping from database emoji to Lucide React component
  const getIconComponent = (iconEmoji: string) => {
    const iconMap: { [key: string]: any } = {
      '☕': Coffee,
      '🎯': Target,
      '📈': TrendingUp,
      '🐷': PiggyBank,
      '🏆': Trophy,
      '📚': BookOpen
    }
    return iconMap[iconEmoji] || Target
  }

  // Transform Challenge to display format
  const transformChallenge = (c: Challenge) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    duration: c.estimated_time_commitment || `${c.duration_days} days`,
    participants: c.total_participants,
    difficulty: c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1),
    category: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    icon: getIconComponent(c.icon || '🎯'),
    reward: `${c.points_full} points + ${c.badge_title || 'badge'}`,
    tips: c.requirements?.tips || [],
    estimatedSavings: c.requirements?.estimated_savings
  })

  const renderChallengeCard = (challenge: Challenge, isJoined: boolean) => {
    const displayChallenge = transformChallenge(challenge)
    const IconComponent = displayChallenge.icon
    
    return (
    <Card key={challenge.id} className="hover:shadow-xl transition-all duration-300 border-l-2 md:border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader className="pb-1 md:pb-4 p-1.5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-2">
          <div className="flex items-start space-x-1 md:space-x-3 flex-1 min-w-0">
            <div className="p-0.5 md:p-2 bg-primary/10 rounded flex-shrink-0">
              <IconComponent className="w-2.5 h-2.5 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-[10px] md:text-lg font-semibold text-gray-900 leading-tight">{displayChallenge.title}</CardTitle>
              <CardDescription className="mt-0.5 md:mt-1 text-gray-600 text-[8px] md:text-sm line-clamp-1 md:line-clamp-2">{displayChallenge.description}</CardDescription>
            </div>
          </div>
          <span className={`px-1 md:px-3 py-0.5 md:py-1 rounded-full text-[7px] md:text-xs font-semibold flex-shrink-0 self-start ${
            displayChallenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border border-green-200' :
            displayChallenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
            'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {displayChallenge.difficulty}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 p-1.5 md:p-6">
        <div className="space-y-1 md:space-y-4">
          <div className="flex items-center justify-between text-[8px] md:text-sm flex-wrap gap-0.5 md:gap-2">
            <div className="flex items-center space-x-1 md:space-x-4 text-gray-500">
              <div className="flex items-center space-x-0.5 md:space-x-1">
                <Calendar className="w-1.5 h-1.5 md:w-4 md:h-4" />
                <span>{displayChallenge.duration}</span>
              </div>
              <div className="flex items-center space-x-0.5 md:space-x-1">
                <Users className="w-1.5 h-1.5 md:w-4 md:h-4" />
                <span className="hidden lg:inline">{displayChallenge.participants.toLocaleString()} joined</span>
                <span className="lg:hidden">{displayChallenge.participants.toLocaleString()}</span>
              </div>
            </div>
            <span className="bg-primary/10 text-primary text-[7px] md:text-xs px-0.5 md:px-2 py-0.5 md:py-1 rounded-md font-medium">
              {displayChallenge.category}
            </span>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-1 md:p-4 rounded border border-green-100">
            <div className="flex items-start space-x-0.5 md:space-x-2">
              <Trophy className="w-1.5 h-1.5 md:w-4 md:h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800 text-[8px] md:text-sm leading-tight">Reward</h4>
                <p className="text-green-700 text-[8px] md:text-sm mt-0.5 md:mt-1 leading-tight">{displayChallenge.reward}</p>
              </div>
            </div>
          </div>

          <div className="space-y-0.5 md:space-y-2 hidden md:block">
            <h4 className="font-semibold text-[9px] md:text-sm text-gray-900 flex items-center space-x-1 md:space-x-2">
              <Target className="w-2 h-2 md:w-4 md:h-4 text-primary" />
              <span>Success Tips</span>
            </h4>
            <ul className="space-y-0.5 md:space-y-2">
              {displayChallenge.tips.slice(0, 2).map((tip: string, index: number) => (
                <li key={index} className="text-[9px] md:text-sm text-gray-600 flex items-start space-x-1 md:space-x-2">
                  <CheckCircle className="w-1.5 h-1.5 md:w-3 md:h-3 text-primary mt-0.5 md:mt-1 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {isJoined ? (
            <div className="flex gap-0.5 md:gap-2">
              <Button 
                className="flex-1 h-6 md:h-11 font-medium text-[8px] md:text-sm px-1 md:px-4" 
                variant="outline"
                disabled
              >
                <CheckCircle className="w-1.5 h-1.5 md:w-4 md:h-4 mr-0.5 md:mr-2" />
                <span className="hidden lg:inline">Challenge Joined</span>
                <span className="lg:hidden">Joined</span>
              </Button>
              <Button
                className="h-6 md:h-11 px-1 md:px-4 text-[8px] md:text-sm"
                variant="outline"
                onClick={() => cancelChallenge(challenge.id, challenge.title)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full h-6 md:h-11 font-medium transition-all duration-200 text-[8px] md:text-sm" 
              onClick={() => joinChallenge(challenge)}
              disabled={joiningId === challenge.id}
            >
              {joiningId === challenge.id ? (
                <>
                  <Loader2 className="w-1.5 h-1.5 md:w-4 md:h-4 mr-0.5 md:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Joining...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                'Join Challenge'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
  }

  // TODO: Dark mode under works
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="challenges" />

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Uniform Header */}
        <PageHeader
          title="Financial Challenges"
          description="Join fun, practical challenges designed for Filipino students and young professionals. Build better money habits while connecting with peers on the same journey."
          badge={{
            text: "Community Challenges",
            icon: Trophy
          }}
        />

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-20">
            <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-primary animate-spin mb-4" />
            <p className="text-gray-600 text-sm md:text-base">Loading challenges...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-2 md:gap-6 mb-4 md:mb-12">
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
                <CardContent className="text-center pt-2 md:pt-6 pb-2 md:pb-6 px-1 md:px-6">
                  <div className="p-1 md:p-3 bg-yellow-500 rounded-full w-fit mx-auto mb-1 md:mb-3">
                    <Trophy className="w-3 h-3 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-sm md:text-2xl font-bold text-gray-900">{stats.completed}</h3>
                  <p className="text-gray-600 font-medium text-[8px] md:text-base leading-tight">Completed</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="text-center pt-2 md:pt-6 pb-2 md:pb-6 px-1 md:px-6">
                  <div className="p-1 md:p-3 bg-blue-500 rounded-full w-fit mx-auto mb-1 md:mb-3">
                    <Users className="w-3 h-3 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-sm md:text-2xl font-bold text-gray-900">{stats.totalMembers.toLocaleString()}</h3>
                  <p className="text-gray-600 font-medium text-[8px] md:text-base leading-tight">Members</p>
                </CardContent>
              </Card>
            </div>

            {/* Student Challenges */}
            <div className="mb-6 md:mb-12">
          <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">Student Challenges</h2>
          </div>
          <p className="text-gray-600 mb-4 md:mb-6 text-xs md:text-lg">Perfect for college students managing allowances and building first financial habits.</p>
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6">
            {studentChallenges.map((challenge) => 
              renderChallengeCard(challenge, joinedChallenges.includes(challenge.id))
            )}
          </div>
        </div>

        {/* Graduate Challenges */}
        <div className="mb-6 md:mb-12">
          <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg">
              <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">Fresh Graduate Challenges</h2>
          </div>
          <p className="text-gray-600 mb-4 md:mb-6 text-xs md:text-lg">Level up your financial game with your first salary and career goals.</p>
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6">
            {graduateChallenges.map((challenge) => 
              renderChallengeCard(challenge, joinedChallenges.includes(challenge.id))
            )}
          </div>
        </div>

        {/* Join Challenge Success Modal */}
        <JoinChallengeSuccessModal
          isOpen={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          challengeTitle={successChallengeTitle}
        />

        {/* Already Joined Modal */}
        <AlreadyJoinedModal
          isOpen={alreadyJoinedModalOpen}
          onClose={() => setAlreadyJoinedModalOpen(false)}
        />

        {/* Cancel Challenge Confirmation Modal */}
        <CancelChallengeModal
          isOpen={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false)
            setCancelingChallengeId(null)
            setCancelingChallengeTitle('')
          }}
          onConfirm={handleCancelChallenge}
          challengeTitle={cancelingChallengeTitle}
          isLoading={isCanceling}
        />

        {/* Challenge Canceled Success Modal */}
        <ChallengeCanceledModal
          isOpen={canceledModalOpen}
          onClose={() => setCanceledModalOpen(false)}
          partialPoints={partialPointsEarned}
        />
          </>
        )}
      </div>
    </div>
  )
}
