import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/admin-auth'
import { requireAdmin } from '@/lib/admin-middleware'
import { ChatOpenAI } from '@langchain/openai'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const { title, description, category } = await request.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Initialize OpenAI
    const llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    })

    const prompt = `You are an expert financial education content creator for Filipino students and young professionals. 
Create comprehensive learning module content for a topic about "${title}".

Description: ${description}
Category: ${category}
Target Audience: Filipino students and young professionals aged 18-30

Generate the following sections:

1. LEARN SECTION:
   - Main educational content (300-500 words) explaining the concept clearly with Filipino context
   - 3-5 key points (bullet points)
   
2. APPLY SECTION:
   - A realistic scenario relevant to Filipino youth (100-150 words)
   - A practical task/question
   - 4 multiple choice options (A, B, C, D)
   - Correct answer (letter only: A, B, C, or D)
   - Explanation of the correct answer (50-100 words)
   
3. REFLECT SECTION:
   - 3-4 reflection questions that prompt deeper thinking
   - 3-4 actionable items they can do immediately
   
4. METADATA:
   - 4-6 key concepts (comma-separated)
   - 3-5 key takeaways (one per line)
   - 4-6 practical tips (one per line)
   - 3-5 common mistakes to avoid (one per line)

IMPORTANT: 
- Use Philippine Peso (₱) for currency examples
- Reference Filipino financial institutions (BDO, BPI, GCash, etc.) when relevant
- Use relatable Filipino scenarios (jeepney fare, load, etc.)
- Keep language simple and engaging
- Be practical and action-oriented

Format your response as a valid JSON object with these exact keys:
{
  "learn_text": "...",
  "learn_key_points": "...",
  "apply_scenario": "...",
  "apply_task": "...",
  "apply_options": "A. ...\\nB. ...\\nC. ...\\nD. ...",
  "apply_correct_answer": "A",
  "apply_explanation": "...",
  "reflect_questions": "...",
  "reflect_action_items": "...",
  "key_concepts": "concept1, concept2, concept3",
  "key_takeaways": "takeaway1\\ntakeaway2\\ntakeaway3",
  "practical_tips": "tip1\\ntip2\\ntip3",
  "common_mistakes": "mistake1\\nmistake2\\nmistake3"
}`

    const response = await llm.invoke(prompt)
    const content = response.content.toString()

    // Try to extract JSON from the response
    let generatedContent
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0])
      } else {
        generatedContent = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(generatedContent)
  } catch (error: any) {
    console.error('AI module generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate module content' },
      { status: 500 }
    )
  }
}
