'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Home,
  Save,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Image as ImageIcon
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface LandingPageContent {
  hero: {
    title: string
    subtitle: string
    cta_text: string
    cta_link: string
  }
  features: Array<{
    title: string
    description: string
    icon: string
  }>
  testimonials: Array<{
    name: string
    role: string
    content: string
    avatar?: string
  }>
  stats: Array<{
    label: string
    value: string
  }>
}

export default function LandingPageManagementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [content, setContent] = useState<LandingPageContent>({
    hero: {
      title: 'Master Your Money with AI-Powered Guidance',
      subtitle: 'Plounix helps Filipino students and young professionals budget, save, and invest smarter with personalized AI financial coaching.',
      cta_text: 'Get Started Free',
      cta_link: '/auth/signup'
    },
    features: [
      {
        title: 'AI Financial Assistant',
        description: 'Get instant answers to your money questions from Fili, your personal AI financial coach.',
        icon: 'Brain'
      },
      {
        title: 'Smart Budgeting',
        description: 'Track expenses and create budgets that work with the 50-30-20 rule designed for Filipino income levels.',
        icon: 'Calculator'
      },
      {
        title: 'Goal Tracking',
        description: 'Set and achieve financial goals - from emergency funds to dream vacations.',
        icon: 'Target'
      },
      {
        title: 'Money Challenges',
        description: 'Join fun saving challenges and build better financial habits with gamification.',
        icon: 'Trophy'
      }
    ],
    testimonials: [
      {
        name: 'Maria Santos',
        role: 'College Student',
        content: 'Plounix helped me save ₱15,000 in just 3 months! The AI assistant makes budgeting so easy.'
      },
      {
        name: 'Juan dela Cruz',
        role: 'Young Professional',
        content: 'Finally understanding where my money goes. The insights are game-changing!'
      }
    ],
    stats: [
      { label: 'Active Users', value: '10,000+' },
      { label: 'Money Saved', value: '₱50M+' },
      { label: 'Goals Achieved', value: '25,000+' },
      { label: 'User Rating', value: '4.9/5' }
    ]
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/admin/session')
      const data = await response.json()

      if (!data.authenticated) {
        router.push('/auth/login')
        return
      }

      await loadContent()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login')
    }
  }

  async function loadContent() {
    try {
      const response = await fetch('/api/admin/landing-page')
      if (response.ok) {
        const data = await response.json()
        if (data.content) {
          setContent(data.content)
        }
      }
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function saveContent() {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!response.ok) throw new Error('Failed to save')

      toast.success('Landing page updated successfully!')
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  function addFeature() {
    setContent({
      ...content,
      features: [
        ...content.features,
        { title: '', description: '', icon: 'Star' }
      ]
    })
  }

  function removeFeature(index: number) {
    setContent({
      ...content,
      features: content.features.filter((_, i) => i !== index)
    })
  }

  function updateFeature(index: number, field: string, value: string) {
    const newFeatures = [...content.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    setContent({ ...content, features: newFeatures })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="xl" color="primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <Home className="w-6 h-6 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Landing Page Management</h1>
                  <p className="text-xs text-gray-500">Edit homepage content</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/" target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </Link>
              <Button 
                onClick={saveContent} 
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <><Spinner size="sm" className="mr-2" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Main headline and call-to-action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">Main Title</Label>
                  <Input
                    id="hero-title"
                    value={content.hero.title}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, title: e.target.value }
                    })}
                    placeholder="Enter main headline"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-subtitle">Subtitle</Label>
                  <Textarea
                    id="hero-subtitle"
                    value={content.hero.subtitle}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, subtitle: e.target.value }
                    })}
                    placeholder="Enter subtitle description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cta-text">CTA Button Text</Label>
                    <Input
                      id="cta-text"
                      value={content.hero.cta_text}
                      onChange={(e) => setContent({
                        ...content,
                        hero: { ...content.hero, cta_text: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta-link">CTA Button Link</Label>
                    <Input
                      id="cta-link"
                      value={content.hero.cta_link}
                      onChange={(e) => setContent({
                        ...content,
                        hero: { ...content.hero, cta_link: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Features</CardTitle>
                  <CardDescription>Highlight key platform features</CardDescription>
                </div>
                <Button onClick={addFeature} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.features.map((feature, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold">Feature {index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Icon (Lucide icon name)</Label>
                        <Input
                          value={feature.icon}
                          onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                          placeholder="e.g., Brain, Calculator, Target"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials */}
          <TabsContent value="testimonials">
            <Card>
              <CardHeader>
                <CardTitle>Testimonials</CardTitle>
                <CardDescription>Coming soon - testimonials management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Testimonial editing will be available in the next update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Platform statistics shown on landing page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.stats.map((stat, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...content.stats]
                          newStats[index] = { ...newStats[index], label: e.target.value }
                          setContent({ ...content, stats: newStats })
                        }}
                      />
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...content.stats]
                          newStats[index] = { ...newStats[index], value: e.target.value }
                          setContent({ ...content, stats: newStats })
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
