'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { ArrowLeft, ArrowRight, BookOpen, Target, Lightbulb, ExternalLink, Calculator, PiggyBank, TrendingUp, Shield, Globe, BarChart3, CheckCircle, Lock, Edit3, AlertCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-hooks'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function TopicLearningPage() {
  const params = useParams()
  const topicId = params.topicId as string
  const { user } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [reflectionInputs, setReflectionInputs] = useState<string[]>([])
  const [reflectionValidation, setReflectionValidation] = useState<{[key: number]: 'validating' | 'valid' | 'invalid' | null}>({})
  const [stepCompleted, setStepCompleted] = useState<boolean[]>([]) // Track completion of each step
  
  // For calculator activity
  const [calculatorInputs, setCalculatorInputs] = useState<{[key: string]: string}>({})
  
  // For categorization activity
  const [categorizedItems, setCategorizedItems] = useState<{[key: string]: string[]}>({})
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const topicModules = {
    budgeting: {
      title: 'Budgeting Mastery for Students',
      description: 'Learn to manage your allowance and starting salary like a pro',
      icon: Calculator,
      color: 'blue',
      steps: [
        {
          type: 'learn',
          title: 'Learn: What is Budgeting?',
          content: {
            text: `Budgeting is simply telling your money where to go before you spend it. Whether you're getting ₱3,000 weekly allowance or ₱20,000 monthly starting salary, budgeting helps you:

• Cover all your essential expenses (food, transport, school supplies)
• Still have money for fun activities with friends
• Save for emergencies and future goals
• Avoid asking parents for extra money

**The 50-30-20 Rule for Filipino Students:**
• 50% for NEEDS: Food, transportation, school supplies, load
• 30% for WANTS: Movies, coffee dates, new clothes, games
• 20% for SAVINGS: Emergency fund, future goals

**Real Example - ₱8,000 Monthly Allowance:**
• Needs: ₱4,000 (meals ₱2,500, transport ₱1,000, supplies ₱500)
• Wants: ₱2,400 (entertainment ₱1,200, shopping ₱1,200)
• Savings: ₱1,600 (builds ₱19,200 yearly emergency fund!)`,
            keyPoints: [
              'Budgeting prevents you from running out of money before next allowance/payday',
              'The 50-30-20 rule adapts to any income level - from ₱5,000 to ₱50,000',
              'Treating savings as a "need" builds wealth automatically'
            ],
            sources: [
              { title: 'Khan Academy - Budget Planning', url: 'https://www.khanacademy.org/college-careers-more/financial-literacy/xa6995ea67a8e9fdd:budgeting-and-saving/xa6995ea67a8e9fdd:budgeting/a/planning-a-budget-start', type: 'Educational' }
            ]
          }
        },
        {
          type: 'apply',
          activityType: 'calculator',
          title: 'Apply: Create Your Personal Budget',
          content: {
            scenario: 'Meet Jana, a 3rd year college student. Her parents give her ₱12,000 monthly allowance. She wants to follow the 50-30-20 budgeting rule.',
            task: 'Calculate how much Jana should allocate for each category using the 50-30-20 rule:',
            monthlyIncome: 12000,
            fields: [
              { 
                id: 'needs',
                label: 'Needs (50%)', 
                expected: 6000,
                hint: 'Food, transport, school supplies'
              },
              { 
                id: 'wants',
                label: 'Wants (30%)', 
                expected: 3600,
                hint: 'Entertainment, shopping, hobbies'
              },
              { 
                id: 'savings',
                label: 'Savings (20%)', 
                expected: 2400,
                hint: 'Emergency fund, future goals'
              }
            ],
            explanation: 'Perfect! Jana should allocate ₱6,000 for needs, ₱3,600 for wants, and ₱2,400 for savings. This means she can save ₱28,800 yearly while still enjoying college life!'
          }
        },
        {
          type: 'reflect',
          title: 'Reflect: Your Budget Action Plan',
          content: {
            questions: [
              'Think about your last month\'s spending. What patterns do you notice, and what surprised you the most?',
              'If you could save ₱5,000 every month for a year, what would that mean for your life and goals?',
              'What\'s one spending habit you have that you\'re not proud of, and why do you think you do it?'
            ],
            actionItems: [
              'Download a budgeting app or create a simple expense tracker',
              'Open a separate savings account for your 20% allocation',
              'Track all expenses for one week to see your actual spending patterns'
            ]
          }
        }
      ]
    },
    saving: {
      title: 'Smart Saving for Filipino Youth',
      description: 'Discover where and how to save money for maximum growth',
      icon: PiggyBank,
      color: 'green',
      steps: [
        {
          type: 'learn',
          title: 'Learn: Where to Save Your Money',
          content: {
            text: `Not all savings accounts are created equal! Where you save your money can make a huge difference in how fast it grows.

**Digital Banks (Best for Students):**
• CIMB Bank: Up to 4% annually, ₱100 minimum, free via GCash
• ING Bank: Up to 2.5% annually, ₱1,000 minimum
• Tonik Bank: Up to 6% annually, ₱1,000 minimum

**Digital Wallets (Most Convenient):**
• GCash GSave: 2.6% annually, instant access, no minimum
• PayMaya Save: 3% annually, easy deposits via 7-Eleven

**Comparison Example:**
₱10,000 saved for 1 year:
• Traditional bank (0.25%): Earns ₱25
• GCash GSave (2.6%): Earns ₱260
• CIMB Bank (4%): Earns ₱400
• Tonik Bank (6%): Earns ₱600`,
            keyPoints: [
              'Digital banks offer 10-20x higher interest than traditional banks',
              'All mentioned banks are PDIC-insured (safe up to ₱500,000)',
              'Start with digital wallets for convenience, upgrade to banks for higher amounts'
            ],
            sources: [
              { title: 'BSP List of Digital Banks', url: 'https://www.bsp.gov.ph/SitePages/Default.aspx', type: 'Government' }
            ]
          }
        },
        {
          type: 'apply',
          title: 'Apply: Choose Your Savings Strategy',
          content: {
            scenario: 'Meet Carlos, a fresh graduate earning ₱25,000 monthly. He wants to save ₱5,000 monthly but is confused about where to put his money. He has ₱15,000 to start with and wants his savings to grow while staying accessible for emergencies.',
            task: 'What combination of savings accounts should Carlos use for his ₱5,000 monthly savings?',
            options: [
              'Put everything in GCash GSave (2.6% interest) for maximum convenience',
              'Split: ₱2,000 in GCash GSave for emergencies, ₱3,000 in Tonik Bank (6%) for growth',
              'Use only traditional bank savings account for safety',
              'Invest everything in stocks for maximum returns'
            ],
            correctAnswer: 'Split: ₱2,000 in GCash GSave for emergencies, ₱3,000 in Tonik Bank (6%) for growth',
            explanation: 'Carlos should diversify: ₱2,000 in GCash GSave for instant access to emergencies, ₱3,000 in Tonik Bank for higher growth (6% vs 2.6%). This strategy gives him both liquidity and higher returns on most of his savings.'
          }
        },
        {
          type: 'reflect',
          title: 'Reflect: Your Savings Plan',
          content: {
            questions: [
              'What does financial security mean to you personally, and how would it change your daily life?',
              'Imagine you had ₱50,000 saved up right now. How would that make you feel, and what would you do with it?',
              'What\'s your biggest fear or worry about money, and how might saving regularly help address that?'
            ],
            actionItems: [
              'Open a GCash GSave account this week for convenience',
              'Research one digital bank (CIMB, ING, or Tonik) for higher interest',
              'Set up automatic transfers to your savings account'
            ]
          }
        }
      ]
    },
    investing: {
      title: 'Investment Basics for Beginners',
      description: 'Start building wealth with beginner-friendly investments',
      icon: TrendingUp,
      color: 'purple',
      steps: [
        {
          type: 'learn',
          title: 'Learn: What is Investing?',
          content: {
            text: `Investing is putting your money to work to earn more money over time. Unlike saving where your money sits safely, investing involves some risk but offers much higher potential returns.

**Why Should Young Filipinos Invest?**
• Philippines inflation: 3-4% yearly average
• Money in 0.25% savings account loses purchasing power
• At 20 years old, you have 45+ years until retirement

**Investment Options for Beginners:**
• BPI Investment Funds: ₱1,000 minimum, professional management
• BDO Mutual Funds: Diversified portfolios, 6-10% historical returns
• COL Financial: ₱1,000 minimum, trade Philippine stocks

**Getting Started Strategy:**
Start with ₱1,000 monthly in a balanced mutual fund. Learn for 6 months, then gradually explore other options.`,
            keyPoints: [
              'Start investing early to harness the power of compound growth',
              'Mutual funds offer professional management and diversification for beginners',
              'Invest money you won\'t need for at least 3-5 years'
            ],
            sources: [
              { title: 'SEC Investor Education', url: 'https://www.sec.gov.ph/#gsc.tab=0', type: 'Government' }
            ]
          }
        },
        {
          type: 'apply',
          title: 'Apply: Start Your Investment Journey',
          content: {
            scenario: 'Meet Maria, 22 years old, earning ₱30,000 monthly. She has ₱50,000 in savings and wants to start investing. She can save ₱8,000 monthly (₱3,000 emergency fund, ₱5,000 potential investing). She wants to grow money for a house down payment in 10 years.',
            task: 'What should be Maria\'s first investment move?',
            options: [
              'Invest all ₱50,000 in Philippine stocks for maximum returns',
              'Start with ₱10,000 in BPI Balanced Fund, continue ₱2,000 monthly',
              'Keep everything in savings account until she has ₱100,000',
              'Invest ₱5,000 monthly in different mutual funds for diversification'
            ],
            correctAnswer: 'Start with ₱10,000 in BPI Balanced Fund, continue ₱2,000 monthly',
            explanation: 'Maria should start conservatively: ₱10,000 initial investment in a balanced mutual fund to learn, then ₱2,000 monthly (leaving ₱3,000 for continued emergency savings). This gives her 10 years to learn and grow her investment knowledge while building wealth for her house goal.'
          }
        },
        {
          type: 'reflect',
          title: 'Reflect: Your Investment Future',
          content: {
            questions: [
              'When you imagine yourself 10 years from now, what does financial freedom look like to you?',
              'What would you do if your investment lost 20% of its value in one month? How would you feel and react?',
              'If you could invest in anything right now (stocks, business, skills), what would excite you most and why?'
            ],
            actionItems: [
              'Visit one investment platform website to explore their offerings',
              'Calculate your potential investment amount using the 20% of income rule',
              'Set up a separate "investment fund" savings account'
            ]
          }
        }
      ]
    },
    'emergency-fund': {
      title: 'Emergency Fund Essentials',
      description: 'Build your financial safety net with smart emergency fund strategies',
      icon: Shield,
      color: 'orange',
      steps: [
        {
          type: 'learn',
          title: 'Learn: Why Emergency Funds Matter',
          content: {
            text: `An emergency fund is money set aside specifically for unexpected expenses or financial emergencies. For Filipino youth, this is crucial because:

**Common Emergencies for Students/Young Professionals:**
• Medical emergencies (₱5,000-15,000)
• Laptop/phone repairs or replacement (₱10,000-40,000)
• Job loss or reduced family income
• Emergency travel or family needs
• Unexpected school fees or requirements

**How Much Do You Need?**
• Students: ₱10,000-15,000 minimum
• Fresh graduates: 3 months of expenses (₱30,000-60,000)
• Working professionals: 6 months of expenses

**Where to Keep Emergency Funds:**
• GCash GSave: Instant access, 2.6% interest
• CIMB Bank: Higher interest (4%) with quick withdrawal
• Traditional savings account: Ultimate safety and accessibility`,
            keyPoints: [
              'Emergency funds prevent you from borrowing money or going into debt',
              'Keep emergency money separate from your regular savings',
              'Emergency funds should be easily accessible within 24 hours'
            ],
            sources: [
              { title: 'BSP Financial Education', url: 'https://www.bsp.gov.ph/SitePages/Default.aspx', type: 'Government' }
            ]
          }
        },
        {
          type: 'apply',
          title: 'Apply: Calculate Your Emergency Fund',
          content: {
            scenario: 'Meet Alex, a working student who earns ₱8,000 monthly from part-time work plus gets ₱5,000 monthly allowance from parents (total ₱13,000). Monthly expenses: food ₱4,000, transport ₱2,000, school ₱1,500, personal ₱2,500, family help ₱1,000. He has no emergency fund but wants to build one.',
            task: 'How much emergency fund should Alex aim for, and how should he build it?',
            options: [
              'Target ₱39,000 (3 months expenses), save ₱1,000 monthly',
              'Target ₱15,000 (student minimum), save ₱500 monthly',
              'Target ₱78,000 (6 months expenses), save ₱2,000 monthly',
              'No emergency fund needed since he gets allowance from parents'
            ],
            correctAnswer: 'Target ₱15,000 (student minimum), save ₱500 monthly',
            explanation: 'As a student with family support, Alex should start with ₱15,000 emergency fund (covers major expenses like laptop repair or medical emergency). Saving ₱500 monthly means reaching his goal in 30 months - achievable while learning good financial habits.'
          }
        },
        {
          type: 'reflect',
          title: 'Reflect: Your Emergency Fund Strategy',
          content: {
            questions: [
              'Describe a time when you or your family faced an unexpected expense. How did it feel, and how was it handled?',
              'If you woke up tomorrow with your ideal emergency fund already saved, what would change about how you live day-to-day?',
              'What are you willing to give up or reduce right now to build financial security for future-you?'
            ],
            actionItems: [
              'Open a separate GCash GSave account labeled "Emergency Fund"',
              'Calculate your ideal emergency fund target based on your situation',
              'Set up automatic transfers to build your emergency fund consistently'
            ]
          }
        }
      ]
    },
    'credit-debt': {
      title: 'Credit & Debt Management',
      description: 'Master credit cards, loans, and debt to avoid financial traps',
      icon: Target,
      color: 'red',
      steps: [
        {
          type: 'learn',
          title: 'Learn: Understanding Credit and Debt',
          content: {
            text: `Credit and debt are powerful financial tools that can help or hurt your financial future. Understanding them is crucial for Filipino youth.

**Types of Credit Common in Philippines:**
• Credit cards (18-36% annual interest)
• Personal loans from banks (12-24% annual)
• "Sangla" or pawnshop loans (3-5% monthly = 36-60% annual!)
• Online lending apps (often 15-30% monthly!)

**Good vs Bad Debt:**
• Good debt: Education loans, business capital, home mortgage
• Bad debt: Credit card debt for wants, luxury purchases, impulse buying

**Credit Card Basics:**
• Always pay full balance to avoid interest charges
• Credit limit should be max 20% of monthly income
• Late payment fees: ₱500-1,500 plus penalty interest

**Warning Signs of Debt Problems:**
• Paying only minimum amounts on credit cards
• Borrowing to pay other debts
• Credit card balance growing each month`,
            keyPoints: [
              'Interest on unpaid credit card debt compounds monthly - very expensive',
              'Building good credit history opens doors to better loan rates later',
              'Avoid online lending apps with extremely high interest rates'
            ],
            sources: [
              { title: 'BSP Consumer Protection', url: 'https://www.bsp.gov.ph/SitePages/Default.aspx', type: 'Government' }
            ]
          }
        },
        {
          type: 'apply',
          title: 'Apply: Smart Credit Decisions',
          content: {
            scenario: 'Meet Sarah, a fresh graduate earning ₱25,000 monthly. She wants a credit card for online shopping and emergencies. Bank offers her ₱30,000 credit limit. She also saw an online lending app offering "instant ₱15,000 loan" at 5% monthly interest for a new laptop.',
            task: 'What should Sarah do about these credit options?',
            options: [
              'Accept the credit card with ₱30,000 limit and take the online loan',
              'Accept credit card but request lower ₱15,000 limit, avoid the online loan',
              'Reject both and save money for the laptop instead',
              'Take only the online loan since 5% monthly sounds reasonable'
            ],
            correctAnswer: 'Accept credit card but request lower ₱15,000 limit, avoid the online loan',
            explanation: 'Sarah should get the credit card but with lower limit (₱15,000 = 60% of income is safer than ₱30,000). Avoid the online loan: 5% monthly = 60% annually! Better to save ₱2,500 monthly for 6 months to buy the laptop.'
          }
        },
        {
          type: 'reflect',
          title: 'Reflect: Your Credit Strategy',
          content: {
            questions: [
              'Do you currently have any debts? How does it make you feel?',
              'What would be your plan for using a credit card responsibly?',
              'How would you handle the temptation to overspend with easy credit?'
            ],
            actionItems: [
              'Check your credit score if you have existing credit accounts',
              'Create a "credit card rules" list for yourself before applying',
              'Calculate the true cost of any loan by looking at total interest paid'
            ]
          }
        }
      ]
    },
    'digital-money': {
      title: 'Digital Money Mastery',
      description: 'Navigate GCash, PayMaya, and online banking like a pro while staying secure',
      icon: Globe,
      color: 'green',
      steps: [
        {
          type: 'learn',
          title: 'Learn: Digital Money in the Philippines',
          content: {
            text: `Digital wallets and online banking have revolutionized how Filipinos handle money. Understanding these tools is essential for modern financial life.

**Major Digital Wallets:**
• GCash: 65+ million users, most features, linked to CIMB Bank
• PayMaya: Focus on payments and online shopping, now Maya Bank
• GrabPay: Integrated with Grab services

**Key Features to Master:**
• GSave/Maya Savings: High-interest savings accounts
• Send Money: Free transfers between same platforms
• Pay Bills: Utilities, loans, credit cards, government
• QR Code Payments: In-store and online shopping
• Investment options: GInvest, Maya Invest

**Security Best Practices:**
• Use strong, unique passwords and PIN codes
• Enable two-factor authentication (SMS/email)
• Never share OTP codes with anyone
• Use official apps only from Google Play/App Store
• Monitor transactions regularly

**Digital Banking:**
• CIMB, ING, Tonik: Higher interest rates than traditional banks
• 24/7 access through mobile apps
• Lower fees than traditional banking**`,
            keyPoints: [
              'Digital wallets offer convenience + higher interest rates than traditional banks',
              'Security is your responsibility - never share login credentials or OTPs',
              'Master all features to maximize benefits and minimize fees'
            ],
            sources: [
              { title: 'BSP Digital Payment Guidelines', url: 'https://www.bsp.gov.ph/SitePages/Default.aspx', type: 'Government' }
            ]
          }
        },
        {
          type: 'apply',
          title: 'Apply: Secure Your Digital Accounts',
          content: {
            scenario: 'Meet Joshua, a college student who just opened GCash and PayMaya accounts. He uses the same password (his birthday) for both apps and often connects to free WiFi in coffee shops to check his balance. He received a text claiming his account was compromised and asking for his OTP.',
            task: 'What security improvements should Joshua make immediately?',
            options: [
              'Change to different strong passwords, avoid public WiFi, never share OTPs',
              'Keep same passwords but enable SMS alerts for all transactions',
              'Share the suspicious text with friends to warn them about scams',
              'Close digital accounts and stick to cash only for safety'
            ],
            correctAnswer: 'Change to different strong passwords, avoid public WiFi, never share OTPs',
            explanation: 'Joshua needs better security: unique strong passwords for each app, avoid public WiFi for financial transactions, and never share OTPs (legitimate companies never ask for them). The text was likely a scam.'
          }
        },
        {
          type: 'reflect',
          title: 'Reflect: Your Digital Money Setup',
          content: {
            questions: [
              'Which digital wallet features would be most useful for your lifestyle?',
              'How confident do you feel about digital money security?',
              'What steps will you take to maximize the benefits while staying safe?'
            ],
            actionItems: [
              'Audit your current digital wallet security settings',
              'Create a strong, unique password system for all financial apps',
              'Explore one new feature in your digital wallet this week'
            ]
          }
        }
      ]
    },
    'insurance': {
      title: 'Insurance Basics for Filipino Families',
      description: 'Understand health, life, and protection insurance to safeguard your family\'s financial future',
      icon: Shield,
      color: 'blue',
      steps: [
        {
          type: 'learn',
          title: 'Learn: Why Insurance Matters',
          content: {
            text: `Insurance protects you and your family from financial disasters. In the Philippines, where medical costs are high and government safety nets are limited, insurance is crucial.

**Essential Insurance for Filipino Youth:**

**1. PhilHealth (Government Health Insurance):**
• Mandatory for employees, voluntary for others
• Covers basic medical expenses, hospitalization
• Premium: 4.5% of income (shared with employer if employed)

**2. SSS (Social Security System):**
• Retirement, disability, death benefits
• Monthly premium based on salary bracket
• Provides pension starting age 60-65

**3. Life Insurance:**
• Protects family if you pass away unexpectedly
• Term life: Pure protection, lower cost
• VUL (Variable Universal Life): Insurance + investment

**Medical Insurance Beyond PhilHealth:**
• HMO from employer: Covers more medical services
• Personal health insurance: Fill gaps in coverage

**Cost Examples (25-year-old):**
• Term life insurance (₱1M coverage): ₱3,000-5,000 annually
• Personal accident insurance: ₱1,500-3,000 annually`,
            keyPoints: [
              'PhilHealth and SSS are mandatory foundations - ensure you\'re covered',
              'Life insurance is crucial if family depends on your income',
              'Start young when premiums are lowest'
            ],
            sources: [
              { title: 'PhilHealth Official Website', url: 'https://www.philhealth.gov.ph/', type: 'Government' },
              { title: 'SSS Benefits Information', url: 'https://www.sss.gov.ph/', type: 'Government' }
            ]
          }
        },
        {
          type: 'apply',
          title: 'Apply: Choose Your Insurance Priority',
          content: {
            scenario: 'Meet Anna, 24, earning ₱28,000 monthly as a teacher. She supports her parents with ₱5,000 monthly. She has PhilHealth through her job but no other insurance. She worries about what happens to her parents if something happens to her.',
            task: 'What should be Anna\'s insurance priority?',
            options: [
              'Get ₱500,000 term life insurance to protect parents (₱2,500 annually)',
              'Get expensive VUL policy for insurance + investment',
              'Focus only on increasing PhilHealth coverage',
              'Wait until she\'s older and earning more before getting insurance'
            ],
            correctAnswer: 'Get ₱500,000 term life insurance to protect parents (₱2,500 annually)',
            explanation: 'Anna should prioritize affordable term life insurance since her parents depend on her ₱5,000 monthly support. ₱500,000 would provide 8+ years of support if something happens to her. At ₱2,500 annually, it\'s affordable and provides crucial protection.'
          }
        },
        {
          type: 'reflect',
          title: 'Reflect: Your Insurance Needs',
          content: {
            questions: [
              'Who in your family would be financially affected if something happened to you?',
              'What medical expenses worry you most about your family\'s financial security?',
              'How would you prioritize different types of insurance based on your current situation?'
            ],
            actionItems: [
              'Check your PhilHealth and SSS coverage status',
              'Get quotes for term life insurance if you support family members',
              'List your family\'s biggest financial risks that insurance could address'
            ]
          }
        }
      ]
    },
    'financial-goals': {
      title: 'Financial Goal Setting & Achievement',
      description: 'Set SMART financial goals and create actionable plans to achieve them',
      icon: Target,
      color: 'purple',
      steps: [
        {
          type: 'learn',
          title: 'Learn: SMART Financial Goals',
          content: {
            text: `Setting clear financial goals gives direction to your money decisions and motivation to save and invest. Without goals, money tends to disappear on random purchases.

**SMART Goal Framework:**
• Specific: Clear, well-defined target
• Measurable: Exact amount and timeline
• Achievable: Realistic for your income
• Relevant: Matters to your life
• Time-bound: Clear deadline

**Common Financial Goals for Filipino Youth:**

**Short-term (1-2 years):**
• Emergency fund: ₱15,000-30,000
• New laptop: ₱40,000-80,000
• Vacation: ₱25,000-50,000

**Medium-term (3-5 years):**
• Car down payment: ₱100,000-200,000
• Wedding fund: ₱200,000-500,000
• Further education: ₱150,000-300,000

**Long-term (5+ years):**
• House down payment: ₱500,000-1,000,000
• Business capital: ₱200,000-500,000
• Retirement fund: ₱1,000,000+

**Goal Achievement Strategy:**
1. Break large goals into monthly savings targets
2. Automate savings for each goal
3. Track progress monthly
4. Celebrate milestones`,
            keyPoints: [
              'Clear goals make it easier to say no to impulse purchases',
              'Automated savings ensures consistent progress toward goals',
              'Multiple goals require prioritization based on importance and timeline'
            ],
            sources: [
              { title: 'Personal Finance Goal Setting', url: 'https://www.investopedia.com/articles/pf/12/setting-financial-goals.asp', type: 'Educational' }
            ]
          }
        },
        {
          type: 'apply',
          title: 'Apply: Create Your Goal Plan',
          content: {
            scenario: 'Meet Rico, 23, earning ₱22,000 monthly. He wants: 1) ₱50,000 laptop in 10 months, 2) ₱30,000 vacation in 18 months, 3) ₱150,000 car down payment in 3 years. He can save ₱8,000 monthly total.',
            task: 'How should Rico allocate his ₱8,000 monthly savings to achieve these goals?',
            options: [
              'Laptop: ₱5,000/month, Vacation: ₱1,500/month, Car: ₱1,500/month',
              'Focus only on laptop first, then vacation, then car (sequential)',
              'Equal amounts: ₱2,667 monthly for each goal',
              'Car: ₱4,000/month, Laptop: ₱3,000/month, Vacation: ₱1,000/month'
            ],
            correctAnswer: 'Laptop: ₱5,000/month, Vacation: ₱1,500/month, Car: ₱1,500/month',
            explanation: 'Rico should prioritize by timeline: ₱5,000/month for laptop (₱50,000 in 10 months), ₱1,667/month for vacation (₱30,000 in 18 months), ₱1,333/month for car down payment (₱48,000 in 36 months, continue after laptop is achieved).'
          }
        },
        {
          type: 'reflect',
          title: 'Reflect: Your Goal Journey',
          content: {
            questions: [
              'What are your top 3 financial goals for the next 5 years?',
              'How will achieving these goals change your life or opportunities?',
              'What might tempt you to spend goal money on other things?'
            ],
            actionItems: [
              'Write down 3 SMART financial goals with specific amounts and dates',
              'Calculate monthly savings needed for each goal',
              'Open separate savings accounts or funds for each major goal'
            ]
          }
        }
      ]
    },
    'money-mindset': {
      title: 'Healthy Money Mindset Development',
      description: 'Transform limiting beliefs and build confidence with money decisions',
      icon: BookOpen,
      color: 'yellow',
      steps: [
        {
          type: 'learn',
          title: 'Learn: Your Money Beliefs',
          content: {
            text: `Your relationship with money is shaped by beliefs learned from family, culture, and experiences. Many Filipino youth struggle with limiting money beliefs that hold back their financial success.

**Common Limiting Beliefs in Filipino Culture:**
• "Money is the root of all evil" (biblical misinterpretation)
• "Rich people are greedy or corrupt"
• "We're not meant to be wealthy"
• "Family obligations come before personal financial goals"
• "Saving is selfish when family needs money"

**Healthy Money Beliefs to Adopt:**
• "Money is a tool that helps me serve others better"
• "I can be wealthy and generous at the same time"
• "Taking care of my financial future helps my family long-term"
• "I deserve financial security and success"
• "Smart money management is a valuable life skill"

**Filipino Values + Financial Success:**
• Utang na loob: Help family from position of strength, not struggle
• Pakikipagkapwa: Build wealth to serve community better
• Malasakit: Care for family includes securing your own future first

**Practical Mindset Shifts:**
• From "I can't afford it" to "How can I afford it?"
• From "Money is scarce" to "There are many opportunities"
• From "I'm bad with money" to "I'm learning financial skills"`,
            keyPoints: [
              'Your money beliefs directly affect your financial behaviors and success',
              'Filipino values can support (not hinder) good financial habits',
              'Mindset work is as important as learning financial techniques'
            ],
            sources: [
              { title: 'Psychology of Money', url: 'https://www.amazon.com/Psychology-Money-Timeless-lessons-happiness/dp/0857197681', type: 'Book' }
            ]
          }
        },
        {
          type: 'apply',
          title: 'Apply: Reframe Your Money Story',
          content: {
            scenario: 'Meet Liza, who grew up hearing "We don\'t have money for that" constantly. Now earning ₱20,000 monthly, she feels guilty spending on herself and gives most earnings to family. She believes wanting financial security is selfish and that good people shouldn\'t focus on money.',
            task: 'How can Liza reframe her money beliefs to support both family care and personal financial health?',
            options: [
              'Accept that money focus is selfish and prioritize family over personal goals',
              'Completely ignore family needs to focus only on personal wealth',
              'Reframe: "Building my financial strength helps me support family better long-term"',
              'Avoid thinking about money altogether to avoid guilt'
            ],
            correctAnswer: 'Reframe: "Building my financial strength helps me support family better long-term"',
            explanation: 'Liza should reframe her beliefs: Building emergency funds and financial skills means she can help family from strength rather than struggle. Setting aside 20-30% for her future actually enables more sustainable family support over decades.'
          }
        },
        {
          type: 'reflect',
          title: 'Reflect: Your Money Story',
          content: {
            questions: [
              'What messages about money did you learn growing up?',
              'How do these beliefs currently affect your financial decisions?',
              'What new money belief would you like to develop?'
            ],
            actionItems: [
              'Write down your current beliefs about money and wealth',
              'Identify which beliefs help vs. hinder your financial goals',
              'Create positive money affirmations to practice daily'
            ]
          }
        }
      ]
    },
    'financial-analysis': {
      title: 'Personal Financial Analysis',
      description: 'Evaluate your financial situation and plan for different life stages',
      icon: BarChart3,
      color: 'indigo',
      steps: [
        {
          type: 'learn',
          title: 'Learn: Analyzing Your Financial Health',
          content: {
            text: `Regular financial analysis helps you understand where you stand and make informed decisions about your money future. It's like a health checkup for your finances.

**Key Financial Health Indicators:**

**1. Income Analysis:**
• Total monthly income (salary + side income)
• Income stability and growth potential
• Passive income percentage (goal: gradually increase)

**2. Expense Analysis:**
• Fixed expenses (rent, utilities, loans): Should be <50% of income
• Variable expenses (food, transport): Track for 3 months to find patterns
• Discretionary expenses (entertainment): Should fit within 30% wants category

**3. Savings Rate:**
• Emergency fund: 3-6 months of expenses
• Savings rate: Aim for 20%+ of income
• Investment allocation: Start with 5-10% of income

**4. Debt Analysis:**
• Debt-to-income ratio: Should be <30%
• High-interest debt (credit cards): Priority to eliminate
• Good debt (education, housing): Manageable levels

**Financial Ratios to Track:**
• Savings Rate = Monthly Savings ÷ Monthly Income
• Emergency Fund Ratio = Emergency Fund ÷ Monthly Expenses
• Debt-to-Income = Monthly Debt Payments ÷ Monthly Income`,
            keyPoints: [
              'Regular analysis prevents small financial problems from becoming big ones',
              'Tracking trends over time is more valuable than single-month snapshots',
              'Use ratios to compare your situation to healthy benchmarks'
            ],
            sources: [
              { title: 'Financial Health Assessment Guide', url: 'https://www.investopedia.com/articles/pf/12/good-financial-health.asp', type: 'Educational' }
            ]
          }
        },
        {
          type: 'apply',
          title: 'Apply: Assess Your Financial Health',
          content: {
            scenario: 'Meet Kevin, 26, monthly income ₱35,000. Expenses: Rent ₱8,000, Food ₱6,000, Transport ₱3,000, Utilities ₱2,000, Entertainment ₱4,000, Family support ₱5,000, Credit card minimum ₱2,000. Savings: ₱5,000. Emergency fund: ₱10,000. Credit card debt: ₱40,000.',
            task: 'What\'s Kevin\'s biggest financial health concern?',
            options: [
              'Low savings rate (₱5,000 ÷ ₱35,000 = 14%)',
              'High debt-to-income ratio (₱2,000 ÷ ₱35,000 = 6%)',
              'Insufficient emergency fund (₱10,000 vs ₱28,000 monthly expenses)',
              'High-interest credit card debt that\'s growing monthly'
            ],
            correctAnswer: 'High-interest credit card debt that\'s growing monthly',
            explanation: 'Kevin\'s biggest problem is credit card debt. Paying only ₱2,000 minimum on ₱40,000 debt (likely 24% annual interest) means the balance grows ₱800 monthly. This debt should be his #1 priority - redirect some savings to eliminate it quickly.'
          }
        },
        {
          type: 'reflect',
          title: 'Reflect: Your Financial Action Plan',
          content: {
            questions: [
              'What surprised you most about analyzing your current financial situation?',
              'Which financial health indicator needs your most urgent attention?',
              'What changes would make the biggest positive impact on your financial health?'
            ],
            actionItems: [
              'Calculate your current savings rate and debt-to-income ratio',
              'Track all expenses for one month to understand your spending patterns',
              'Create a monthly financial health checklist to review regularly'
            ]
          }
        }
      ]
    }
  }

  const currentTopic = topicModules[topicId as keyof typeof topicModules]

  if (!currentTopic) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-2">Module Not Found</h2>
            <p className="text-gray-600 mb-4">Topic: {topicId}</p>
            <Link href="/learning">
              <Button>Back to Learning</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStepData = currentTopic.steps[currentStep]
  const isLastStep = currentStep === (currentTopic.steps.length - 1)
  const progress = ((currentStep + 1) / currentTopic.steps.length) * 100
  const IconComponent = currentTopic.icon

  // Validate reflection content quality
  const isValidReflection = (input: string, index?: number): boolean => {
    if (!input || input.trim().length < 20) return false
    
    // If AI validation is available for this index, use it
    if (index !== undefined && reflectionValidation[index]) {
      return reflectionValidation[index] === 'valid'
    }
    
    // Otherwise, use basic validation as fallback
    const trimmed = input.trim()
    const words = trimmed.split(/\s+/).filter(word => word.length > 0)
    
    if (words.length < 10) return false
    
    const hasRepeatedChars = /(.)\1{9,}/.test(trimmed)
    if (hasRepeatedChars) return false
    
    const uniqueWords = new Set(words.map(w => w.toLowerCase()))
    if (uniqueWords.size < words.length * 0.4) return false
    
    return true
  }

  // Check if current step can proceed to next
  const canProceedToNext = () => {
    if (currentStepData.type === 'learn') {
      // Learn step: User must click "I've read this" or similar confirmation
      return stepCompleted[currentStep] === true
    }
    
    if (currentStepData.type === 'apply') {
      const activityType = (currentStepData as any).activityType || 'mcq'
      
      if (activityType === 'calculator') {
        // Check if all calculator fields are correct
        const fields = (currentStepData.content as any).fields || []
        return fields.every((field: any) => {
          const userValue = parseInt(calculatorInputs[field.id] || '0')
          return userValue === field.expected
        }) && showResult
      }
      
      if (activityType === 'categorize') {
        // Check if all items are categorized correctly
        const correctCategories = (currentStepData.content as any).correctCategories || {}
        return showResult && Object.keys(correctCategories).every(item => {
          const userCategory = Object.keys(categorizedItems).find(cat => 
            categorizedItems[cat]?.includes(item)
          )
          return userCategory === correctCategories[item]
        })
      }
      
      // Default MCQ
      return showResult && selectedAnswer === (currentStepData.content as any).correctAnswer
    }
    
    if (currentStepData.type === 'reflect') {
      // Reflect step: User must fill in at least 2 out of 3 reflection questions with meaningful content
      const validReflections = reflectionInputs.filter((input, index) => isValidReflection(input, index)).length
      const totalQuestions = currentStepData.content.questions?.length || 0
      return validReflections >= Math.min(2, totalQuestions) // At least 2 questions or all if less than 2
    }
    
    return false
  }

  const markStepAsComplete = () => {
    const newCompleted = [...stepCompleted]
    newCompleted[currentStep] = true
    setStepCompleted(newCompleted)
  }

  const nextStep = () => {
    if (!isLastStep && canProceedToNext()) {
      setCurrentStep(currentStep + 1)
      setSelectedAnswer('')
      setShowResult(false)
      setReflectionInputs([])
    }
  }

  const completeModule = async () => {
    if (canProceedToNext()) {
      // Save module completion to user-specific localStorage
      const storageKey = user?.id ? `plounix-learning-progress-${user.id}` : 'plounix-learning-progress'
      const savedProgress = localStorage.getItem(storageKey)
      let completedModules: string[] = []
      
      if (savedProgress) {
        try {
          completedModules = JSON.parse(savedProgress)
        } catch (error) {
          console.error('Failed to load learning progress:', error)
        }
      }
      
      // Add current module to completed list if not already there
      if (!completedModules.includes(topicId)) {
        completedModules.push(topicId)
        localStorage.setItem(storageKey, JSON.stringify(completedModules))
        
        // Clean up old non-user-specific key if user is logged in
        if (user?.id && localStorage.getItem('plounix-learning-progress')) {
          localStorage.removeItem('plounix-learning-progress')
        }

        // Save to database
        if (user?.id) {
          try {
            console.log('💾 Saving module completion to database:', topicId)
            
            // Get current preferences
            const { data: currentData } = await supabase
              .from('user_profiles')
              .select('preferences')
              .eq('user_id', user.id)
              .maybeSingle()

            const currentPrefs = (currentData as any)?.preferences || {}

            // Update with new learning progress
            const { error } = await (supabase
              .from('user_profiles')
              .upsert as any)({
              user_id: user.id,
              preferences: {
                ...currentPrefs,
                learning_progress: {
                  completed_modules: completedModules,
                  current_level: completedModules.length >= 3 ? 'intermediate' : 'beginner',
                  badges_earned: currentPrefs.learning_progress?.badges_earned || []
                }
              },
              updated_at: new Date().toISOString()
            })

            if (error) {
              console.error('❌ Error saving learning progress:', error)
            } else {
              console.log('✅ Learning progress saved to database!')
            }
          } catch (error) {
            console.error('Failed to save learning progress to database:', error)
          }
        }
      }
      
      // Mark module as completed
      toast.success('Module completed!', {
        description: 'Great job! You\'ve completed this learning module.'
      })
      
      // Navigate back to learning page
      setTimeout(() => {
        window.location.href = '/learning'
      }, 1000) // Small delay to show the success toast
    } else {
      toast.error('Please complete all reflections', {
        description: 'You need to answer at least 2 reflection questions to complete the module.'
      })
    }
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'learn': return <BookOpen className="w-5 h-5 text-blue-600" />
      case 'apply': return <Target className="w-5 h-5 text-green-600" />
      case 'reflect': return <Lightbulb className="w-5 h-5 text-purple-600" />
    }
  }

  // Save reflection to database for AI learning
  const saveReflection = async (question: string, answer: string, questionIndex: number) => {
    if (!user || !answer || answer.trim().length < 20) return

    try {
      const response = await fetch('/api/learning-reflections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          moduleId: topicId,
          moduleTitle: currentTopic.title,
          phase: currentStepData.type,
          stepNumber: currentStep,
          question,
          answer
        })
      })

      if (!response.ok) {
        console.error('Failed to save reflection')
      } else {
        console.log('Reflection saved for AI learning')
      }
    } catch (error) {
      console.error('Error saving reflection:', error)
    }
  }

  // AI-powered validation for reflection quality
  const validateReflectionWithAI = async (question: string, answer: string, questionIndex: number) => {
    // Basic checks first
    if (!answer || answer.trim().length < 20) {
      setReflectionValidation(prev => ({ ...prev, [questionIndex]: 'invalid' }))
      return false
    }

    const trimmed = answer.trim()
    const words = trimmed.split(/\s+/).filter(word => word.length > 0)
    
    if (words.length < 10) {
      setReflectionValidation(prev => ({ ...prev, [questionIndex]: 'invalid' }))
      return false
    }

    // Check for obvious gibberish patterns
    const hasRepeatedChars = /(.)\1{9,}/.test(trimmed)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()))
    if (hasRepeatedChars || uniqueWords.size < words.length * 0.4) {
      setReflectionValidation(prev => ({ ...prev, [questionIndex]: 'invalid' }))
      return false
    }

    // Use AI to validate content quality
    setReflectionValidation(prev => ({ ...prev, [questionIndex]: 'validating' }))

    try {
      const response = await fetch('/api/validate-reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          answer
        })
      })

      if (!response.ok) {
        console.error('Validation API error:', response.statusText)
        // On error, accept to not block students
        setReflectionValidation(prev => ({ ...prev, [questionIndex]: 'valid' }))
        return true
      }

      const data = await response.json()
      
      console.log('🤖 AI Validation Response:', data.reason)
      console.log('Question:', question)
      console.log('Answer:', answer)
      console.log('Is Valid?', data.isValid)
      
      setReflectionValidation(prev => ({ ...prev, [questionIndex]: data.isValid ? 'valid' : 'invalid' }))
      return data.isValid
    } catch (error) {
      console.error('AI validation error:', error)
      // On error, fall back to basic validation
      setReflectionValidation(prev => ({ ...prev, [questionIndex]: 'valid' }))
      return true
    }
  }

  // TODO: Dark mode under works
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="learning" />
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-2 md:space-x-4 mb-4 md:mb-6">
          <Link href="/learning">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </Link>
          <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <div>
            <h1 className="text-base md:text-2xl font-bold">{currentTopic.title}</h1>
            <p className="text-gray-600 text-xs md:text-base hidden sm:block">{currentTopic.description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 md:mb-8">
          <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-1.5 md:mb-2">
            <span>Step {currentStep + 1} of {currentTopic.steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
            <div 
              className="bg-primary h-2 md:h-3 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-4 md:mb-6">
          <CardHeader className="p-3 md:p-6">
            <div className="flex items-center space-x-2 md:space-x-3">
              {getStepIcon(currentStepData.type)}
              <CardTitle className="text-sm md:text-xl">{currentStepData.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            {/* Learn Phase */}
            {currentStepData.type === 'learn' && (
              <div className="space-y-4 md:space-y-6">
                <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed [&>p]:mb-4 [&>ul]:my-4 [&>ul]:space-y-2 [&>ul>li]:ml-5 [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:font-semibold [&>strong]:font-semibold [&>strong]:text-gray-900">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentStepData.content.text}
                  </ReactMarkdown>
                </div>

                <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 md:mb-3 text-xs md:text-base">Key Takeaways:</h4>
                  <ul className="space-y-1.5 md:space-y-2">
                    {currentStepData.content.keyPoints?.map((point, index) => (
                      <li key={index} className="text-blue-700 text-xs md:text-sm flex items-start space-x-2">
                        <span className="text-blue-500 mt-1 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-3 md:pt-4">
                  <h4 className="font-semibold mb-2 md:mb-3 text-xs md:text-base">Sources:</h4>
                  {currentStepData.content.sources?.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
                      <span className="text-xs md:text-sm">{source.title}</span>
                      <Button variant="outline" size="sm" className="h-7 md:h-8 text-xs" onClick={() => window.open(source.url, '_blank')}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Confirmation button for Learn phase */}
                {!stepCompleted[currentStep] && (
                  <div className="border-t pt-3 md:pt-4 mt-4 md:mt-6">
                    <Button onClick={markStepAsComplete} className="w-full h-9 md:h-10 text-xs md:text-sm flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      I've Read and Understood This Content
                    </Button>
                  </div>
                )}

                {stepCompleted[currentStep] && (
                  <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200 text-center">
                    <p className="text-green-700 font-medium text-xs md:text-base flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Great! You can now proceed to the next step.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Apply Phase */}
            {currentStepData.type === 'apply' && (
              <div className="space-y-4 md:space-y-6">
                <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2 md:mb-3 text-xs md:text-base">Scenario:</h4>
                  <p className="text-green-700 text-xs md:text-base">{(currentStepData.content as any).scenario}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 md:mb-4 text-xs md:text-base">{(currentStepData.content as any).task}</h4>
                  
                  {/* Calculator Activity */}
                  {(currentStepData as any).activityType === 'calculator' && (
                    <div className="space-y-3 md:space-y-4">
                      <div className="bg-blue-50 p-3 md:p-4 rounded-lg mb-3 md:mb-4">
                        <p className="text-xs md:text-sm text-blue-800">
                          <strong>Monthly Income:</strong> ₱{((currentStepData.content as any).monthlyIncome || 0).toLocaleString()}
                        </p>
                      </div>
                      
                      {((currentStepData.content as any).fields || []).map((field: any, index: number) => (
                        <div key={field.id} className="bg-white p-3 md:p-4 border rounded-lg">
                          <label className="block text-xs md:text-sm font-medium mb-2">
                            {field.label}
                            <span className="text-gray-500 text-[10px] md:text-xs ml-2">({field.hint})</span>
                          </label>
                          <div className="flex items-center space-x-2">
                            <span className="text-base md:text-lg font-bold">₱</span>
                            <input
                              type="number"
                              className="flex-1 p-2 md:p-3 border rounded-lg text-sm md:text-lg"
                              placeholder="0"
                              value={calculatorInputs[field.id] || ''}
                              onChange={(e) => setCalculatorInputs({
                                ...calculatorInputs,
                                [field.id]: e.target.value
                              })}
                            />
                            {showResult && (
                              <div className="flex-shrink-0">
                                {parseInt(calculatorInputs[field.id] || '0') === field.expected ? (
                                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                                ) : (
                                  <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-100 flex items-center justify-center">
                                    <span className="text-red-600 font-bold text-sm md:text-base">✕</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {!showResult && (
                        <Button 
                          onClick={() => setShowResult(true)} 
                          disabled={!((currentStepData.content as any).fields || []).every((f: any) => calculatorInputs[f.id])}
                          className="w-full h-9 md:h-10 text-xs md:text-sm"
                        >
                          Check My Calculations
                        </Button>
                      )}

                      {showResult && (
                        <div className={`p-3 md:p-4 rounded-lg border ${
                          canProceedToNext()
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-orange-50 border-orange-200'
                        }`}>
                          <h4 className={`font-semibold mb-2 md:mb-3 text-xs md:text-base flex items-center gap-2 ${
                            canProceedToNext()
                              ? 'text-green-800' 
                              : 'text-orange-800'
                          }`}>
                            {canProceedToNext() ? (
                              <>
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                                Perfect! All calculations are correct!
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                                Some calculations need adjustment
                              </>
                            )}
                          </h4>
                          
                          {canProceedToNext() && (
                            <>
                              <p className="text-xs md:text-sm mb-2 md:mb-3">{(currentStepData.content as any).explanation}</p>
                              <p className="text-green-700 font-medium mt-2 text-xs md:text-base flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                You can now proceed to the next step!
                              </p>
                            </>
                          )}
                          
                          {!canProceedToNext() && (
                            <div className="mt-3 md:mt-4">
                              <p className="text-xs md:text-sm font-medium text-orange-700 mb-2 md:mb-3">
                                Check your answers and try again:
                              </p>
                              {((currentStepData.content as any).fields || []).map((field: any) => (
                                <div key={field.id} className="text-xs md:text-sm mb-2 flex items-center gap-1.5">
                                  {parseInt(calculatorInputs[field.id] || '0') === field.expected ? (
                                    <>
                                      <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                      <span className="text-green-700">{field.label}: Correct</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                                      <span className="text-orange-700">{field.label}: Review your calculation</span>
                                    </>
                                  )}
                                </div>
                              ))}
                              <Button 
                                onClick={() => setShowResult(false)} 
                                variant="outline"
                                className="w-full mt-2 md:mt-3 h-8 md:h-10 text-xs md:text-sm"
                              >
                                Try Again
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MCQ Activity (default) */}
                  {(!(currentStepData as any).activityType || (currentStepData as any).activityType === 'mcq') && (
                    <div className="space-y-2 md:space-y-3">
                      {((currentStepData.content as any).options || []).map((option: string, index: number) => (
                        <label key={index} className="flex items-start space-x-2 md:space-x-3 p-3 md:p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="answer"
                            value={option}
                            checked={selectedAnswer === option}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            className="mt-1"
                          />
                          <span className="text-xs md:text-sm">{option}</span>
                        </label>
                      ))}

                      {!showResult && (
                        <Button onClick={() => setShowResult(true)} disabled={!selectedAnswer} className="w-full h-9 md:h-10 text-xs md:text-sm">
                          Submit Answer
                        </Button>
                      )}

                      {showResult && (
                        <div className={`p-3 md:p-4 rounded-lg border ${
                          selectedAnswer === (currentStepData.content as any).correctAnswer 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-orange-50 border-orange-200'
                        }`}>
                          <h4 className={`font-semibold mb-2 md:mb-3 text-xs md:text-base flex items-center gap-2 ${
                            selectedAnswer === (currentStepData.content as any).correctAnswer 
                              ? 'text-green-800' 
                              : 'text-orange-800'
                          }`}>
                            {selectedAnswer === (currentStepData.content as any).correctAnswer ? (
                              <>
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                                Correct! Well done!
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                                Not quite. Let's learn from this:
                              </>
                            )}
                          </h4>
                          <p className="text-xs md:text-sm mb-2 md:mb-3">{(currentStepData.content as any).explanation}</p>
                          
                          {selectedAnswer !== (currentStepData.content as any).correctAnswer && (
                            <div className="mt-3 md:mt-4">
                              <p className="text-xs md:text-sm font-medium text-orange-700 mb-2">
                                Please try again to proceed to the next step.
                              </p>
                              <Button 
                                onClick={() => {
                                  setShowResult(false)
                                  setSelectedAnswer('')
                                }} 
                                variant="outline"
                                className="w-full h-8 md:h-10 text-xs md:text-sm"
                              >
                                Try Again
                              </Button>
                            </div>
                          )}
                          
                          {selectedAnswer === (currentStepData.content as any).correctAnswer && (
                            <p className="text-green-700 font-medium mt-2 text-xs md:text-base flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              You can now proceed to the next step!
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reflect Phase */}
            {currentStepData.type === 'reflect' && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 md:mb-4 text-xs md:text-base">Reflection Questions:</h4>
                  <div className="space-y-3 md:space-y-4">
                    {currentStepData.content.questions?.map((question, index) => (
                      <div key={index} className="space-y-2">
                        <label className="text-xs md:text-sm font-medium text-purple-700">{question}</label>
                        <textarea
                          className="w-full p-2 md:p-3 border rounded-lg resize-none text-xs md:text-sm"
                          rows={3}
                          placeholder="Share your thoughts..."
                          value={reflectionInputs[index] || ''}
                          onChange={(e) => {
                            const newInputs = [...reflectionInputs]
                            newInputs[index] = e.target.value
                            setReflectionInputs(newInputs)
                            
                            // Reset validation state when user is typing
                            setReflectionValidation(prev => ({ ...prev, [index]: null }))
                          }}
                          onBlur={async (e) => {
                            // Validate with AI when user leaves the field
                            const answer = e.target.value
                            if (answer.trim().length >= 10) {
                              const isValid = await validateReflectionWithAI(question, answer, index)
                              if (isValid) {
                                saveReflection(question, answer, index)
                              }
                            }
                          }}
                        />
                        {reflectionInputs[index] && (
                          <>
                            {reflectionValidation[index] === 'validating' ? (
                              <p className="text-[10px] md:text-xs text-blue-600 flex items-center gap-1">
                                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                Checking your response...
                              </p>
                            ) : reflectionValidation[index] === 'valid' ? (
                              <p className="text-[10px] md:text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Great response! Saved
                              </p>
                            ) : reflectionValidation[index] === 'invalid' ? (
                              <p className="text-[10px] md:text-xs text-red-600 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Please provide a more thoughtful, relevant response
                              </p>
                            ) : reflectionInputs[index].trim().length > 0 && reflectionInputs[index].trim().length < 10 && (
                              <p className="text-[10px] md:text-xs text-amber-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Keep writing... (at least 10 words needed)
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 p-3 md:p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2 md:mb-3 text-xs md:text-base">Action Items:</h4>
                  <ul className="space-y-1.5 md:space-y-2">
                    {currentStepData.content.actionItems?.map((item, index) => (
                      <li key={index} className="text-purple-700 text-xs md:text-sm flex items-start space-x-2">
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reflection completion indicator */}
                <div className={`p-3 md:p-4 rounded-lg border ${
                  canProceedToNext() 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className={`text-xs md:text-sm font-medium flex items-center gap-2 ${
                    canProceedToNext() ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    {canProceedToNext() ? (
                      <>
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                        Great reflections! You can now proceed to the next step.
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Please answer at least 2 questions with thoughtful, meaningful responses to continue.</span>
                        <span className="sm:hidden">Answer at least 2 questions meaningfully to continue.</span>
                      </>
                    )}
                  </p>
                  {!canProceedToNext() && (
                    <p className="text-[10px] md:text-xs text-blue-600 mt-2">
                      Completed: {reflectionInputs.filter((input, index) => isValidReflection(input, index)).length} / 
                      {Math.min(2, currentStepData.content.questions?.length || 0)} required
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-2">
          <Button 
            variant="outline" 
            disabled={currentStep === 0}
            onClick={() => {
              setCurrentStep(currentStep - 1)
              setSelectedAnswer('')
              setShowResult(false)
            }}
            className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-4"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>

          {isLastStep ? (
            <div className="flex flex-col items-end">
              <Button 
                onClick={completeModule}
                disabled={!canProceedToNext()}
                className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-4"
              >
                {canProceedToNext() ? (
                  <>
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Complete Module</span>
                    <span className="sm:hidden">Complete</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Complete This Step First</span>
                    <span className="sm:hidden">Locked</span>
                  </>
                )}
              </Button>
              {!canProceedToNext() && (
                <p className="text-[10px] md:text-xs text-gray-500 mt-1 text-right max-w-[150px] md:max-w-none">
                  {currentStepData.type === 'reflect' && 'Answer at least 2 reflection questions to complete'}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <Button 
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-4"
              >
                {canProceedToNext() ? (
                  <>
                    <span className="hidden sm:inline">Next Step</span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Complete This Step First</span>
                    <span className="sm:hidden">Locked</span>
                  </>
                )}
              </Button>
              {!canProceedToNext() && (
                <p className="text-[10px] md:text-xs text-gray-500 mt-1 text-right max-w-[150px] md:max-w-none">
                  {currentStepData.type === 'learn' && 'Read and confirm'}
                  {currentStepData.type === 'apply' && 'Answer correctly'}
                  {currentStepData.type === 'reflect' && 'Fill 2+ reflections'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
