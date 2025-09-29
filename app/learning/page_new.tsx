'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { ChevronDown, ChevronUp, ExternalLink, Calculator, PiggyBank, TrendingUp, BookOpen, Users, Target, CheckCircle, ArrowRight, Globe, Shield, BarChart3, Lightbulb } from 'lucide-react'
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
      description: 'Master the 50-30-20 rule and create budgets that work with Filipino lifestyle and income levels.',
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
      description: 'Discover where to save money for maximum growth with digital banks and high-interest accounts.',
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
      description: 'Start building wealth with beginner-friendly Philippine investments like mutual funds and stocks.',
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
          description="Master the essential pillars of personal finance designed specifically for Filipino young adults. Learn practical strategies that work with our culture and financial system."
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

        {/* Core Financial Modules Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Core Financial Modules</h2>
            <p className="text-lg text-gray-600">
              Master the fundamentals through our interactive LAR (Learning, Application, Reflection) system.
            </p>
          </div>

          {/* Uniform Grid of Core Learning Modules */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {learningTopics.slice(1).map((topic, index) => {
              const IconComponent = topic.icon
              
              return (
                <Card key={topic.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader className="text-center flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${getColorClasses(topic.color)}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg mb-2">{topic.title}</CardTitle>
                    <CardDescription className="text-sm min-h-[60px] flex items-center">
                      {topic.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow flex flex-col justify-between">
                    {/* Module Features */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs">
                        <BookOpen className="w-3 h-3 text-blue-500 mr-2" />
                        <span><strong>Learn:</strong> Core concepts & strategies</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <Target className="w-3 h-3 text-green-500 mr-2" />
                        <span><strong>Apply:</strong> Real scenarios & decisions</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <Lightbulb className="w-3 h-3 text-purple-500 mr-2" />
                        <span><strong>Reflect:</strong> Personal action plans</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg mb-4 ${getColorClasses(topic.color).replace('border-', 'bg-').replace('text-', 'text-opacity-80 text-')}`}>
                      <div className="text-xs space-y-1">
                        {topic.id === 'budgeting' && (
                          <>
                            <div>💰 50-30-20 Rule Mastery</div>
                            <div>📊 Real allowance examples</div>
                            <div>🎯 Personal budget creation</div>
                          </>
                        )}
                        {topic.id === 'saving' && (
                          <>
                            <div>🏦 Digital banks comparison</div>
                            <div>📈 Interest rate optimization</div>
                            <div>💡 Smart saving strategies</div>
                          </>
                        )}
                        {topic.id === 'investing' && (
                          <>
                            <div>📈 Beginner-friendly options</div>
                            <div>🎯 Risk vs reward analysis</div>
                            <div>💼 Portfolio building basics</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Start Module Button */}
                    <Link href={`/learning/${topic.id}`}>
                      <Button className="w-full">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Start Module
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Essential Financial Modules */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Essential Financial Modules</h2>
            <p className="text-lg text-gray-600">
              Master crucial financial skills through our Interactive LAR (Learning, Application, Reflection) system.
            </p>
          </div>

          {/* Uniform Grid of Essential Modules */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Emergency Fund Module */}
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="text-center flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-orange-50 text-orange-600 border-orange-200">
                  <Shield className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mb-2">Emergency Fund</CardTitle>
                <CardDescription className="text-sm min-h-[60px] flex items-center">
                  Build your financial safety net with emergency funds designed for Filipino youth. Learn where to save and how much you need.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs">
                    <BookOpen className="w-3 h-3 text-blue-500 mr-2" />
                    <span><strong>Learn:</strong> Emergency fund basics</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Target className="w-3 h-3 text-green-500 mr-2" />
                    <span><strong>Apply:</strong> Calculate your ideal fund</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Lightbulb className="w-3 h-3 text-purple-500 mr-2" />
                    <span><strong>Reflect:</strong> Create action plan</span>
                  </div>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-orange-700 space-y-1">
                    <div>📊 Students: ₱10,000-15,000 target</div>
                    <div>💼 Workers: 3-6 months expenses</div>
                    <div>🏦 Best places: GCash GSave, CIMB</div>
                  </div>
                </div>

                <Link href="/learning/emergency-fund">
                  <Button className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Module
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Credit and Debt Module */}
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="text-center flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-red-50 text-red-600 border-red-200">
                  <Target className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mb-2">Credit & Debt</CardTitle>
                <CardDescription className="text-sm min-h-[60px] flex items-center">
                  Master credit cards, loans, and debt management to avoid the traps many young Filipinos fall into.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs">
                    <BookOpen className="w-3 h-3 text-blue-500 mr-2" />
                    <span><strong>Learn:</strong> Credit basics & dangers</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Target className="w-3 h-3 text-green-500 mr-2" />
                    <span><strong>Apply:</strong> Analyze debt scenarios</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Lightbulb className="w-3 h-3 text-purple-500 mr-2" />
                    <span><strong>Reflect:</strong> Build credit strategy</span>
                  </div>
                </div>

                <div className="bg-red-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-red-700 space-y-1">
                    <div>💳 Credit card best practices</div>
                    <div>📊 Understanding interest rates</div>
                    <div>🎯 Building credit history safely</div>
                  </div>
                </div>

                <Link href="/learning/credit-debt">
                  <Button className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Module
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Digital Money Module */}
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="text-center flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-green-50 text-green-600 border-green-200">
                  <Globe className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mb-2">Digital Money</CardTitle>
                <CardDescription className="text-sm min-h-[60px] flex items-center">
                  Navigate GCash, PayMaya, and online banking like a pro while staying secure and maximizing features.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs">
                    <BookOpen className="w-3 h-3 text-blue-500 mr-2" />
                    <span><strong>Learn:</strong> Digital wallet security</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Target className="w-3 h-3 text-green-500 mr-2" />
                    <span><strong>Apply:</strong> Set up secure accounts</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Lightbulb className="w-3 h-3 text-purple-500 mr-2" />
                    <span><strong>Reflect:</strong> Optimize digital setup</span>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-green-700 space-y-1">
                    <div>📱 GCash & PayMaya mastery</div>
                    <div>🔒 Online banking security</div>
                    <div>💡 Hidden features & tips</div>
                  </div>
                </div>

                <Link href="/learning/digital-money">
                  <Button className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Module
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Insurance Basics Module */}
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="text-center flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-blue-50 text-blue-600 border-blue-200">
                  <Shield className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mb-2">Insurance Basics</CardTitle>
                <CardDescription className="text-sm min-h-[60px] flex items-center">
                  Protection strategies for Filipino families - PhilHealth, SSS, and life insurance essentials.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs">
                    <BookOpen className="w-3 h-3 text-blue-500 mr-2" />
                    <span><strong>Learn:</strong> Insurance types & benefits</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Target className="w-3 h-3 text-green-500 mr-2" />
                    <span><strong>Apply:</strong> Choose right coverage</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Lightbulb className="w-3 h-3 text-purple-500 mr-2" />
                    <span><strong>Reflect:</strong> Plan your protection</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>🏥 PhilHealth coverage</div>
                    <div>💼 SSS benefits</div>
                    <div>👨‍👩‍👧‍👦 Life insurance protection</div>
                  </div>
                </div>

                <Link href="/learning/insurance">
                  <Button className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Module
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Financial Goals Module */}
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="text-center flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-purple-50 text-purple-600 border-purple-200">
                  <Target className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mb-2">Financial Goals</CardTitle>
                <CardDescription className="text-sm min-h-[60px] flex items-center">
                  SMART goal setting for laptops, travel, and major life purchases with actionable plans.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs">
                    <BookOpen className="w-3 h-3 text-blue-500 mr-2" />
                    <span><strong>Learn:</strong> SMART goal framework</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Target className="w-3 h-3 text-green-500 mr-2" />
                    <span><strong>Apply:</strong> Create goal timeline</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Lightbulb className="w-3 h-3 text-purple-500 mr-2" />
                    <span><strong>Reflect:</strong> Track progress plan</span>
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-purple-700 space-y-1">
                    <div>🎯 SMART Goals method</div>
                    <div>📊 Progress tracking</div>
                    <div>⏰ Timeline planning</div>
                  </div>
                </div>

                <Link href="/learning/financial-goals">
                  <Button className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Module
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Money Mindset Module */}
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="text-center flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-yellow-50 text-yellow-600 border-yellow-200">
                  <BookOpen className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mb-2">Money Mindset</CardTitle>
                <CardDescription className="text-sm min-h-[60px] flex items-center">
                  Transform limiting beliefs and build healthy financial confidence for lasting success.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs">
                    <BookOpen className="w-3 h-3 text-blue-500 mr-2" />
                    <span><strong>Learn:</strong> Identify limiting beliefs</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Target className="w-3 h-3 text-green-500 mr-2" />
                    <span><strong>Apply:</strong> Reframe money stories</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Lightbulb className="w-3 h-3 text-purple-500 mr-2" />
                    <span><strong>Reflect:</strong> Build new habits</span>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-yellow-700 space-y-1">
                    <div>🧠 Belief transformation</div>
                    <div>💪 Confidence building</div>
                    <div>⚖️ Family vs personal balance</div>
                  </div>
                </div>

                <Link href="/learning/money-mindset">
                  <Button className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Module
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Financial Analysis Module */}
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="text-center flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-indigo-50 text-indigo-600 border-indigo-200">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mb-2">Financial Analysis</CardTitle>
                <CardDescription className="text-sm min-h-[60px] flex items-center">
                  Evaluate your financial situation and plan for different life stages with data-driven insights.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs">
                    <BookOpen className="w-3 h-3 text-blue-500 mr-2" />
                    <span><strong>Learn:</strong> Financial health metrics</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Target className="w-3 h-3 text-green-500 mr-2" />
                    <span><strong>Apply:</strong> Analyze your situation</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Lightbulb className="w-3 h-3 text-purple-500 mr-2" />
                    <span><strong>Reflect:</strong> Create improvement plan</span>
                  </div>
                </div>

                <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-indigo-700 space-y-1">
                    <div>📊 Income vs expenses</div>
                    <div>🎯 Needs vs wants analysis</div>
                    <div>📈 Future planning metrics</div>
                  </div>
                </div>

                <Link href="/learning/financial-analysis">
                  <Button className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Module
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Placeholder for 9th module to complete 3x3 grid */}
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col border-dashed border-2 border-gray-300">
              <CardHeader className="text-center flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-gray-50 text-gray-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mb-2 text-gray-500">Coming Soon</CardTitle>
                <CardDescription className="text-sm min-h-[60px] flex items-center text-gray-400">
                  More essential financial modules are being developed to complete your learning journey.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-400">
                    <BookOpen className="w-3 h-3 mr-2" />
                    <span>Advanced financial topics</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <Target className="w-3 h-3 mr-2" />
                    <span>Interactive scenarios</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <Lightbulb className="w-3 h-3 mr-2" />
                    <span>Personalized insights</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>🔄 In development</div>
                    <div>📅 Coming Q4 2025</div>
                    <div>💡 Suggest topics!</div>
                  </div>
                </div>

                <Button variant="outline" disabled className="w-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Coming Soon
                </Button>
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
