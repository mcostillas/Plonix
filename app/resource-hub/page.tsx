'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { PageHeader } from '@/components/ui/page-header'
import { ExternalLink, Calculator, TrendingUp, FileText, Bookmark, Globe, Youtube, BookOpen, Users, Building2, Shield, MessageCircle } from 'lucide-react'
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
<div className="min-h-screen bg-gray-50">
  <Navbar currentPage="resources" />

  <div className="container mx-auto px-4 py-8">
    {/* Uniform Header */}
    <PageHeader
      title="Resource Hub"
      description="Curated collection of Filipino financial educators, tools, and educational content to support your financial literacy journey."
      badge={{
        text: "Trusted Resources",
        icon: Globe
      }}
    />

    {/* Quick Tools */}
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Quick Tools</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickTools.map((tool, index) => (
          <Link key={index} href={tool.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <tool.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-sm">{tool.name}</CardTitle>
                <CardDescription className="text-xs">{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
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