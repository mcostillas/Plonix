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
        reason: 'Basic validation passed (AI validation unavailable)'
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
          content: `You are a strict learning validator. Evaluate if the student's reflection is meaningful and relevant.

REJECT responses that:
- Say "I don't know" or show no effort
- Are vague or generic with no specific insights
- Don't answer the question asked
- Are gibberish, spam, or copy-pasted text
- Show no genuine thought or learning

ACCEPT responses that:
- Directly address the question
- Show personal insight or understanding
- Demonstrate learning or reflection
- Are specific and thoughtful

Respond with ONLY one word: "VALID" or "INVALID"`
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nStudent's Answer: ${answer}\n\nEvaluate this reflection:`
        }
      ],
      temperature: 0.3,
      max_tokens: 10
    })

    const aiResponse = completion.choices[0]?.message?.content?.trim().toLowerCase() || ''
    const isValid = aiResponse.startsWith('valid')

    console.log('🤖 AI Reflection Validation:', {
      question: question.substring(0, 50) + '...',
      answer: answer.substring(0, 50) + '...',
      aiResponse,
      isValid
    })

    return NextResponse.json({ 
      isValid,
      reason: isValid ? 'Thoughtful and relevant response' : 'Response needs more depth or relevance'
    })

  } catch (error) {
    console.error('❌ Validation API Error:', error)
    
    // Fallback to accepting on error (don't block students)
    return NextResponse.json({ 
      isValid: true,
      reason: 'Validation service unavailable - defaulting to accept',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
