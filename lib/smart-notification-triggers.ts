/**
 * Smart Notification Triggers
 * Phase 3: Automatically create notifications based on user activity and behavior
 */

import { createClient } from '@supabase/supabase-js'

interface NotificationData {
  user_id: string
  type: 'bill_reminder' | 'learning' | 'achievement' | 'budget_alert' | 'system'
  title: string
  message: string
  action_url?: string
  metadata?: any
}

/**
 * Create a notification in the database
 */
async function createNotification(data: NotificationData) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        action_url: data.action_url || null,
        metadata: data.metadata || {},
        is_read: false
      })
      .select()
      .single()

    if (error) throw error
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

/**
 * Check if user has this notification type enabled in preferences
 */
async function isNotificationEnabled(
  user_id: string,
  type: 'bill_reminders' | 'budget_alerts' | 'learning_prompts' | 'achievements'
): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select(type)
      .eq('user_id', user_id)
      .maybeSingle()

    if (error) throw error
    return data ? (data as any)[type] : true // Default to true if no preference set
  } catch (error) {
    console.error('Error checking notification preference:', error)
    return true // Default to enabled
  }
}

// ============================================
// 1. BUDGET ALERT TRIGGERS
// ============================================

/**
 * Check if user has exceeded budget percentage and send alert
 * @param user_id - User ID
 * @param spent - Amount spent this month
 * @param budget - Monthly budget limit
 * @param threshold - Percentage threshold (default 90)
 */
export async function checkBudgetAlert(
  user_id: string,
  spent: number,
  budget: number,
  threshold: number = 90
) {
  try {
    // Check if budget alerts are enabled
    const enabled = await isNotificationEnabled(user_id, 'budget_alerts')
    if (!enabled) return

    // Calculate percentage spent
    const percentage = (spent / budget) * 100

    // Only send if threshold reached
    if (percentage < threshold) return

    // Check if we already sent a notification for this threshold
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: existingNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user_id)
      .eq('type', 'budget_alert')
      .gte('created_at', new Date(new Date().setDate(1)).toISOString()) // This month only
      .limit(1)
      .maybeSingle()

    // Don't spam - only one budget alert per month
    if (existingNotif) return

    // Create notification
    await createNotification({
      user_id,
      type: 'budget_alert',
      title: 'Budget Alert',
      message: `You've spent ₱${spent.toLocaleString()} of your ₱${budget.toLocaleString()} budget (${Math.round(percentage)}%)`,
      action_url: '/dashboard',
      metadata: { spent, budget, percentage: Math.round(percentage) }
    })

    console.log(`Budget alert sent to user ${user_id}: ${Math.round(percentage)}%`)
  } catch (error) {
    console.error('Error in checkBudgetAlert:', error)
  }
}

// ============================================
// 2. LEARNING PROMPT TRIGGERS
// ============================================

/**
 * Send learning prompt if user hasn't visited Learning Hub recently
 * @param user_id - User ID
 * @param daysSinceLastVisit - Number of days since last visit to Learning Hub
 * @param threshold - Days threshold to trigger (default 5)
 */
