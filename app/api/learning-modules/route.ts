import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface LearningModule {
  id: string
  module_id: string
  module_title: string
  module_description: string
  duration: string
  category: string
  icon: string
  color: string
  total_steps: number
}

// GET all published learning modules (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('learning_module_content')
      .select('id, module_id, module_title, module_description, duration, category, icon, color, total_steps')
      .order('category', { ascending: true })
      .order('module_id', { ascending: true })

    if (error) {
      console.error('Failed to fetch learning modules:', error)
      return NextResponse.json(
        { error: 'Failed to fetch modules' },
        { status: 500 }
      )
    }

    // Map to the format expected by the learning hub
    const modules = (data || []).map((module: LearningModule) => ({
      id: module.module_id,
      title: module.module_title,
      description: module.module_description,
      icon: module.icon || 'BookOpen',
      color: module.color || 'blue',
      duration: module.duration,
      category: module.category,
      steps: module.total_steps || 3
    }))

    return NextResponse.json(modules)
  } catch (error: any) {
    console.error('Learning modules API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
