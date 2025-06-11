'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { ArrowLeft, ArrowRight, BookOpen, Target, Lightbulb, ExternalLink, Calculator, PiggyBank, TrendingUp } from 'lucide-react'

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
                    {currentStepData.content.keyPoints.map((point, index) => (
                      <li key={index} className="text-blue-700 text-sm flex items-start space-x-2">
                        <span className="text-blue-500 mt-1 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Sources:</h4>
                  {currentStepData.content.sources.map((source, index) => (
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
                    {currentStepData.content.options.map((option, index) => (
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
                    {currentStepData.content.questions.map((question, index) => (
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
                    {currentStepData.content.actionItems.map((item, index) => (
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
