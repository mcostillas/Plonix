export interface LearningModule {
  id: string
  title: string
  description: string
  duration: string
  lessons: Lesson[]
  completed: boolean
  progress: number
}

export interface Lesson {
  id: string
  title: string
  type: 'learn' | 'apply' | 'reflect'
  content: LessonContent
  completed: boolean
}

export interface LessonContent {
  learn?: {
    text: string
    keyPoints: string[]
    examples: string[]
    source: {
      title: string
      url: string
      type: 'YouTube' | 'Article' | 'Government' | 'Educational'
    }
  }
  apply?: {
    scenario: string
    task: string
    options?: string[]
    correctAnswer?: string
    explanation?: string
  }
  reflect?: {
    questions: string[]
    prompts: string[]
    actionItems: string[]
  }
}

export const learningModules: LearningModule[] = [
  {
    id: 'financial-literacy-basics',
    title: 'Financial Literacy Basics',
    description: 'Master the fundamentals: budgeting, saving, and investing for Filipino young adults',
    duration: '20 min',
    lessons: [
      {
        id: 'budgeting-101',
        title: 'Budgeting 101: The 50-30-20 Rule',
        type: 'learn',
        content: {
          learn: {
            text: `Budgeting is simply telling your money where to go before you spend it. The 50-30-20 rule is perfect for Filipino young adults because it's simple and flexible.

**How it works:**
• 50% for NEEDS: Rent, food, transportation, utilities
• 30% for WANTS: Entertainment, shopping, dining out
• 20% for SAVINGS: Emergency fund, investments, goals

**Example with ₱20,000 monthly salary:**
• Needs: ₱10,000 (rent ₱6,000, food ₱2,500, transport ₱1,500)
• Wants: ₱6,000 (entertainment ₱3,000, shopping ₱3,000)
• Savings: ₱4,000 (emergency fund ₱2,000, goals ₱2,000)

This rule adapts to Filipino culture by allowing flexibility for family support and celebrations while ensuring you still save consistently.`,
            keyPoints: [
              'The 50-30-20 rule provides a simple framework for any income level',
              'Needs include essential expenses you cannot avoid',
              'Wants are things you enjoy but could live without',
              'Savings should be treated as a non-negotiable expense'
            ],
            examples: [
              'College student with ₱8,000 allowance: ₱4,000 needs, ₱2,400 wants, ₱1,600 savings',
              'Fresh graduate with ₱25,000 salary: ₱12,500 needs, ₱7,500 wants, ₱5,000 savings'
            ],
            source: {
              title: 'Khan Academy - Planning a Budget',
              url: 'https://www.khanacademy.org/college-careers-more/financial-literacy/xa6995ea67a8e9fdd:budgeting-and-saving/xa6995ea67a8e9fdd:budgeting/a/planning-a-budget-start',
              type: 'Educational'
            }
          }
        },
        completed: false
      },
      {
        id: 'saving-strategies',
        title: 'Saving Strategies for Filipinos',
        type: 'learn',
        content: {
          learn: {
            text: `Saving money in the Philippines requires strategy because of our unique financial culture and family obligations.

**Where to Save Your Money:**

**Emergency Fund (3-6 months expenses):**
• Digital banks: CIMB (4%), ING (2.5%), Tonik (6%)
• Traditional banks: BPI, BDO (0.25%) - lower rates but more ATMs
• Goal: Easy access when emergencies happen

**Short-term Goals (6 months - 2 years):**
• Time deposits: 1-3% guaranteed returns
• Money market funds: 3-5% with professional management
• Goal: Steady growth while protecting your money

**Long-term Goals (2+ years):**
• Mutual funds: 6-10% potential returns
• UITF (Unit Investment Trust Funds): Diversified growth
• Goal: Beat inflation and build wealth

**The Automated Saving Strategy:**
Set up automatic transfers on payday. Treat savings like a bill you must pay yourself first.`,
            keyPoints: [
              'Different savings goals need different types of accounts',
              'Higher interest rates help your money grow faster than inflation',
              'Automation removes the temptation to skip saving',
              'PDIC insurance protects deposits up to ₱500,000 per bank'
            ],
            examples: [
              'Emergency fund: ₱30,000 in CIMB earning ₱1,200 yearly vs ₱75 in traditional bank',
              'Vacation fund: ₱50,000 in 1-year time deposit guarantees growth',
              'House fund: ₱100,000 in balanced mutual fund for 5+ years growth'
            ],
            source: {
              title: 'Bangko Sentral ng Pilipinas - Consumer Education',
              url: 'https://www.bsp.gov.ph/SitePages/Default.aspx',
              type: 'Government'
            }
          }
        },
        completed: false
      },
      {
        id: 'investing-basics',
        title: 'Investing Basics: Growing Your Wealth',
        type: 'learn',
        content: {
          learn: {
            text: `Investing means putting your money to work to earn more money over time. In the Philippines, young adults have access to many investment options that can help build long-term wealth.

**Why Invest?**
Inflation averages 3-4% yearly in the Philippines. Money in 0.25% savings accounts loses purchasing power. Investing helps your money grow faster than inflation.

**Investment Options for Filipino Beginners:**

**Level 1: Conservative (Low Risk)**
• Money Market Funds: 4-6% annual returns
• Government bonds: 3-5% annual returns
• Time deposits: 1-3% guaranteed returns

**Level 2: Moderate (Medium Risk)**
• Balanced mutual funds: 6-8% potential returns
• UITFs: Professionally managed portfolios
• Index funds: Follow stock market performance

**Level 3: Growth (Higher Risk)**
• Philippine stocks via COL Financial: 8-12% potential
• Equity mutual funds: Aggressive growth potential
• Real Estate Investment Trusts (REITs): Property exposure

**Getting Started:**
Begin with ₱1,000 monthly in a balanced mutual fund. As you learn and earn more, gradually increase your investment amount and explore other options.`,
            keyPoints: [
              'Investing helps your money grow faster than inflation over time',
              'Start with low-risk options and gradually increase risk as you learn',
              'Diversification across different investments reduces overall risk',
              'Time in the market is more important than timing the market'
            ],
            examples: [
              '₱2,000 monthly in mutual fund for 10 years = ₱329,000 at 8% returns',
              'Starting at age 25 vs 35: ₱1M difference by retirement due to compound growth',
              'Emergency fund first, then invest surplus money for long-term goals'
            ],
            source: {
              title: 'Securities and Exchange Commission - Investor Education',
              url: 'https://www.sec.gov.ph/#gsc.tab=0',
              type: 'Government'
            }
          }
        },
        completed: false
      },
      {
        id: 'apply-financial-basics',
        title: 'Apply: Create Your Financial Plan',
        type: 'apply',
        content: {
          apply: {
            scenario: `Meet Alex, a 24-year-old software developer earning ₱35,000 monthly. He lives with family (₱5,000 contribution), has basic expenses (₱15,000), and wants to start building wealth. He has no savings yet but can allocate ₱15,000 monthly to financial goals.`,
            task: 'How should Alex allocate his ₱15,000 monthly for budgeting, saving, and investing?',
            options: [
              'Save everything in a traditional bank account for maximum safety',
              'Emergency fund: ₱5,000, Savings: ₱5,000, Investing: ₱5,000',
              'Build ₱105,000 emergency fund first, then start investing ₱15,000 monthly',
              'Invest everything in stocks for maximum growth potential'
            ],
            correctAnswer: 'Build ₱105,000 emergency fund first, then start investing ₱15,000 monthly',
            explanation: `Alex should prioritize building his financial foundation first:

**Phase 1 (Months 1-7): Emergency Fund Priority**
• Save ₱15,000 monthly in CIMB Bank (4% interest)
• Target: ₱105,000 (3 months of ₱35,000 salary)
• This provides security before taking investment risks

**Phase 2 (Month 8+): Investment Focus**
• Emergency fund complete, now invest ₱15,000 monthly
• Suggested allocation: ₱7,500 balanced mutual fund + ₱7,500 stocks
• This builds long-term wealth while maintaining security

**Why this strategy works:**
Emergency fund prevents him from selling investments during emergencies. Once secure, his full ₱15,000 can focus on wealth building through diversified investing.`
          }
        },
        completed: false
      },
      {
        id: 'reflect-financial-journey',
        title: 'Reflect: Your Financial Action Plan',
        type: 'reflect',
        content: {
          reflect: {
            questions: [
              'Based on your current income, how would you apply the 50-30-20 rule?',
              'What savings account will you open this week to start earning higher interest?',
              'Which investment option interests you most as a beginner?',
              'What financial goal would motivate you to stick to this plan?'
            ],
            prompts: [
              'Calculate your emergency fund target (3-6 months of expenses)',
              'Research one specific bank or investment platform mentioned in the lessons',
              'Write down one action you will take this week to improve your finances',
              'Consider how building wealth could impact your family and future'
            ],
            actionItems: [
              'Open a high-yield savings account (CIMB, ING, or Tonik)',
              'Set up automatic transfer of at least ₱1,000 monthly to savings',
              'Download one investment app (BPI, COL Financial, or FAMI) to explore',
              'Join a Filipino financial education Facebook group for ongoing learning'
            ]
          }
        },
        completed: false
      }
    ],
    completed: false,
    progress: 0
  }
]
