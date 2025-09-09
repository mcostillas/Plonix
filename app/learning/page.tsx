'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { ChevronDown, ChevronUp, ExternalLink, Calculator, PiggyBank, TrendingUp, BookOpen, Users, Target, CheckCircle, ArrowRight, Globe, Shield, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export default function LearningPage() {
  const [expandedCards, setExpandedCards] = useState<string[]>([])

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  const learningTopics = [
    // Financial Literacy introduction card (moved to top)
    {
      id: 'financial-literacy',
      title: 'What is Financial Literacy?',
      icon: BookOpen,
      color: 'indigo',
      description: 'Financial literacy is the ability to understand and effectively use various financial skills, including personal financial management, budgeting, and investing. For Filipino students and young professionals, it means knowing how to manage your allowance, save for goals, and make informed decisions about banks, investments, and financial products available in the Philippines.',
      sources: [
        {
          title: 'Corporate Finance Institute - Financial Literacy',
          url: 'https://corporatefinanceinstitute.com/resources/wealth-management/financial-literacy/',
          type: 'Professional Education'
        },
        {
          title: 'BSP - Financial Education',
          url: 'https://www.bsp.gov.ph/SitePages/Default.aspx',
          type: 'Government'
        },
        {
          title: 'Annuity.org - Financial Literacy Guide',
          url: 'https://www.annuity.org/financial-literacy/',
          type: 'Educational'
        }
      ],
      faqs: [
        {
          question: 'Why is financial literacy important for Filipino youth?',
          answer: 'With limited government safety nets and strong family financial obligations, Filipino youth need financial literacy to break cycles of debt, build emergency funds, and create opportunities for education and business ventures.'
        },
        {
          question: 'What financial skills should I learn first?',
          answer: 'Start with budgeting your allowance/salary, then learn about savings accounts and emergency funds. Once you have a foundation, explore investing in mutual funds and understanding loans/credit.'
        },
        {
          question: 'How does financial literacy help with family obligations?',
          answer: 'Good financial planning helps you support family sustainably while building your own financial security. You can budget for "family support" while still saving for personal goals.'
        },
        {
          question: 'What Filipino financial products should I know about?',
          answer: 'Learn about GCash/PayMaya features, digital banks (CIMB, ING, Tonik), mutual funds from BPI/BDO, COL Financial for stocks, and government programs like SSS and PhilHealth.'
        }
      ]
    },
    
    // Main learning topics
    {
      id: 'budgeting',
      title: 'Budgeting',
      icon: Calculator,
      color: 'blue',
      description: 'Budgeting is creating a plan for your allowance or salary before you spend it. Whether you receive ₱5,000 weekly allowance or ₱20,000 monthly starting salary, budgeting helps you cover school expenses, family contributions, and still save for your future. It\'s about making your money last until the next "baon" or payday while building good financial habits early.',
      sources: [
        {
          title: 'Peso Sense - Budgeting for Students',
          url: 'https://www.youtube.com/@pesosense4306',
          type: 'YouTube'
        },
        {
          title: 'Khan Academy - Planning a Budget',
          url: 'https://www.khanacademy.org/college-careers-more/financial-literacy/xa6995ea67a8e9fdd:budgeting-and-saving/xa6995ea67a8e9fdd:budgeting/a/planning-a-budget-start',
          type: 'Educational'
        },
        {
          title: 'UNFCU 50-30-20 Rule Guide',
          url: 'https://www.unfcu.org/financial-wellness/50-30-20-rule/',
          type: 'Educational'
        }
      ],
      faqs: [
        {
          question: 'How do I budget my weekly allowance of ₱3,000?',
          answer: 'Try 50% for school needs (₱1,500 for food, transport, supplies), 30% for wants (₱900 for movies, coffee with friends), 20% for savings (₱600 weekly = ₱2,400 monthly emergency fund).'
        },
        {
          question: 'What if my parents give me irregular amounts?',
          answer: 'Base your budget on the minimum amount you usually receive. Save any extra money in good weeks to cover shortfalls in lean weeks. Keep a small notebook to track what you actually receive.'
        },
        {
          question: 'Should I ask for more allowance or find ways to earn?',
          answer: 'First, optimize your current budget. Track spending for 2 weeks to see where money goes. Then consider small income sources like tutoring younger students, selling preloved items, or online freelancing.'
        },
        {
          question: 'How do I budget for school supplies and projects?',
          answer: 'Create a separate "School Projects" fund by saving ₱200-500 monthly. This prevents you from borrowing or asking parents for emergency funds when big projects come up.'
        }
      ]
    },
    {
      id: 'saving', 
      title: 'Saving',
      icon: PiggyBank,
      color: 'green',
      description: 'Saving is keeping part of your allowance or salary for emergencies and future goals instead of spending everything. As a student or fresh graduate, saving helps you handle unexpected expenses (broken laptop, medical bills), achieve goals (new phone, graduation celebration), and build financial independence. Even saving ₱100 weekly creates ₱5,200 yearly - that\'s a laptop fund!',
      sources: [
        {
          title: 'Nicole Alba - Student Saving Tips',
          url: 'https://www.youtube.com/results?search_query=nicole+alba',
          type: 'YouTube'
        },
        {
          title: 'BSP - Financial Consumer Protection',
          url: 'https://www.bsp.gov.ph/SitePages/Default.aspx',
          type: 'Government'
        },
        {
          title: 'GCash - Student Savings Features',
          url: 'https://www.gcash.com/',
          type: 'Fintech'
        }
      ],
      faqs: [
        {
          question: 'Where should I save my allowance money?',
          answer: 'For students: GCash GSave (2.6% interest, instant access), or CIMB UpSave (4% interest, ₱100 minimum). Both are perfect for small amounts and you can deposit through 7-Eleven or online banking.'
        },
        {
          question: 'How much should I save from my ₱8,000 monthly allowance?',
          answer: 'Start with ₱800 (10%) if you\'re new to saving. Once comfortable, aim for ₱1,600 (20%). Remember: ₱800 monthly = ₱9,600 yearly emergency fund - enough for laptop repairs or medical emergencies.'
        },
        {
          question: 'I\'m graduating soon, how much should I save?',
          answer: 'Fresh graduates need ₱30,000-50,000 for job hunting (professional clothes, transportation, certificates). Start saving at least ₱3,000 monthly during your final year to build this fund.'
        },
        {
          question: 'Should I save in a bank or digital wallet?',
          answer: 'Digital wallets (GCash, PayMaya) are convenient for students - easy deposits, higher interest than traditional banks. For larger amounts (₱20,000+), consider CIMB or ING Bank for better rates.'
        }
      ]
    },
    {
      id: 'investing',
      title: 'Investing',
      icon: TrendingUp,
      color: 'purple',
      description: 'Investing is using your saved money to buy assets that can grow in value over time, like stocks, mutual funds, or businesses. For young Filipinos, investing helps your money grow faster than inflation and builds wealth for major life goals - house down payment, wedding, or starting a business. The earlier you start, even with just ₱500 monthly, the more time compound growth has to work magic.',
      sources: [
        {
          title: 'COL Financial - Student Investment Guide',
          url: 'https://www.colfinancial.com/ape/Final2/home/HOME_NL_MAIN.asp?p=0',
          type: 'Investment Platform'
        },
        {
          title: 'SEC Philippines - Investor Education',
          url: 'https://www.sec.gov.ph/#gsc.tab=0',
          type: 'Government'
        },
        {
          title: 'Chinkee Tan - Investment Mindset',
          url: 'https://chinkeetan.com/blog/',
          type: 'Financial Education'
        },
        {
          title: 'Corporate Finance Institute',
          url: 'https://corporatefinanceinstitute.com/resources/wealth-management/financial-literacy/',
          type: 'Professional Education'
        }
      ],
      faqs: [
        {
          question: 'Can I start investing with just ₱1,000 as a student?',
          answer: 'Yes! GInvest (via GCash) allows ₱50 minimum investment in mutual funds. BPI and BDO also offer mutual funds starting at ₱1,000. Perfect for students to learn investing basics with small amounts.'
        },
        {
          question: 'What should fresh graduates invest in first?',
          answer: 'After building emergency fund, start with balanced mutual funds (60% stocks, 40% bonds). These offer growth potential with less risk than pure stock funds. Invest ₱2,000-5,000 monthly from your first salary.'
        },
        {
          question: 'Is investing risky for young people?',
          answer: 'At 18-25, you have 40+ years until retirement, so you can handle more risk for higher returns. Start conservative with mutual funds, then gradually learn about individual stocks as your knowledge grows.'
        },
        {
          question: 'Should I invest my graduation money?',
          answer: 'Only invest money you won\'t need for 3+ years. Keep 6 months emergency fund first. If your graduation money exceeds emergency needs, investing 50% in mutual funds while keeping 50% for job hunting is smart.'
        }
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'indigo':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200'
      case 'blue':
        return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'green':
        return 'bg-green-50 text-green-600 border-green-200'
      case 'purple':
        return 'bg-purple-50 text-purple-600 border-purple-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-green-50/30">
      <Navbar currentPage="learning" />

      <div className="container mx-auto px-4 py-12">
        {/* Uniform Header */}
        <PageHeader
          title="Financial Literacy Basics"
          description="Master the three pillars of personal finance designed specifically for Filipino young adults. Learn practical strategies that work with our culture and financial system."
          badge={{
            text: "Interactive Learning",
            icon: BookOpen
          }}
        />

        {/* Simplified Featured Financial Literacy Card */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="border-2 border-primary/20 shadow-lg">
            <div className="absolute -top-3 left-6">
              <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                ⭐ Start Here
              </span>
            </div>
            
            <CardHeader className="text-center pt-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-indigo-100">
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl mb-3">{learningTopics[0].title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {learningTopics[0].description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-6">
              <div className="text-center">
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <span className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">Foundation</span>
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">Philippine Context</span>
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">Youth Focused</span>
                </div>
                <p className="text-indigo-700 font-medium">
                  📚 Ready to start? Choose any topic below!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Path Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Your Learning Path</h2>
            <p className="text-lg text-gray-600">
              Follow our structured approach to build financial knowledge.
            </p>
          </div>

          {/* Three Main Learning Cards */}
          <div className="grid lg:grid-cols-3 gap-6">
            {learningTopics.slice(1).map((topic, index) => {
              const isExpanded = expandedCards.includes(topic.id)
              const IconComponent = topic.icon
              
              return (
                <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${getColorClasses(topic.color)}`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-xl mb-2">{topic.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {topic.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* FAQ Toggle */}
                    <Button
                      variant="outline"
                      className="w-full mb-4"
                      onClick={() => toggleCard(topic.id)}
                    >
                      <span>Questions</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                    </Button>

                    {isExpanded && (
                      <div className="space-y-2 mb-4">
                        {topic.faqs?.slice(0, 2).map((faq, faqIndex) => (
                          <div key={faqIndex} className="border rounded-lg p-3">
                            <h4 className="font-medium text-sm mb-1">{faq.question}</h4>
                            <p className="text-xs text-gray-600">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Learn More Button */}
                    <Link href={`/learning/${topic.id}`}>
                      <Button className="w-full">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Start Learning
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Emergency Fund Topic Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Essential Financial Topics</h2>
            <p className="text-lg text-gray-600">
              Additional financial knowledge every Filipino youth should know.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Emergency Fund */}
            <Card className="border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-orange-100">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg text-orange-800">Emergency Fund</CardTitle>
                <CardDescription className="text-sm text-left">
                  <div className="space-y-2">
                    <div><strong>What:</strong> Money saved for unexpected expenses like medical bills or laptop repairs.</div>
                    <div><strong>Why:</strong> Prevents debt and gives financial peace of mind.</div>
                    <div><strong>Tips:</strong> Start with ₱500, use GCash GSave, aim for 3-6 months expenses.</div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Students: ₱10,000-15,000 target</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Workers: 3-6 months expenses</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Keep in GCash GSave or CIMB</span>
                  </div>
                </div>
                <Link href="/tools/savings-tracker">
                  <Button variant="outline" className="w-full text-orange-600 border-orange-200">
                    Track Emergency Fund
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Credit and Debt */}
            <Card className="border-red-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-red-100">
                  <Target className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-lg text-red-800">Credit & Debt</CardTitle>
                <CardDescription className="text-sm text-left">
                  <div className="space-y-2">
                    <div><strong>What:</strong> Understanding credit cards, loans, and borrowing responsibly.</div>
                    <div><strong>Why:</strong> Avoid debt traps that affect many young Filipinos.</div>
                    <div><strong>Tips:</strong> Pay full balance, understand interest rates, build credit history slowly.</div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Avoid credit card debt cycles</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Understanding loan interest rates</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Building good credit history</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full text-red-600 border-red-200">
                  Learn About Credit
                </Button>
              </CardContent>
            </Card>

            {/* Insurance Basics */}
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-blue-100">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-blue-800">Insurance Basics</CardTitle>
                <CardDescription className="text-sm text-left">
                  <div className="space-y-2">
                    <div><strong>What:</strong> Protection plans that cover health, life, and other risks.</div>
                    <div><strong>Why:</strong> Protects families from financial disasters and unexpected costs.</div>
                    <div><strong>Tips:</strong> Start with PhilHealth, add SSS, consider life insurance for family.</div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>PhilHealth for health coverage</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Life insurance for family protection</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>SSS benefits and contributions</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full text-blue-600 border-blue-200">
                  Explore Insurance
                </Button>
              </CardContent>
            </Card>

            {/* Digital Money */}
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-green-100">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg text-green-800">Digital Money</CardTitle>
                <CardDescription className="text-sm text-left">
                  <div className="space-y-2">
                    <div><strong>What:</strong> Using GCash, PayMaya, and online banking safely.</div>
                    <div><strong>Why:</strong> Essential for modern Filipino financial life and convenience.</div>
                    <div><strong>Tips:</strong> Use strong passwords, enable 2FA, learn all app features.</div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>GCash and PayMaya features</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Online banking security</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Digital payment safety tips</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full text-green-600 border-green-200">
                  Master Digital Money
                </Button>
              </CardContent>
            </Card>

            {/* Goal Setting */}
            <Card className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-purple-100">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg text-purple-800">Financial Goals</CardTitle>
                <CardDescription className="text-sm text-left">
                  <div className="space-y-2">
                    <div><strong>What:</strong> Setting specific targets like buying a laptop or saving for abroad.</div>
                    <div><strong>Why:</strong> Gives direction and motivation for your money decisions.</div>
                    <div><strong>Tips:</strong> Use SMART goals, break into small steps, track progress monthly.</div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>SMART financial goal setting</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Short vs long-term planning</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Tracking progress effectively</span>
                  </div>
                </div>
                <Link href="/goals">
                  <Button variant="outline" className="w-full text-purple-600 border-purple-200">
                    Set Financial Goals
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Money Mindset */}
            <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-yellow-100">
                  <BookOpen className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg text-yellow-800">Money Mindset</CardTitle>
                <CardDescription className="text-sm text-left">
                  <div className="space-y-2">
                    <div><strong>What:</strong> Your beliefs and attitudes about money and wealth.</div>
                    <div><strong>Why:</strong> Healthy mindset leads to better financial decisions and success.</div>
                    <div><strong>Tips:</strong> Challenge limiting beliefs, balance family support with personal goals.</div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Overcoming "walang pera" mindset</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Balancing family and personal goals</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Building confidence with money</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full text-yellow-600 border-yellow-200">
                  Improve Money Mindset
                </Button>
              </CardContent>
            </Card>

            {/* Financial Needs Analysis */}
            <Card className="border-indigo-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-indigo-100">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg text-indigo-800">Financial Needs Analysis</CardTitle>
                <CardDescription className="text-sm text-left">
                  <div className="space-y-2">
                    <div><strong>What:</strong> Evaluating your current financial situation and future needs.</div>
                    <div><strong>Why:</strong> Helps prioritize spending and plan for life goals effectively.</div>
                    <div><strong>Tips:</strong> List all expenses, identify wants vs needs, plan for life stages.</div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Tracking monthly income and expenses</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Distinguishing needs vs wants</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Planning for future life events</span>
                  </div>
                </div>
                <Link href="/tools/budget-calculator">
                  <Button variant="outline" className="w-full text-indigo-600 border-indigo-200">
                    Analyze Your Finances
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Simplified CTA */}
        <Card className="text-center bg-primary text-white">
          <CardContent className="py-12">
            <h3 className="text-3xl font-bold mb-4">Ready to Master Your Finances?</h3>
            <p className="text-xl mb-6 text-blue-100">
              Start with any topic above and begin your journey to financial freedom.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/learning/budgeting">
                <Button variant="secondary" size="lg">Start with Budgeting</Button>
              </Link>
              <Link href="/ai-assistant">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary">
                  Ask AI Assistant
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
