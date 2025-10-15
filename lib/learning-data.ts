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
              title: 'Khan Academy - Budgeting and the 50/30/20 Rule',
              url: 'https://www.khanacademy.org/economics-finance-domain/economics-personal-finance-va/x3ed8f3aede624754:budgeting-saving/x3ed8f3aede624754:budgeting/v/budgeting-and-the-503020-rule',
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
              title: 'BSP - Deposit Insurance & Banking Information',
              url: 'https://www.bsp.gov.ph/SitePages/FinancialStability/DirBanksFIList.aspx',
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
              title: 'BPI Asset Management - Investment Products',
              url: 'https://www.bpiassetmanagement.com/',
              type: 'Educational'
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
  },

  // 2. BUDGETING MASTERY MODULE
  {
    id: 'budgeting-mastery',
    title: 'Budgeting Mastery',
    description: 'Advanced budgeting strategies for Filipino lifestyle and family obligations',
    duration: '25 min',
    lessons: [
      {
        id: 'filipino-budgeting-challenges',
        title: 'Filipino Budgeting: Family & Cultural Considerations',
        type: 'learn',
        content: {
          learn: {
            text: `Budgeting in Filipino families involves unique challenges like "utang na loob," family support, and cultural celebrations. Here's how to balance personal financial goals with Filipino values.

**Common Filipino Budgeting Challenges:**

**1. Family Financial Support**
• Parents' allowance or support
• Siblings' education expenses  
• Extended family emergencies
• Solution: Budget 5-10% for family support

**2. Cultural Celebrations & Events**
• Christmas bonuses spent on gifts
• Fiestas, weddings, baptisms
• "Pakimkim" and pasalubong culture
• Solution: Create a "celebration fund" 

**3. Debt Culture ("Utang")**
• Easy credit card approvals
• "5-6" lending practices
• Peer pressure spending
• Solution: Track all debts and prioritize high-interest elimination

**The Filipino-Adapted 50-30-20 Rule:**
• 45% Needs (including family support)
• 25% Wants (including cultural events)
• 30% Savings & Debt Payment (aggressive wealth building)`,
            keyPoints: [
              'Filipino budgeting must account for family obligations and cultural events',
              'Family support should be budgeted, not treated as emergencies',
              'Cultural celebrations need dedicated savings, not credit card debt',
              'Higher savings rates help overcome inflation and family pressures'
            ],
            examples: [
              '₱30,000 salary: ₱13,500 needs, ₱7,500 wants, ₱9,000 savings/debt',
              'Christmas fund: ₱500 monthly = ₱6,000 for gifts without debt',
              'Family emergency fund: Separate from personal emergency fund'
            ],
            source: {
              title: 'Bangko Sentral ng Pilipinas - Financial Education',
              url: 'https://www.bsp.gov.ph/Pages/InclusiveFinance/Financial-Education.aspx',
              type: 'Government'
            }
          }
        },
        completed: false
      },
      {
        id: 'zero-based-budgeting',
        title: 'Zero-Based Budgeting: Every Peso Has Purpose',
        type: 'learn',
        content: {
          learn: {
            text: `Zero-based budgeting means every peso you earn gets assigned a specific purpose before you spend it. This method is perfect for Filipinos who want maximum control over their money.

**How Zero-Based Budgeting Works:**
Income - Expenses - Savings = ₱0

Every peso is planned for:
• Fixed expenses (rent, utilities, loans)
• Variable expenses (food, transportation, entertainment)
• Savings goals (emergency fund, investments, vacation)
• Family obligations (support, celebrations)

**Step-by-Step Process:**

**Step 1: List Your Income**
• Salary after taxes
• Side hustle income
• Allowances or bonuses
• Total monthly income

**Step 2: List Fixed Expenses**
• Rent or mortgage
• Insurance premiums
• Loan payments
• Subscription services

**Step 3: Plan Variable Expenses**
• Food and groceries
• Transportation
• Utilities (estimate high)
• Entertainment budget

**Step 4: Assign Savings Goals**
• Emergency fund contribution
• Investment contributions
• Short-term goal savings
• Long-term goal savings

**Step 5: Balance to Zero**
If you have leftover money, assign it to savings or debt payment. If you're short, reduce variable expenses or find additional income.`,
            keyPoints: [
              'Every peso must be assigned before the month begins',
              'Prioritize necessities, then savings, then wants',
              'Adjust categories monthly based on actual spending patterns',
              'Zero-based budgeting prevents impulse spending and money leaks'
            ],
            examples: [
              '₱25,000 income: All ₱25,000 assigned to specific categories',
              'Leftover ₱1,500: Assign to emergency fund or extra debt payment',
              'Monthly budget review: Adjust categories based on spending reality'
            ],
            source: {
              title: 'Dave Ramsey - Zero Based Budget',
              url: 'https://www.ramseysolutions.com/budgeting/how-to-make-a-zero-based-budget',
              type: 'Educational'
            }
          }
        },
        completed: false
      },
      {
        id: 'apply-budgeting-system',
        title: 'Apply: Build Your Filipino Budget',
        type: 'apply',
        content: {
          apply: {
            scenario: `Maria earns ₱28,000 monthly as a teacher. She gives ₱3,000 to her parents, spends ₱12,000 on personal needs, ₱8,000 on wants, and saves ₱5,000. Christmas is coming and she wants to give ₱10,000 in gifts without using credit cards. She also wants to start investing.`,
            task: 'What budgeting strategy should Maria use to balance all her goals?',
            options: [
              'Continue current budget and use credit card for Christmas',
              'Reduce wants spending and create specific savings funds for different goals',
              'Ask for a salary increase to afford everything',
              'Skip Christmas gifts to focus on investing'
            ],
            correctAnswer: 'Reduce wants spending and create specific savings funds for different goals',
            explanation: `Maria should restructure her budget to create targeted savings funds:

**Revised Monthly Budget (₱28,000):**
• Needs + Family: ₱15,000 (₱12,000 + ₱3,000 parents)
• Wants: ₱6,000 (reduced from ₱8,000)
• Emergency Fund: ₱2,000
• Christmas Fund: ₱1,000 (₱12,000 annually)
• Investment Fund: ₱2,500
• Buffer: ₱1,500

**Why this works:**
• Christmas fund eliminates holiday debt stress
• Still maintains family obligations
• Starts investment habit early
• Reduced but reasonable entertainment budget
• Creates multiple savings goals instead of generic saving

This system teaches her to balance Filipino family values with personal financial growth.`
          }
        },
        completed: false
      },
      {
        id: 'reflect-budgeting-mastery',
        title: 'Reflect: Your Budgeting System',
        type: 'reflect',
        content: {
          reflect: {
            questions: [
              'What Filipino cultural expenses do you need to budget for regularly?',
              'Which budgeting method (50-30-20 or zero-based) fits your personality better?',
              'What spending leaks have you noticed in your current budget?',
              'How can you balance family obligations with personal financial goals?'
            ],
            prompts: [
              'Track your spending for one week to identify patterns',
              'Calculate how much you spend annually on Filipino celebrations',
              'Consider which family financial obligations are truly necessary',
              'Think about automating your savings to remove temptation'
            ],
            actionItems: [
              'Choose one budgeting method and use it for the next month',
              'Set up separate savings accounts for different goals',
              'Have an honest conversation with family about financial boundaries',
              'Use a budgeting app like Coins.ph or create a simple spreadsheet'
            ]
          }
        },
        completed: false
      }
    ],
    completed: false,
    progress: 0
  },

  // 3. SAVING STRATEGIES MODULE
  {
    id: 'saving-strategies',
    title: 'Smart Saving Strategies',
    description: 'Build emergency funds and save for goals using Philippine banking options',
    duration: '30 min',
    lessons: [
      {
        id: 'emergency-fund-building',
        title: 'Building Your Emergency Fund: 3-6 Month Security',
        type: 'learn',
        content: {
          learn: {
            text: `An emergency fund is money set aside for unexpected expenses like job loss, medical bills, or family emergencies. In the Philippines, this fund is crucial because of limited government support systems.

**Why Emergency Funds Matter in the Philippines:**
• Job security is often uncertain
• Health insurance coverage can be limited
• Family emergencies happen frequently
• Natural disasters (typhoons, earthquakes) are common
• "Utang" culture can trap you in debt cycles

**How Much Should You Save?**
• **Minimum: 3 months** of essential expenses
• **Ideal: 6 months** of total monthly expenses
• **Conservative: 12 months** if you're risk-averse

**Calculation Example:**
Monthly expenses: ₱20,000
• 3 months: ₱60,000 (minimum security)
• 6 months: ₱120,000 (recommended target)
• 12 months: ₱240,000 (maximum security)

**Best Places for Emergency Funds in PH:**

**High-Yield Digital Banks:**
• **Tonik**: Up to 6% per annum, PDIC insured
• **CIMB**: 4% per annum, easy mobile access  
• **ING**: 2.5% per annum, established brand
• **Maya**: 3.5% per annum, integrated with payments

**Traditional Bank Options:**
• **BPI Save Up**: 0.5% but nationwide ATM access
• **BDO Peso Savings**: 0.25% but most ATMs in PH
• **Metrobank**: 0.5% with good online banking

**Money Market Funds:**
• **BPI Money Market Fund**: 2-3% returns
• **First Metro Asset Management**: Professional management
• **Philam Asset Management**: Higher returns with liquidity

Emergency funds should be easily accessible but earn more than inflation (3-4% annually in PH).`,
            keyPoints: [
              'Emergency funds prevent debt when unexpected expenses arise',
              'Digital banks offer higher interest rates than traditional banks',
              'Money should be accessible within 24-48 hours maximum',
              'PDIC insurance protects up to ₱500,000 per bank account'
            ],
            examples: [
              'Job loss scenario: 6-month fund covers expenses while job hunting',
              'Medical emergency: ₱50,000 fund prevents credit card debt',
              'Family crisis: Separate emergency fund protects personal goals'
            ],
            source: {
              title: 'BSP - Financial Stability & Banking Directory',
              url: 'https://www.bsp.gov.ph/SitePages/FinancialStability/DirBanksFIList.aspx',
              type: 'Government'
            }
          }
        },
        completed: false
      },
      {
        id: 'goal-based-saving',
        title: 'Goal-Based Saving: From Dreams to Reality',
        type: 'learn',
        content: {
          learn: {
            text: `Goal-based saving means creating separate savings accounts for each specific financial goal. This method works better than generic saving because it connects your money to your dreams.

**How to Structure Goal-Based Savings:**

**1. Short-Term Goals (1-12 months):**
• Emergency fund completion
• New gadgets (phone, laptop)
• Vacation or travel plans
• Christmas/birthday gifts
• **Best accounts**: High-yield savings, time deposits

**2. Medium-Term Goals (1-5 years):**
• House down payment
• Car purchase
• Wedding expenses
• Business capital
• **Best accounts**: Time deposits, money market funds

**3. Long-Term Goals (5+ years):**
• Retirement fund
• Children's education
• House full payment
• Wealth building
• **Best accounts**: Mutual funds, UITFs, stocks

**The SMART Goal Framework:**
• **Specific**: "Save ₱200,000 for condo down payment"
• **Measurable**: Track monthly progress
• **Achievable**: Based on realistic income/expenses
• **Relevant**: Aligned with life priorities
• **Time-bound**: "By December 2025"

**Calculating Monthly Savings Needed:**

**Example Goal**: ₱100,000 vacation fund in 2 years
• Total needed: ₱100,000
• Time frame: 24 months  
• Monthly savings: ₱100,000 ÷ 24 = ₱4,167
• Plus interest earnings: ₱3,800 monthly if earning 4% annually

**Automation Strategy:**
Set up automatic transfers on payday:
• Emergency fund: ₱2,000 monthly
• Vacation fund: ₱4,000 monthly
• Investment fund: ₱3,000 monthly
• Total automated savings: ₱9,000 monthly`,
            keyPoints: [
              'Separate accounts for each goal prevent money mixing and confusion',
              'SMART goals provide clear targets and timelines for success',
              'Automation removes emotional decision-making from saving',
              'Higher interest rates compound over time for larger goals'
            ],
            examples: [
              'House fund: ₱5,000 monthly × 48 months = ₱240,000 + interest',
              'Car fund: ₱8,000 monthly × 30 months = ₱240,000 for sedan',
              'Business fund: ₱3,000 monthly × 36 months = ₱108,000 startup capital'
            ],
            source: {
              title: 'Investopedia - Setting Financial Goals',
              url: 'https://www.investopedia.com/articles/personal-finance/100516/setting-financial-goals/',
              type: 'Educational'
            }
          }
        },
        completed: false
      },
      {
        id: 'apply-saving-strategy',
        title: 'Apply: Design Your Savings Plan',
        type: 'apply',
        content: {
          apply: {
            scenario: `Carlos, 26, earns ₱32,000 monthly. He has ₱15,000 expenses, no emergency fund, and three goals: (1) ₱150,000 for a motorcycle in 18 months, (2) ₱50,000 emergency fund, and (3) ₱300,000 condo down payment in 5 years. He can save ₱12,000 monthly total.`,
            task: 'How should Carlos prioritize and allocate his ₱12,000 monthly savings?',
            options: [
              'Split equally: ₱4,000 each goal',
              'Emergency fund first (4 months), then motorcycle (10 months), then condo',  
              'Focus on condo down payment as the biggest goal',
              'Motorcycle first (fastest goal), then emergency fund, then condo'
            ],
            correctAnswer: 'Emergency fund first (4 months), then motorcycle (10 months), then condo',
            explanation: `Carlos should prioritize building financial security before pursuing wants:

**Phase 1 (Months 1-4): Emergency Fund Priority**
• Save ₱12,000 monthly in CIMB Bank (4% interest)
• Target: ₱48,000 + ₱800 interest ≈ ₱50,000 emergency fund
• Reason: Security foundation before taking on debt or big purchases

**Phase 2 (Months 5-14): Motorcycle Fund**
• Continue ₱12,000 monthly saving
• Target: ₱120,000 + interest ≈ ₱125,000 in 10 months
• Add ₱25,000 from emergency fund temporarily or increase savings rate
• Reason: Transportation can improve earning potential

**Phase 3 (Month 15+): Condo Down Payment**  
• Full ₱12,000 monthly toward condo fund
• 42 months remaining: ₱12,000 × 42 = ₱504,000
• Invest in balanced mutual funds for growth
• Reason: Long-term goal benefits from compound growth

**Why this sequence works:**
Emergency fund provides security buffer, motorcycle improves lifestyle/earning potential, condo down payment has longest timeline to benefit from investment growth.`
          }
        },
        completed: false
      },
      {
        id: 'reflect-saving-habits',
        title: 'Reflect: Your Saving Identity',
        type: 'reflect',
        content: {
          reflect: {
            questions: [
              'What are your top 3 financial goals for the next 5 years?',
              'Which saving challenges do you face most: discipline, income, or expenses?',
              'How would achieving your savings goals change your life and family situation?',
              'What automated systems can you set up this month to make saving easier?'
            ],
            prompts: [
              'Calculate exactly how much you need to save monthly for each goal',
              'Research which banks or platforms offer the best rates for your timeline',
              'Consider what lifestyle changes you might need to reach your savings targets',
              'Think about how to stay motivated during long-term saving periods'
            ],
            actionItems: [
              'Open separate high-yield accounts for your top 3 financial goals',
              'Set up automatic transfers for at least your emergency fund',
              'Download apps like CIMB, Tonik, or ING to start earning higher interest',
              'Create visual reminders of your goals (photos, progress charts)'
            ]
          }
        },
        completed: false
      }
    ],
    completed: false,
    progress: 0
  },

  // 4. INVESTMENT FUNDAMENTALS MODULE  
  {
    id: 'investment-fundamentals',
    title: 'Investment Fundamentals',
    description: 'Start building wealth through stocks, bonds, and funds in the Philippine market',
    duration: '35 min',
    lessons: [
      {
        id: 'investment-mindset',
        title: 'Investment Mindset: Building Long-Term Wealth',
        type: 'learn',
        content: {
          learn: {
            text: `Investing is the most powerful tool for building wealth, but it requires the right mindset and understanding of risk vs. reward over time.

**Why Filipinos Must Invest:**
• Inflation (3-4% annually) erodes money in low-interest savings
• Social Security System provides minimal retirement income  
• OFW remittances won't last forever
• Cost of living increases faster than salary increases
• Compound interest creates exponential wealth growth over decades

**Investment vs. Saving vs. Speculation:**

**Saving (0.25-4% returns):**
• Purpose: Security and emergency funds
• Risk: Very low (PDIC insured)
• Timeline: Immediate access needed
• Example: Emergency fund in high-yield savings

**Investing (6-12% average returns):**
• Purpose: Long-term wealth building
• Risk: Moderate to high (value fluctuates)
• Timeline: 5+ years minimum
• Example: Mutual funds, stocks, UITFs

**Speculation (Variable returns):**
• Purpose: Quick profits (gambling mentality)
• Risk: Very high (can lose everything)
• Timeline: Short-term trading
• Example: Day trading, crypto speculation

**The Power of Compound Interest:**

**₱5,000 monthly investment example:**
• **Year 5**: ₱331,000 (₱300,000 invested + ₱31,000 growth)
• **Year 10**: ₱764,000 (₱600,000 invested + ₱164,000 growth)  
• **Year 20**: ₱2.29M (₱1.2M invested + ₱1.09M growth)
• **Year 30**: ₱6.1M (₱1.8M invested + ₱4.3M growth)

**Key Investment Principles:**
• Start early to maximize compound growth
• Invest regularly (peso-cost averaging)
• Diversify across different assets
• Focus on time in market, not timing the market
• Reinvest profits for exponential growth`,
            keyPoints: [
              'Investing is necessary to beat inflation and build real wealth',
              'Compound interest becomes more powerful the longer you invest',
              'Regular investing reduces the impact of market volatility',
              'Starting 10 years earlier can double your final wealth'
            ],
            examples: [
              '25 vs 35 start age: ₱3M difference at retirement with same monthly investment',
              'Inflation impact: ₱100,000 today = ₱67,000 purchasing power in 10 years',
              'Stock market history: PSEi averaged 8.7% annually over 20+ years'
            ],
            source: {
              title: 'COL Financial - Online Stock Trading Platform',
              url: 'https://www.colfinancial.com/',
              type: 'Educational'
            }
          }
        },
        completed: false
      },
      {
        id: 'philippine-investment-options',
        title: 'Philippine Investment Landscape: Your Options',
        type: 'learn',
        content: {
          learn: {
            text: `The Philippines offers many investment options for different risk tolerances and goals. Understanding each option helps you build a diversified portfolio.

**LEVEL 1: CONSERVATIVE INVESTMENTS (Low Risk, 3-6% returns)**

**Government Bonds (Retail Treasury Bonds)**
• Backed by Philippine government
• 5-25 year terms, 4-6% annual interest
• Minimum: ₱5,000 via banks
• Best for: Conservative long-term savings

**Money Market Funds**
• Professionally managed short-term investments
• 3-5% annual returns, highly liquid
• Examples: BPI Money Market, First Metro Money Market
• Best for: Emergency fund alternative with higher returns

**LEVEL 2: MODERATE INVESTMENTS (Medium Risk, 6-10% potential returns)**

**Balanced Mutual Funds**
• Mix of stocks (growth) and bonds (stability) 
• Professional portfolio management
• Examples: BPI Balanced Fund, Philam Strategic Growth
• Best for: First-time investors wanting diversification

**Unit Investment Trust Funds (UITFs)**
• Bank-offered investment products
• Lower fees than mutual funds
• Examples: BPI Equity Index Fund, Metrobank Dollar Bond Fund
• Best for: Bank customers wanting easy access

**LEVEL 3: GROWTH INVESTMENTS (Higher Risk, 8-15% potential returns)**

**Philippine Stocks (PSEi)**
• Ownership shares in Filipino companies
• Examples: Jollibee (JFC), Ayala (AC), BDO, SM
• Platforms: COL Financial, First Metro Securities, BPI Trade
• Best for: Long-term wealth building (10+ years)

**Equity Mutual Funds**
• 100% invested in stocks, professionally managed
• Examples: First Metro Equity Fund, Sun Life Prosperity Fund
• Higher volatility but higher growth potential
• Best for: Aggressive wealth building

**Real Estate Investment Trusts (REITs)**  
• Invest in income-generating properties
• Examples: AREIT (Ayala Land), RLC REIT (Robinsons Land)
• Earn rental income + potential appreciation
• Best for: Real estate exposure without direct ownership

**Getting Started Recommendations:**
• **Beginner**: Start with balanced mutual fund (₱1,000-5,000 monthly)
• **Intermediate**: Add index fund or blue-chip stocks
• **Advanced**: Diversify across multiple asset classes`,
            keyPoints: [
              'Philippine market offers options for every risk level and budget',
              'Diversification across asset classes reduces overall portfolio risk',
              'Professional management (mutual funds/UITFs) good for beginners',
              'Direct stock investing requires more knowledge but offers higher control'
            ],
            examples: [
              'Conservative portfolio: 70% money market + 30% government bonds',
              'Balanced portfolio: 40% bonds + 60% stocks/equity funds',
              'Aggressive portfolio: 80% stocks + 20% REITs/alternative investments'
            ],
            source: {
              title: 'PSA - Consumer Price Index & Inflation Data',
              url: 'https://psa.gov.ph/price-indices/cpi-and-inflation-rate',
              type: 'Government'
            }
          }
        },
        completed: false
      },
      {
        id: 'apply-investment-portfolio',
        title: 'Apply: Build Your First Investment Portfolio',
        type: 'apply',
        content: {
          apply: {
            scenario: `Sarah, 28, has built her ₱100,000 emergency fund and can now invest ₱8,000 monthly. She wants to retire comfortably at 60 (32 years to invest) and can tolerate moderate risk. She's never invested before but is willing to learn. She has three goals: house down payment in 7 years, children's education in 15 years, and retirement in 32 years.`,
            task: 'What investment allocation strategy should Sarah use for her ₱8,000 monthly budget?',
            options: [
              'Put everything in one balanced mutual fund for simplicity',
              'Divide by goals: ₱3,000 conservative, ₱3,000 moderate, ₱2,000 aggressive', 
              'Start conservative, gradually increase risk as she learns more',
              'Focus on stocks only since she has 32 years until retirement'
            ],
            correctAnswer: 'Divide by goals: ₱3,000 conservative, ₱3,000 moderate, ₱2,000 aggressive',
            explanation: `Sarah should use a goal-based investment strategy matching risk to timeline:

**Goal-Based Allocation (₱8,000 monthly):**

**House Down Payment (7 years): ₱3,000/month**
• **Investment**: Balanced mutual fund (60% stocks, 40% bonds)
• **Risk level**: Moderate (can handle some volatility)
• **Platform**: BPI Balanced Fund or Sun Life Prosperity Fund
• **Expected**: ₱320,000 total with 6-8% average returns

**Children's Education (15 years): ₱3,000/month**  
• **Investment**: Equity mutual fund (80% stocks)
• **Risk level**: Moderate-aggressive (longer timeline)
• **Platform**: First Metro Equity Fund or Philam Strategic Growth
• **Expected**: ₱750,000+ with 8-10% average returns

**Retirement Fund (32 years): ₱2,000/month**
• **Investment**: Index fund tracking PSEi + some individual blue-chips
• **Risk level**: Aggressive (longest timeline, highest growth potential)
• **Platform**: COL Financial for direct stocks + BPI Equity Index Fund
• **Expected**: ₱2M+ with 10-12% average returns

**Why this works:**
Different timelines require different risk levels. Shorter goals need stability, longer goals can handle volatility for higher growth. This teaches diversification while matching investments to specific life goals.`
          }
        },
        completed: false
      },
      {
        id: 'reflect-investment-journey',
        title: 'Reflect: Your Investment Philosophy',
        type: 'reflect',
        content: {
          reflect: {
            questions: [
              'What is your biggest fear about investing, and how can you address it through education?',
              'Which investment timeline do you have: short-term (1-5 years), medium-term (5-15 years), or long-term (15+ years)?',
              'How comfortable are you with seeing your investments lose value temporarily?',
              'What would achieving financial independence through investing mean for your family?'
            ],
            prompts: [
              'Calculate how much you could have at retirement if you start investing now vs. waiting 5 years',
              'Research one specific mutual fund or stock that interests you',
              'Consider how your investment strategy should change as your income grows',
              'Think about the legacy you want to leave for your children through wealth building'
            ],
            actionItems: [
              'Open your first investment account this month (mutual fund, UITF, or brokerage)',
              'Start with a small amount (₱1,000-2,000) to learn without major risk',
              'Set up automatic monthly investments to build the habit',
              'Join Filipino investor communities online for ongoing education and support'
            ]
          }
        },
        completed: false
      }
    ],
    completed: false,
    progress: 0
  },

  // 5. DEBT MANAGEMENT MODULE
  {
    id: 'debt-management',
    title: 'Debt Management & Freedom',
    description: 'Strategies to eliminate debt and avoid the Filipino debt trap',
    duration: '30 min',
    lessons: [
      {
        id: 'understanding-filipino-debt-culture',
        title: 'Breaking the Filipino Debt Cycle',
        type: 'learn',
        content: {
          learn: {
            text: `Debt culture in the Philippines is deeply rooted in social relationships and immediate needs, but understanding how to manage and eliminate debt is crucial for financial freedom.

**Common Filipino Debt Patterns:**

**"Utang na Loob" Debt Culture**
• Borrowing from family/friends for emergencies
• Social pressure to lend money you don't have
• Difficulty saying no to financial requests
• Using debt to maintain social status

**High-Interest Debt Traps**
• Credit card debt (3-5% monthly = 36-60% annually!)
• "5-6" lending (20% interest in 30 days = 240% annually!)
• Salary loans with hidden fees
• Pawning valuable items repeatedly

**Lifestyle Inflation Debt**
• Living paycheck to paycheck despite salary increases
• Financing lifestyle through credit cards
• Buying status symbols on installment
• BNPL (Buy Now Pay Later) addiction

**Debt Ranking System (Pay off in this order):**

**LEVEL 1: EMERGENCY ELIMINATION**
• "5-6" lending: 240%+ annual interest
• Credit card cash advances: 60%+ annual interest  
• Salary loans: 24-36% annual interest
• **Strategy**: Pay minimum on others, attack these aggressively

**LEVEL 2: HIGH-INTEREST CONSUMER DEBT**
• Credit card balances: 36-42% annual interest
• Personal loans: 18-30% annual interest
• Store financing: 20-40% annual interest
• **Strategy**: Debt snowball or avalanche method

**LEVEL 3: MODERATE-INTEREST SECURED DEBT**
• Car loans: 8-15% annual interest
• Home loans: 6-12% annual interest  
• SSS/Pag-IBIG loans: 6-10% annual interest
• **Strategy**: Pay regularly, consider extra payments

**The Debt Avalanche vs. Snowball Method:**

**Avalanche Method (Math-Optimal)**
• Pay minimums on all debts
• Put extra money toward highest interest rate debt
• Saves more money in total interest paid
• Better for disciplined individuals

**Snowball Method (Psychology-Optimal)**  
• Pay minimums on all debts
• Put extra money toward smallest balance debt
• Creates momentum and motivation
• Better for people who need quick wins`,
            keyPoints: [
              'Filipino debt culture requires both financial and social boundary strategies',
              'High-interest debt (credit cards, 5-6 lending) must be eliminated first',
              'Debt elimination requires both mathematical strategy and psychological motivation',
              'Emergency fund prevents future debt cycles from unexpected expenses'
            ],
            examples: [
              '₱50,000 credit card debt at 42% interest = ₱21,000 annual interest cost',
              'Minimum payments extend debt to 15+ years and triple total payment',
              '₱5,000 extra monthly payment reduces 10-year debt to 2 years'
            ],
            source: {
              title: 'BSP - Credit and Debit Card Regulations',
              url: 'https://www.bsp.gov.ph/Regulations/Issuances/2023/1165.pdf',
              type: 'Government'
            }
          }
        },
        completed: false
      },
      {
        id: 'debt-elimination-strategies',
        title: 'Proven Debt Elimination Strategies',
        type: 'learn',
        content: {
          learn: {
            text: `Successful debt elimination requires a systematic approach combining behavioral changes, strategic payments, and income optimization.

**Step 1: Complete Debt Inventory**

List every debt with:
• Creditor name
• Total balance owed
• Minimum monthly payment  
• Interest rate (annual)
• Payment due date

**Example Debt List:**
• Credit Card A: ₱75,000 balance, ₱3,750 minimum, 42% interest
• Personal Loan: ₱150,000 balance, ₱8,500 minimum, 24% interest
• Car Loan: ₱480,000 balance, ₱12,000 minimum, 12% interest
• Family Loan: ₱50,000 balance, ₱0 minimum, 0% interest

**Step 2: Calculate Debt-to-Income Ratio**
Total monthly debt payments ÷ Monthly income = DTI ratio
• Above 40% DTI = Debt emergency
• 20-40% DTI = Needs aggressive action
• Below 20% DTI = Manageable

**Step 3: Choose Your Elimination Strategy**

**Modified Avalanche (Recommended for Filipinos):**
1. Pay minimums on all debts
2. Attack highest interest rate debt first
3. Exception: Pay off small family debts quickly to preserve relationships
4. Roll payments from eliminated debts into next target

**Debt Consolidation Options:**
• **Balance transfer**: Move high-interest credit card debt to lower-interest card
• **Personal loan**: Replace multiple debts with single lower-interest loan
• **Home equity**: Use property value to secure lower-interest debt (risky)
• **Family loan**: Negotiate formal terms with family members

**Step 4: Increase Debt Payment Power**

**Expense Reduction (Immediate)**
• Cancel unnecessary subscriptions (Netflix, gym, etc.)
• Reduce dining out by 50%
• Use public transportation instead of Grab/taxi
• Buy generic brands instead of premium products

**Income Increase (Short-term)**
• Freelance work (writing, virtual assistance, tutoring)
• Sell unused items (gadgets, clothes, furniture)
• Part-time weekend work
• Utilize skills for side income (graphics, coding, cooking)

**Example Debt Elimination Plan:**
Monthly income: ₱30,000
Total minimums: ₱15,000
Available for extra payments: ₱8,000
Timeline: 18 months to debt freedom vs. 8+ years with minimums`,
            keyPoints: [
              'Complete debt inventory reveals the true scope of the problem',
              'Mathematical approach (avalanche) saves more money than emotional approach',
              'Debt consolidation can lower interest rates but requires discipline',
              'Increasing payment power through reduced expenses and higher income accelerates freedom'
            ],
            examples: [
              'Credit card debt elimination: ₱8,000 extra monthly eliminates ₱75,000 in 11 months',
              'Debt consolidation: Combining 3 debts at different rates into 1 lower rate',
              'Side hustle impact: ₱5,000 monthly extra income cuts debt timeline in half'
            ],
            source: {
              title: 'CICC - Cybercrime Investigation & Coordination',
              url: 'https://cicc.gov.ph/advisories/',
              type: 'Government'
            }
          }
        },
        completed: false
      },
      {
        id: 'apply-debt-elimination',
        title: 'Apply: Create Your Debt Freedom Plan',
        type: 'apply',
        content: {
          apply: {
            scenario: `Miguel has ₱35,000 monthly income and these debts: Credit Card ₱80,000 (42% interest, ₱4,000 minimum), Personal Loan ₱120,000 (24% interest, ₱6,000 minimum), Car Loan ₱300,000 (12% interest, ₱8,500 minimum), Family Debt ₱25,000 (0% interest, no minimum). His expenses are ₱20,000 monthly, leaving ₱15,000 for debt payments beyond minimums. He wants to be debt-free as quickly as possible.`,
            task: 'What is the most effective debt elimination strategy for Miguel?',
            options: [
              'Pay equal extra amounts to all debts to reduce them proportionally',
              'Pay family debt first to improve relationships, then use avalanche method',
              'Use debt snowball: pay family debt, then credit card, then personal loan, then car',
              'Focus all extra payment on credit card (highest interest) using avalanche method'
            ],
            correctAnswer: 'Focus all extra payment on credit card (highest interest) using avalanche method',
            explanation: `Miguel should use the debt avalanche method for maximum savings:

**Monthly Payment Strategy:**
• Family Debt: ₱1,000 (pay off in 25 months, maintain relationship)
• Personal Loan: ₱6,000 minimum
• Car Loan: ₱8,500 minimum  
• Credit Card: ₱4,000 minimum + ₱15,500 extra = ₱19,500 total

**Results with Avalanche Method:**
• **Month 5**: Credit card eliminated (saves ₱2,800 monthly interest)
• **Month 12**: Personal loan eliminated (total payments now focus on car)
• **Month 24**: Car loan eliminated 
• **Total interest saved**: ₱180,000+ vs. minimum payments

**Why avalanche works best:**
• Credit card's 42% interest rate costs ₱2,800 monthly
• Eliminating highest rate debt first maximizes interest savings
• Family debt at 0% can be paid slowly without cost
• Mathematical approach saves 6+ years and ₱180,000 in interest

**After debt freedom (Month 24):**
Miguel's ₱18,500 in debt payments become available for emergency fund building and investing, creating a complete financial transformation.`
          }
        },
        completed: false
      },
      {
        id: 'reflect-debt-freedom-mindset',
        title: 'Reflect: Your Relationship with Debt',
        type: 'reflect',
        content: {
          reflect: {
            questions: [
              'What emotional triggers cause you to take on debt (stress, social pressure, instant gratification)?',
              'Which debts in your life are from genuine needs vs. wants or social expectations?',
              'How would eliminating all your debt change your daily stress and life choices?',
              'What boundaries do you need to set with family and friends regarding money lending?'
            ],
            prompts: [
              'Calculate the total interest you will pay if you only make minimum payments',
              'Identify which expenses you can reduce temporarily to accelerate debt elimination',
              'Consider what skills or assets you have that could generate extra income',
              'Think about the lifestyle changes needed to prevent future debt accumulation'
            ],
            actionItems: [
              'Create a complete list of all your debts with balances and interest rates',
              'Choose either avalanche or snowball method and commit to one strategy',
              'Set up automatic payments for all minimum amounts to avoid late fees',
              'Find one way to increase income or reduce expenses by ₱2,000+ monthly'
            ]
          }
        },
        completed: false
      }
    ],
    completed: false,
    progress: 0
  },

  // 6. INSURANCE & PROTECTION MODULE
  {
    id: 'insurance-protection',
    title: 'Insurance & Financial Protection', 
    description: 'Protect your family and wealth from unexpected life events',
    duration: '25 min',
    lessons: [
      {
        id: 'filipino-insurance-landscape',
        title: 'Understanding Insurance in the Philippine Context',
        type: 'learn',
        content: {
          learn: {
            text: `Insurance is crucial in the Philippines due to limited government safety nets, natural disasters, and family-centered culture where one person's misfortune affects many.

**Why Filipinos Need Insurance:**
• Limited government healthcare coverage (PhilHealth covers basics only)
• Typhoons, earthquakes, and natural disasters are common
• Family breadwinners support multiple dependents
• Hospital bills can bankrupt families instantly
• Job security is often uncertain

**Types of Insurance Every Filipino Needs:**

**1. HEALTH INSURANCE (Priority #1)**

**Government Options:**
• **PhilHealth**: Basic coverage, ₱45,000 annual benefit limit
• **Coverage**: Basic hospitalization, some procedures
• **Cost**: Based on income, minimum ₱4,800 annually
• **Limitation**: Insufficient for major medical expenses

**Private Health Insurance:**
• **HMO Plans**: ₱15,000-50,000 annually for comprehensive coverage
• **Examples**: Maxicare, Medicard, IntelliCare, Avega
• **Coverage**: Consultations, lab tests, hospitalization, some procedures
• **Best for**: Regular medical needs and preventive care

**Health Insurance Cards:**
• **Examples**: Cocolife, AXA Philippines, Sun Life
• **Coverage**: ₱100,000-1,000,000 per illness
• **Cost**: ₱3,000-15,000 annually
• **Best for**: Major medical emergencies

**2. LIFE INSURANCE (Financial Protection)**

**Term Life Insurance:**
• **Coverage**: 5-20 times annual income
• **Cost**: ₱5,000-15,000 annually for ₱1M coverage
• **Duration**: 10-30 year terms
• **Best for**: Young families with dependents

**Whole Life Insurance:**
• **Coverage**: Permanent protection + savings component
• **Cost**: ₱20,000-100,000+ annually
• **Benefits**: Death benefit + cash value growth
• **Best for**: Estate planning and long-term savings

**VUL (Variable Universal Life):**
• **Coverage**: Life insurance + investment component
• **Cost**: ₱24,000+ annually (₱2,000+ monthly)
• **Benefits**: Flexible premiums + investment growth potential
• **Best for**: Disciplined investors wanting insurance + growth

**3. DISABILITY INSURANCE**
• **Coverage**: Income replacement if unable to work
• **Cost**: 1-3% of annual income
• **Types**: Short-term (6 months) vs. Long-term (until retirement)
• **Importance**: Protects against loss of earning capacity`,
            keyPoints: [
              'Health insurance prevents medical bankruptcy - Philippines\' #1 financial risk',
              'Life insurance protects dependents from loss of breadwinner income',
              'Term life insurance provides maximum coverage at lowest cost for young families',
              'Disability insurance protects your most valuable asset - your ability to earn'
            ],
            examples: [
              'Hospital bill reality: ₱500,000 for dengue complications without insurance',
              'Life insurance need: ₱30,000 monthly income = ₱3-6M coverage recommendation',
              'Disability scenario: Unable to work for 2 years = ₱720,000 lost income'
            ],
            source: {
              title: 'PhilHealth - National Health Insurance',
              url: 'https://www.philhealth.gov.ph/',
              type: 'Government'
            }
          }
        },
        completed: false
      },
      {
        id: 'insurance-planning-strategy',
        title: 'Building Your Insurance Safety Net',
        type: 'learn',
        content: {
          learn: {
            text: `Effective insurance planning means getting the right coverage at the right time for the right cost, without over-insuring or under-insuring your risks.

**Insurance Priority Ladder (Buy in this order):**

**STEP 1: Basic Health Protection**
• **PhilHealth**: Mandatory, covers basic needs
• **Company HMO**: If available through employer (often free)
• **Personal HMO**: If no company coverage (₱15,000-30,000 annually)
• **Target**: ₱200,000+ annual coverage limit

**STEP 2: Life Insurance for Dependents**
• **Who needs it**: Anyone with dependents (spouse, children, parents)
• **Coverage amount**: 5-10 times annual income
• **Type**: Term life insurance for maximum protection at lowest cost
• **Example**: ₱300,000 income = ₱1.5-3M term life coverage

**STEP 3: Major Medical Coverage**
• **Critical illness insurance**: ₱500,000-2M coverage
• **Cancer insurance**: Specific coverage for cancer treatment
• **Accident insurance**: Coverage for injury-related expenses
• **Cost**: ₱5,000-20,000 annually depending on coverage

**STEP 4: Income Protection**
• **Disability insurance**: Replaces income if unable to work
• **Coverage**: 60-70% of current income
• **Duration**: Until retirement age or recovery
• **Cost**: 1-3% of annual income

**STEP 5: Property Protection**
• **Home insurance**: Protects property investment
• **Car insurance**: Mandatory comprehensive coverage
• **Personal property**: Valuable items coverage
• **Natural disaster**: Earthquake, flood, typhoon coverage

**Common Filipino Insurance Mistakes:**

**Mistake #1: Buying VUL as First Insurance**
• Problem: Expensive, complex, lower insurance coverage per peso
• Better: Buy term life + invest the difference in mutual funds

**Mistake #2: Over-insuring Single Life**
• Problem: Buying multiple life insurance policies on same person
• Better: One adequate policy + diversified asset building

**Mistake #3: Ignoring Inflation**
• Problem: ₱1M coverage today = ₱670,000 purchasing power in 10 years
• Better: Choose policies with inflation adjustment riders

**Insurance Budget Guidelines:**
• Total insurance cost: 10-15% of gross income
• Health insurance: 3-5% of income
• Life insurance: 3-5% of income  
• Other insurance: 2-5% of income

**Example for ₱30,000 monthly income:**
• Health HMO: ₱1,500 monthly (₱18,000 annually)
• Term life: ₱800 monthly (₱9,600 annually)  
• Disability: ₱500 monthly (₱6,000 annually)
• Total: ₱2,800 monthly (11% of income)`,
            keyPoints: [
              'Buy insurance in order of priority - health first, then life, then extras',
              'Term life insurance provides maximum protection for families at lowest cost',
              'Insurance should cost 10-15% of income total across all policies',
              'Avoid complex products (VUL) until you understand basic insurance first'
            ],
            examples: [
              'Young family priority: Health HMO + Term life insurance = ₱25,000 annually',
              'Single professional: Health insurance only until dependents exist',
              'Established family: Full ladder including disability and property insurance'
            ],
            source: {
              title: 'SSS - Social Security System',
              url: 'https://www.sss.gov.ph/',
              type: 'Government'
            }
          }
        },
        completed: false
      },
      {
        id: 'apply-insurance-planning',
        title: 'Apply: Design Your Insurance Portfolio',
        type: 'apply',
        content: {
          apply: {
            scenario: `Anna, 29, earns ₱45,000 monthly and supports her husband (₱25,000 income) and 2 young children. She has ₱150,000 emergency fund but no insurance except mandatory PhilHealth and SSS. Their combined monthly expenses are ₱55,000. Anna can budget ₱6,000 monthly for insurance. She's worried about medical bills and what happens to her family if she can't work.`,
            task: 'How should Anna allocate her ₱6,000 monthly insurance budget for optimal family protection?',
            options: [
              'Buy the most expensive VUL policy available to get both insurance and investment',
              'Split equally: ₱2,000 health, ₱2,000 life, ₱2,000 disability insurance',
              'Prioritize health and life: ₱2,500 family health HMO, ₱3,500 term life insurance',
              'Focus on life insurance only since she has emergency fund for medical bills'
            ],
            correctAnswer: 'Prioritize health and life: ₱2,500 family health HMO, ₱3,500 term life insurance',
            explanation: `Anna should prioritize the most critical risks first with her budget:

**Recommended ₱6,000 Monthly Insurance Allocation:**

**Family Health HMO: ₱2,500/month (₱30,000 annually)**
• **Coverage**: Family plan for 4 people
• **Benefits**: ₱300,000+ annual limit per person
• **Providers**: Maxicare, Medicard, or IntelliCare
• **Reason**: Medical bills are the #1 financial emergency in Philippines

**Term Life Insurance: ₱3,500/month (₱42,000 annually)**
• **Coverage**: ₱4-5M death benefit on Anna's life
• **Calculation**: ₱45,000 × 12 months × 8 years = ₱4.3M coverage
• **Providers**: Sun Life, AXA, or Philam Life  
• **Reason**: Protects family's primary income source

**Why this allocation works:**
• Health HMO prevents medical bankruptcy (most common Filipino financial crisis)
• Life insurance replaces 8+ years of Anna's income if she dies
• Emergency fund handles smaller medical bills not covered by HMO
• Once established, can add disability insurance with future raises

**Future additions (Year 2+):**
Add disability insurance (₱1,500 monthly) and husband's life insurance (₱1,000 monthly) when income increases.`
          }
        },
        completed: false
      },
      {
        id: 'reflect-insurance-security',
        title: 'Reflect: Your Financial Security Net',
        type: 'reflect',
        content: {
          reflect: {
            questions: [
              'What would happen to your family financially if you couldn\'t work for 6 months due to illness?',
              'Which family members depend on your income, and how would they survive without it?',
              'What is the biggest financial risk your family faces: medical bills, disability, or premature death?',
              'How much could you realistically budget monthly for insurance without affecting basic needs?'
            ],
            prompts: [
              'Calculate how many months your emergency fund would last if you had no income',
              'Research insurance claims stories from Filipino families to understand real risks',
              'Compare the cost of insurance premiums vs. potential out-of-pocket medical expenses',
              'Consider how insurance fits into your overall financial plan and goals'
            ],
            actionItems: [
              'Get quotes from 3 different insurance companies for health and life coverage',
              'Review your current PhilHealth and SSS benefits to understand coverage gaps',
              'Set up a separate savings account for insurance premium payments',
              'Schedule annual insurance reviews to adjust coverage as income and family size change'
            ]
          }
        },
        completed: false
      }
    ],
    completed: false,
    progress: 0
  },

  // 7. TAX PLANNING MODULE
  {
    id: 'tax-planning',
    title: 'Tax Planning & Optimization',
    description: 'Understand Philippine tax system and legal ways to minimize tax burden',
    duration: '20 min',
    lessons: [
      {
        id: 'philippine-tax-system',
        title: 'Understanding Philippine Income Tax (TRAIN Law)',
        type: 'learn',
        content: {
          learn: {
            text: `The Tax Reform for Acceleration and Inclusion (TRAIN) Law changed Philippine income tax rates in 2018, making tax planning essential for maximizing take-home income.

**Current Income Tax Brackets (2018-Present):**

**For Employees (Compensation Income):**
• **₱0 - ₱250,000**: 0% tax (tax-free)
• **₱250,001 - ₱400,000**: 15% tax on excess over ₱250,000
• **₱400,001 - ₱800,000**: ₱22,500 + 20% on excess over ₱400,000
• **₱800,001 - ₱2,000,000**: ₱102,500 + 25% on excess over ₱800,000
• **₱2,000,001 - ₱8,000,000**: ₱402,500 + 30% on excess over ₱2,000,000
• **Above ₱8,000,000**: ₱2,202,500 + 35% on excess over ₱8,000,000

**Tax Calculation Examples:**

**Example 1: ₱300,000 Annual Salary**
• First ₱250,000: ₱0 tax
• Next ₱50,000: ₱50,000 × 15% = ₱7,500 tax
• **Total annual tax**: ₱7,500
• **Monthly tax**: ₱625
• **Take-home**: ₱24,375 monthly

**Example 2: ₱600,000 Annual Salary**
• First ₱250,000: ₱0 tax
• Next ₱150,000: ₱150,000 × 15% = ₱22,500
• Next ₱200,000: ₱200,000 × 20% = ₱40,000
• **Total annual tax**: ₱62,500
• **Monthly tax**: ₱5,208
• **Take-home**: ₱44,792 monthly

**Other Taxes Affecting Filipinos:**

**Withholding Tax on Investments:**
• **Bank interest**: 20% final tax
• **Stock dividends**: 10% final tax
• **Mutual fund gains**: Tax-free if held 5+ years
• **UITF gains**: Subject to final tax rates

**VAT (Value Added Tax):**
• **Rate**: 12% on most goods and services
• **Impact**: Reduces purchasing power
• **Exemptions**: Basic commodities, educational services

**Estate Tax:**
• **Rate**: 6% of net estate value
• **Exemption**: ₱5,000,000 per estate
• **Importance**: Proper planning prevents family financial burden

**Business Income Tax:**
• **Corporations**: 25% (large) / 20% (small)
• **Self-employed**: Same individual rates as employees
• **Freelancers**: 8% of gross receipts (optional simplified tax system)`,
            keyPoints: [
              'First ₱250,000 of income is completely tax-free under TRAIN Law',
              'Progressive tax system means higher earners pay higher percentages',
              'Investment taxes vary by type and holding period',
              'Proper tax planning can legally reduce overall tax burden'
            ],
            examples: [
              '₱20,833 monthly salary = ₱0 income tax (below ₱250,000 annually)',
              '₱50,000 monthly salary = ₱5,208 monthly tax (₱600,000 annually)',
              'Mutual fund vs. bank savings: 0% vs. 20% tax on gains'
            ],
            source: {
              title: 'BSP - Interest Rate Statistics',
              url: 'https://www.bsp.gov.ph/statistics/',
              type: 'Government'
            }
          }
        },
        completed: false
      },
      {
        id: 'tax-optimization-strategies',
        title: 'Legal Tax Optimization Strategies for Filipinos',
        type: 'learn',
        content: {
          learn: {
            text: `Tax optimization means legally minimizing your tax burden through proper planning, timing, and use of available deductions and exemptions.

**Employment-Based Tax Strategies:**

**Maximize 13th Month Pay and Bonuses**
• **Tax-free amount**: Up to ₱90,000 annually
• **Strategy**: Negotiate bonus structure with employer
• **Timing**: Spread bonuses across calendar year
• **Savings**: Up to ₱22,500 in taxes for high earners

**Optimize Leave Conversions**
• **Tax treatment**: Leave conversions may have different tax rates
• **Strategy**: Convert unused leave in low-income years
• **Planning**: Time leave conversions with other income

**Investment-Based Tax Strategies:**

**Tax-Free Mutual Fund Strategy**
• **Rule**: Mutual fund gains are tax-free if held 5+ years
• **Strategy**: Hold equity mutual funds for long-term goals
• **Benefit**: 0% tax vs. 20% tax on bank interest
• **Example**: ₱100,000 gain = ₱0 tax vs. ₱20,000 tax on time deposit

**Dividend Tax Optimization**
• **Philippine stocks**: 10% final tax on dividends
• **Foreign stocks**: Subject to income tax rates
• **Strategy**: Focus on Philippine dividend-paying stocks
• **REITs**: Different tax treatment for rental income distributions

**Retirement Account Tax Benefits**
• **Pag-IBIG MP2**: Tax-deductible contributions up to ₱100,000
• **VUL contributions**: May qualify for tax deductions
• **SSS voluntary contributions**: Potential tax benefits

**Business and Self-Employment Strategies:**

**Freelancer 8% Tax Option**
• **Eligibility**: Gross receipts not exceeding ₱3M annually
• **Benefit**: Fixed 8% rate vs. graduated income tax rates
• **Requirements**: Register as self-employed, pay quarterly

**Business Expense Deductions**
• **Home office**: Portion of utilities, rent as business expense
• **Equipment**: Computers, phones for business use
• **Training**: Professional development courses
• **Requirements**: Proper receipts and business connection

**Estate Planning Tax Strategies:**

**Estate Tax Minimization**
• **Annual gifts**: ₱250,000 per recipient tax-free annually
• **Family planning**: Distribute assets over time
• **Trust funds**: Professional estate tax planning
• **Life insurance**: Proceeds generally not subject to estate tax

**Tax-Efficient Investment Sequencing:**
1. **Tax-free accounts first**: Pag-IBIG MP2, retirement accounts
2. **Long-term mutual funds**: For 5+ year goals (tax-free gains)
3. **Philippine dividend stocks**: Lower tax rate (10%)
4. **High-yield savings**: For short-term needs (20% tax acceptable)
5. **International investments**: Highest tax burden (income tax rates)

**Common Tax Mistakes to Avoid:**
• Not keeping investment records for capital gains calculation
• Choosing bank products over tax-efficient mutual funds for long-term goals
• Not maximizing tax-free 13th month and bonus limits
• Failing to consider tax implications when switching jobs`,
            keyPoints: [
              'Tax-free mutual fund gains (5+ years) vs. 20% tax on bank interest creates huge advantage',
              'Proper timing of bonuses and leave conversions can save thousands annually',
              'Pag-IBIG MP2 offers both high returns and tax deduction benefits',
              'Estate planning prevents large tax burdens on beneficiaries'
            ],
            examples: [
              '₱500,000 mutual fund gain (5+ years): ₱0 tax vs. ₱100,000 tax if in bank',
              '₱100,000 Pag-IBIG MP2 contribution: ₱15,000-30,000 tax savings depending on bracket',
              'Freelancer earning ₱2M: ₱160,000 tax (8% rate) vs. ₱290,000+ (income tax rates)'
            ],
            source: {
              title: 'BSP - Inclusive Finance & Financial Education',
              url: 'https://www.bsp.gov.ph/SitePages/InclusiveFinance/InclusiveFinance.aspx',
              type: 'Government'
            }
          }
        },
        completed: false
      },
      {
        id: 'apply-tax-planning',
        title: 'Apply: Optimize Your Tax Strategy',
        type: 'apply',
        content: {
          apply: {
            scenario: `Robert earns ₱720,000 annually (₱60,000 monthly) as a software developer. He currently puts ₱10,000 monthly in a time deposit earning 2.5% (taxed at 20%). He's planning to invest for retirement (25 years away) and wants to minimize taxes. He can also contribute to Pag-IBIG MP2 and is considering mutual fund investments for long-term growth.`,
            task: 'What tax-efficient investment strategy should Robert implement?',
            options: [
              'Continue time deposits for safety despite the 20% tax on interest',
              'Move everything to tax-free mutual funds but lose liquidity and guaranteed returns',
              'Split strategy: Pag-IBIG MP2 for tax deduction + mutual funds for tax-free long-term growth',
              'Focus on dividend-paying stocks for the lower 10% tax rate'
            ],
            correctAnswer: 'Split strategy: Pag-IBIG MP2 for tax deduction + mutual funds for tax-free long-term growth',
            explanation: `Robert should implement a tax-efficient diversified strategy:

**Recommended Tax-Optimized Allocation (₱10,000 monthly):**

**Pag-IBIG MP2: ₱5,000/month (₱60,000 annually)**
• **Tax benefit**: ₱60,000 × 25% = ₱15,000 annual tax deduction
• **Investment return**: 6-8% annually (historically)
• **Total benefit**: ₱15,000 tax savings + investment growth
• **Liquidity**: 5-year minimum holding period

**Equity Mutual Fund: ₱5,000/month (₱60,000 annually)**
• **Tax benefit**: 0% tax on gains if held 5+ years
• **Expected return**: 8-12% annually (long-term average)
• **Time horizon**: Perfect for 25-year retirement goal
• **Flexibility**: Can access earlier if needed (with tax consequences)

**Comparison with Current Strategy:**
• **Current**: ₱10,000 in time deposits = 2% after-tax returns
• **New strategy**: Tax deduction + higher growth potential
• **25-year projection**: ₱2.1M vs. ₱3.2M+ difference

**Additional optimizations:**
• Maximize 13th month pay (ensure within ₱90,000 tax-free limit)
• Consider employer retirement benefits if available
• Review investment allocation annually for rebalancing

This strategy provides immediate tax benefits, long-term tax-free growth, and diversification across different investment types while maintaining reasonable liquidity.`
          }
        },
        completed: false
      },
      {
        id: 'reflect-tax-awareness',
        title: 'Reflect: Your Tax Strategy Impact',
        type: 'reflect',
        content: {
          reflect: {
            questions: [
              'How much tax do you currently pay annually, and what percentage of your income does this represent?',
              'Which investments or financial products are you using that may not be tax-efficient?',
              'What opportunities do you have to legally reduce your tax burden through planning?',
              'How does understanding taxes change your perspective on different investment options?'
            ],
            prompts: [
              'Calculate your effective tax rate and compare it to others in your income bracket',
              'Review your current investment portfolio for tax efficiency opportunities',
              'Research whether your employer offers any tax-advantaged benefits you\'re not using',
              'Consider the long-term impact of tax-efficient investing on your wealth building'
            ],
            actionItems: [
              'Calculate your exact annual tax burden and identify optimization opportunities',
              'Open a Pag-IBIG MP2 account if you haven\'t already for tax deduction benefits',
              'Research tax-efficient mutual funds for your long-term investment goals',
              'Consult with a tax professional if your situation is complex or high-income'
            ]
          }
        },
        completed: false
      }
    ],
    completed: false,
    progress: 0
  },

  // 8. CAREER & INCOME MODULE
  {
    id: 'career-income-growth',
    title: 'Career & Income Growth',
    description: 'Strategies to increase earning potential and build multiple income streams',
    duration: '30 min',
    lessons: [
      {
        id: 'income-growth-strategies',
        title: 'Building Your Earning Potential in the Philippines',
        type: 'learn',
        content: {
          learn: {
            text: `In the Philippines, growing your income requires strategic career planning, skill development, and creating multiple income streams to combat inflation and build wealth.

**Primary Income Growth Strategies:**

**1. Career Advancement Within Employment**

**Skill Development for Higher Pay:**
• **Tech skills**: Programming, data analysis, digital marketing
• **Language skills**: English proficiency, Mandarin, Japanese, Korean
• **Certifications**: Industry-specific credentials (PMP, CPA, etc.)
• **Soft skills**: Leadership, communication, project management

**Salary Negotiation Tactics:**
• **Research market rates**: Use JobStreet, Glassdoor, salary surveys
• **Document achievements**: Quantify impact on company revenue/efficiency
• **Timing**: Annual reviews, after major accomplishments
• **Alternative benefits**: Flexible work, training budget, health insurance upgrades

**Job Switching Strategy:**
• **Average increase**: 20-40% salary jump when switching companies
• **Timing**: Every 2-3 years for maximum growth
• **Preparation**: Build skills and network before current job becomes unsatisfactory
• **Industries**: Tech, finance, healthcare offer highest growth potential

**2. Side Hustles and Freelancing**

**High-Demand Filipino Skills Globally:**
• **Virtual Assistance**: ₱15,000-50,000 monthly part-time
• **Content Writing**: ₱500-2,000 per article
• **Graphic Design**: ₱1,000-5,000 per project
• **Online Tutoring**: ₱300-800 per hour
• **Social Media Management**: ₱10,000-30,000 monthly per client

**Local Service-Based Businesses:**
• **Food delivery/catering**: Leverage Filipino cooking skills
• **Tutoring**: Math, English, science for students
• **Beauty services**: Makeup, hair, nails (especially events)
• **Repair services**: Electronics, appliances, automotive

**Digital Product Creation:**
• **Online courses**: Share expertise via Udemy, Skillshare
• **E-books**: Write about Filipino topics, how-to guides  
• **Apps/websites**: Solve local Filipino problems
• **YouTube channel**: Monetize through ads and sponsorships

**3. Investment Income Development**

**Dividend-Focused Investing:**
• **Target**: 4-6% annual dividend yield
• **Philippine stocks**: Ayala (AC), BDO, Jollibee dividend history
• **REITs**: Rental income distributions (AREIT, RCR)
• **Timeline**: 5-10 years to build meaningful dividend income

**Rental Property Income:**
• **Condominiums**: ₱15,000-30,000 monthly rental in Metro Manila
• **Boarding houses**: Higher yields in university areas
• **Commercial spaces**: Higher income but requires more capital
• **Considerations**: Property management, maintenance costs, vacancy risks

**Business Ownership:**
• **Franchising**: Established brands (7-Eleven, Jollibee franchises)
• **Service businesses**: Lower capital requirements, higher profit margins
• **Online businesses**: E-commerce, dropshipping, affiliate marketing
• **Partnerships**: Combine skills with others' capital

**Income Growth Timeline Example:**

**Year 1-2: Foundation Building**
• Focus on primary job performance and skill development
• Start one manageable side hustle (2-5 hours weekly)
• Target: 10-20% income increase through raises/promotions

**Year 3-5: Diversification**
• Scale successful side hustle or add second income stream
• Begin dividend-focused investing with surplus income
• Target: 30-50% total income increase from multiple sources

**Year 6-10: Wealth Building**
• Consider business ownership or rental property investment
• Optimize tax efficiency across multiple income streams
• Target: Financial independence where investment income covers basic expenses

**Common Filipino Income Growth Mistakes:**
• Staying too long in low-growth positions due to comfort
• Not investing in skills that command premium wages globally
• Ignoring English communication skills that unlock international opportunities
• Starting too many side hustles without focusing on scalable ones`,
            keyPoints: [
              'Career switching every 2-3 years typically increases income faster than staying loyal',
              'Filipino skills (English, service orientation) are globally marketable online',
              'Multiple income streams protect against job loss and accelerate wealth building',
              'Investment income becomes meaningful after 5-10 years of consistent investing'
            ],
            examples: [
              'Career progression: ₱25,000 → ₱35,000 (job switch) → ₱50,000 (promotion) in 3 years',
              'Side hustle growth: ₱5,000 monthly virtual assistance → ₱25,000 with 3 clients',
              'Dividend income: ₱2M invested at 5% yield = ₱100,000 annual passive income'
            ],
            source: {
              title: 'GCash - Digital Payments Platform',
              url: 'https://www.gcash.com/',
              type: 'Educational'
            }
          }
        },
        completed: false
      },
      {
        id: 'multiple-income-streams',
        title: 'Building Multiple Income Streams: The Filipino Advantage',
        type: 'learn',
        content: {
          learn: {
            text: `Filipinos have unique advantages in building multiple income streams due to English proficiency, service culture, and global digital connectivity.

**The 4 Types of Income (Build All 4):**

**1. EARNED INCOME (Job/Business Active Work)**
• **Characteristics**: Time for money, stops when you stop working
• **Examples**: Salary, freelance work, business operations
• **Goal**: Maximize this to fund other income types
• **Filipino advantage**: English skills, cultural adaptability

**2. PORTFOLIO INCOME (Investment Gains)**
• **Characteristics**: Money from buying/selling investments
• **Examples**: Stock trading profits, mutual fund gains, crypto gains
• **Goal**: Supplement income but not primary strategy
• **Risk**: Requires skill and timing, can lose money

**3. PASSIVE INCOME (Money Works for You)**
• **Characteristics**: Minimal ongoing effort required
• **Examples**: Rental income, dividend payments, royalties
• **Goal**: Eventually replace earned income for financial freedom
• **Timeline**: 10-20 years to build substantial passive income

**4. RESIDUAL INCOME (One-Time Work, Ongoing Pay)**
• **Characteristics**: Work once, earn repeatedly
• **Examples**: Book royalties, online course sales, affiliate marketing
• **Goal**: Create scalable income with no time limits
• **Filipino opportunity**: Content creation, course development

**High-Potential Income Streams for Filipinos:**

**ONLINE SERVICES (Global Market)**

**Virtual Assistance Specialization:**
• **General VA**: ₱15,000-25,000 monthly (20-30 hours)
• **Specialized VA**: ₱30,000-60,000 monthly (real estate, marketing, executive)
• **Agency model**: Hire other VAs, earn ₱5,000-15,000 per employee
• **Growth path**: Client → Employee → Business owner

**Content Creation & Marketing:**
• **Copywriting**: ₱2,000-10,000 per sales page
• **Social media management**: ₱15,000-40,000 monthly per client  
• **Video editing**: ₱1,000-5,000 per video project
• **SEO services**: ₱20,000-50,000 monthly retainers

**PHYSICAL SERVICES (Local Market)**

**Food & Catering Business:**
• **Home-based catering**: ₱10,000-50,000 per event
• **Meal prep service**: ₱200-400 per meal × 100 customers weekly
• **Food cart/stall**: ₱20,000-80,000 monthly profit
• **Specialty products**: Pastries, regional delicacies for local market

**Personal Services:**
• **Beauty services**: ₱2,000-8,000 per event (weddings, parties)
• **Fitness training**: ₱500-1,500 per session
• **Tutoring services**: ₱300-1,000 per hour
• **Pet services**: Grooming, boarding, walking in affluent areas

**DIGITAL PRODUCTS (Scalable)**

**Educational Content:**
• **Online courses**: ₱2,000-15,000 per course × unlimited students
• **E-books**: ₱200-1,000 per book with recurring sales
• **Webinars**: ₱500-5,000 per participant
• **Coaching programs**: ₱10,000-50,000 per client

**Software & Apps:**
• **Mobile apps**: Advertising revenue + in-app purchases
• **Website tools**: Subscription-based software (₱500-5,000 monthly per user)
• **Digital templates**: One-time creation, ongoing sales

**Income Stream Development Strategy:**

**Phase 1: Stabilize Primary Income (Months 1-6)**
• Excel in current job to ensure security
• Develop one skill that can become a side hustle
• Research market demand for chosen side business

**Phase 2: Launch First Side Stream (Months 6-18)**
• Start with service-based income (immediate cash flow)
• Dedicate 5-10 hours weekly consistently  
• Reinvest profits into business growth and skill development

**Phase 3: Scale and Diversify (Months 18-36)**
• Scale successful side business or add complementary stream
• Begin investing profits into passive income assets
• Consider transitioning top side hustle to primary income

**Phase 4: Build Passive Streams (Years 3-10)**
• Invest consistently in dividend-paying assets
• Create digital products for residual income
• Develop rental property or business ownership income

**Target Income Distribution (After 5-7 Years):**
• Primary career: 40-50% of total income
• Side businesses: 30-40% of total income
• Investment income: 10-20% of total income
• Total increase: 80-100% above starting salary`,
            keyPoints: [
              'Filipino English skills and service culture create global income opportunities',
              'Service-based income streams start fastest, digital products scale highest',
              'Multiple income streams provide security and accelerate wealth building',
              'Passive income development requires 5-10 years but creates true financial freedom'
            ],
            examples: [
              'VA business growth: 1 client (₱15k) → 3 clients (₱45k) → agency model (₱80k+)',
              'Food business scale: Home catering → food cart → restaurant franchise',
              'Digital product success: Course creation → ₱500k annual sales with minimal ongoing work'
            ],
            source: {
              title: 'Maya - Digital Banking & Payments',
              url: 'https://www.maya.ph/',
              type: 'Educational'
            }
          }
        },
        completed: false
      },
      {
        id: 'apply-income-strategy',
        title: 'Apply: Design Your Income Growth Plan',
        type: 'apply',
        content: {
          apply: {
            scenario: `Maria is a 27-year-old marketing coordinator earning ₱28,000 monthly. She has strong English writing skills, social media experience, and enjoys cooking. She wants to increase her income by 50% within 2 years. She can dedicate 10 hours weekly to side income activities and has ₱20,000 available to invest in starting a side business.`,
            task: 'What income growth strategy should Maria implement to reach her ₱42,000 monthly target?',
            options: [
              'Focus only on getting promoted at current job through excellent performance',
              'Quit current job to start a full-time catering business',
              'Combine freelance social media management with weekend catering for events',
              'Use ₱20,000 to invest in stocks for dividend income'
            ],
            correctAnswer: 'Combine freelance social media management with weekend catering for events',
            explanation: `Maria should leverage her existing skills while building complementary income streams:

**Month 1-6: Foundation Phase**
**Freelance Social Media Management (5 hours/week)**
• **Target**: 1-2 small business clients at ₱8,000-12,000 monthly each
• **Services**: Content creation, posting, basic analytics
• **Investment**: ₱5,000 for design tools, portfolio website
• **Expected income**: ₱10,000-15,000 monthly

**Weekend Event Catering (5 hours/week)**
• **Target**: 2-4 events monthly (birthdays, small gatherings)
• **Services**: Themed menu packages, delivery included
• **Investment**: ₱15,000 for cooking equipment, initial inventory
• **Expected income**: ₱8,000-15,000 monthly

**Month 7-12: Growth Phase**
**Scale Social Media Business**
• Add 1-2 more clients (₱20,000-25,000 monthly total)
• Offer premium services (paid ads management, strategy consulting)

**Expand Catering Services**
• Partner with event coordinators for referrals
• Develop signature dishes and premium packages
• Target corporate events and larger celebrations

**Month 13-24: Optimization Phase**
• **Total target**: ₱28,000 (job) + ₱20,000 (social media) + ₱10,000 (catering) = ₱58,000
• **Exceeds goal**: 107% increase vs. 50% target
• **Decision point**: Consider transitioning to entrepreneurship or negotiating remote work

**Why this works:**
Both income streams use Maria's existing skills, require minimal startup capital, can be done part-time, and have scalable growth potential that could eventually exceed her day job income.`
          }
        },
        completed: false
      },
      {
        id: 'reflect-career-vision',
        title: 'Reflect: Your Financial Career Vision',
        type: 'reflect',
        content: {
          reflect: {
            questions: [
              'What skills do you have that could be monetized outside your current job?',
              'Which income stream appeals to you most: scaling your career, building a business, or creating passive income?',
              'What would financial independence mean for your family and life choices?',
              'How could you use your cultural knowledge and Filipino connections as competitive advantages?'
            ],
            prompts: [
              'Research the global market demand for skills you already possess',
              'Calculate how different income growth rates would impact your 10-year financial position',
              'Consider what lifestyle changes you\'re willing to make to increase income',
              'Think about how you could help other Filipinos while building your own income streams'
            ],
            actionItems: [
              'Identify and develop one marketable skill that could become a side income within 90 days',
              'Set up profiles on freelancing platforms (Upwork, Freelancer, Fiverr) or local service apps',
              'Network with 5 people in industries or businesses that interest you for income opportunities',
              'Create a 2-year income growth plan with specific monthly targets and milestone reviews'
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
