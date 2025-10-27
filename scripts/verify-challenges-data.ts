import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function verifyUserChallenges() {
  console.log('🔍 Fetching all user_challenges data...\n')

  try {
    // Fetch all user_challenges
    const { data: allChallenges, error } = await supabase
      .from('user_challenges')
      .select('id, user_id, challenge_id, status, progress, joined_at')
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching data:', error)
      return
    }

    if (!allChallenges || allChallenges.length === 0) {
      console.log('⚠️  NO DATA FOUND in user_challenges table!')
      console.log('📊 Total records: 0')
      console.log('\n🤔 This means either:')
      console.log('   1. The table is empty (no users have joined challenges)')
      console.log('   2. There might be an issue with the table structure')
      console.log('   3. The query permissions are incorrect')
      return
    }

    console.log('✅ Data found!')
    console.log(`📊 Total challenge records: ${allChallenges.length}`)
    
    // Calculate unique users
    const uniqueUserIds = new Set(allChallenges.map(uc => uc.user_id))
    console.log(`👥 Unique users who joined challenges: ${uniqueUserIds.size}`)
    
    // Count by status
    const statusCounts: {[key: string]: number} = {}
    allChallenges.forEach(uc => {
      statusCounts[uc.status] = (statusCounts[uc.status] || 0) + 1
    })
    
    console.log('\n📈 Breakdown by status:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })
    
    // Show sample of user IDs
    console.log('\n👤 Sample user IDs (first 10):')
    Array.from(uniqueUserIds).slice(0, 10).forEach((userId, index) => {
      const userChallenges = allChallenges.filter(uc => uc.user_id === userId)
      console.log(`   ${index + 1}. ${userId.substring(0, 8)}... (${userChallenges.length} challenges)`)
    })
    
    // Show if there are users with multiple challenges
    const challengeCountByUser: {[key: string]: number} = {}
    allChallenges.forEach(uc => {
      challengeCountByUser[uc.user_id] = (challengeCountByUser[uc.user_id] || 0) + 1
    })
    
    const usersWithMultiple = Object.entries(challengeCountByUser)
      .filter(([_, count]) => count > 1)
      .length
    
    console.log(`\n🔢 Users with multiple challenges: ${usersWithMultiple}`)
    console.log(`🔢 Users with single challenge: ${uniqueUserIds.size - usersWithMultiple}`)
    
    // Show most recent entries
    console.log('\n📅 Most recent 5 challenge entries:')
    allChallenges.slice(0, 5).forEach((uc, index) => {
      console.log(`   ${index + 1}. User: ${uc.user_id.substring(0, 8)}... | Challenge: ${uc.challenge_id.substring(0, 8)}... | Status: ${uc.status} | Progress: ${uc.progress}% | Joined: ${new Date(uc.joined_at).toLocaleDateString()}`)
    })

    // Verify the count that the API would return
    console.log('\n✅ VERIFICATION RESULT:')
    console.log(`   The API endpoint should return: ${uniqueUserIds.size} members`)
    console.log(`   If you're seeing a different number, there might be an issue with the API logic.`)
    
  } catch (err) {
    console.error('❌ Exception occurred:', err)
  }
}

// Run the verification
verifyUserChallenges()
  .then(() => {
    console.log('\n✅ Verification complete!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Verification failed:', err)
    process.exit(1)
  })
