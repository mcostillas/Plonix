'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { ArrowLeft, ArrowRight, BookOpen, Target, Lightbulb, ExternalLink, Calculator, PiggyBank, TrendingUp, Shield, Globe, BarChart3 } from 'lucide-react'

export default function TopicLearningPage() {
  const params = useParams()
  const topicId = params.topicId as string
  
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [reflectionInputs, setReflectionInputs] = useState<string[]>([])

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
          title: 'Apply: Create Your Personal Budget',
          content: {
            scenario: 'Meet Jana, a 3rd year college student. Her parents give her ₱12,000 monthly allowance. She spends about ₱3,500 on food, ₱1,500 on transportation, ₱800 on school supplies, ₱2,000 on coffee dates and movies, ₱1,200 on clothes/shopping, and usually runs out of money by the 25th of each month.',
            task: 'Using the 50-30-20 rule, how should Jana allocate her ₱12,000 monthly allowance?',
            options: [
              'Needs: ₱6,000, Wants: ₱3,600, Savings: ₱2,400 (standard 50-30-20)',
              'Needs: ₱8,000, Wants: ₱4,000, Savings: ₱0 (focus on enjoying college)',
              'Keep current spending pattern and ask parents for more money',
              'Needs: ₱5,800, Wants: ₱3,200, Savings: ₱3,000 (reduce current spending)'
            ],
            correctAnswer: 'Needs: ₱6,000, Wants: ₱3,600, Savings: ₱2,400 (standard 50-30-20)',
            explanation: 'Jana should follow the 50-30-20 rule with ₱12,000: Needs ₱6,000 (covers food ₱3,500, transport ₱1,500, supplies ₱800, plus ₱200 buffer), Wants ₱3,600 (entertainment ₱2,000, shopping ₱1,200, plus ₱400 extra), Savings ₱2,400 monthly (₱28,800 yearly emergency fund!)'
          }
        },
        {
          type: 'reflect',
          title: 'Reflect: Your Budget Action Plan',
          content: {
            questions: [
              'Based on your current allowance/salary, how would you apply the 50-30-20 rule?',
              'What spending habits would you need to change to fit this budget?',
              'What financial goal would motivate you to stick to saving 20%?'
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
              'Which digital bank or wallet appeals most to you and why?',
              'How would you split your savings between convenience and growth?',
              'What savings milestone would you celebrate first?'
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
              'What long-term financial goal would motivate you to start investing?',
              'How comfortable are you with the risk that your investment might lose value short-term?',
              'What investment platform (BPI, BDO, COL) seems most suitable for your situation?'
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
              'What emergency expenses are you most worried about in the next 2 years?',
              'How would having an emergency fund change your financial confidence?',
              'What monthly amount could you realistically save for emergencies?'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1)
      setSelectedAnswer('')
      setShowResult(false)
      setReflectionInputs([])
    }
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'learn': return <BookOpen className="w-5 h-5 text-blue-600" />
      case 'apply': return <Target className="w-5 h-5 text-green-600" />
      case 'reflect': return <Lightbulb className="w-5 h-5 text-purple-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="learning" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/learning">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <IconComponent className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{currentTopic.title}</h1>
            <p className="text-gray-600">{currentTopic.description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {currentTopic.steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              {getStepIcon(currentStepData.type)}
              <CardTitle>{currentStepData.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Learn Phase */}
            {currentStepData.type === 'learn' && (
              <div className="space-y-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {currentStepData.content.text}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">Key Takeaways:</h4>
                  <ul className="space-y-2">
                    {currentStepData.content.keyPoints?.map((point, index) => (
                      <li key={index} className="text-blue-700 text-sm flex items-start space-x-2">
                        <span className="text-blue-500 mt-1 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Sources:</h4>
                  {currentStepData.content.sources?.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{source.title}</span>
                      <Button variant="outline" size="sm" onClick={() => window.open(source.url, '_blank')}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Phase */}
            {currentStepData.type === 'apply' && (
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">Scenario:</h4>
                  <p className="text-green-700">{currentStepData.content.scenario}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">{currentStepData.content.task}</h4>
                  <div className="space-y-3">
                    {currentStepData.content.options?.map((option, index) => (
                      <label key={index} className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={selectedAnswer === option}
                          onChange={(e) => setSelectedAnswer(e.target.value)}
                          className="mt-1"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {!showResult && (
                  <Button onClick={() => setShowResult(true)} disabled={!selectedAnswer} className="w-full">
                    Submit Answer
                  </Button>
                )}

                {showResult && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">
                      {selectedAnswer === currentStepData.content.correctAnswer ? '🎉 Correct!' : '🤔 Let\'s learn from this'}
                    </h4>
                    <p className="text-sm">{currentStepData.content.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Reflect Phase */}
            {currentStepData.type === 'reflect' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">Reflection Questions:</h4>
                  <div className="space-y-4">
                    {currentStepData.content.questions?.map((question, index) => (
                      <div key={index} className="space-y-2">
                        <label className="text-sm font-medium text-purple-700">{question}</label>
                        <textarea
                          className="w-full p-3 border rounded-lg resize-none"
                          rows={3}
                          placeholder="Share your thoughts..."
                          value={reflectionInputs[index] || ''}
                          onChange={(e) => {
                            const newInputs = [...reflectionInputs]
                            newInputs[index] = e.target.value
                            setReflectionInputs(newInputs)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-3">Action Items:</h4>
                  <ul className="space-y-2">
                    {currentStepData.content.actionItems?.map((item, index) => (
                      <li key={index} className="text-purple-700 text-sm flex items-start space-x-2">
                        <span className="text-purple-500 mt-1 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {isLastStep ? (
            <Link href="/learning">
              <Button>🎉 Complete Module</Button>
            </Link>
          ) : (
            <Button onClick={nextStep}>
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
