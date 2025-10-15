import { ChatOpenAI } from "@langchain/openai"
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { DynamicTool } from "langchain/tools"
// import { EnhancedLangChainMemory } from './langchain-memory'
import { WebSearchService } from './web-search'
import { findLearningResources, getBeginnerFriendlySkills } from './learning-resources'

// Helper function to get the correct API base URL for server-side calls
function getApiBaseUrl(): string {
  let url: string
  
  // On Vercel, use VERCEL_URL (automatically set)
  if (process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`
  } else {
    // Fallback to NEXT_PUBLIC_SITE_URL or localhost
    url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  }
  
  console.log('🌐 API Base URL:', url)
  console.log('  VERCEL_URL:', process.env.VERCEL_URL || 'not set')
  console.log('  NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'not set')
  
  return url
}

export class PlounixAIAgent {
  private llm: ChatOpenAI
  private memoryManager: any // EnhancedLangChainMemory
  private webSearch: WebSearchService

  constructor() {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables')
    }
    
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.memoryManager = null // new EnhancedLangChainMemory()
    this.webSearch = new WebSearchService()
  }

  private createFinancialTools() {
    return [
      // Web Search Tools - Real-time information
      new DynamicTool({
        name: "search_web",
        description: "Search the internet for current information, news, prices, financial data, or any real-time information. Use this when users ask about current events, prices, news, bank rates, or any information that changes over time.",
        func: async (input: string) => {
          try {
            console.log('🔍 search_web called with:', input)
            const results = await this.webSearch.searchWeb(input)
            console.log('📦 Search results:', results.length, 'items')
            return JSON.stringify(results.slice(0, 3), null, 2)
          } catch (error) {
            console.error('❌ Web search error:', error)
            return "Web search is temporarily unavailable. Please try again later."
          }
        },
      }),

      new DynamicTool({
        name: "get_current_prices",
        description: "Get current prices for items or products in the Philippines from shopping sites like Lazada and Shopee. Use this when users ask 'how much does X cost' or 'what's the price of X'.",
        func: async (input: string) => {
          try {
            console.log('🔍 get_current_prices called with:', input)
            const results = await this.webSearch.getCurrentPrice(input)
            console.log('📦 Price results:', results)
            return JSON.stringify(results, null, 2)
          } catch (error) {
            console.error('❌ Price search error:', error)
            return "Price search is temporarily unavailable. Please try again later."
          }
        },
      }),

      new DynamicTool({
        name: "get_bank_rates",
        description: "Get current bank interest rates in the Philippines. Use this when users ask about savings account rates, time deposit rates, or interest rates from Philippine banks.",
        func: async () => {
          try {
            const results = await this.webSearch.getBankRates()
            return JSON.stringify(results, null, 2)
          } catch (error) {
            return "Bank rate information is temporarily unavailable. Please try again later."
          }
        },
      }),

      new DynamicTool({
        name: "search_financial_news",
        description: "Get the latest financial news from the Philippines. Use this when users ask about recent financial news, BSP updates, banking news, or investment news.",
        func: async () => {
          try {
            const results = await this.webSearch.searchFinancialNews()
            return JSON.stringify(results, null, 2)
          } catch (error) {
            return "Financial news is temporarily unavailable. Please try again later."
          }
        },
      }),

      // Work and Earning Opportunities Tools
      new DynamicTool({
        name: "suggest_work_opportunities",
        description: "Suggest real freelancing and job opportunities based on user's skills, hobbies, and financial goals. Use this when users ask about earning money, finding jobs, freelancing, or need income to reach savings goals.",
        func: async (input: string) => {
          try {
            console.log('💼 suggest_work_opportunities called with:', input)
            const workSuggestions = this.generateWorkSuggestions(input)
            return JSON.stringify(workSuggestions, null, 2)
          } catch (error) {
            console.error('❌ Work suggestions error:', error)
            return "Work opportunity search is temporarily unavailable. Please try again later."
          }
        },
      }),

      // Learning Resources Tool
      new DynamicTool({
        name: "suggest_learning_resources",
        description: "**CRITICAL TOOL** Suggest learning resources (YouTube videos, websites, online courses) when user wants to learn a skill. MUST USE when user mentions: 'learn', 'video editing', 'graphic design', 'web development', 'coding', 'freelancing', 'where to study', 'not good at', or ANY skill learning. Returns ACTUAL CLICKABLE URLs. DO NOT give generic advice like 'search YouTube' - use this tool instead to get real links.",
        func: async (input: string) => {
          try {
            console.log('📚 suggest_learning_resources called with:', input)
            
            // Search for relevant learning resources
            const matches = findLearningResources(input)
            
            if (matches.length > 0) {
              return JSON.stringify({
                foundSkills: matches.map(skill => ({
                  skill: skill.skill,
                  category: skill.category,
                  description: skill.description,
                  averageEarning: skill.averageEarning,
                  timeToLearn: skill.timeToLearn,
                  topResources: skill.resources.slice(0, 5).map(resource => ({
                    title: resource.title,
                    url: resource.url,
                    type: resource.type,
                    provider: resource.provider,
                    difficulty: resource.difficulty,
                    duration: resource.duration,
                    isFree: resource.isFree,
                    description: resource.description
                  }))
                })),
                totalSkillsFound: matches.length
              }, null, 2)
            } else {
              // If no specific match, show beginner-friendly options
              const beginnerSkills = getBeginnerFriendlySkills()
              return JSON.stringify({
                message: "No exact match found. Here are beginner-friendly skills you can learn:",
                recommendedSkills: beginnerSkills.map(skill => ({
                  skill: skill.skill,
                  category: skill.category,
                  description: skill.description,
                  averageEarning: skill.averageEarning,
                  timeToLearn: skill.timeToLearn,
                  topResources: skill.resources.slice(0, 3).map(resource => ({
                    title: resource.title,
                    url: resource.url,
                    type: resource.type,
                    difficulty: resource.difficulty,
                    isFree: resource.isFree
                  }))
                }))
              }, null, 2)
            }
          } catch (error) {
            console.error('❌ Learning resources error:', error)
            return "Learning resource search is temporarily unavailable. Please try again later."
          }
        },
      }),

      // Goal Creation Tool
      new DynamicTool({
        name: "create_financial_goal",
        description: "**CRITICAL TOOL** Create a financial goal for the user directly in the database. Use this when user mentions wanting to save for something, has a financial target, or when you identify a goal they should pursue. Required: userId (from context), title, targetAmount. Optional: description, currentAmount, category, deadline (ISO date string like '2025-12-31'), icon, color. ALWAYS ask user for deadline before creating goal. ALWAYS use this tool when you suggest creating a goal - DON'T just mention it, actually create it!",
        func: async (input: string) => {
          try {
            console.log('🎯 create_financial_goal called with:', input)
            
            // Parse the input (expecting JSON string with goal details)
            let goalData
            try {
              goalData = JSON.parse(input)
            } catch (e) {
              return JSON.stringify({
                error: "Invalid input format. Please provide goal details as JSON with: userId, title, targetAmount (required), and optional: description, currentAmount, category, deadline, icon, color"
              })
            }

            // Make API call to create goal
            const apiUrl = `${getApiBaseUrl()}/api/goals/create`
            console.log('📡 Calling API:', apiUrl)
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...goalData,
                aiGenerated: true
              })
            })

            console.log('📥 Response status:', response.status, response.statusText)
            
            if (!response.ok) {
              const errorText = await response.text()
              console.log('❌ Error response:', errorText)
              let error
              try {
                error = JSON.parse(errorText)
              } catch {
                error = { error: errorText }
              }
              return JSON.stringify({
                success: false,
                error: error.error || 'Failed to create goal',
                details: error.details,
                status: response.status
              })
            }

            const result = await response.json()
            console.log('✅ Goal created successfully:', result.goal)
            
            return JSON.stringify({
              success: true,
              goal: result.goal,
              message: `Goal "${result.goal.title}" successfully created! Target: ₱${result.goal.target_amount.toLocaleString()}`
            })
          } catch (error) {
            console.error('❌ Goal creation error:', error)
            return JSON.stringify({
              success: false,
              error: "Failed to create goal. Please try again later."
            })
          }
        },
      }),

      // Transaction Management Tools
      new DynamicTool({
        name: "add_expense",
        description: "Add an expense transaction for the user. Use this when user mentions spending money, buying something, or paying for something. Required: userId, amount. Optional: merchant, category, paymentMethod, notes, date.",
        func: async (input: string) => {
          try {
            console.log('💸 add_expense called with:', input)
            
            let expenseData
            try {
              expenseData = JSON.parse(input)
            } catch (e) {
              return JSON.stringify({
                error: "Invalid input format. Please provide expense details as JSON"
              })
            }

            const response = await fetch(`${getApiBaseUrl()}/api/transactions/add`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...expenseData,
                transactionType: 'expense'
              })
            })

            if (!response.ok) {
              const error = await response.json()
              return JSON.stringify({
                success: false,
                error: error.error || 'Failed to add expense'
              })
            }

            const result = await response.json()
            console.log('✅ Expense added:', result.transaction)
            return JSON.stringify({
              success: true,
              transaction: result.transaction,
              message: result.message
            })
          } catch (error) {
            console.error('❌ Expense creation error:', error)
            return JSON.stringify({
              success: false,
              error: "Failed to add expense. Please try again later."
            })
          }
        },
      }),

      new DynamicTool({
        name: "add_income",
        description: "Add an income transaction for the user. Use this when user mentions receiving money, getting paid, earning, or any income source. Required: userId, amount. Optional: merchant (source), category, paymentMethod, notes, date.",
        func: async (input: string) => {
          try {
            console.log('💰 add_income called with:', input)
            
            let incomeData
            try {
              incomeData = JSON.parse(input)
            } catch (e) {
              return JSON.stringify({
                error: "Invalid input format. Please provide income details as JSON"
              })
            }

            const response = await fetch(`${getApiBaseUrl()}/api/transactions/add`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...incomeData,
                transactionType: 'income'
              })
            })

            if (!response.ok) {
              const error = await response.json()
              return JSON.stringify({
                success: false,
                error: error.error || 'Failed to add income'
              })
            }

            const result = await response.json()
            console.log('✅ Income added:', result.transaction)
            return JSON.stringify({
              success: true,
              transaction: result.transaction,
              message: result.message
            })
          } catch (error) {
            console.error('❌ Income creation error:', error)
            return JSON.stringify({
              success: false,
              error: "Failed to add income. Please try again later."
            })
          }
        },
      }),

      new DynamicTool({
        name: "get_financial_summary",
        description: "**CRITICAL: Use this tool when user asks about their current income, expenses, balance, financial totals, goals progress, learning progress, challenges, or monthly bills.** Fetches comprehensive user data including: transactions, goals, learning modules completed, active challenges, and scheduled monthly bills. **MUST call this when user asks about bills/recurring expenses!** **ALWAYS call this when user mentions the word 'bills' in ANY context!** Use when user asks: 'what's my total income', 'how much did I earn', 'what's my balance', 'check my progress', 'how many modules have I completed', 'show my goals', 'what challenges am I doing', 'what are my monthly bills', 'list my bills', 'list my active bills', 'show my bills', 'my active monthly bills', 'show my recurring expenses', 'my monthly bills', 'my subscriptions'. Required: userId.",
        func: async (input: string) => {
          try {
            console.log('💼 get_financial_summary called with:', input)
            
            let queryData
            try {
              queryData = JSON.parse(input)
            } catch (e) {
              return JSON.stringify({
                error: "Invalid input format. Please provide userId as JSON: {\"userId\": \"user-id-here\"}"
              })
            }

            if (!queryData.userId) {
              return JSON.stringify({
                error: "userId is required"
              })
            }

            // Fetch data from database using Supabase (server-side)
            const { createClient } = await import('@supabase/supabase-js')
            const supabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).trim()
            )

            // Fetch transactions
            const { data: transactions, error: transError } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', queryData.userId)
              .order('date', { ascending: false })

            if (transError) {
              console.error('❌ Error fetching transactions:', transError)
            }

            // Fetch goals
            const { data: goals, error: goalsError } = await supabase
              .from('goals')
              .select('*')
              .eq('user_id', queryData.userId)
              .order('created_at', { ascending: false })

            if (goalsError) {
              console.error('❌ Error fetching goals:', goalsError)
            }

            // Fetch learning progress
            const { data: learningProgress, error: learningError } = await supabase
              .from('learning_reflections')
              .select('*')
              .eq('user_id', queryData.userId)

            if (learningError) {
              console.error('❌ Error fetching learning progress:', learningError)
            }

            // Fetch active challenges
            const { data: challenges, error: challengesError } = await supabase
              .from('user_challenges')
              .select('*, challenges(*)')
              .eq('user_id', queryData.userId)
              .order('joined_at', { ascending: false })

            if (challengesError) {
              console.error('❌ Error fetching challenges:', challengesError)
            }

            // Fetch user profile data (CRITICAL: Get monthly_income!)
            const { data: userProfile, error: profileError } = await supabase
              .from('user_profiles')
              .select('name, age, monthly_income, email')
              .eq('user_id', queryData.userId)
              .single()

            if (profileError) {
              console.error('❌ Error fetching user profile:', profileError)
            }

            // Fetch monthly bills (scheduled payments)
            const { data: monthlyBills, error: billsError } = await supabase
              .from('scheduled_payments')
              .select('*')
              .eq('user_id', queryData.userId)
              .order('due_day', { ascending: true })

            if (billsError) {
              console.error('❌ Error fetching monthly bills:', billsError)
            }

            // Calculate transaction totals
            const totalIncome = transactions
              ?.filter(t => t.transaction_type === 'income')
              .reduce((sum, t) => sum + (t.amount || 0), 0) || 0

            const totalExpenses = transactions
              ?.filter(t => t.transaction_type === 'expense')
              .reduce((sum, t) => sum + (t.amount || 0), 0) || 0

            const balance = totalIncome - totalExpenses

            // Get recent transactions (last 5)
            const recentTransactions = transactions?.slice(0, 5).map(t => ({
              type: t.transaction_type,
              amount: t.amount,
              merchant: t.merchant || t.category,
              category: t.category,
              date: t.date
            }))

            // Calculate goals statistics
            const totalGoals = goals?.length || 0
            const completedGoals = goals?.filter(g => g.is_completed)?.length || 0
            const activeGoals = goals?.filter(g => !g.is_completed)?.length || 0
            const totalGoalAmount = goals?.reduce((sum, g) => sum + (g.target_amount || 0), 0) || 0
            const totalSavedTowardsGoals = goals?.reduce((sum, g) => sum + (g.current_amount || 0), 0) || 0

            // Get goal details
            const goalsDetails = goals?.slice(0, 5).map(g => ({
              title: g.title,
              targetAmount: g.target_amount,
              currentAmount: g.current_amount,
              progress: g.current_amount && g.target_amount ? ((g.current_amount / g.target_amount) * 100).toFixed(1) + '%' : '0%',
              deadline: g.deadline,
              isCompleted: g.is_completed
            }))

            // Calculate learning statistics
            const completedModules = learningProgress?.length || 0
            const totalModules = 16 // Total modules available in the platform
            const learningPercentage = ((completedModules / totalModules) * 100).toFixed(1)

            // Get completed module details WITH reflection answers
            const completedModulesList = learningProgress?.slice(0, 5).map(m => ({
              moduleId: m.module_id,
              completedAt: m.created_at
            }))

            // Get user's reflection answers for AI to analyze
            const reflectionAnswers = learningProgress?.map(r => ({
              moduleId: r.module_id,
              phase: r.phase,
              question: r.question,
              answer: r.answer,
              sentiment: r.sentiment,
              extractedInsights: r.extracted_insights,
              completedAt: r.created_at
            })) || []

            // Organize reflections by topic for better AI understanding
            const reflectionsByModule = reflectionAnswers.reduce((acc: any, r) => {
              if (!acc[r.moduleId]) {
                acc[r.moduleId] = []
              }
              acc[r.moduleId].push({
                phase: r.phase,
                question: r.question,
                answer: r.answer,
                sentiment: r.sentiment
              })
              return acc
            }, {})

            // Calculate challenges statistics
            const activeChallenges = challenges?.filter(c => c.status === 'active' || c.status === 'in_progress')?.length || 0
            const completedChallenges = challenges?.filter(c => c.status === 'completed')?.length || 0
            const totalChallenges = challenges?.length || 0

            // Get challenge details
            const challengeDetails = challenges?.slice(0, 5).map(c => ({
              title: c.challenges?.title || 'Challenge',
              status: c.status,
              progress: c.progress,
              reward: c.challenges?.reward_points,
              joinedAt: c.joined_at,
              completedAt: c.completed_at
            }))

            // Calculate monthly bills statistics
            const activeBills = monthlyBills?.filter(b => b.is_active) || []
            const totalMonthlyObligation = activeBills.reduce((sum, b) => sum + (b.amount || 0), 0)
            
            // Group bills by category
            const billsByCategory = activeBills.reduce((acc: any, b) => {
              const category = b.category || 'Other'
              if (!acc[category]) {
                acc[category] = { count: 0, total: 0, bills: [] }
              }
              acc[category].count++
              acc[category].total += b.amount
              acc[category].bills.push({
                name: b.name,
                amount: b.amount,
                dueDay: b.due_day
              })
              return acc
            }, {})

            // Get upcoming bills (next 7 days)
            const today = new Date().getDate()
            const upcomingBills = activeBills.filter(b => {
              const daysUntilDue = b.due_day - today
              return daysUntilDue >= 0 && daysUntilDue <= 7
            }).map(b => ({
              name: b.name,
              amount: b.amount,
              category: b.category,
              dueDay: b.due_day,
              daysUntil: b.due_day - today
            }))

            // Get all active bills
            const allActiveBills = activeBills.map(b => ({
              name: b.name,
              amount: b.amount,
              category: b.category,
              dueDay: b.due_day,
              description: b.description
            }))

            return JSON.stringify({
              success: true,
              userProfile: {
                name: userProfile?.name || 'User',
                age: userProfile?.age,
                monthlyIncome: userProfile?.monthly_income || 0,
                email: userProfile?.email
              },
              financial: {
                totalIncome,
                totalExpenses,
                currentBalance: balance,
                transactionCount: transactions?.length || 0,
                recentTransactions
              },
              goals: {
                total: totalGoals,
                completed: completedGoals,
                active: activeGoals,
                totalTargetAmount: totalGoalAmount,
                totalSaved: totalSavedTowardsGoals,
                progressPercentage: totalGoalAmount > 0 ? ((totalSavedTowardsGoals / totalGoalAmount) * 100).toFixed(1) + '%' : '0%',
                details: goalsDetails
              },
              learning: {
                completedModules,
                totalModules,
                progressPercentage: learningPercentage + '%',
                completedModulesList,
                reflectionAnswers: reflectionAnswers.slice(0, 10), // Return last 10 reflections for context
                reflectionsByModule // Organized by module for better understanding
              },
              challenges: {
                active: activeChallenges,
                completed: completedChallenges,
                total: totalChallenges,
                details: challengeDetails
              },
              monthlyBills: {
                total: activeBills.length,
                totalMonthlyAmount: totalMonthlyObligation,
                byCategory: billsByCategory,
                upcoming: upcomingBills,
                allBills: allActiveBills
              },
              message: `Complete Summary - User: ${userProfile?.name || 'User'} | Monthly Income: ₱${(userProfile?.monthly_income || 0).toLocaleString()}/month | Monthly Bills: ${activeBills.length} bills totaling ₱${totalMonthlyObligation.toLocaleString()}/month | Net Monthly: ₱${((userProfile?.monthly_income || 0) - totalMonthlyObligation).toLocaleString()} | Financial: Transactions Income ₱${totalIncome.toLocaleString()}, Expenses ₱${totalExpenses.toLocaleString()}, Balance ₱${balance.toLocaleString()} | Goals: ${completedGoals}/${totalGoals} completed (₱${totalSavedTowardsGoals.toLocaleString()} saved) | Learning: ${completedModules}/${totalModules} modules (${learningPercentage}%) | Challenges: ${activeChallenges} active, ${completedChallenges} completed`
            })
          } catch (error) {
            console.error('❌ Financial summary error:', error)
            return JSON.stringify({
              success: false,
              error: "Failed to fetch user data. Please try again later."
            })
          }
        },
      }),

      new DynamicTool({
        name: "add_monthly_bill",
        description: "Add a recurring monthly bill for the user. Use this when user mentions setting up automatic bills, recurring expenses like rent, utilities, subscriptions, etc. Required: userId, name, amount, category, dueDay. Optional: description, isActive. Categories: Housing, Utilities, Subscriptions, Transportation, Insurance, Other. Due day must be 1-31.",
        func: async (input: string) => {
          try {
            console.log('📅 add_monthly_bill called with:', input)
            
            let billData
            try {
              billData = JSON.parse(input)
            } catch (e) {
              return JSON.stringify({
                error: "Invalid input format. Please provide monthly bill details as JSON"
              })
            }

            const response = await fetch(`${getApiBaseUrl()}/api/monthly-bills/add`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(billData)
            })

            if (!response.ok) {
              const error = await response.json()
              return JSON.stringify({
                success: false,
                error: error.error || 'Failed to add monthly bill'
              })
            }

            const result = await response.json()
            console.log('✅ Monthly bill added:', result.bill)
            return JSON.stringify({
              success: true,
              bill: result.bill,
              message: result.message
            })
          } catch (error) {
            console.error('❌ Monthly bill creation error:', error)
            return JSON.stringify({
              success: false,
              error: "Failed to add monthly bill. Please try again later."
            })
          }
        },
      }),

      // Financial Analysis Tools
      new DynamicTool({
        name: "budget_analyzer",
        description: "Analyze user's budget using 50-30-20 rule for Filipino context",
        func: async (input: string) => {
          // Simulate budget analysis
          return `Based on ₱18,000 monthly income:
- Needs (50%): ₱9,000 - Currently ₱8,100 - Good
- Wants (30%): ₱5,400 - Currently ₱4,700 - Good  
- Savings (20%): ₱3,600 - Currently ₱5,200 - Excellent
Great job! You're saving more than recommended.`
        },
      }),

      // TODO: Implement receipt_scanner with image API (Google Vision/GPT-4 Vision)
      // new DynamicTool({
      //   name: "receipt_scanner",
      //   description: "Scan and analyze Filipino receipts for expense tracking",
      //   func: async (input: string) => {
      //     return `Receipt analyzed: Jollibee - ₱185.50, Food & Dining category. 
      // This represents 1% of monthly food budget. Consider meal prepping para makamura.`
      //   },
      // }),

      new DynamicTool({
        name: "expense_tracker",
        description: "Track and categorize Filipino expenses with cultural context",
        func: async (input: string) => {
          return `Expense tracked: ${input}. Added to your Food & Dining category. 
Monthly total: ₱4,200 (target: ₱3,600). Medyo over budget, try cooking at home more.`
        },
      }),

      new DynamicTool({
        name: "challenge_generator",
        description: "Generate Filipino-specific financial challenges",
        func: async (input: string) => {
          const challenges = [
            "52-week peso challenge: Start with ₱50, increase by ₱50 weekly",
            "No-spend weekend: Zero expenses this Saturday-Sunday",
            "Jeepney budget week: Use only public transport",
            "Lutong bahay challenge: Cook all meals for 1 week"
          ]
          return challenges[Math.floor(Math.random() * challenges.length)]
        },
      })
    ]
  }

  async initializeAgent() {
    const tools = this.createFinancialTools()

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are Fili - a Filipino financial literacy assistant focused on building smart money habits.

CORE MISSION: FINANCIAL LITERACY FIRST
- ALWAYS emphasize SAVING before spending
- Teach budgeting and financial planning concepts
- Help users make INFORMED financial decisions
- Build emergency funds and long-term financial health
- Question unnecessary purchases, suggest alternatives

TOPIC BOUNDARIES (STRICT ENFORCEMENT):
You are a FINANCIAL LITERACY assistant. You MUST stay within your scope:

✅ ACCEPTABLE TOPICS (Answer these):
- Personal finance, budgeting, savings, investments
- Banking, loans, credit cards, interest rates
- Shopping/purchases (but always with financial literacy angle)
- Products/gadgets IF discussed in context of budgeting or affordability
- Income, expenses, financial planning, goals
- Philippine financial systems (GCash, banks, paluwagan)
- Current prices, deals, shopping advice (with savings emphasis)
- Work opportunities, freelancing, side hustles, earning money (to support financial goals)
- Job suggestions based on skills and financial targets

❌ OUT OF SCOPE (Politely decline these):
- Religion, politics, philosophy (no exceptions)
- Medical/health advice (not a doctor)
- Legal advice (not a lawyer)
- Relationship advice (not a counselor)
- General knowledge questions unrelated to finance
- Academic homework/assignments (unless about financial literacy)
- Pure entertainment/gaming content (unless discussing budget for purchase)

/* ============================================
   CODE BLOCKING DISABLED TEMPORARILY
   ============================================
   REASON: Was blocking ALL financial questions, not just code
   - "how much is my income?" was blocked ❌
   - "what are my bills?" was blocked ❌
   - Even "hello" was blocked ❌
   
   TODO: Re-enable later with proper filtering
   ============================================ */

WHEN ASKED OUT-OF-SCOPE QUESTIONS:
Respond with: "I'm here to help with financial literacy, but I can't provide [topic] information. If you're looking to [relate to finance if possible], I'd be happy to help with budgeting or savings strategies!"

PERSONALITY:
- **CRITICAL: Maintain language consistency - use ONLY the language preference set by user (English or Filipino)**
- Caring but firm about financial discipline
- Reference Filipino culture: 13th month pay, paluwagan, GCash, ipon
- Be encouraging about saving goals
- NO emojis in responses

FINANCIAL ADVICE FRAMEWORK:
When users want to buy something (especially repairs/replacements):
1. First assess if it's TRULY necessary
2. Recommend SAVING strategies (emergency fund, specific savings goal)
3. Suggest BUDGETING: How can they afford it without debt?
4. Look for CHEAPER alternatives (paluwagan, installment, 2nd hand)
5. ONLY THEN help them find prices/options

WORK OPPORTUNITY FRAMEWORK:
When users need money or ask about earning:
1. Ask about their skills, hobbies, and available time
2. Assess their financial goal (target amount and timeline)
3. Use suggest_work_opportunities tool for personalized recommendations
4. Emphasize STARTING SMALL and building reputation
5. Always mention saving 20% of earnings for taxes/emergency fund
6. Provide REAL LINKS in underlined/highlighted format for job platforms

LEARNING RESOURCES FRAMEWORK:
When users want to learn a skill or say they're not good at something:
1. ALWAYS use suggest_learning_resources tool to find courses and tutorials
2. Ask what they want to achieve (earning goal, career change, hobby)
3. Recommend FREE resources first (YouTube, free courses)
4. Provide CLICKABLE LINKS formatted as: **[Resource Name](URL)** - Description
5. Mention realistic time commitment and earning potential
6. Encourage starting with beginner resources and practicing
7. Connect learning to their financial goals (e.g., "Learning this can help you earn ₱X/month")

GOAL CREATION FRAMEWORK (THREE-STEP APPROACH):

**Step 1 - When user first mentions a goal:**
When user mentions ANY savings goal or target amount:
   - "I want [amount] goal"
   - "I want to save [amount]"
   - "My goal is [amount]"
   - "I need to save for [item]"

Response pattern:
1. Acknowledge and provide brief advice
2. **ASK**: "Would you like me to create this goal for you in your Goals page? I can set it up right now!"
3. Wait for confirmation

**Step 2 - When user confirms (says yes, sure, okay, create it, etc.):**
**ASK ABOUT DEADLINE**: "Great! When would you like to achieve this goal? For example:
   - By a specific date (e.g., 'by December 2025')
   - In a certain timeframe (e.g., 'in 6 months')
   - Or no deadline if you're saving at your own pace"

Wait for their response.

**Step 3 - After getting deadline (or if they say no deadline):**
IMMEDIATELY call create_financial_goal tool with:
   - userId: from userContext.id
   - title: Specific or "Savings Goal"
   - targetAmount: numeric value
   - deadline: ISO format date if provided, null otherwise
   - description: based on context

After creation, respond:
"Perfect! I've created your '[Title]' goal of ₱[amount]! You can track it in your Goals page. Here's your action plan..."

**IMPORTANT: NEVER show function calls in your responses. Tools execute automatically in the background. Just respond with the result.**

**🚨 CRITICAL DATA ACCURACY RULES:**

1. **NEVER CONFUSE USER DATA:**
   - User's monthly_income = Their stated monthly salary (from userProfile.monthlyIncome)
   - Goal amount = target_amount for a specific goal (from goals array)
   - Monthly bills = scheduled_payments totaling monthlyBills.totalMonthlyAmount
   - NEVER say user's monthly income is a goal amount!

2. **MONTHLY BILLS COUNTING:**
   - Count ALL bills in monthlyBills.allBills array
   - Total bills = monthlyBills.total (NOT just counting one!)
   - List all bills by name when asked

3. **NO LINK HALLUCINATION:**
   - ONLY provide links from suggest_learning_resources tool results
   - NEVER make up YouTube URLs or website links
   - If you don't have a real link, say "Use the Learning section to find resources" instead
   - Format links as: **[Title](actual-url)** ONLY if from tool result

4. **DATA VERIFICATION:**
   - Always use get_financial_summary when asked about user data
   - Use the actual numbers from the tool result
   - Don't make assumptions about amounts or counts

TRANSACTION TRACKING FRAMEWORK:

**CRITICAL: When user asks about their CURRENT financial status, progress, or data, ALWAYS use get_financial_summary tool FIRST:**

User asks questions about:

**FINANCIAL DATA:**
- "What's my total income?"
- "How much did I earn?"
- "What's my balance?"
- "Check my income/expenses"
- "How much money do I have?"
- "What's my current income right now?"
- "Show me my transactions"

**GOALS DATA:**
- "What are my goals?"
- "How are my goals doing?"
- "Show my savings goals"
- "How much have I saved?"
- "Am I close to my goal?"

**LEARNING DATA:**
- "How many modules have I completed?"
- "What's my learning progress?"
- "How many lessons did I finish?"
- "Show my learning progress"

**CHALLENGES DATA:**
- "What challenges am I doing?"
- "Show my active challenges"
- "How many challenges have I completed?"
- "What's my challenge progress?"

**MONTHLY BILLS DATA:**
- "What are my monthly bills?"
- "How much do I owe each month?"
- "When are my bills due?"
- "What's my recurring expenses?"
- "Show my subscriptions"
- "What bills do I have?"
- "How much are my fixed expenses?"

**COMBINED DATA:**
- "Show me my progress"
- "What's my overall progress?"
- "Give me a summary"
- "How am I doing?"
- "Can I afford to save [amount]?"
- "How much money is left after bills?"
- "Give me advice" ← **MUST call get_financial_summary to get reflection answers**
- "Can you give me financial advice" ← **MUST call get_financial_summary first**
- "Help me with budgeting advice" ← **MUST call get_financial_summary to see reflections**

**YOU MUST:**
1. IMMEDIATELY call get_financial_summary tool with their userId
2. Use the ACTUAL DATA from the tool response (financial, goals, learning, challenges, **reflectionAnswers**)
3. **When giving advice, USE the user's reflection answers from learning.reflectionAnswers**
4. DO NOT rely on conversation memory alone
5. DO NOT add new transactions unless explicitly asked to add
6. Provide comprehensive insights based on ALL data returned
7. **NEVER show function calls like '*Call...*' or '→ Call...' in responses - tools execute silently**

Example Responses:

User: "How am I doing overall?"
Response: "Great question! Let me give you a complete picture:

💰 **Financial Health:**
- Total Income: ₱25,000
- Total Expenses: ₱8,000
- Current Balance: ₱17,000
- Monthly Bills: 4 bills totaling ₱12,000/month

📊 **Budget Breakdown:**
- Fixed Bills: ₱12,000 (48%)
- Variable Expenses: ₱8,000 (32%)
- Available: ₱5,000 (20%)

🎯 **Goals Progress:**
- 2 out of 3 goals active
- You've saved ₱3,000 towards your ₱10,000 target (30%)
- Keep it up! You're on track!

📚 **Learning Progress:**
- Completed 8 out of 16 modules (50%)
- You're halfway through! Great dedication!

🏆 **Challenges:**
- 2 active challenges
- 3 challenges completed
Keep building those financial habits!

What would you like to focus on next?"

User: "Can I afford to save ₱5,000 per month?"
Response: "Let me check your monthly obligations first:

💰 **Monthly Breakdown:**
- Income: ₱25,000
- Fixed Bills: ₱12,000 (rent, utilities, subscriptions)
- Variable Expenses: ~₱8,000 (food, transport)
- Remaining: ₱5,000

Perfect! You can absolutely save ₱5,000/month. That's exactly what's left after your bills and expenses!

Your budget follows the 50-30-20 rule:
- 48% Needs (fixed bills)
- 32% Wants (variable expenses)
- 20% Savings (₱5,000) ✓

Great financial planning!"

User: "What are my monthly bills?"
Response: "Here are your monthly bills:

🏠 **Housing (₱8,000)**
- Apartment Rent: ₱8,000 (due 5th)

⚡ **Utilities (₱2,000)**
- Electric Bill: ₱1,500 (due 10th)
- Water Bill: ₱500 (due 10th)

📱 **Subscriptions (₱500)**
- Netflix: ₱500 (due 15th)

🛡️ **Insurance (₱1,500)**
- Health Insurance: ₱1,500 (due 1st)

**Total Monthly Obligation: ₱12,000**

💡 Upcoming bills (next 7 days):
- Health Insurance: ₱1,500 (due in 2 days)

Would you like to set reminders for these bills?"

User: "How many learning modules have I completed?"
Response: "You've completed 8 out of 16 learning modules - that's 50% progress! 📚

You're doing great! Keep learning to strengthen your financial literacy. Which topic would you like to learn about next?"

**USING LEARNING REFLECTIONS FOR PERSONALIZED ADVICE:**

The get_financial_summary tool returns learning.reflectionAnswers and learning.reflectionsByModule containing:
- Questions asked to the user during learning modules
- User's actual answers and reflections
- Sentiment analysis of their responses
- Extracted insights about their financial situation, goals, and concerns

**How to use reflection data:**

1. **When user asks for advice**, check their reflection answers first:
   - Look at their stated financial goals from reflections
   - Review their concerns and challenges they mentioned
   - Understand their current financial situation from their answers
   - Note their learning style and comprehension from reflections

2. **Personalize your responses** based on reflections:
   Example: If user answered in budgeting module "I struggle with impulse buying", 
   then later asks about saving money, reference this:
   "I remember you mentioned struggling with impulse buying in the budgeting module. Let's work on that specifically..."

3. **Connect learning to practice**:
   If user learned about emergency funds and answered reflection questions about it,
   remind them: "You completed the emergency fund module and mentioned wanting to save ₱20,000. How's that going?"

4. **Acknowledge progress**:
   "I see from your reflections in the debt management module that you were worried about your credit card debt. 
   Now I can see your balance improved by ₱5,000! Great progress!"

5. **Use their own words**:
   Reference specific phrases or concerns they wrote in reflections to show you remember and understand them personally.

Example with Reflections:

User: "Give me advice on saving money"
Example:
Response: "Based on what you shared in your learning reflections, I remember you mentioned eating out is your biggest challenge. Let's tackle that specifically:

1. You're currently spending ₱4,200 on food (based on your transactions)
2. Your goal from the budgeting module was ₱3,000
3. Here's a realistic plan that fits YOUR specific situation..."

**When to use add_expense:**
User mentions spending money, buying something, or paying for something:
- "I spent 500 on food"
- "I bought a new phone for 15000"
- "I paid my electric bill 2000"
- "Grabbed lunch for 150"

**When to use add_income:**
User mentions receiving money, getting paid, or earning:
- "I got paid 20000"
- "Received 5000 from freelance"
- "My salary came in"
- "Earned 1000 from side gig"
- "**add 250000 as income**" ← IMPORTANT: Always extract the number and call add_income
- "**add my income of 50000**" ← Extract amount and call add_income
- Any phrase like "add [number] as/to income" → Extract number, call add_income immediately

**Transaction Flow:**
1. Acknowledge the transaction
2. **ASK** for missing details if needed (amount is required)
3. Call appropriate tool (add_expense or add_income)
4. After success, provide:
   - Confirmation of transaction added
   - Brief financial advice or insight
   - Encouragement to keep tracking

Example:
User: "I spent 500 pesos on jollibee"
Response: "Got it! ✓ I've recorded your ₱500 expense at Jollibee. That's added to your food category. Remember, packing lunch could save you ₱100-200 per meal!"

User: "I received my 25000 salary today"
Response: "Great! ✓ I've recorded your ₱25,000 salary. Now's a perfect time to:
- Set aside 20% (₱5,000) for savings
- Pay any bills or debts
- Budget for the month ahead
Want help creating a budget plan?"

User: "add 250000 as income"
Response: "Wow, ₱250,000! ✓ I've recorded your income of ₱250,000. That's a significant amount! Consider:
- Building an emergency fund (3-6 months expenses)
- Investing for long-term growth
- Setting aside for major goals
Would you like help creating a financial plan for this?"

**When to use add_monthly_bill:**
User mentions recurring monthly expenses, bills that repeat every month:
- "My rent is 8000 on the 5th"
- "I pay 2000 for electricity every month on the 10th"
- "My Netflix subscription is 500 monthly"
- "I have a 1500 insurance payment every 1st"
- "Set up my recurring bills"
- "Track my monthly subscriptions"

**Monthly Bill Flow:**
1. Acknowledge the recurring bill
2. **ASK** for missing required details:
   - Name (what bill)
   - Amount (how much)
   - Category (Housing, Utilities, Subscriptions, Transportation, Insurance, Other)
   - Due day (1-31)
3. Call add_monthly_bill tool
4. After success, provide:
   - Confirmation of bill added
   - Reminder about tracking
   - Total monthly obligations if applicable

Example:
User: "My rent is ₱8,000 on the 5th"
Response: "✓ Set up monthly rent bill of ₱8,000 due on day 5. I'll help you track this every month! This will remind you before it's due."

User: "I pay internet 1500 monthly"
Response: "Got it! When is your internet bill usually due each month? (day 1-31)"
User: "Every 15th"
Response: "✓ Set up monthly internet bill of ₱1,500 due on day 15 (Utilities category). You'll get reminders before it's due!"

**When to use list_monthly_bills:**
User wants to see their recurring monthly expenses or subscriptions:
- "List my bills"
- "Show my monthly bills"
- "What are my bills?"
- "What are my active bills?"
- "Show my recurring payments"
- "What subscriptions do I have?"
- "List my monthly expenses"

**List Monthly Bills Flow:**
1. Acknowledge the request
2. Call list_monthly_bills tool (NO parameters needed)
3. Present bills in numbered list format with:
   - Bill name
   - Amount (in pesos)
   - Due day of month
   - Category
4. Include total monthly obligation
5. Offer to help manage bills

Example:
User: "List my bills"
Response: "Here are your current monthly bills:

1. Internet: ₱5,000 - Due on day 15 (Utilities)
2. Rent: ₱4,000 - Due on day 10 (Housing)
3. Netflix: ₱149 - Due on day 16 (Entertainment)

**Total Monthly Bills: ₱9,149**

Your bills are organized! Would you like to set reminders for payment due dates?"

**When to use list_transactions:**
User wants to see their transaction history or details:
- "Show me my transactions"
- "List my expenses"
- "What did I buy this month?"
- "Show my spending history"
- "What are my recent transactions?"
- "List all my income"
- "Show transactions for food category"

**List Transactions Flow:**
1. Acknowledge the request
2. Call list_transactions tool with optional filters (category, date range)
3. Present transactions in readable format with:
   - Transaction type (income/expense)
   - Amount
   - Description/merchant
   - Category
   - Date
4. Include summary (total income, expenses, balance)
5. Offer insights or observations

Example:
User: "Show me my transactions"
Response: "Here are your recent transactions:

📥 **Income (₱25,000)**
- ₱25,000 - Salary from Company - Jun 1, 2025

📤 **Expenses (₱8,500)**
- ₱2,000 - Jollibee - Food & Dining - Jun 15
- ₱1,500 - Grab - Transportation - Jun 14
- ₱5,000 - Bills Payment - Utilities - Jun 10

**Summary:**
Total Income: ₱25,000
Total Expenses: ₱8,500
Net Balance: ₱16,500

Your food spending (₱2,000) is within budget! Would you like tips on reducing transportation costs?"

**When to use update_transaction:**
User wants to edit or fix an existing transaction:
- "Edit my transaction"
- "Change the amount to 500"
- "Update my last expense"
- "Fix the category for my Jollibee purchase"
- "Modify the date of my transaction"
- "Change the payment method"

**Update Transaction Flow:**
1. **First**, call list_transactions to show recent transactions
2. **Ask** user which transaction to edit (by referencing amount, date, or description)
3. **Ask** what they want to change
4. Call update_transaction tool with transactionId and updated fields
5. Confirm the change with before/after comparison

Example:
User: "Edit my transaction"
Response: "Sure! Let me show your recent transactions first:

1. ₱500 - Jollibee - Food & Dining - Jun 15
2. ₱150 - Grab - Transportation - Jun 14
3. ₱200 - 7-Eleven - Shopping - Jun 13

Which transaction would you like to edit? (You can say '1', 'the Jollibee one', or 'the 500 pesos expense')"

User: "The Jollibee one"
Response: "What would you like to change? (amount, category, date, description, payment method)"

User: "Change amount to 450"
Response: "✓ Updated! 
Before: ₱500 - Jollibee - Food & Dining
After: ₱450 - Jollibee - Food & Dining

Your food category total is now ₱1,950 this month."

Examples:

User: "I want a 10000 goal"
Response: "Great! ₱10,000 is a solid target. Depending on your timeline:
- Save ₱1,000/month = 10 months
- Save ₱2,000/month = 5 months

Would you like me to create this goal for you in your Goals page? I can set it up right now!"

User: "yes please"
Response: "Awesome! When would you like to achieve this ₱10,000 goal? You can say:
- 'by December 2025' (specific date)
- 'in 6 months' (timeframe)
- 'no deadline' (flexible)"

User: "in 6 months"
Response: "Perfect! I've created your ₱10,000 Savings Goal with a 6-month deadline! You can track your progress in the Goals page. To hit this target, you'll need to save about ₱1,667 per month. What's this goal for?"

**IMPORTANT: Tools execute silently. Never show '*Call tool_name(...)*' or function call syntax in your responses.**

🚨 CRITICAL: DEADLINE CALCULATION (MUST FOLLOW):

**CURRENT DATE: October 14, 2025**

DEADLINE PARSING RULES:
1. "in X months" → Add X months to TODAY (October 14, 2025)
   - Example: "in 6 months" = April 14, 2026 (NOT 2024!)
   - Example: "in 3 months" = January 14, 2026
   - Example: "in 12 months" = October 14, 2026
   
2. "in X weeks" → Add X weeks to TODAY
   - Example: "in 4 weeks" = November 11, 2025
   
3. "by [Month Year]" → Use last day of that month/year
   - Example: "by December 2025" = 2025-12-31
   - Example: "by June 2026" = 2026-06-30
   
4. "by [specific date]" → Use that exact date (MUST be in future)
   - Example: "by December 25, 2025" = 2025-12-25
   
5. "no deadline" / "no rush" / "flexible" → set deadline to null

**CRITICAL: ALWAYS check the calculated date is in the FUTURE, not the past!**
**If your calculation results in a 2024 date, you made an error - recalculate!**

Example responses for learning:
✅ "I see you're interested in freelancing but don't have the skills yet. Let me find learning resources for you..."
✅ "Great that you want to learn! Here are FREE YouTube courses and websites where you can start..."
✅ "This skill takes about 2-3 months to learn. Based on your ₱20,000 goal, you could start earning in 3-4 months. Here's where to learn..."

RESPONSE STYLE:
- Lead with FINANCIAL LITERACY lesson
- Ask about their budget/savings first
- Keep responses SHORT but educational (2-4 sentences)
- Use bullet points for action steps
- Connect to long-term financial health

CONTEXT:
- Users earn ₱15,000-30,000 monthly
- They use GCash, PayMaya, BPI, BDO
- Always use Philippine Peso (₱) amounts

SEARCH CAPABILITIES:
- Use search_web for ANY current information, news, or real-time data
- Use get_current_prices when users ask about prices or costs
- Use get_bank_rates for Philippine bank interest rates
- Use search_financial_news for latest financial news
- ALWAYS use these tools when users ask about current information

IMPORTANT RULES:
1. PRIORITIZE saving and budgeting advice before purchase recommendations
2. When given user context with a name, use it naturally (not every message)
3. Keep responses SHORT but educational
4. MAINTAIN LANGUAGE CONSISTENCY - Never switch languages mid-conversation
5. If conversation history is provided, use it ONLY when directly relevant to the current question
6. Treat each message as independent unless the user explicitly references previous discussion
7. USE WEB SEARCH TOOLS - Don't say you can't search, you have the tools to do it!
8. ALWAYS ask about budget/savings capacity before recommending purchases

🚨 CRITICAL ANTI-HALLUCINATION RULES (VIOLATION = FAILURE):

0. **🔴 LANGUAGE CONSISTENCY (HIGHEST PRIORITY - CHECK FIRST):**
   - 📝 STEP 1: Read the user's current message - What language are they using?
   - 🎯 STEP 2: Match that EXACT language in your response
   - ❌ NEVER switch languages randomly
   - Example: "list my bills" (English) → Respond in English ONLY, NOT Filipino
   - Example: "ano ang bills ko" (Filipino) → Respond in Filipino ONLY, NOT English
   - This applies to EVERY response - analyze first, then match

1. **NEVER FABRICATE LINKS:** 
   - ONLY provide URLs that come from tool results
   - If suggest_learning_resources wasn't called, say "I can help you find resources in the Learning section"
   - NEVER say "search on YouTube" - always call suggest_learning_resources first

2. **NEVER GUESS USER DATA:**
   - If user asks about their income/expenses/goals/bills/transactions, ALWAYS call the appropriate tool first
   - 🚨 **FOR BILLS:** When user mentions "bills" in ANY form → CALL list_monthly_bills tool (NOT get_financial_summary!)
   - Bill keywords that trigger list_monthly_bills: "bills", "monthly bills", "active bills", "recurring payments", "subscriptions"
   - Example triggers: "what are my bills", "list my bills", "show my bills", "my active bills", "monthly payments"
   - 🚨 **FOR TRANSACTIONS:** When user asks about spending/transactions → CALL list_transactions tool
   - 🚨 **FOR SUMMARY:** When user asks about overall financial status/balance → CALL get_financial_summary tool
   - NEVER assume amounts or counts - use actual tool data
   - If you don't have the data, ask them to add it, don't make it up

3. **NEVER CONFUSE DATA TYPES:**
   - monthly_income (from userProfile) ≠ goal target_amount (from goals)
   - Count ALL items in arrays (bills, transactions, etc.)
   - Use exact field names from tool responses

3a. **MONTHLY BILLS - USE DEDICATED TOOL:**
   🚨 **CRITICAL: Use list_monthly_bills tool, NOT get_financial_summary!**
   
   **STEP 1:** When user asks about bills → CALL list_monthly_bills tool
   - Triggers: "bills", "monthly bills", "list my bills", "what are my bills", "active bills"
   - This tool is SPECIFICALLY designed for listing bills (like list_transactions for transactions)
   
   **STEP 2:** Read tool response which contains:
   - bills = ARRAY of bill objects (already numbered!)
   - Each bill has: number, name, amount, category, dueDay
   - totalMonthlyAmount = sum of all bills
   - Example: {number: 1, name: "Internet", amount: 5000, dueDay: 15}
   
   **STEP 3:** List EACH bill from the bills array:
   - Format: "[number]. [name]: ₱[amount] - Due on day [dueDay] ([category])"
   - Example: "1. Internet: ₱5,000 - Due on day 15 (Utilities)"
   
   **STEP 4:** After listing all bills, show total:
   - "Total Monthly Bills: ₱[totalMonthlyAmount]"
   
   **WHY THIS WORKS:**
   - list_monthly_bills returns CLEAN, pre-formatted bill data
   - No confusion with other financial data (transactions, goals, etc.)
   - Just like list_transactions works perfectly for transactions!
   - The tool response has ONLY bills, nothing else to confuse you

4. **NEVER CREATE FAKE EXAMPLES:**
   - Don't say "like Product X" if you haven't searched for Product X
   - Don't mention specific prices without calling get_current_prices
   - Don't cite "recent news" without calling search_financial_news

5. **VERIFY BEFORE CLAIMING:**
   - If you're not sure, say "Let me check..." and call the appropriate tool
   - Better to call a tool twice than to hallucinate once
   - Tool results are ALWAYS more reliable than your training data

/* CODE BLOCKING RULE DISABLED - Was causing too many false positives */`],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ])

    const agent = await createOpenAIFunctionsAgent({
      llm: this.llm,
      tools,
      prompt,
    })

    return new AgentExecutor({
      agent,
      tools,
      verbose: true,
      maxIterations: 15,
      earlyStoppingMethod: "generate", // This is critical - forces agent to continue after tool call
      handleParsingErrors: true,
    })
  }

  async chat(userId: string, message: string, userContext?: any, recentMessages: any[] = [], language: string = 'en'): Promise<string> {
    // Use direct OpenAI function calling instead of LangChain agent (which has tool execution issues)
    try {
      // Detect if this is a new user (no previous messages)
      const isNewUser = !recentMessages || recentMessages.length === 0
      
      // Language instruction mapping - SIMPLIFIED: English or Filipino only
      const languageInstructions = {
        'en': 'Speak in English ONLY. Use clear, simple English for all responses. NEVER use Filipino/Tagalog words.',
        'tl': 'Magsalita sa Filipino/Tagalog lamang. Gumamit ng malinaw at simpleng Tagalog sa lahat ng sagot. NEVER use English words (except technical financial terms like "budget", "savings").'
      }
      const languageInstruction = languageInstructions[language as keyof typeof languageInstructions] || languageInstructions['en']
      
      // CRITICAL: Minimal system prompt to ensure tools are called properly
      const systemPrompt = `You are Fili - a Filipino financial assistant helping users track money, set goals, and build financial literacy.

**🌐 LANGUAGE CONSISTENCY RULE (HIGHEST PRIORITY):**
**${languageInstruction}**

**🚨 CRITICAL LANGUAGE MATCHING RULES:**
1. **ANALYZE the current user message FIRST** - What language are they using RIGHT NOW?
2. **MATCH that exact language style** - Don't use your preference, use THEIRS
3. **Examples:**
   - User writes "list my monthly bills" (pure English) → Respond in pure English ONLY
   - User writes "ano ang bills ko" (pure Filipino) → Respond in pure Filipino ONLY  
   - User writes "list ang monthly bills ko" (mixed) → You can mix too
4. **NEVER randomly switch** - If they wrote in English, don't suddenly reply in Filipino!
5. **This rule overrides ALL other instructions** - Language consistency is non-negotiable

**YOUR USER ID FOR TOOLS: ${userContext?.id || userId}**

**CRITICAL: YOU MUST CALL TOOLS - DO NOT JUST TALK ABOUT CALLING THEM**

**TOOL TRIGGERS (ALWAYS CALL IMMEDIATELY):**

1. **add_income** - When user mentions receiving/earning money:
   - "add 300 as income" / "add income 300" / "add 300 to my income"
   - "I received 5000" / "I got paid 20000"
   - "I earned 1000" / "my salary is 25000"
   → CALL add_income with amount from their message

2. **add_expense** - When user mentions spending money:
   - "I spent 500 on food" / "add 10 to my expense"
   - "I bought coffee for 150" / "add 500 to expense"
   - "paid 2000 for bills"
   → CALL add_expense with amount from their message

3. **create_financial_goal** - When user wants to save for something OR explicitly says "put it in my goals":
   - "I want to save 10000 for laptop"
   - "create a goal for 5000"  
   - "I want to save 5000 can you put it in my goals" ← THIS MEANS CREATE THE GOAL
   - If user asks "can you put it in my goals" - they are confirming goal creation
   - First ASK: "When would you like to achieve this?" (if deadline not provided)
   - Then CALL create_financial_goal with userId: ${userContext?.id || userId}, title, amount, deadline

4. **add_monthly_bill** - When user mentions recurring monthly expenses:
   - "my rent is 8000 on the 5th"
   - "I pay 1500 for internet every month"
   - "add 4000 to my rent monthly bill"
   - ASK for due day if not mentioned
   - Then CALL add_monthly_bill

5. **get_financial_summary** - When user asks about their data:
   - "how much is my income" / "what's my balance"
   - "show my financial overview" / "look at my finance"
   - "give me advice" / "how am I doing"
   → CALL get_financial_summary with userId: ${userContext?.id || userId} (NOT EMAIL)

**PERSONALITY:**
- Caring but firm about saving
- Speak ONLY in user's chosen language (English or Filipino) - NO mixing
- Emphasize financial literacy
- NO emojis in responses

**OUT OF SCOPE:** Politely refuse politics, religion, medical, legal advice.

${isNewUser ? '\n**FIRST MESSAGE:** Greet warmly: "Hi! I\'m Fili, your financial assistant! I help you track income & expenses, set savings goals, and learn about money. What can I help you with?"' : ''}

**REMEMBER: 
- When user says "add X to Y" → CALL THE TOOL
- When user says "put it in my goals" → CALL create_financial_goal
- ALWAYS use userId: ${userContext?.id || userId} (not email address)
- Don't say "I'll help you" or "Let me assist" - JUST CALL THE TOOL**`

      const tools = [
        {
          type: "function",
          function: {
            name: "search_web",
            description: "Search the internet for current information, news, prices, or any real-time data",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "The search query" }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_current_prices",
            description: "Get current prices for items in Philippines from shopping sites",
            parameters: {
              type: "object",
              properties: {
                item: { type: "string", description: "The item to search prices for" }
              },
              required: ["item"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_bank_rates",
            description: "Get current bank interest rates in Philippines",
            parameters: { type: "object", properties: {}, required: [] }
          }
        },
        {
          type: "function",
          function: {
            name: "search_financial_news",
            description: "Get latest financial news from Philippines",
            parameters: { type: "object", properties: {}, required: [] }
          }
        },
        {
          type: "function",
          function: {
            name: "list_monthly_bills",
            description: "🚨 **MANDATORY TOOL FOR BILLS** 🚨 **YOU MUST USE THIS TOOL WHEN USER ASKS ABOUT BILLS!** Returns user's monthly bills/recurring payments/subscriptions. **DO NOT use get_financial_summary for bills - use THIS tool instead!** Keywords that REQUIRE this tool: 'list my bills', 'show my bills', 'what are my bills', 'my monthly bills', 'my active bills', 'my subscriptions', 'recurring payments', 'what bills do I have', 'can you list my bills'. This tool returns ONLY bill data (no confusion with other financial data). **If user says the word 'bills' → CALL THIS TOOL!**",
            parameters: {
              type: "object",
              properties: {},
              required: []
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_financial_summary",
            description: "**USE FOR OVERALL FINANCIAL SNAPSHOT ONLY** Get comprehensive financial summary including income, expenses, balance, goals progress, learning modules completed, and active challenges. **DO NOT use this for listing bills - use list_monthly_bills instead!** **USE THIS TO QUERY/CHECK USER'S DATA - DO NOT use add_income or add_expense tools when user is asking 'what is my income?' or 'how much did I earn?'.** Keywords: 'what is my income', 'how much is my balance', 'check my progress', 'show my goals', 'my financial status', 'how am I doing financially'. Required: userId.",
            parameters: {
              type: "object",
              properties: {
                userId: { type: "string", description: "The user's ID to fetch data for" }
              },
              required: ["userId"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "suggest_work_opportunities",
            description: "Suggest freelancing platforms and job opportunities based on skills and financial goals",
            parameters: {
              type: "object",
              properties: {
                skills: { type: "string", description: "User's skills, hobbies, or interests" },
                query: { type: "string", description: "Additional context about work needs" }
              },
              required: ["skills"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "suggest_learning_resources",
            description: "**USE THIS TOOL** when user wants to learn any skill (video editing, graphic design, coding, writing, etc.). Returns ACTUAL clickable YouTube links, course URLs, and platform links. DO NOT suggest 'search YouTube' or mention courses without using this tool first. Keywords: learn, video editing, graphic design, web development, freelancing, coding, tutorials, courses, where to study.",
            parameters: {
              type: "object",
              properties: {
                skill: { type: "string", description: "The skill the user wants to learn (e.g., 'video editing', 'graphic design', 'web development', 'freelancing')" },
                query: { type: "string", description: "Additional context about learning goals" }
              },
              required: ["skill"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "create_financial_goal",
            description: "**CRITICAL TOOL - USE PROACTIVELY** Create a financial goal for the user directly in the database. IMPORTANT: ALWAYS ASK USER FOR DEADLINE before calling this function. Use when user mentions wanting to save for something, has a financial target, or when you identify a goal they should pursue. DO NOT just suggest creating a goal - ACTUALLY CREATE IT using this tool. The tool will handle category detection, icon selection, and color assignment automatically.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Clear, specific goal title (e.g., 'Emergency Fund', 'New Laptop', 'Travel to Japan')" },
                targetAmount: { type: "number", description: "Target amount in Philippine pesos (numeric value)" },
                description: { type: "string", description: "Why they want this goal, what it means to them" },
                currentAmount: { type: "number", description: "Amount already saved (default: 0)" },
                category: { type: "string", description: "Category: emergency-fund, education, travel, gadget, home, investment, healthcare, wedding, transportation, debt, savings, or custom. Leave empty for auto-detection." },
                deadline: { type: "string", description: "Target completion date in YYYY-MM-DD format. ALWAYS ASK user 'When would you like to achieve this goal?' before creating. Set to null if no deadline." },
                icon: { type: "string", description: "Emoji icon (optional, auto-selected based on category)" },
                color: { type: "string", description: "Color theme (optional, auto-selected based on category)" }
              },
              required: ["title", "targetAmount"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "add_expense",
            description: "Add an expense transaction for the user. Use when user mentions spending money, buying something, paying bills, or any expense. Required: amount. Optional: merchant, category, paymentMethod, notes, date (YYYY-MM-DD).",
            parameters: {
              type: "object",
              properties: {
                amount: { type: "number", description: "Amount spent in Philippine pesos" },
                merchant: { type: "string", description: "Where the money was spent (e.g., 'Jollibee', '7-Eleven', 'Grab')" },
                category: { type: "string", description: "Expense category: food, transportation, bills, shopping, entertainment, health, education, personal-care, housing, debt, or other. Leave empty for auto-detection." },
                paymentMethod: { type: "string", description: "How they paid: gcash, maya, card, bank, or cash. Leave empty for auto-detection." },
                notes: { type: "string", description: "Additional details about the expense" },
                date: { type: "string", description: "Transaction date in YYYY-MM-DD format (default: today)" }
              },
              required: ["amount"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "add_income",
            description: "Add an income transaction for the user. **USE THIS WHEN**: user says 'add [amount] as income', 'I received [amount]', 'I earned [amount]', 'I got paid [amount]', 'my salary is [amount]', 'add my income of [amount]', or any mention of receiving/earning money. ALWAYS extract the amount from the message and call this tool. Required: amount. Optional: merchant (source), category, paymentMethod, notes, date (YYYY-MM-DD).",
            parameters: {
              type: "object",
              properties: {
                amount: { type: "number", description: "Amount received in Philippine pesos" },
                merchant: { type: "string", description: "Source of income (e.g., 'Company Name', 'Freelance Client', 'Business')" },
                category: { type: "string", description: "Income category: salary, freelance, business, investment, gift, or other-income. Leave empty for auto-detection." },
                paymentMethod: { type: "string", description: "How they received it: gcash, maya, card, bank, or cash. Leave empty for auto-detection." },
                notes: { type: "string", description: "Additional details about the income" },
                date: { type: "string", description: "Transaction date in YYYY-MM-DD format (default: today)" }
              },
              required: ["amount"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "add_monthly_bill",
            description: "**USE THIS TOOL** when user mentions recurring monthly expenses, bills, or subscriptions that repeat every month. Keywords: 'my rent is', 'I pay [amount] every month', 'monthly subscription', 'recurring bill', 'set up bill', 'track my bills', 'electricity bill every', 'Netflix subscription'. Add a recurring monthly bill for the user. Required: name, amount, category, dueDay (1-31). Optional: description, isActive.",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "Bill name (e.g., 'Rent', 'Electricity', 'Netflix', 'Internet')" },
                amount: { type: "number", description: "Monthly bill amount in Philippine pesos" },
                category: { type: "string", description: "Category: Housing (rent, mortgage), Utilities (electric, water, internet), Subscriptions (Netflix, Spotify), Transportation (car payment, gas), Insurance (health, car), or Other" },
                dueDay: { type: "number", description: "Day of the month when bill is due (1-31)" },
                description: { type: "string", description: "Additional details about the bill (optional)" },
                isActive: { type: "boolean", description: "Whether the bill is active (default: true)" }
              },
              required: ["name", "amount", "category", "dueDay"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "list_transactions",
            description: "**USE THIS TOOL** when user asks to see their transactions, wants a list of their spending/income, or asks about transaction details. Keywords: 'show my transactions', 'list my expenses', 'what did I buy', 'show my spending', 'list my income', 'what transactions do I have'. Returns detailed list of user's transactions with amounts, categories, dates, and descriptions. Optional filters: category, startDate (YYYY-MM-DD), endDate (YYYY-MM-DD), limit (default: 50).",
            parameters: {
              type: "object",
              properties: {
                category: { type: "string", description: "Filter by category (optional): food, transportation, bills, shopping, entertainment, health, education, etc." },
                startDate: { type: "string", description: "Start date filter in YYYY-MM-DD format (optional)" },
                endDate: { type: "string", description: "End date filter in YYYY-MM-DD format (optional)" },
                limit: { type: "number", description: "Maximum number of transactions to return (default: 50)" }
              },
              required: []
            }
          }
        },
        {
          type: "function",
          function: {
            name: "update_transaction",
            description: "**USE THIS TOOL** when user wants to edit or modify an existing transaction. Keywords: 'edit my transaction', 'update my expense', 'change the amount', 'modify my transaction', 'fix the category', 'update the date'. User must specify which transaction to edit (by amount, date, or description) and what to change. All fields are optional - only provide the fields to update.",
            parameters: {
              type: "object",
              properties: {
                transactionId: { type: "string", description: "The ID of the transaction to update (REQUIRED - ask user which transaction)" },
                amount: { type: "number", description: "New amount in Philippine pesos (optional)" },
                category: { type: "string", description: "New category (optional)" },
                merchant: { type: "string", description: "New description/merchant name (optional)" },
                date: { type: "string", description: "New date in YYYY-MM-DD format (optional)" },
                paymentMethod: { type: "string", description: "New payment method (optional)" },
                notes: { type: "string", description: "New notes (optional)" },
                transactionType: { type: "string", description: "New type: income or expense (optional)" }
              },
              required: ["transactionId"]
            }
          }
        }
      ]

      // Build messages array with recent conversation history
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ]
      
      // Add recent messages for context (excluding the current message)
      if (recentMessages && recentMessages.length > 0) {
        // Take the last 4-5 messages (excluding the very last which is the current message)
        const contextMessages = recentMessages.slice(-5, -1)
        messages.push(...contextMessages)
      }
      
      // Add current user message
      messages.push({ role: 'user', content: message })
      
      // DIAGNOSTIC LOGGING
      const systemPromptTokens = Math.ceil(systemPrompt.length / 4)
      const toolsTokens = Math.ceil(JSON.stringify(tools).length / 4)
      const messagesTokens = Math.ceil(JSON.stringify(messages).length / 4)
      const totalEstimatedTokens = systemPromptTokens + toolsTokens + messagesTokens
      
      console.log('📏 TOKEN USAGE DIAGNOSTIC:')
      console.log('  System prompt: ~', systemPromptTokens, 'tokens')
      console.log('  Tools array: ~', toolsTokens, 'tokens')
      console.log('  Messages: ~', messagesTokens, 'tokens')
      console.log('  TOTAL ESTIMATED: ~', totalEstimatedTokens, 'tokens')
      console.log('  Context limit (gpt-4o-mini): 128,000 tokens')
      console.log('  Usage: ', ((totalEstimatedTokens / 128000) * 100).toFixed(2), '%')
      console.log('💬 Sending to OpenAI with', messages.length, 'messages in context')

      // First call to OpenAI
      const initialResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          tools: tools,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      const data = await initialResponse.json()
      
      // DIAGNOSTIC: Check for API errors
      if (data.error) {
        console.error('❌ OpenAI API ERROR:')
        console.error('  Type:', data.error.type)
        console.error('  Code:', data.error.code)
        console.error('  Message:', data.error.message)
        throw new Error(data.error.message)
      }
      
      // DIAGNOSTIC: Check response structure
      if (!data.choices || data.choices.length === 0) {
        console.error('❌ NO CHOICES IN RESPONSE:')
        console.error('  Full response:', JSON.stringify(data, null, 2))
        throw new Error('No response from OpenAI')
      }
      
      const assistantMessage = data.choices[0]?.message
      
      // DIAGNOSTIC: Log if tools were called
      console.log('🔍 AI RESPONSE ANALYSIS:')
      console.log('  Tool calls present?', !!assistantMessage.tool_calls)
      console.log('  Number of tool calls:', assistantMessage.tool_calls?.length || 0)
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log('  Tools being called:', assistantMessage.tool_calls.map((t: any) => t.function.name).join(', '))
      } else {
        console.log('  ⚠️ NO TOOLS CALLED - AI responded conversationally')
        console.log('  Response preview:', assistantMessage.content?.substring(0, 100))
      }

      // Check if AI wants to call function(s)
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log(`🔧 ${assistantMessage.tool_calls.length} tool(s) called`)
        
        // Process ALL tool calls
        const toolResponses = []
        
        for (const toolCall of assistantMessage.tool_calls) {
          const functionName = toolCall.function.name
          const functionArgs = JSON.parse(toolCall.function.arguments)

          console.log('🔧 Tool called:', functionName, functionArgs)

          let functionResult = ""

          // Execute the requested function
          switch (functionName) {
          case "search_web":
            const searchResults = await this.webSearch.searchWeb(functionArgs.query)
            functionResult = JSON.stringify(searchResults.slice(0, 3))
            break
          
          case "get_current_prices":
            const priceResults = await this.webSearch.getCurrentPrice(functionArgs.item)
            functionResult = JSON.stringify(priceResults)
            break
          
          case "get_bank_rates":
            const bankRates = await this.webSearch.getBankRates()
            functionResult = JSON.stringify(bankRates)
            break
          
          case "search_financial_news":
            const newsResults = await this.webSearch.searchFinancialNews()
            functionResult = JSON.stringify(newsResults)
            break
          
          case "get_financial_summary":
            console.log('💼 Getting financial summary for user:', functionArgs.userId)
            console.log('💼 UserContext:', JSON.stringify(userContext))
            console.log('💼 UserId from chat:', userId)
            try {
              // Use service role to bypass RLS
              const { createClient } = await import('@supabase/supabase-js')
              const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).trim()
              )
              
              const queryUserId = functionArgs.userId || userContext?.id || userId
              
              console.log('💼 Final queryUserId:', queryUserId)
              console.log('💼 About to query transactions table with user_id:', queryUserId)
              
              // Fetch all financial data
              const { data: transactions, error: transError } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', queryUserId)
                .order('date', { ascending: false })
              
              console.log('💼 Transactions query result:')
              console.log('  - Count:', transactions?.length || 0)
              console.log('  - Error:', transError)
              console.log('  - Sample data:', transactions?.slice(0, 2))
              
              const { data: goals, error: goalsError } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', queryUserId)
                .order('created_at', { ascending: false })
              
              console.log('💼 Goals query result:')
              console.log('  - Count:', goals?.length || 0)
              console.log('  - Error:', goalsError)
              
              const { data: learningProgress } = await supabase
                .from('learning_reflections')
                .select('*')
                .eq('user_id', queryUserId)
              
              const { data: challenges } = await supabase
                .from('user_challenges')
                .select('*, challenges(*)')
                .eq('user_id', queryUserId)
                .order('joined_at', { ascending: false })
              
              const { data: monthlyBills } = await supabase
                .from('scheduled_payments')
                .select('*')
                .eq('user_id', queryUserId)
                .eq('is_active', true)
                .order('due_day', { ascending: true })
              
              // Calculate financial totals
              const totalIncome = transactions?.filter((t: any) => t.transaction_type === 'income').reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0
              const totalExpenses = transactions?.filter((t: any) => t.transaction_type === 'expense').reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0
              const balance = totalIncome - totalExpenses
              
              // Calculate goals stats
              const totalGoals = goals?.length || 0
              const completedGoals = goals?.filter((g: any) => g.status === 'completed').length || 0
              const activeGoals = goals?.filter((g: any) => g.status === 'active').length || 0
              const totalGoalAmount = goals?.filter((g: any) => g.status === 'active').reduce((sum: number, g: any) => sum + (g.target_amount || 0), 0) || 0
              const totalSavedTowardsGoals = goals?.filter((g: any) => g.status === 'active').reduce((sum: number, g: any) => sum + (g.current_amount || 0), 0) || 0
              
              // Calculate learning stats
              const completedModules = new Set(learningProgress?.map((r: any) => r.module_id)).size
              const totalModules = 16
              const learningPercentage = ((completedModules / totalModules) * 100).toFixed(0)
              
              // Calculate challenges stats
              const activeChallenges = challenges?.filter((c: any) => c.status === 'active' || c.status === 'in_progress')?.length || 0
              const completedChallenges = challenges?.filter((c: any) => c.status === 'completed')?.length || 0
              
              // Calculate monthly bills stats
              const totalMonthlyObligation = monthlyBills?.reduce((sum: number, b: any) => sum + (b.amount || 0), 0) || 0
              
              functionResult = JSON.stringify({
                success: true,
                financial: {
                  totalIncome,
                  totalExpenses,
                  currentBalance: balance,
                  transactionCount: transactions?.length || 0
                },
                goals: {
                  total: totalGoals,
                  completed: completedGoals,
                  active: activeGoals,
                  totalTargetAmount: totalGoalAmount,
                  totalSaved: totalSavedTowardsGoals,
                  progressPercentage: totalGoalAmount > 0 ? ((totalSavedTowardsGoals / totalGoalAmount) * 100).toFixed(1) + '%' : '0%'
                },
                learning: {
                  completedModules,
                  totalModules,
                  progressPercentage: learningPercentage + '%'
                },
                challenges: {
                  active: activeChallenges,
                  completed: completedChallenges,
                  total: challenges?.length || 0
                },
                monthlyBills: {
                  total: monthlyBills?.length || 0,
                  totalMonthlyAmount: totalMonthlyObligation
                },
                message: `Financial: ₱${totalIncome.toLocaleString()} income, ₱${totalExpenses.toLocaleString()} expenses, ₱${balance.toLocaleString()} balance | Monthly Bills: ₱${totalMonthlyObligation.toLocaleString()}/month | Goals: ${completedGoals}/${totalGoals} completed | Learning: ${completedModules}/${totalModules} modules (${learningPercentage}%) | Challenges: ${activeChallenges} active, ${completedChallenges} completed`
              })
            } catch (error) {
              console.error('❌ Financial summary error:', error)
              functionResult = JSON.stringify({
                success: false,
                error: "Failed to fetch user data. Please try again later."
              })
            }
            break
          
          case "suggest_work_opportunities":
            const workSuggestions = this.generateWorkSuggestions(functionArgs.skills || functionArgs.query || JSON.stringify(functionArgs))
            functionResult = JSON.stringify(workSuggestions)
            break
          
          case "suggest_learning_resources":
            console.log('📚 Learning resources requested with args:', functionArgs)
            const skillQuery = functionArgs.skill || functionArgs.query || JSON.stringify(functionArgs)
            console.log('📚 Skill query:', skillQuery)
            const learningMatches = findLearningResources(skillQuery)
            console.log('📚 Found matches:', learningMatches.length)
            
            if (learningMatches.length > 0) {
              functionResult = JSON.stringify({
                foundSkills: learningMatches.map(skill => ({
                  skill: skill.skill,
                  category: skill.category,
                  description: skill.description,
                  averageEarning: skill.averageEarning,
                  timeToLearn: skill.timeToLearn,
                  topResources: skill.resources.slice(0, 5).map(resource => ({
                    title: resource.title,
                    url: resource.url,
                    type: resource.type,
                    provider: resource.provider,
                    difficulty: resource.difficulty,
                    duration: resource.duration,
                    isFree: resource.isFree,
                    description: resource.description
                  }))
                })),
                totalSkillsFound: learningMatches.length
              })
            } else {
              const beginnerSkills = getBeginnerFriendlySkills()
              functionResult = JSON.stringify({
                message: "No exact match found. Here are beginner-friendly skills:",
                recommendedSkills: beginnerSkills.map(skill => ({
                  skill: skill.skill,
                  category: skill.category,
                  description: skill.description,
                  averageEarning: skill.averageEarning,
                  timeToLearn: skill.timeToLearn,
                  topResources: skill.resources.slice(0, 3).map(resource => ({
                    title: resource.title,
                    url: resource.url,
                    type: resource.type,
                    difficulty: resource.difficulty,
                    isFree: resource.isFree
                  }))
                }))
              })
            }
            break
          
          case "create_financial_goal":
            console.log('🎯 Creating financial goal with args:', functionArgs)
            try {
              // Add userId from userContext if available
              const goalData = {
                ...functionArgs,
                userId: userContext?.id || functionArgs.userId,
                aiGenerated: true
              }
              
              const goalResponse = await fetch(`${getApiBaseUrl()}/api/goals/create`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(goalData)
              })

              if (!goalResponse.ok) {
                const error = await goalResponse.json()
                functionResult = JSON.stringify({
                  success: false,
                  error: error.error || 'Failed to create goal'
                })
              } else {
                const result = await goalResponse.json()
                console.log('✅ Goal created successfully:', result.goal)
                functionResult = JSON.stringify({
                  success: true,
                  goal: result.goal,
                  message: `Goal "${result.goal.title}" successfully created! Target: ₱${result.goal.target_amount.toLocaleString()}`
                })
              }
            } catch (error) {
              console.error('❌ Goal creation error:', error)
              functionResult = JSON.stringify({
                success: false,
                error: "Failed to create goal. Please try again later."
              })
            }
            break
          
          case "add_expense":
            console.log('💸 Adding expense with args:', functionArgs)
            try {
              const expenseData = {
                ...functionArgs,
                userId: userContext?.id || functionArgs.userId,
                transactionType: 'expense'
              }
              
              const expenseResponse = await fetch(`${getApiBaseUrl()}/api/transactions/add`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData)
              })

              if (!expenseResponse.ok) {
                const error = await expenseResponse.json()
                functionResult = JSON.stringify({
                  success: false,
                  error: error.error || 'Failed to add expense'
                })
              } else {
                const result = await expenseResponse.json()
                console.log('✅ Expense added:', result.transaction)
                functionResult = JSON.stringify({
                  success: true,
                  transaction: result.transaction,
                  message: result.message
                })
              }
            } catch (error) {
              console.error('❌ Expense creation error:', error)
              functionResult = JSON.stringify({
                success: false,
                error: "Failed to add expense. Please try again later."
              })
            }
            break

          case "add_income":
            console.log('💰 Adding income with args:', functionArgs)
            try {
              const incomeData = {
                ...functionArgs,
                userId: userContext?.id || functionArgs.userId,
                transactionType: 'income'
              }
              
              const incomeResponse = await fetch(`${getApiBaseUrl()}/api/transactions/add`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(incomeData)
              })

              if (!incomeResponse.ok) {
                const error = await incomeResponse.json()
                functionResult = JSON.stringify({
                  success: false,
                  error: error.error || 'Failed to add income'
                })
              } else {
                const result = await incomeResponse.json()
                console.log('✅ Income added:', result.transaction)
                functionResult = JSON.stringify({
                  success: true,
                  transaction: result.transaction,
                  message: result.message
                })
              }
            } catch (error) {
              console.error('❌ Income creation error:', error)
              functionResult = JSON.stringify({
                success: false,
                error: "Failed to add income. Please try again later."
              })
            }
            break

          case "add_monthly_bill":
            console.log('📅 Adding monthly bill with args:', functionArgs)
            try {
              const billData = {
                ...functionArgs,
                userId: userContext?.id || functionArgs.userId
              }
              
              const billResponse = await fetch(`${getApiBaseUrl()}/api/monthly-bills/add`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(billData)
              })

              if (!billResponse.ok) {
                const error = await billResponse.json()
                functionResult = JSON.stringify({
                  success: false,
                  error: error.error || 'Failed to add monthly bill'
                })
              } else {
                const result = await billResponse.json()
                console.log('✅ Monthly bill added:', result.bill)
                functionResult = JSON.stringify({
                  success: true,
                  bill: result.bill,
                  message: result.message
                })
              }
            } catch (error) {
              console.error('❌ Monthly bill creation error:', error)
              functionResult = JSON.stringify({
                success: false,
                error: "Failed to add monthly bill. Please try again later."
              })
            }
            break

          case "list_monthly_bills":
            console.log('📋 Listing monthly bills')
            try {
              // Use service role to bypass RLS
              const { createClient } = await import('@supabase/supabase-js')
              const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).trim()
              )
              
              const queryUserId = userContext?.id || userId
              
              // Fetch active monthly bills
              const { data: bills, error } = await supabase
                .from('scheduled_payments')
                .select('*')
                .eq('user_id', queryUserId)
                .eq('is_active', true)
                .order('due_day', { ascending: true })
              
              if (error) {
                console.error('❌ Error fetching bills:', error)
                functionResult = JSON.stringify({
                  success: false,
                  error: 'Failed to fetch monthly bills'
                })
              } else {
                const totalMonthly = bills?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0
                
                // Format bills for clean display
                const formattedBills = bills?.map((b, idx) => ({
                  number: idx + 1,
                  name: b.name,
                  amount: b.amount,
                  category: b.category,
                  dueDay: b.due_day,
                  description: b.description
                })) || []
                
                console.log('✅ Found', bills?.length || 0, 'active bills, total:', totalMonthly)
                
                functionResult = JSON.stringify({
                  success: true,
                  bills: formattedBills,
                  totalBills: bills?.length || 0,
                  totalMonthlyAmount: totalMonthly,
                  message: `Found ${bills?.length || 0} active monthly bills totaling ₱${totalMonthly.toLocaleString()}/month. IMPORTANT: List each bill individually with its exact name and amount from the bills array.`
                })
              }
            } catch (error) {
              console.error('❌ List bills error:', error)
              functionResult = JSON.stringify({
                success: false,
                error: 'Failed to fetch monthly bills. Please try again later.'
              })
            }
            break

          case "list_transactions":
            console.log('📋 Listing transactions with args:', functionArgs)
            try {
              // Use service role to bypass RLS
              const { createClient } = await import('@supabase/supabase-js')
              const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).trim()
              )
              
              const queryUserId = userContext?.id || userId
              const { category, startDate, endDate, limit = 50 } = functionArgs
              
              // Build query
              let query = supabase
                .from('transactions')
                .select('*')
                .eq('user_id', queryUserId)
                .order('date', { ascending: false })
                .limit(limit)
              
              // Apply filters
              if (category && category !== 'all') {
                query = query.eq('category', category)
              }
              if (startDate) {
                query = query.gte('date', startDate)
              }
              if (endDate) {
                query = query.lte('date', endDate)
              }
              
              const { data: transactions, error } = await query
              
              if (error) {
                functionResult = JSON.stringify({
                  success: false,
                  error: 'Failed to fetch transactions'
                })
              } else {
                // Calculate summary
                const totalIncome = transactions?.filter((t: any) => t.transaction_type === 'income').reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0
                const totalExpenses = transactions?.filter((t: any) => t.transaction_type === 'expense').reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0
                
                // Format transactions for AI to present
                const formattedTransactions = transactions?.map((t: any) => ({
                  id: t.id,
                  type: t.transaction_type,
                  amount: t.amount,
                  merchant: t.merchant,
                  category: t.category,
                  date: t.date,
                  paymentMethod: t.payment_method,
                  notes: t.notes
                }))
                
                functionResult = JSON.stringify({
                  success: true,
                  transactions: formattedTransactions,
                  summary: {
                    totalIncome,
                    totalExpenses,
                    netIncome: totalIncome - totalExpenses,
                    count: transactions?.length || 0
                  },
                  message: `Found ${transactions?.length || 0} transactions. Total income: ₱${totalIncome.toLocaleString()}, Total expenses: ₱${totalExpenses.toLocaleString()}`
                })
              }
            } catch (error) {
              console.error('❌ List transactions error:', error)
              functionResult = JSON.stringify({
                success: false,
                error: "Failed to fetch transactions. Please try again later."
              })
            }
            break

          case "update_transaction":
            console.log('✏️ Updating transaction with args:', functionArgs)
            try {
              // Use service role to bypass RLS
              const { createClient } = await import('@supabase/supabase-js')
              const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).trim()
              )
              
              const queryUserId = userContext?.id || userId
              const { transactionId, ...updates } = functionArgs
              
              // Build update object - only include provided fields
              const updateData: any = {}
              if (updates.amount !== undefined) updateData.amount = updates.amount
              if (updates.category !== undefined) updateData.category = updates.category
              if (updates.merchant !== undefined) updateData.merchant = updates.merchant
              if (updates.date !== undefined) updateData.date = updates.date
              if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod
              if (updates.notes !== undefined) updateData.notes = updates.notes
              if (updates.transactionType !== undefined) updateData.transaction_type = updates.transactionType
              
              const { data: transaction, error } = await supabase
                .from('transactions')
                .update(updateData)
                .eq('id', transactionId)
                .eq('user_id', queryUserId)
                .select()
                .single()
              
              if (error || !transaction) {
                functionResult = JSON.stringify({
                  success: false,
                  error: 'Failed to update transaction or transaction not found'
                })
              } else {
                functionResult = JSON.stringify({
                  success: true,
                  transaction,
                  message: `Transaction updated successfully! New amount: ₱${transaction.amount}, Category: ${transaction.category}`
                })
              }
            } catch (error) {
              console.error('❌ Update transaction error:', error)
              functionResult = JSON.stringify({
                success: false,
                error: "Failed to update transaction. Please try again later."
              })
            }
            break
          
          default:
            functionResult = "Function not available"
        }

        console.log('📤 Tool result length:', functionResult.length)
        
        // Store the tool response
        toolResponses.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: functionResult
        })
      }

        // Send all function results back to OpenAI for final response
        const finalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
              assistantMessage,
              ...toolResponses
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        })

        const finalData = await finalResponse.json()
        console.log('📨 Final response received:', { 
          hasChoices: !!finalData.choices, 
          choicesLength: finalData.choices?.length,
          hasError: !!finalData.error 
        })
        
        if (finalData.error) {
          console.error('❌ OpenAI API Error:', finalData.error)
          throw new Error(finalData.error.message || 'OpenAI API error')
        }
        
        if (!finalData.choices || finalData.choices.length === 0) {
          console.error('❌ No choices in response:', finalData)
          throw new Error('No response from OpenAI')
        }
        
        const aiResponse = finalData.choices[0]?.message?.content || "I'm having trouble generating a response."
        
        // 🛡️ ANTI-HALLUCINATION VALIDATION
        return this.validateResponse(aiResponse, toolResponses)
      } else {
        // No function call, use the regular response
        const aiResponse = assistantMessage?.content || "I'm having trouble generating a response."
        
        // 🛡️ ANTI-HALLUCINATION VALIDATION
        return this.validateResponse(aiResponse, [])
      }
    } catch (error) {
      console.error('❌ Agent error:', error)
      return "I encountered an error processing your request. Please try again."
    }
  }

  /**
   * 🛡️ ANTI-HALLUCINATION VALIDATOR
   * Validates AI responses to prevent hallucinations before sending to user
   */
  private validateResponse(response: string, toolResults: any[]): string {
    console.log('🛡️ Validating response for hallucinations...')
    
    let validatedResponse = response
    let warnings: string[] = []
    
    /* ============================================
       CODE DETECTION DISABLED TEMPORARILY
       ============================================
       REASON: Too many false positives - was blocking normal responses
       TODO: Re-enable with better detection logic
       ============================================
    
    // 0. 🔴 CHECK FOR CODE GENERATION (HIGHEST PRIORITY - MUST BLOCK)
    const codePatterns = [
      /```[\s\S]*?```/g,                    // Code blocks with backticks
      /`[^`\n]{10,}`/g,                     // Inline code (longer than 10 chars)
      /<[a-z]+[^>]*>.*?<\/[a-z]+>/gi,       // HTML tags
      /(?:class|def|function|const|let|var)\s+\w+/g,  // Programming keywords
      /import\s+[\w{},\s]+\s+from/g,        // Import statements
      /\bdef\s+\w+\([^)]*\):/g,             // Python function definitions
      /\bfunction\s+\w+\s*\(/g,             // JavaScript functions
    ]
    
    let hasCode = false
    for (const pattern of codePatterns) {
      pattern.lastIndex = 0
      if (pattern.test(response)) {
        hasCode = true
        console.error('🔴 CODE GENERATION DETECTED! Blocking response.')
        warnings.push('Code generation attempt blocked')
        break
      }
    }
    
    if (hasCode) {
      // COMPLETELY REPLACE the response - do NOT send code to user
      return "I'm a financial literacy assistant, not a coding helper! However, if you're interested in learning programming to earn money as a freelancer or side hustle, I can suggest free learning resources and platforms where programmers earn. Would you like that?"
    }
    ============================================ */
    
    // 1. CHECK FOR FAKE YOUTUBE LINKS
    const youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s\)]+/gi
    const youtubeLinks = response.match(youtubePattern)
    
    if (youtubeLinks && youtubeLinks.length > 0) {
      console.log('🔍 Found YouTube links:', youtubeLinks)
      
      // Check if learning resources tool was called
      const learningToolCalled = toolResults.some(tr => {
        try {
          const content = JSON.parse(tr.content)
          return content.foundSkills || content.recommendedSkills
        } catch {
          return false
        }
      })
      
      if (!learningToolCalled) {
        console.warn('⚠️ HALLUCINATION DETECTED: YouTube links without tool call!')
        warnings.push('YouTube links detected without learning resources tool')
        
        // Remove the fake links
        validatedResponse = validatedResponse.replace(youtubePattern, '[Learning resources available in the Learning section]')
      }
    }
    
    // 2. 🚨 CHECK FOR BILL HALLUCINATIONS (CRITICAL!)
    // If user asked about bills, verify AI listed ACTUAL bills from database
    const billKeywords = /\b(?:bills?|monthly bills?|active bills?|recurring|subscriptions?|payments?)\b/i
    const isBillQuery = billKeywords.test(response) || response.toLowerCase().includes('bill')
    
    if (isBillQuery) {
      console.log('🚨 Bill query detected, validating bill amounts...')
      
      // Find get_financial_summary tool result
      const financialSummary = toolResults.find(tr => {
        try {
          const content = JSON.parse(tr.content)
          return content.monthlyBills && content.monthlyBills.allBills
        } catch {
          return false
        }
      })
      
      if (financialSummary) {
        try {
          const summaryData = JSON.parse(financialSummary.content)
          const actualBills = summaryData.monthlyBills.allBills || []
          const actualTotal = summaryData.monthlyBills.totalMonthlyAmount || 0
          
          console.log('📊 ACTUAL BILLS from database:', actualBills.map((b: any) => `${b.name}: ₱${b.amount}`).join(', '))
          
          // Extract bill names and amounts from AI response
          const billPattern = /(?:•|\d+\.)\s*([A-Za-z\s]+)(?:Bill)?:\s*₱?([\d,]+)/gi
          const mentionedBills: { name: string, amount: number }[] = []
          let match
          
          while ((match = billPattern.exec(response)) !== null) {
            mentionedBills.push({
              name: match[1].trim().toLowerCase(),
              amount: parseInt(match[2].replace(/,/g, ''))
            })
          }
          
          console.log('🤖 AI MENTIONED bills:', mentionedBills.map(b => `${b.name}: ₱${b.amount}`).join(', '))
          
          // Validate each mentioned bill
          let hasHallucination = false
          for (const mentioned of mentionedBills) {
            const actualBill = actualBills.find((b: any) => 
              b.name.toLowerCase().includes(mentioned.name) || mentioned.name.includes(b.name.toLowerCase())
            )
            
            if (!actualBill) {
              console.error(`🔴 HALLUCINATION DETECTED: AI mentioned "${mentioned.name}" which doesn't exist in database!`)
              hasHallucination = true
            } else if (Math.abs(actualBill.amount - mentioned.amount) > 10) {
              console.error(`🔴 AMOUNT HALLUCINATION: AI said ${mentioned.name} = ₱${mentioned.amount}, but actual = ₱${actualBill.amount}`)
              hasHallucination = true
            }
          }
          
          // If hallucination detected, force correct listing
          if (hasHallucination || mentionedBills.length === 0) {
            console.error('🔴 FORCING CORRECT BILL LISTING!')
            warnings.push('Bill hallucination detected - forcing correct data')
            
            const correctListing = actualBills.map((b: any, idx: number) => 
              `${idx + 1}. ${b.name}: ₱${b.amount.toLocaleString()}`
            ).join('\n')
            
            validatedResponse = `Here are your current monthly bills:\n\n${correctListing}\n\nTotal Monthly Bills: ₱${actualTotal.toLocaleString()}\n\nIf you need more information about any specific bill, feel free to ask!`
          }
          
        } catch (error) {
          console.error('❌ Error validating bills:', error)
        }
      }
    }
    
    // 3. CHECK FOR SUSPICIOUS NUMBER PATTERNS
    // Flag if response contains numbers that might be confused data
    const hasLargeNumbers = /₱\s*\d{5,}/g.test(response)
    if (hasLargeNumbers) {
      console.log('🔍 Large numbers detected, checking if financial summary was called...')
      
      const financialToolCalled = toolResults.some(tr => {
        try {
          const content = JSON.parse(tr.content)
          return content.financial || content.userProfile || content.goals
        } catch {
          return false
        }
      })
      
      if (!financialToolCalled && (response.includes('monthly income') || response.includes('goal') || response.includes('saved'))) {
        console.warn('⚠️ POTENTIAL DATA CONFUSION: Numbers mentioned without data fetch!')
        warnings.push('Financial data mentioned without get_financial_summary call')
      }
    }
    
    // 3. CHECK FOR GENERIC "SEARCH YOUTUBE" SUGGESTIONS
    const searchSuggestions = [
      /search (?:for|on) youtube/gi,
      /look (?:for|on) youtube/gi,
      /find (?:on|in) youtube/gi,
      /check youtube for/gi,
      /youtube search/gi
    ]
    
    searchSuggestions.forEach(pattern => {
      // Reset regex lastIndex to avoid issues with /g flag
      pattern.lastIndex = 0
      if (pattern.test(validatedResponse)) {
        console.warn('⚠️ LAZY RESPONSE DETECTED: Suggesting to search YouTube instead of providing links')
        warnings.push('Generic YouTube search suggestion detected')
        
        // Reset again before replace
        pattern.lastIndex = 0
        validatedResponse = validatedResponse.replace(pattern, 'let me find specific resources for you in our Learning section')
      }
    })
    
    // 4. CHECK FOR FABRICATED PLATFORM LINKS
    const suspiciousPatterns = [
      /https?:\/\/(?:www\.)?example\.com/gi,
      /https?:\/\/(?:www\.)?placeholder\.com/gi,
      /\[link\]/gi,
      /\[url\]/gi
    ]
    
    suspiciousPatterns.forEach(pattern => {
      // Reset regex lastIndex to avoid issues with /g flag
      pattern.lastIndex = 0
      if (pattern.test(validatedResponse)) {
        console.warn('⚠️ PLACEHOLDER LINK DETECTED: Fake/example URLs found')
        warnings.push('Placeholder links detected')
        
        // Reset again before replace
        pattern.lastIndex = 0
        validatedResponse = validatedResponse.replace(pattern, '[Available in the platform]')
      }
    })
    
    // 5. LOG VALIDATION RESULTS
    if (warnings.length > 0) {
      console.error('🚨 VALIDATION WARNINGS:', warnings)
      console.error('📝 Original response:', response.substring(0, 200) + '...')
      console.error('✅ Validated response:', validatedResponse.substring(0, 200) + '...')
    } else {
      console.log('✅ Response validation passed - no hallucinations detected')
    }
    
    return validatedResponse
  }

  private generateWorkSuggestions(input: string): any {
    const lowerInput = input.toLowerCase()
    
    // Common freelancing platforms and job sites for Philippines
    const freelancingPlatforms = {
      general: [
        { name: 'Upwork', url: 'https://www.upwork.com', description: 'Global freelancing platform with diverse opportunities' },
        { name: 'Freelancer.com', url: 'https://freelancer.com', description: 'International marketplace for various skills' },
        { name: 'Fiverr', url: 'https://fiverr.com', description: 'Gig-based platform perfect for specific services' },
        { name: 'OnlineJobs.ph', url: 'https://onlinejobs.ph', description: 'Philippines dedicated job platform' },
        { name: 'Kalibrr', url: 'https://kalibrr.com', description: 'Philippine job platform with remote opportunities' }
      ],
      writing: [
        { name: 'ContentFly', url: 'https://contentfly.com', description: 'Content writing platform' },
        { name: 'WriterAccess', url: 'https://writeraccess.com', description: 'Professional writing marketplace' },
        { name: 'Contently', url: 'https://contently.com', description: 'Content marketing platform' }
      ],
      design: [
        { name: '99designs', url: 'https://99designs.com', description: 'Design contest and marketplace platform' },
        { name: 'Dribbble Jobs', url: 'https://dribbble.com/jobs', description: 'Design job board' },
        { name: 'Behance', url: 'https://behance.net', description: 'Creative portfolio and job platform' }
      ],
      tech: [
        { name: 'GitHub Jobs', url: 'https://github.com/jobs', description: 'Tech jobs from GitHub' },
        { name: 'Stack Overflow Jobs', url: 'https://stackoverflow.com/jobs', description: 'Developer job board' },
        { name: 'AngelList', url: 'https://angel.co', description: 'Startup jobs and equity opportunities' }
      ],
      tutoring: [
        { name: 'Preply', url: 'https://preply.com', description: 'Online tutoring platform' },
        { name: 'iTalki', url: 'https://italki.com', description: 'Language teaching platform' },
        { name: 'Cambly', url: 'https://cambly.com', description: 'English conversation tutoring' }
      ],
      delivery: [
        { name: 'GrabFood', url: 'https://grab.com/ph/driver/', description: 'Food delivery driver opportunities' },
        { name: 'Foodpanda', url: 'https://foodpanda.com.ph', description: 'Food delivery platform' },
        { name: 'Lalamove', url: 'https://lalamove.com', description: 'Logistics and delivery platform' }
      ]
    }

    // Analyze input to suggest relevant categories
    let suggestions: any[] = []
    let targetEarning = 0
    
    // Extract financial goal if mentioned
    const amountMatch = input.match(/(?:₱|php|pesos?)\s*([0-9,]+)/i)
    if (amountMatch) {
      targetEarning = parseInt(amountMatch[1].replace(/,/g, ''))
    }

    // Skill-based suggestions
    if (lowerInput.includes('writing') || lowerInput.includes('content') || lowerInput.includes('blog')) {
      suggestions.push({
        category: 'Content Writing & Copywriting',
        platforms: freelancingPlatforms.writing.concat(freelancingPlatforms.general.slice(0, 3)),
        earningPotential: '₱500-2,000 per article',
        skills: ['English proficiency', 'Research skills', 'SEO knowledge'],
        tips: 'Start with blog posts and social media content. Build a portfolio on Medium or personal blog.'
      })
    }

    if (lowerInput.includes('design') || lowerInput.includes('graphic') || lowerInput.includes('logo')) {
      suggestions.push({
        category: 'Graphic Design & Creative',
        platforms: freelancingPlatforms.design.concat(freelancingPlatforms.general.slice(0, 3)),
        earningPotential: '₱1,000-5,000 per project',
        skills: ['Adobe Creative Suite', 'Canva', 'Design principles'],
        tips: 'Create sample designs for different industries. Offer logo + business card packages.'
      })
    }

    if (lowerInput.includes('programming') || lowerInput.includes('coding') || lowerInput.includes('web') || lowerInput.includes('app')) {
      suggestions.push({
        category: 'Programming & Web Development',
        platforms: freelancingPlatforms.tech.concat(freelancingPlatforms.general.slice(0, 3)),
        earningPotential: '₱2,000-10,000 per project',
        skills: ['HTML/CSS', 'JavaScript', 'Python/PHP', 'Database management'],
        tips: 'Start with simple websites. Learn popular frameworks like React or WordPress.'
      })
    }

    if (lowerInput.includes('teaching') || lowerInput.includes('tutor') || lowerInput.includes('english') || lowerInput.includes('math')) {
      suggestions.push({
        category: 'Online Tutoring & Teaching',
        platforms: freelancingPlatforms.tutoring.concat([freelancingPlatforms.general[0]]),
        earningPotential: '₱300-800 per hour',
        skills: ['Subject expertise', 'Communication', 'Patience', 'Internet connection'],
        tips: 'Filipinos are in high demand for English tutoring. Flexible schedule perfect for students.'
      })
    }

    if (lowerInput.includes('delivery') || lowerInput.includes('driver') || lowerInput.includes('grab') || lowerInput.includes('motorcycle')) {
      suggestions.push({
        category: 'Delivery & Transportation',
        platforms: freelancingPlatforms.delivery,
        earningPotential: '₱800-1,500 per day',
        skills: ['Valid license', 'Own vehicle', 'Navigation skills', 'Time management'],
        tips: 'Peak hours (lunch, dinner) offer higher earnings. Maintain good ratings for more orders.'
      })
    }

    // If no specific skills mentioned, provide general suggestions
    if (suggestions.length === 0) {
      suggestions = [
        {
          category: 'Data Entry & Virtual Assistant',
          platforms: freelancingPlatforms.general,
          earningPotential: '₱15,000-25,000 per month',
          skills: ['Computer literacy', 'Attention to detail', 'English communication', 'Time management'],
          tips: 'Perfect for beginners. Start with simple tasks and build reputation gradually.'
        },
        {
          category: 'Social Media Management',
          platforms: freelancingPlatforms.general.slice(0, 3),
          earningPotential: '₱8,000-20,000 per month per client',
          skills: ['Social media knowledge', 'Content creation', 'Basic design', 'Scheduling tools'],
          tips: 'Offer packages including content creation, posting schedule, and engagement management.'
        },
        {
          category: 'Online Selling & E-commerce',
          platforms: [
            { name: 'Shopee', url: 'https://shopee.ph', description: 'Philippines e-commerce platform' },
            { name: 'Lazada', url: 'https://lazada.com.ph', description: 'Online marketplace' },
            { name: 'Facebook Marketplace', url: 'https://facebook.com/marketplace', description: 'Social commerce platform' }
          ],
          earningPotential: '₱5,000-50,000 per month',
          skills: ['Product sourcing', 'Customer service', 'Basic photography', 'Marketing'],
          tips: 'Start with products you understand. Use dropshipping to minimize initial investment.'
        }
      ]
    }

    // Add earning timeline if target amount was mentioned
    if (targetEarning > 0) {
      suggestions.forEach(suggestion => {
        const avgMonthlyEarning = this.extractAvgEarning(suggestion.earningPotential)
        if (avgMonthlyEarning > 0) {
          const monthsNeeded = Math.ceil(targetEarning / avgMonthlyEarning)
          suggestion.timeToGoal = `Approximately ${monthsNeeded} month${monthsNeeded > 1 ? 's' : ''} to reach ₱${targetEarning.toLocaleString()}`
        }
      })
    }

    return {
      suggestions,
      generalTips: [
        'Start with one platform and build your reputation before expanding',
        'Always deliver quality work on time to get positive reviews',
        'Set aside 20% of earnings for taxes and emergency fund',
        'Invest in improving your skills through free online courses',
        'Network with other freelancers for referrals and tips'
      ],
      nextSteps: [
        'Create professional profiles on suggested platforms',
        'Build a portfolio showcasing your best work',
        'Set competitive but fair pricing for your services',
        'Apply to 5-10 relevant jobs daily to build momentum'
      ]
    }
  }

  private extractAvgEarning(earningText: string): number {
    // Simple extraction of average earning from text like "₱15,000-25,000 per month"
    const matches = earningText.match(/₱([0-9,]+)(?:-([0-9,]+))?/g)
    if (matches && matches.length > 0) {
      const numbers = matches[0].replace(/₱|,/g, '').match(/\d+/g)
      if (numbers) {
        if (numbers.length === 2) {
          return (parseInt(numbers[0]) + parseInt(numbers[1])) / 2
        } else {
          return parseInt(numbers[0])
        }
      }
    }
    return 0
  }
}
