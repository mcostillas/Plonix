'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function TestAIPage() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const testAI = async () => {
    if (!message.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/simple-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: 'test-user'
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setResponse(data.response)
      } else {
        setResponse(`Error: ${data.error}`)
      }
    } catch (error) {
      setResponse(`Network Error: ${error}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test AI Assistant</h1>
        
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Send a message to AI (Simple OpenAI API)</h2>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              ✅ This test uses OpenAI API directly (no LangChain required)
            </p>
          </div>
          <div className="space-y-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              onKeyPress={(e) => e.key === 'Enter' && testAI()}
            />
            <Button 
              onClick={testAI} 
              disabled={loading || !message.trim()}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </Card>

        {response && (
          <Card className="p-6">
            <h3 className="font-semibold mb-2">AI Response:</h3>
            <div className="whitespace-pre-wrap text-gray-700">
              {response}
            </div>
          </Card>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Test suggestions:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Hello, can you help me with budgeting?</li>
            <li>I earn ₱25,000 monthly, how should I budget?</li>
            <li>What are the best banks in the Philippines?</li>
            <li>How can I start investing?</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
