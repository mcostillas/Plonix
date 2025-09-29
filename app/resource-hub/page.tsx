'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { PageHeader } from '@/components/ui/page-header'
import { ExternalLink, Calculator, TrendingUp, FileText, Bookmark, Globe, Youtube, BookOpen, Users, Building2, Shield, MessageCircle, Wrench, Target } from 'lucide-react'
import { resourcesDatabase } from '@/lib/resources-data'

export default function ResourceHubPage() {
const quickTools = [
{ 
name: 'Peso Budget Calculator', 
icon: Calculator, 
description: 'Quick budget calculations',
href: '/tools/budget-calculator'
},
{ 
name: 'Savings Goal Tracker', 
icon: TrendingUp, 
description: 'Track your savings progress',
href: '/tools/savings-tracker'
},
{ 
name: 'Investment Simulator', 
icon: FileText, 
description: 'Practice investing virtually',
href: '/tools/investment-simulator'
},
{ 
name: 'Expense Categorizer', 
icon: Bookmark, 
description: 'Organize your expenses',
href: '/tools/expense-categorizer'
}
]

const getCategoryIcon = (category: string) => {
switch (category) {
case 'Financial Education':
case 'Financial Motivation':
return Youtube
case 'Traditional Banking':
case 'Fintech':
return Building2
case 'Government Regulatory':
return Shield
default:
return Globe
}
}

const getTypeColor = (type: string) => {
switch (type) {
case 'YouTube Channel':
return 'bg-red-100 text-red-800'
case 'Banking Institution':
return 'bg-blue-100 text-blue-800'
case 'Digital Wallet':
case 'Digital Bank':
return 'bg-green-100 text-green-800'
case 'Government Agency':
return 'bg-purple-100 text-purple-800'
case 'Educational Platform':
return 'bg-orange-100 text-orange-800'
default:
return 'bg-gray-100 text-gray-800'
}
}

const openExternalLink = (url: string, linkName: string) => {
window.open(url, '_blank', 'noopener,noreferrer')
}

return (
<div className="bg-gray-50">
  <Navbar currentPage="resources" />

  <div className="container mx-auto px-4 py-8 max-w-7xl">
    {/* Uniform Header */}
    <PageHeader
      title="Resource Hub"
      description="Curated collection of Filipino financial educators, tools, and educational content to support your financial literacy journey."
      badge={{
        text: "Trusted Resources",
        icon: Globe
      }}
    />

    {/* Digital Financial Tools */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Digital Financial Tools</h2>
        <Link href="/digital-tools">
          <Button variant="outline" size="sm">
            View All Tools
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
      
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Complete Suite of Financial Tools</h3>
              <p className="text-gray-600 mb-4">
                Access our growing collection of digital financial tools including budget calculators, savings trackers, and more - all designed specifically for Filipino youth.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">✅ Budget Calculator</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">✅ Savings Tracker</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">🔄 Investment Simulator</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">🔄 Expense Categorizer</span>
              </div>
              <Link href="/digital-tools">
                <Button>
                  Explore Digital Tools
                  <Wrench className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Financial Literacy Learning Sources */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Financial Literacy Learning Sources</h2>
        <Link href="/learning">
          <Button variant="outline" size="sm">
            Go to Learning Page
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Emergency Fund Sources */}
        <Card className="border-orange-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-orange-600" />
              <CardTitle className="text-lg">Emergency Fund Resources</CardTitle>
            </div>
            <CardDescription>Learn what emergency funds are, why they're crucial, and how to build them</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">BSP - Financial Consumer Protection</h4>
                <p className="text-xs text-gray-600 mb-2">Government guidelines on emergency savings</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://www.bsp.gov.ph/SitePages/Default.aspx', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">GCash - Student Savings Features</h4>
                <p className="text-xs text-gray-600 mb-2">Digital wallet savings tools for students</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://www.gcash.com/', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit & Debt Sources */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6 text-red-600" />
              <CardTitle className="text-lg">Credit & Debt Education</CardTitle>
            </div>
            <CardDescription>Understanding credit cards, loans, and debt management strategies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">Philippine Credit Information Corporation</h4>
                <p className="text-xs text-gray-600 mb-2">Your credit score and credit history</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://www.cic.com.ph/', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">BSP - Responsible Credit Use</h4>
                <p className="text-xs text-gray-600 mb-2">Government guidelines on credit cards and loans</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://www.bsp.gov.ph/SitePages/Default.aspx', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Sources */}
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-lg">Insurance Education</CardTitle>
            </div>
            <CardDescription>Health, life, and protection insurance for Filipino families</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">PhilHealth Official</h4>
                <p className="text-xs text-gray-600 mb-2">National health insurance program</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://www.philhealth.gov.ph/', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">SSS Benefits Guide</h4>
                <p className="text-xs text-gray-600 mb-2">Social Security System benefits and contributions</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://www.sss.gov.ph/', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digital Money Sources */}
        <Card className="border-green-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6 text-green-600" />
              <CardTitle className="text-lg">Digital Money & Fintech</CardTitle>
            </div>
            <CardDescription>Mastering digital wallets and online banking security</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">BSP - Digital Payment Safety</h4>
                <p className="text-xs text-gray-600 mb-2">Official guidelines for safe digital transactions</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://www.bsp.gov.ph/SitePages/Default.aspx', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">PayMaya Academy</h4>
                <p className="text-xs text-gray-600 mb-2">Digital financial literacy resources</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://www.paymaya.com/', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goal Setting Sources */}
        <Card className="border-purple-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6 text-purple-600" />
              <CardTitle className="text-lg">Financial Goal Setting</CardTitle>
            </div>
            <CardDescription>SMART goals and financial planning strategies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">Khan Academy - Financial Planning</h4>
                <p className="text-xs text-gray-600 mb-2">Free courses on goal setting and planning</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://www.khanacademy.org/college-careers-more/financial-literacy', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">Corporate Finance Institute</h4>
                <p className="text-xs text-gray-600 mb-2">Professional financial planning resources</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://corporatefinanceinstitute.com/resources/wealth-management/financial-literacy/', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Money Mindset Sources */}
        <Card className="border-yellow-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-yellow-600" />
              <CardTitle className="text-lg">Money Mindset & Psychology</CardTitle>
            </div>
            <CardDescription>Developing healthy financial attitudes and behaviors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">Chinkee Tan - Investment Mindset</h4>
                <p className="text-xs text-gray-600 mb-2">Filipino financial educator and motivational speaker</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://chinkeetan.com/blog/', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1">Peso Sense - Filipino Financial Mindset</h4>
                <p className="text-xs text-gray-600 mb-2">YouTube channel focused on Filipino money psychology</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://www.youtube.com/@pesosense4306', '_blank')}>
                  <ExternalLink className="w-3 h-3 mr-1" />Visit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Filipino Financial Educators */}
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Filipino Financial Educators</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        {resourcesDatabase.filipinoEducators.map((educator, index) => {
          const IconComponent = getCategoryIcon(educator.category)
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <IconComponent className="w-6 h-6 text-red-600" />
                    <div>
                      <CardTitle className="text-lg">{educator.name}</CardTitle>
                      <CardDescription className="mt-1">{educator.description}</CardDescription>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(educator.type)}`}>
                    {educator.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {educator.topics.map((topic, topicIndex) => (
                    <span key={topicIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1" 
                    variant="outline" 
                    size="sm"
                    onClick={() => openExternalLink(educator.url, educator.name)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Channel
                  </Button>
                  {educator.blogUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openExternalLink(educator.blogUrl, `${educator.name} Blog`)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Blog
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>

    {/* Philippine Banks & Financial Institutions */}
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Philippine Banks & Financial Institutions</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        {resourcesDatabase.philippineBanks.map((bank, index) => {
          const IconComponent = getCategoryIcon(bank.category)
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{bank.name}</CardTitle>
                      <CardDescription className="mt-1">{bank.description}</CardDescription>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(bank.type)}`}>
                    {bank.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {bank.services.map((service, serviceIndex) => (
                    <span key={serviceIndex} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {service}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  size="sm"
                  onClick={() => openExternalLink(bank.url, bank.name)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>

    {/* Digital Financial Platforms */}
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Digital Financial Platforms</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        {resourcesDatabase.digitalPlatforms.map((platform, index) => {
          const IconComponent = getCategoryIcon(platform.category)
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <IconComponent className="w-6 h-6 text-green-600" />
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      <CardDescription className="mt-1">{platform.description}</CardDescription>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(platform.type)}`}>
                    {platform.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {platform.services.map((service, serviceIndex) => (
                    <span key={serviceIndex} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                      {service}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  size="sm"
                  onClick={() => openExternalLink(platform.url, platform.name)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Platform
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>

    {/* Government & Regulatory Bodies */}
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Government & Regulatory Bodies</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        {resourcesDatabase.governmentAgencies.map((agency, index) => {
          const IconComponent = getCategoryIcon(agency.category)
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <IconComponent className="w-6 h-6 text-purple-600" />
                    <div>
                      <CardTitle className="text-lg">{agency.name}</CardTitle>
                      <CardDescription className="mt-1">{agency.description}</CardDescription>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(agency.type)}`}>
                    {agency.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {agency.services.map((service, serviceIndex) => (
                    <span key={serviceIndex} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                      {service}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  size="sm"
                  onClick={() => openExternalLink(agency.url, agency.name)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Official Site
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>

    {/* International Resources */}
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6">International Financial Education</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        {resourcesDatabase.internationalResources.map((resource, index) => {
          const IconComponent = getCategoryIcon(resource.category)
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <IconComponent className="w-6 h-6 text-orange-600" />
                    <div>
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                      <CardDescription className="mt-1">{resource.description}</CardDescription>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {resource.topics.map((topic, topicIndex) => (
                    <span key={topicIndex} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  size="sm"
                  onClick={() => openExternalLink(resource.url, resource.name)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Access Resource
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>

    {/* AI Training Data Notice */}
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>AI-Powered Learning</span>
        </CardTitle>
        <CardDescription>
          Our AI assistant is trained using content from these trusted Filipino and international financial resources. 
          All links open in new tabs so you can easily return here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          All resources are regularly updated to ensure our AI provides accurate, culturally relevant, and up-to-date financial guidance for Filipino young adults.
        </p>
        <Link href="/ai-assistant">
          <Button variant="outline" className="mt-4" size="sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Ask AI About These Resources
          </Button>
        </Link>
      </CardContent>
    </Card>
  </div>
</div>
)
}