export async function checkLearningPrompt(
  user_id: string,
  daysSinceLastVisit: number,
  threshold: number = 5
) {
  try {
    // Check if learning prompts are enabled
    const enabled = await isNotificationEnabled(user_id, 'learning_prompts')
    if (!enabled) return

    // Only send if threshold reached
    if (daysSinceLastVisit < threshold) return

    // Check if we already sent a learning prompt this week
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const { data: recentNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user_id)
      .eq('type', 'learning')
      .gte('created_at', oneWeekAgo.toISOString())
      .limit(1)
      .maybeSingle()

    // Don't spam - only one learning prompt per week
    if (recentNotif) return

    // Get a random learning module suggestion
    const learningModules = [
      { title: 'Emergency Fund Basics', lesson_id: 'emergency-fund' },
      { title: 'Credit Cards Explained', lesson_id: 'credit-cards' },
      { title: 'Investing 101', lesson_id: 'investing-101' },
      { title: 'Budgeting Strategies', lesson_id: 'budgeting' },
      { title: 'Saving Money Tips', lesson_id: 'saving-tips' }
    ]

    const randomModule = learningModules[Math.floor(Math.random() * learningModules.length)]

    // Create notification
    await createNotification({
      user_id,
      type: 'learning',
      title: 'Ready to learn something new?',
      message: `You haven't visited the Learning Hub in ${daysSinceLastVisit} days. Check out "${randomModule.title}"!`,
      action_url: '/learning',
      metadata: { lesson_id: randomModule.lesson_id, days_since_visit: daysSinceLastVisit }
    })

    console.log(`Learning prompt sent to user ${user_id}: ${daysSinceLastVisit} days inactive`)
  } catch (error) {
    console.error('Error in checkLearningPrompt:', error)
  }
}

// ============================================
// 3. GOAL MILESTONE TRIGGERS
// ============================================

/**
 * Send achievement notification when goal reaches milestone
 * @param user_id - User ID
 * @param goal_name - Name of the goal
 * @param current_amount - Current progress amount
 * @param target_amount - Target goal amount
 * @param goal_id - Goal ID
 */
export async function checkGoalMilestone(
  user_id: string,
  goal_name: string,
  current_amount: number,
  target_amount: number,
  goal_id: string
) {
  try {
    // Check if achievement notifications are enabled
    const enabled = await isNotificationEnabled(user_id, 'achievements')
    if (!enabled) return

    const percentage = (current_amount / target_amount) * 100

    // Milestone thresholds: 50%, 75%, 90%, 100%
    const milestones = [
      { threshold: 50, title: 'Halfway There!', message: `You're 50% of the way to ${goal_name}!` },
      { threshold: 75, title: 'Great Progress!', message: `You're 75% of the way to ${goal_name}!` },
      { threshold: 90, title: 'Almost There!', message: `You're 90% of the way to ${goal_name}!` },
      { threshold: 100, title: 'Goal Achieved! 🎉', message: `Congratulations! You reached your ${goal_name} goal of ₱${target_amount.toLocaleString()}!` }
    ]

    // Find the highest milestone reached
    const milestone = milestones
      .filter((m) => percentage >= m.threshold)
      .sort((a, b) => b.threshold - a.threshold)[0]

    if (!milestone) return

    // Check if we already sent notification for this milestone
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: existingNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user_id)
      .eq('type', 'achievement')
      .contains('metadata', { goal_id, milestone: milestone.threshold })
      .limit(1)
      .maybeSingle()

    // Don't send duplicate milestone notifications
    if (existingNotif) return

    // Create notification
    await createNotification({
      user_id,
      type: 'achievement',
      title: milestone.title,
      message: milestone.message,
      action_url: '/goals',
      metadata: {
        goal_id,
        goal_name,
        milestone: milestone.threshold,
        current_amount,
        target_amount,
        percentage: Math.round(percentage)
      }
    })

    console.log(`Goal milestone notification sent to user ${user_id}: ${goal_name} ${milestone.threshold}%`)
  } catch (error) {
    console.error('Error in checkGoalMilestone:', error)
  }
}

// ============================================
// 4. CHALLENGE COMPLETION TRIGGERS
// ============================================

/**
 * Send achievement notification when challenge is completed
 * @param user_id - User ID
 * @param challenge_name - Name of the challenge
 * @param challenge_id - Challenge ID
 * @param reward_points - Points earned (optional)
 */
export async function notifyChallengeComplete(
  user_id: string,
  challenge_name: string,
  challenge_id: string,
  reward_points?: number
) {
  try {
    // Check if achievement notifications are enabled
    const enabled = await isNotificationEnabled(user_id, 'achievements')
    if (!enabled) return

    // Create notification
    let message = `You completed the ${challenge_name}!`
    if (reward_points) {
      message += ` You earned ${reward_points} points!`
    }

    await createNotification({
      user_id,
      type: 'achievement',
      title: 'Challenge Complete!',
      message,
      action_url: '/challenges',
      metadata: { challenge_id, challenge_name, reward_points }
    })

    console.log(`Challenge completion notification sent to user ${user_id}: ${challenge_name}`)
  } catch (error) {
    console.error('Error in notifyChallengeComplete:', error)
  }
}

