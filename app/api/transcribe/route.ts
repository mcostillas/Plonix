import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Convert File to format OpenAI expects
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // Can be changed to 'tl' for Tagalog or auto-detect
    })

    return NextResponse.json({
      success: true,
      text: transcription.text,
    })
  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to transcribe audio' 
      },
      { status: 500 }
    )
  }
}
