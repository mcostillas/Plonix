'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles, Send, CheckCircle2, XCircle, Globe, BookOpen, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface ResearchedModule {
  module_id: string
  module_title: string
  module_description: string
  duration: string
  category: 'core' | 'essential' | 'advanced'
  icon: string
  color: string
  test_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'scenario_based' | 'calculation'
  
  // Learn
  learn_title: string
  learn_text: string
  learn_key_points: string
  learn_sources: string
  
  // Apply
  apply_title: string
  apply_scenario: string
  apply_task: string
  apply_options: string
  apply_correct_answer: string
  apply_explanation: string
  
  // Reflect
  reflect_title: string
  reflect_questions: string
  reflect_action_items: string
  
  // Metadata
  key_concepts: string
  key_takeaways: string
  practical_tips: string
  common_mistakes: string
  
  // Sources
  sources: Array<{
    title: string
    url: string
    description: string
  }>
}

export default function AIModuleCreatorPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Module Creator. Tell me what financial topic you'd like to create a module about, and I'll research credible sources and generate a complete learning module for you to review.\n\nFor example: \"Create a module about NFTs for beginners\" or \"I want to teach students about cryptocurrency investing\"",
      timestamp: new Date()
    }
  ])
  const [userInput, setUserInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [researchedModule, setResearchedModule] = useState<ResearchedModule | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return

    const userMessage: Message = {
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsProcessing(true)

    try {
      const response = await fetch('/api/admin/ai-module-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: userInput.trim(),
          conversationHistory: messages
        })
      })

      if (!response.ok) throw new Error('AI research failed')

      const data = await response.json()

      // Add AI response to chat
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])

      // If module data is ready, set it for preview
      if (data.moduleData) {
        setResearchedModule(data.moduleData)
      }
    } catch (error) {
      console.error('AI research error:', error)
      toast.error('Failed to process your request')
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while researching this topic. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePublishModule = async () => {
    if (!researchedModule) return

    setIsPublishing(true)
    try {
      // 1. Create the module
      const moduleResponse = await fetch('/api/admin/learning-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(researchedModule)
      })

      if (!moduleResponse.ok) throw new Error('Failed to create module')

      // 2. Add sources to Resource Hub
      if (researchedModule.sources && researchedModule.sources.length > 0) {
        await Promise.all(
          researchedModule.sources.map(source =>
            fetch('/api/admin/resources', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: source.title,
                url: source.url,
                description: source.description,
                type: 'Article',
                category: 'Learning Resources',
                is_active: true
              })
            })
          )
        )
      }

      toast.success('Module published successfully! Sources added to Resource Hub.')
      router.push('/admin/learning-modules')
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('Failed to publish module')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleRejectModule = () => {
    setResearchedModule(null)
    const rejectMessage: Message = {
      role: 'assistant',
      content: "No problem! Let's try a different topic or I can research this one again with different parameters. What would you like to do?",
      timestamp: new Date()
    }
    setMessages(prev => [...prev, rejectMessage])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/learning-modules">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Modules
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
                  AI Module Creator
                </h1>
                <p className="text-sm text-gray-600">Let AI research and create learning modules for you</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Interface */}
          <Card className="flex flex-col h-[calc(100vh-200px)]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                AI Research Assistant
              </CardTitle>
              <CardDescription>
                Tell me what topic you'd like to create a module about
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600">AI is researching...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your topic or instructions..."
                  disabled={isProcessing}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isProcessing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Module Preview */}
          <Card className="h-[calc(100vh-200px)] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Module Preview
              </CardTitle>
              <CardDescription>
                {researchedModule 
                  ? 'Review the AI-generated module before publishing'
                  : 'Module preview will appear here after AI research'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {researchedModule ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{researchedModule.module_title}</h3>
                    <p className="text-sm text-gray-600">{researchedModule.module_description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>⏱️ {researchedModule.duration}</span>
                      <span>📁 {researchedModule.category}</span>
                      <span>🧪 {researchedModule.test_type.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Learn Section */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📚 Learn Section</h4>
                    <p className="text-sm text-gray-700 mb-2">{researchedModule.learn_text.substring(0, 200)}...</p>
                    <p className="text-xs text-gray-500">Key Points: {researchedModule.learn_key_points.split('\n').length} items</p>
                  </div>

                  {/* Apply Section */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✏️ Apply Section</h4>
                    <p className="text-sm text-gray-700 mb-2">{researchedModule.apply_scenario.substring(0, 150)}...</p>
                    <p className="text-xs text-gray-500">Test Type: {researchedModule.test_type}</p>
                  </div>

                  {/* Reflect Section */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">💭 Reflect Section</h4>
                    <p className="text-xs text-gray-500">
                      {researchedModule.reflect_questions.split('\n').length} reflection questions
                      • {researchedModule.reflect_action_items.split('\n').length} action items
                    </p>
                  </div>

                  {/* Sources */}
                  {researchedModule.sources && researchedModule.sources.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Credible Sources ({researchedModule.sources.length})
                      </h4>
                      <div className="space-y-2">
                        {researchedModule.sources.map((source, idx) => (
                          <div key={idx} className="text-sm bg-gray-50 p-3 rounded">
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {source.title}
                            </a>
                            <p className="text-xs text-gray-600 mt-1">{source.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={handlePublishModule}
                      disabled={isPublishing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve & Publish
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleRejectModule}
                      disabled={isPublishing}
                      variant="outline"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with AI to generate a module</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
