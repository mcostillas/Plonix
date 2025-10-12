'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { PageHeader } from '@/components/ui/page-header'
import { AuthGuard } from '@/components/AuthGuard'
import { 
  Calculator, 
  TrendingUp, 
  PieChart, 
  Target, 
  FileText,
  ArrowRight,
  Wrench
} from 'lucide-react'

const digitalTools = [
  // Available Tools (Currently Implemented)
  {
    id: 'budget-calculator',
    name: 'Peso Budget Calculator',
    icon: Calculator,
    description: 'Calculate your 50-30-20 budget breakdown with Philippine Peso amounts',
    category: 'Budgeting',
    href: '/tools/budget-calculator',
    status: 'available',
    features: ['50-30-20 Rule', 'Peso Currency', 'Annual Projections']
  },
  {
    id: 'savings-tracker',
    name: 'Savings Goal Tracker',
    icon: Target,
    description: 'Monitor your savings goals progress and timeline',
    category: 'Savings',
    href: '/tools/savings-tracker',
    status: 'available',
    features: ['Progress Tracking', 'Timeline Calculator', 'Visual Progress']
  },
  
  // Originally Planned Tools (Coming Soon)
  {
    id: 'investment-simulator',
    name: 'Investment Simulator',
    icon: TrendingUp,
    description: 'Practice investing virtually with simulated market data',
    category: 'Investments',
    href: '/tools/investment-simulator',
    status: 'coming-soon',
    features: ['Virtual Portfolio', 'Risk-free Practice', 'Market Simulation']
  },
  {
    id: 'expense-categorizer',
    name: 'Expense Categorizer',
    icon: PieChart,
    description: 'Organize your expenses into categories automatically',
    category: 'Expenses',
    href: '/tools/expense-categorizer',
    status: 'coming-soon',
    features: ['Auto-categorization', 'Custom Categories', 'Spending Analysis']
  }
]

const categories = [
  { id: 'all', name: 'All Tools', count: digitalTools.length },
  { id: 'Budgeting', name: 'Budgeting', count: digitalTools.filter(t => t.category === 'Budgeting').length },
  { id: 'Savings', name: 'Savings', count: digitalTools.filter(t => t.category === 'Savings').length },
  { id: 'Investments', name: 'Investments', count: digitalTools.filter(t => t.category === 'Investments').length },
  { id: 'Expenses', name: 'Expenses', count: digitalTools.filter(t => t.category === 'Expenses').length },
]

export default function DigitalToolsPage() {
  return (
    <AuthGuard>
      <DigitalToolsContent />
    </AuthGuard>
  )
}

function DigitalToolsContent() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredTools = selectedCategory === 'all' 
    ? digitalTools 
    : digitalTools.filter(tool => tool.category === selectedCategory)

  const availableTools = filteredTools.filter(tool => tool.status === 'available')
  const comingSoonTools = filteredTools.filter(tool => tool.status === 'coming-soon')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="tools" />
      
      <PageHeader 
        title="Digital Financial Tools"
        description="Comprehensive suite of financial tools designed for Filipino youth"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{availableTools.length}</p>
              <p className="text-sm text-gray-600">Available Now</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{comingSoonTools.length}</p>
              <p className="text-sm text-gray-600">Coming Soon</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{categories.length - 1}</p>
              <p className="text-sm text-gray-600">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">100%</p>
              <p className="text-sm text-gray-600">Free to Use</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-sm"
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Available Tools Section */}
        {availableTools.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h2 className="text-2xl font-bold">Available Now</h2>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Ready to Use
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTools.map(tool => {
                const IconComponent = tool.icon
                return (
                  <Card key={tool.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <IconComponent className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg">{tool.name}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tool.category}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{tool.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Features:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {tool.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Link href={tool.href}>
                        <Button className="w-full">
                          Use Tool
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Coming Soon Tools Section */}
        {comingSoonTools.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h2 className="text-2xl font-bold">Coming Soon</h2>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                In Development
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonTools.map(tool => {
                const IconComponent = tool.icon
                return (
                  <Card key={tool.id} className="opacity-75 border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg">{tool.name}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tool.category}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{tool.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Planned Features:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {tool.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button disabled className="w-full">
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Need Help Choosing a Tool?</h3>
              <p className="text-gray-600 mb-6">
                Our AI assistant can recommend the best tools for your financial goals
              </p>
              <Link href="/ai-assistant">
                <Button size="lg">
                  Ask Plounix AI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