// ============================================
// 5. FIRST TRANSACTION CELEBRATION
// ============================================

/**
 * Send achievement notification for first transaction
 * @param user_id - User ID
 */
export async function notifyFirstTransaction(user_id: string) {
  try {
    // Check if achievement notifications are enabled
    const enabled = await isNotificationEnabled(user_id, 'achievements')
    if (!enabled) return

    // Check if we already sent this notification
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: existingNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user_id)
      .eq('type', 'achievement')
      .contains('metadata', { achievement_type: 'first_transaction' })
      .limit(1)
      .maybeSingle()

    if (existingNotif) return

    // Create notification
    await createNotification({
      user_id,
      type: 'achievement',
      title: 'Great Start!',
      message: 'You added your first transaction! Keep tracking to build better financial habits.',
      action_url: '/transactions',
      metadata: { achievement_type: 'first_transaction' }
    })

    console.log(`First transaction notification sent to user ${user_id}`)
  } catch (error) {
    console.error('Error in notifyFirstTransaction:', error)
  }
}

// ============================================
// 6. BILL PAYMENT REMINDER
// ============================================

/**
 * Send bill reminder notification
 * @param user_id - User ID
 * @param bill_name - Name of the bill
 * @param amount - Bill amount
 * @param due_day - Day of month bill is due
 * @param days_until_due - Days until due date
 * @param bill_id - Bill ID
 */
export async function sendBillReminder(
  user_id: string,
  bill_name: string,
  amount: number,
  due_day: number,
  days_until_due: number,
  bill_id: string
) {
  try {
    // Check if bill reminders are enabled
    const enabled = await isNotificationEnabled(user_id, 'bill_reminders')
    if (!enabled) return

    // Check if we already sent reminder for this bill this month
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const startOfMonth = new Date(new Date().setDate(1))
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: existingNotifs, error: checkError } = await supabase
      .from('notifications')
      .select('id, metadata')
      .eq('user_id', user_id)
      .eq('type', 'bill_reminder')
      .gte('created_at', startOfMonth.toISOString())

    if (checkError) {
      console.error('Error checking existing notifications:', checkError)
    }

    // Check if any existing notification is for this specific bill
    const hasBillNotif = existingNotifs?.some((notif) => 
      notif.metadata && typeof notif.metadata === 'object' && 
      (notif.metadata as any).bill_id === bill_id
    )

    if (hasBillNotif) {
      console.log(`Bill reminder already sent for ${bill_name} this month`)
      return
    }

    // Create notification message
    let message = `Your ${bill_name} bill of ₱${amount.toLocaleString()} is `
    if (days_until_due === 0) {
      message += 'due today'
    } else if (days_until_due === 1) {
      message += 'due tomorrow'
    } else {
      message += `due in ${days_until_due} days (day ${due_day})`
    }

    await createNotification({
      user_id,
      type: 'bill_reminder',
      title: days_until_due === 0 ? `${bill_name} Due Today!` : `${bill_name} Due Soon`,
      message,
      action_url: '/dashboard',
      metadata: { bill_id, bill_name, amount, due_day, days_until_due }
    })

    console.log(`Bill reminder sent to user ${user_id}: ${bill_name} in ${days_until_due} days`)
  } catch (error) {
    console.error('Error in sendBillReminder:', error)
  }
}

// Export all trigger functions
export const SmartTriggers = {
  checkBudgetAlert,
  checkLearningPrompt,
  checkGoalMilestone,
  notifyChallengeComplete,
  notifyFirstTransaction,
  sendBillReminder
}
