import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { question, answer } = await request.json()

    if (!question || !answer) {
      return NextResponse.json({ 
        isValid: false, 
        error: 'Question and answer are required' 
      }, { status: 400 })
    }

    // Basic validation first
    const trimmed = answer.trim()
    const words = trimmed.split(/\s+/).filter((word: string) => word.length > 0)

    if (words.length < 10) {
      return NextResponse.json({ 
        isValid: false, 
        reason: 'Response too short (minimum 10 words)' 
      })
    }

    // Check for obvious gibberish patterns
    const hasRepeatedChars = /(.)\1{9,}/.test(trimmed)
    const uniqueWords = new Set(words.map((w: string) => w.toLowerCase()))
    
    if (hasRepeatedChars || uniqueWords.size < words.length * 0.4) {
      return NextResponse.json({ 
        isValid: false, 
        reason: 'Response appears to be gibberish or too repetitive' 
      })
    }

    // Use OpenAI for semantic validation
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ No OpenAI API key - using basic validation only')
      return NextResponse.json({ 
        isValid: true,
        tutorHelp: null,
        encouragement: 'Keep reflecting on what you learned!'
      })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a friendly learning tutor helping students with their reflections.

If the response is thoughtful and relevant:
- Start with "VALID:" followed by brief encouragement

If the response needs improvement (vague, "I don't know", too short, gibberish):
- Start with "HELP:" followed by a helpful hint/question to guide them
- Be encouraging and specific
- Ask probing questions or give examples
- Keep it under 40 words

Examples:
VALID: Great insight! You're thinking critically about this.
HELP: Try thinking about a specific time this happened. What did you feel? What could you do differently?
HELP: I see you're unsure. Let's break it down - what's one small thing you noticed about your spending this week?`
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nStudent's Answer: ${answer}\n\nEvaluate and guide:`
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    })

    const aiResponse = completion.choices[0]?.message?.content?.trim() || ''
    const isValid = aiResponse.toUpperCase().startsWith('VALID')
    const isHelp = aiResponse.toUpperCase().startsWith('HELP')
    
    // Extract the message (remove VALID: or HELP: prefix)
    const message = aiResponse.replace(/^(VALID|HELP):\s*/i, '').trim()

    console.log('🤖 AI Reflection Validation:', {
      question: question.substring(0, 50) + '...',
      answer: answer.substring(0, 50) + '...',
      aiResponse,
      isValid,
      isHelp
    })

    return NextResponse.json({ 
      isValid,
      tutorHelp: isHelp ? message : null,
      encouragement: isValid ? message : null
    })

  } catch (error) {
    console.error('❌ Validation API Error:', error)
    
    // Fallback to accepting on error (don't block students)
    return NextResponse.json({ 
      isValid: true,
      tutorHelp: null,
      encouragement: 'Great effort! Keep thinking about what you learned.',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
