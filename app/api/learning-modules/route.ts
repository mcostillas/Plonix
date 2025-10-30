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
    // Try to fetch with new columns first, fall back to basic columns if they don't exist
    let { data, error } = await supabase
      .from('learning_module_content')
      .select('*')
      .order('category', { ascending: true })
      .order('module_id', { ascending: true })

    if (error) {
      console.error('Failed to fetch learning modules:', error)
      return NextResponse.json(
        { error: 'Failed to fetch modules' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      console.warn('No modules found in database')
      return NextResponse.json([])
    }

    // Icon mapping for modules without icon column
    const iconMapping: Record<string, string> = {
      'budgeting': 'Calculator',
      'saving': 'PiggyBank',
      'investing': 'TrendingUp',
      'emergency-fund': 'Shield',
      'credit-debt': 'CreditCard',
      'digital-money': 'Globe',
      'insurance': 'Shield',
      'financial-goals': 'Target',
      'money-mindset': 'Brain',
      'nft-basics-for-filipinos': 'BookOpen'
    }

    // Color mapping for modules without color column
    const colorMapping: Record<string, string> = {
      'budgeting': 'blue',
      'saving': 'green',
      'investing': 'purple',
      'emergency-fund': 'orange',
      'credit-debt': 'red',
      'digital-money': 'green',
      'insurance': 'blue',
      'financial-goals': 'purple',
      'money-mindset': 'yellow',
      'nft-basics-for-filipinos': 'blue'
    }

    // Map to the format expected by the learning hub
    const modules = data.map((module: any) => ({
      id: module.module_id,
      title: module.module_title,
      description: module.module_description || '',
      icon: module.icon || iconMapping[module.module_id] || 'BookOpen',
      color: module.color || colorMapping[module.module_id] || 'blue',
      duration: module.duration || '20 min',
      category: module.category || 'essential',
      steps: module.total_steps || 3
    }))

    console.log(`✅ Successfully fetched ${modules.length} modules from database`)
    return NextResponse.json(modules)
  } catch (error: any) {
    console.error('Learning modules API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
