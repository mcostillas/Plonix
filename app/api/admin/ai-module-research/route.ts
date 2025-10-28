import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-middleware'
import { ChatOpenAI } from '@langchain/openai'
import { tavily } from '@tavily/core'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for research

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 403 }
      )
    }

    const { topic, conversationHistory } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    // Initialize OpenAI
    const llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Step 1: Use Tavily to search for credible sources
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY })

    let searchResults
    let sources: Array<{ title: string; url: string; description: string }> = []

    try {
      // Search for credible educational content
      const searchQuery = `${topic} financial education beginner guide credible source`
      const response = await tvly.search(searchQuery, { 
        maxResults: 5,
        searchDepth: 'advanced'
      })
      
      searchResults = response.results
      
      // Parse search results
      if (Array.isArray(searchResults)) {
        sources = searchResults.map((result: any) => ({
          title: result.title || 'Educational Resource',
          url: result.url || '',
          description: result.content?.substring(0, 200) || 'Credible source for learning'
        }))
      }
    } catch (searchError) {
      console.error('Search error:', searchError)
      // Continue without web search if it fails
    }

    // Step 2: Determine if we should generate module or continue conversation
    const shouldGenerateModule = topic.toLowerCase().includes('create') || 
                                  topic.toLowerCase().includes('module') ||
                                  topic.toLowerCase().includes('teach') ||
                                  conversationHistory.length > 2

    if (!shouldGenerateModule) {
      // Continue conversation to clarify requirements
      const clarificationPrompt = `The user wants to create a learning module about: "${topic}"

Sources found: ${sources.length} credible sources

Ask the user ONE clarifying question to better understand what they want:
- What level? (beginner, intermediate, advanced)
- What specific aspect? (basics, practical application, risks, etc.)
- Target audience confirmation? (students, young professionals, both)

Keep it conversational and friendly. Don't ask multiple questions at once.`

      const response = await llm.invoke(clarificationPrompt)
      
      return NextResponse.json({
        message: response.content.toString(),
        moduleData: null
      })
    }

    // Step 3: Generate complete module with researched content
    const researchContext = sources.length > 0 
      ? `\n\nCREDIBLE SOURCES FOUND:\n${sources.map((s, i) => `${i + 1}. ${s.title}\n   URL: ${s.url}\n   Summary: ${s.description}`).join('\n\n')}\n\nUse these sources as reference but write in your own words for Filipino students.`
      : ''

    const modulePrompt = `You are an expert financial education content creator for Filipino students and young professionals.

USER REQUEST: "${topic}"

${researchContext}

Create a COMPLETE learning module with ALL fields filled out. This is for students aged 18-30 in the Philippines.

Generate comprehensive content for:

1. MODULE BASICS:
   - Unique module_id (lowercase, hyphenated, e.g., "nft-basics")
   - Compelling module_title (engaging and clear)
   - Brief module_description (1-2 sentences, value proposition)
   - Realistic duration (e.g., "20 min", "15 min")
   - Appropriate category: "core" for essential topics, "essential" for important ones, "advanced" for complex ones
   - Relevant icon name from lucide-react (e.g., "Coins", "TrendingUp", "Shield", "Wallet")
   - Color scheme (blue, green, purple, orange, red)

2. LEARN SECTION (Educational Content):
   - learn_title: Stage title (e.g., "Learn: Understanding NFTs")
   - learn_text: 400-600 words explaining the concept clearly with Filipino context, real examples, and analogies
   - learn_key_points: 4-6 bullet points (separated by newlines)
   - learn_sources: Brief mention of where info comes from

3. APPLY SECTION (Interactive Quiz):
   - apply_title: Stage title (e.g., "Apply: NFT Decision Making")
   - test_type: Choose ONE: "multiple_choice", "true_false", "fill_blank", "scenario_based", or "calculation"
   - apply_scenario: Realistic Filipino scenario (100-200 words with ₱ amounts, local context)
   - apply_task: Clear question or task
   - apply_options: 4 options (A-D) separated by newlines, OR "True\\nFalse" for true_false, OR empty for fill_blank/calculation
   - apply_correct_answer: The correct answer (must match format)
   - apply_explanation: Why this answer is correct (100-150 words)

4. REFLECT SECTION:
   - reflect_title: Stage title (e.g., "Reflect: Your NFT Strategy")
   - reflect_questions: 3-4 thought-provoking questions (separated by newlines)
   - reflect_action_items: 3-5 actionable steps they can take today (separated by newlines)

5. METADATA:
   - key_concepts: 5-7 main concepts (comma-separated)
   - key_takeaways: 4-5 main lessons (separated by newlines)
   - practical_tips: 5-7 actionable tips (separated by newlines)
   - common_mistakes: 4-5 mistakes to avoid (separated by newlines)

CRITICAL REQUIREMENTS:
- Use Philippine Peso (₱) for all currency
- Reference Filipino context (GCash, Maya, local banks, jeepney, load, etc.)
- Keep language simple, conversational, and engaging
- Be practical and action-oriented
- Include specific numbers and examples
- Make it relatable to 18-30 year olds in Philippines

Return ONLY a valid JSON object with this EXACT structure:
{
  "module_id": "",
  "module_title": "",
  "module_description": "",
  "duration": "",
  "category": "",
  "icon": "",
  "color": "",
  "test_type": "",
  "learn_title": "",
  "learn_text": "",
  "learn_key_points": "",
  "learn_sources": "",
  "apply_title": "",
  "apply_scenario": "",
  "apply_task": "",
  "apply_options": "",
  "apply_correct_answer": "",
  "apply_explanation": "",
  "reflect_title": "",
  "reflect_questions": "",
  "reflect_action_items": "",
  "key_concepts": "",
  "key_takeaways": "",
  "practical_tips": "",
  "common_mistakes": "",
  "total_steps": 3,
  "sources": ${JSON.stringify(sources)}
}`

    const moduleResponse = await llm.invoke(modulePrompt)
    const content = moduleResponse.content.toString()

    // Parse JSON response
    let moduleData
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        moduleData = JSON.parse(jsonMatch[0])
      } else {
        moduleData = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('Failed to parse module data:', content)
      return NextResponse.json(
        { error: 'Failed to generate module. Please try again.' },
        { status: 500 }
      )
    }

    // Return success message with module data
    const successMessage = `✅ I've researched and created a complete module about "${moduleData.module_title}"!

📚 Found ${sources.length} credible sources
⏱️ Estimated completion time: ${moduleData.duration}
🎯 Category: ${moduleData.category}

I've filled out the entire module for you including:
- Learn section with comprehensive content
- Apply section with a ${moduleData.test_type.replace('_', ' ')} quiz
- Reflect section with questions and action items
- All metadata and key concepts

Please review the module preview on the right. If you approve, I'll publish it and add the ${sources.length} source(s) to your Resource Hub automatically.

What would you like to do?`

    return NextResponse.json({
      message: successMessage,
      moduleData: moduleData
    })

  } catch (error: any) {
    console.error('AI research error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process research request' },
      { status: 500 }
    )
  }
}
