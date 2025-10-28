'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { BookOpen, Plus, Pencil, Trash2, Save, X, Eye, AlertCircle, CheckCircle2, Loader2, ArrowLeft, GraduationCap, Lightbulb, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LearningModule {
  id: string
  module_id: string
  module_title: string
  module_description: string
  duration: string
  category: 'core' | 'essential' | 'advanced'
  icon: string
  color: string
  key_concepts: string[]
  key_takeaways: string[]
  practical_tips: string[]
  common_mistakes: string[]
  total_steps: number
  created_at: string
  updated_at: string
}

export default function AdminLearningModulesPage() {
  const router = useRouter()
  const [modules, setModules] = useState<LearningModule[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    module_id: '',
    module_title: '',
    module_description: '',
    duration: '',
    category: 'core' as 'core' | 'essential' | 'advanced',
    icon: 'Calculator',
    color: 'blue',
    // Learn Stage
    learn_title: '',
    learn_text: '',
    learn_key_points: '',
    learn_sources: '',
    // Apply Stage
    apply_title: '',
    apply_scenario: '',
    apply_task: '',
    apply_options: '',
    apply_correct_answer: '',
    apply_explanation: '',
    // Reflect Stage
    reflect_title: '',
    reflect_questions: '',
    reflect_action_items: '',
    // Metadata
    key_concepts: '',
    key_takeaways: '',
    practical_tips: '',
    common_mistakes: '',
    total_steps: 3  // Learn, Apply, Reflect
  })

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const response = await fetch('/api/admin/learning-modules')
      
      if (!response.ok) {
        throw new Error('Failed to fetch modules')
      }
      
      const data = await response.json()
      setModules(data || [])
    } catch (error) {
      console.error('Failed to load modules:', error)
      toast.error('Failed to load learning modules')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      module_id: '',
      module_title: '',
      module_description: '',
      duration: '15 min',
      category: 'core',
      icon: 'Calculator',
      color: 'blue',
      // Learn Stage
      learn_title: 'Learn: ',
      learn_text: '',
      learn_key_points: '',
      learn_sources: '',
      // Apply Stage
      apply_title: 'Apply: ',
      apply_scenario: '',
      apply_task: '',
      apply_options: '',
      apply_correct_answer: '',
      apply_explanation: '',
      // Reflect Stage
      reflect_title: 'Reflect: ',
      reflect_questions: '',
      reflect_action_items: '',
      // Metadata
      key_concepts: '',
      key_takeaways: '',
      practical_tips: '',
      common_mistakes: '',
      total_steps: 3
    })
    setIsCreateOpen(true)
  }

  const handleEdit = (module: LearningModule) => {
    setSelectedModule(module)
    setFormData({
      module_id: module.module_id,
      module_title: module.module_title,
      module_description: module.module_description,
      duration: module.duration,
      category: module.category,
      icon: module.icon || 'Calculator',
      color: module.color || 'blue',
      // Learn Stage - TODO: Parse from module data when backend supports it
      learn_title: 'Learn: ',
      learn_text: '',
      learn_key_points: '',
      learn_sources: '',
      // Apply Stage
      apply_title: 'Apply: ',
      apply_scenario: '',
      apply_task: '',
      apply_options: '',
      apply_correct_answer: '',
      apply_explanation: '',
      // Reflect Stage
      reflect_title: 'Reflect: ',
      reflect_questions: '',
      reflect_action_items: '',
      // Metadata
      key_concepts: (module.key_concepts || []).join(', '),
      key_takeaways: (module.key_takeaways || []).join('\n'),
      practical_tips: (module.practical_tips || []).join('\n'),
      common_mistakes: (module.common_mistakes || []).join('\n'),
      total_steps: module.total_steps
    })
    setIsEditOpen(true)
  }

  const handleDelete = (module: LearningModule) => {
    setSelectedModule(module)
    setIsDeleteOpen(true)
  }

  const saveModule = async () => {
    setIsSaving(true)
    try {
      // Parse arrays from strings
      const moduleData = {
        module_id: formData.module_id.toLowerCase().replace(/\s+/g, '-'),
        module_title: formData.module_title,
        module_description: formData.module_description,
        duration: formData.duration,
        category: formData.category,
        icon: formData.icon,
        color: formData.color,
        key_concepts: formData.key_concepts
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        key_takeaways: formData.key_takeaways
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean),
        practical_tips: formData.practical_tips
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean),
        common_mistakes: formData.common_mistakes
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean),
        total_steps: formData.total_steps
      }

      if (isCreateOpen) {
        // Create new module
        const response = await fetch('/api/admin/learning-modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(moduleData)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create module')
        }

        toast.success('Module created successfully!')
      } else if (isEditOpen && selectedModule) {
        // Update existing module
        const response = await fetch('/api/admin/learning-modules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...moduleData, id: selectedModule.id })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update module')
        }

        toast.success('Module updated successfully!')
      }

      setIsCreateOpen(false)
      setIsEditOpen(false)
      loadModules()
    } catch (error: any) {
      console.error('Failed to save module:', error)
      toast.error(error.message || 'Failed to save module')
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedModule) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/learning-modules?id=${selectedModule.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete module')
      }

      toast.success('Module deleted successfully!')
      setIsDeleteOpen(false)
      loadModules()
    } catch (error: any) {
      console.error('Failed to delete module:', error)
      toast.error(error.message || 'Failed to delete module')
    } finally {
      setIsSaving(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      core: 'bg-green-100 text-green-800 border-green-200',
      essential: 'bg-purple-100 text-purple-800 border-purple-200',
      advanced: 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[category as keyof typeof colors] || colors.core
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button 
          onClick={() => router.push('/admin')} 
          variant="ghost" 
          className="mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Modules</h1>
            <p className="text-gray-600 mt-1">Create, edit, and manage learning hub modules</p>
          </div>
          <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Module
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{modules.length}</div>
            <div className="text-sm text-gray-600">Total Modules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {modules.filter(m => m.category === 'core').length}
            </div>
            <div className="text-sm text-gray-600">Core Modules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {modules.filter(m => m.category === 'essential').length}
            </div>
            <div className="text-sm text-gray-600">Essential Modules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {modules.filter(m => m.category === 'advanced').length}
            </div>
            <div className="text-sm text-gray-600">Advanced Modules</div>
          </CardContent>
        </Card>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
              <p className="text-gray-600 mb-4">Create your first learning module to get started</p>
              <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Module
              </Button>
            </CardContent>
          </Card>
        ) : (
          modules.map((module) => (
            <Card key={module.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{module.module_title}</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryBadge(module.category)}`}>
                        {module.category}
                      </span>
                    </div>
                    <CardDescription className="text-sm">
                      <strong>ID:</strong> {module.module_id} • <strong>Duration:</strong> {module.duration} • <strong>Steps:</strong> {module.total_steps}
                    </CardDescription>
                    <p className="text-gray-600 mt-2">{module.module_description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(module)}
                      className="hover:bg-green-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(module)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-700">Key Concepts:</strong>
                    <p className="text-gray-600">{(module.key_concepts || []).length} concepts</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Takeaways:</strong>
                    <p className="text-gray-600">{(module.key_takeaways || []).length} takeaways</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Practical Tips:</strong>
                    <p className="text-gray-600">{(module.practical_tips || []).length} tips</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Common Mistakes:</strong>
                    <p className="text-gray-600">{(module.common_mistakes || []).length} mistakes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false)
          setIsEditOpen(false)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreateOpen ? 'Create New Module' : 'Edit Module'}</DialogTitle>
            <DialogDescription>
              Create a comprehensive learning module with Learn, Apply, and Reflect stages.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">
                <BookOpen className="w-4 h-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="learn">
                <GraduationCap className="w-4 h-4 mr-2" />
                Learn
              </TabsTrigger>
              <TabsTrigger value="apply">
                <Lightbulb className="w-4 h-4 mr-2" />
                Apply
              </TabsTrigger>
              <TabsTrigger value="reflect">
                <MessageSquare className="w-4 h-4 mr-2" />
                Reflect
              </TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="module_id">Module ID *</Label>
                  <Input
                    id="module_id"
                    value={formData.module_id}
                    onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                    placeholder="budgeting-basics"
                    disabled={isEditOpen}
                  />
                  <p className="text-xs text-gray-500 mt-1">Lowercase, hyphen-separated</p>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: 'core' | 'essential' | 'advanced') => 
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="core">Core</SelectItem>
                      <SelectItem value="essential">Essential</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icon *</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Calculator">Calculator</SelectItem>
                      <SelectItem value="PiggyBank">PiggyBank</SelectItem>
                      <SelectItem value="TrendingUp">TrendingUp</SelectItem>
                      <SelectItem value="Shield">Shield</SelectItem>
                      <SelectItem value="CreditCard">CreditCard</SelectItem>
                      <SelectItem value="Globe">Globe</SelectItem>
                      <SelectItem value="Target">Target</SelectItem>
                      <SelectItem value="Brain">Brain</SelectItem>
                      <SelectItem value="BookOpen">BookOpen</SelectItem>
                      <SelectItem value="Award">Award</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Icon shown in module card</p>
                </div>
                <div>
                  <Label htmlFor="color">Color *</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Theme color for the module</p>
                </div>
              </div>

              <div>
                <Label htmlFor="module_title">Module Title *</Label>
                <Input
                  id="module_title"
                  value={formData.module_title}
                  onChange={(e) => setFormData({ ...formData, module_title: e.target.value })}
                  placeholder="Budgeting Mastery for Students"
                />
              </div>

              <div>
                <Label htmlFor="module_description">Description *</Label>
                <Textarea
                  id="module_description"
                  value={formData.module_description}
                  onChange={(e) => setFormData({ ...formData, module_description: e.target.value })}
                  placeholder="Learn to manage your allowance and starting salary like a pro"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="15 min"
                  />
                </div>
                <div>
                  <Label htmlFor="total_steps">Total Steps *</Label>
                  <Input
                    id="total_steps"
                    type="number"
                    value={formData.total_steps}
                    onChange={(e) => setFormData({ ...formData, total_steps: parseInt(e.target.value) || 3 })}
                    min="1"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Fixed at 3 (Learn, Apply, Reflect)</p>
                </div>
              </div>
            </TabsContent>

            {/* Learn Stage Tab */}
            <TabsContent value="learn" className="space-y-4 py-4">
              <div>
                <Label htmlFor="learn_title">Learn Stage Title *</Label>
                <Input
                  id="learn_title"
                  value={formData.learn_title}
                  onChange={(e) => setFormData({ ...formData, learn_title: e.target.value })}
                  placeholder="Learn: What is Budgeting?"
                />
              </div>

              <div>
                <Label htmlFor="learn_text">Main Content *</Label>
                <Textarea
                  id="learn_text"
                  value={formData.learn_text}
                  onChange={(e) => setFormData({ ...formData, learn_text: e.target.value })}
                  placeholder="Explain the concept in detail with examples, Filipino context, and practical information..."
                  rows={12}
                />
                <p className="text-xs text-gray-500 mt-1">Main educational content. Use markdown formatting.</p>
              </div>

              <div>
                <Label htmlFor="learn_key_points">Key Points (one per line)</Label>
                <Textarea
                  id="learn_key_points"
                  value={formData.learn_key_points}
                  onChange={(e) => setFormData({ ...formData, learn_key_points: e.target.value })}
                  placeholder="Budgeting prevents you from running out of money&#10;The 50-30-20 rule adapts to any income level&#10;Treating savings as a need builds wealth automatically"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="learn_sources">Sources (one per line, format: Title | URL | Type)</Label>
                <Textarea
                  id="learn_sources"
                  value={formData.learn_sources}
                  onChange={(e) => setFormData({ ...formData, learn_sources: e.target.value })}
                  placeholder="Khan Academy - Budget Planning | https://www.khanacademy.org/... | Educational"
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Apply Stage Tab */}
            <TabsContent value="apply" className="space-y-4 py-4">
              <div>
                <Label htmlFor="apply_title">Apply Stage Title *</Label>
                <Input
                  id="apply_title"
                  value={formData.apply_title}
                  onChange={(e) => setFormData({ ...formData, apply_title: e.target.value })}
                  placeholder="Apply: Create Your Personal Budget"
                />
              </div>

              <div>
                <Label htmlFor="apply_scenario">Scenario *</Label>
                <Textarea
                  id="apply_scenario"
                  value={formData.apply_scenario}
                  onChange={(e) => setFormData({ ...formData, apply_scenario: e.target.value })}
                  placeholder="Meet Jana, a 3rd year college student. Her parents give her ₱12,000 monthly allowance..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">Real-world scenario for students to apply knowledge</p>
              </div>

              <div>
                <Label htmlFor="apply_task">Task/Question *</Label>
                <Input
                  id="apply_task"
                  value={formData.apply_task}
                  onChange={(e) => setFormData({ ...formData, apply_task: e.target.value })}
                  placeholder="What should Jana allocate for savings?"
                />
              </div>

              <div>
                <Label htmlFor="apply_options">Answer Options (one per line) *</Label>
                <Textarea
                  id="apply_options"
                  value={formData.apply_options}
                  onChange={(e) => setFormData({ ...formData, apply_options: e.target.value })}
                  placeholder="₱2,400 (20% of allowance)&#10;₱4,800 (40% of allowance)&#10;₱1,200 (10% of allowance)&#10;₱6,000 (50% of allowance)"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="apply_correct_answer">Correct Answer *</Label>
                <Input
                  id="apply_correct_answer"
                  value={formData.apply_correct_answer}
                  onChange={(e) => setFormData({ ...formData, apply_correct_answer: e.target.value })}
                  placeholder="₱2,400 (20% of allowance)"
                />
                <p className="text-xs text-gray-500 mt-1">Must match one of the options exactly</p>
              </div>

              <div>
                <Label htmlFor="apply_explanation">Explanation *</Label>
                <Textarea
                  id="apply_explanation"
                  value={formData.apply_explanation}
                  onChange={(e) => setFormData({ ...formData, apply_explanation: e.target.value })}
                  placeholder="Following the 50-30-20 rule, Jana should save 20% of her ₱12,000 allowance = ₱2,400..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">Explain why this is the correct answer</p>
              </div>
            </TabsContent>

            {/* Reflect Stage Tab */}
            <TabsContent value="reflect" className="space-y-4 py-4">
              <div>
                <Label htmlFor="reflect_title">Reflect Stage Title *</Label>
                <Input
                  id="reflect_title"
                  value={formData.reflect_title}
                  onChange={(e) => setFormData({ ...formData, reflect_title: e.target.value })}
                  placeholder="Reflect: Your Budgeting Journey"
                />
              </div>

              <div>
                <Label htmlFor="reflect_questions">Reflection Questions (one per line) *</Label>
                <Textarea
                  id="reflect_questions"
                  value={formData.reflect_questions}
                  onChange={(e) => setFormData({ ...formData, reflect_questions: e.target.value })}
                  placeholder="What money mistakes have you made in the past?&#10;How would a budget change your spending habits?&#10;What financial goal motivates you most?"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">Open-ended questions for personal reflection</p>
              </div>

              <div>
                <Label htmlFor="reflect_action_items">Action Items (one per line) *</Label>
                <Textarea
                  id="reflect_action_items"
                  value={formData.reflect_action_items}
                  onChange={(e) => setFormData({ ...formData, reflect_action_items: e.target.value })}
                  placeholder="Download a budgeting app like Money Lover&#10;Track your expenses for one week&#10;Create your first budget plan"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">Concrete next steps for students to take</p>
              </div>
            </TabsContent>

            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-4 py-4">
              <div>
                <Label htmlFor="key_concepts">Key Concepts (comma-separated)</Label>
                <Input
                  id="key_concepts"
                  value={formData.key_concepts}
                  onChange={(e) => setFormData({ ...formData, key_concepts: e.target.value })}
                  placeholder="50-30-20 rule, Needs vs Wants, Budget tracking"
                />
              </div>

              <div>
                <Label htmlFor="key_takeaways">Key Takeaways (one per line)</Label>
                <Textarea
                  id="key_takeaways"
                  value={formData.key_takeaways}
                  onChange={(e) => setFormData({ ...formData, key_takeaways: e.target.value })}
                  placeholder="Budgeting prevents running out of money&#10;The 50-30-20 rule adapts to any income level"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="practical_tips">Practical Tips (one per line)</Label>
                <Textarea
                  id="practical_tips"
                  value={formData.practical_tips}
                  onChange={(e) => setFormData({ ...formData, practical_tips: e.target.value })}
                  placeholder="Use 50% for NEEDS (food, transport, supplies)&#10;Allocate 30% for WANTS (entertainment, shopping)"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="common_mistakes">Common Mistakes (one per line)</Label>
                <Textarea
                  id="common_mistakes"
                  value={formData.common_mistakes}
                  onChange={(e) => setFormData({ ...formData, common_mistakes: e.target.value })}
                  placeholder="Not tracking small expenses&#10;Skipping the savings category"
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false)
                setIsEditOpen(false)
              }}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={saveModule} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedModule?.module_title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Warning</p>
                <p className="text-sm text-red-700 mt-1">
                  Deleting this module will remove all associated content. User reflections and progress data will not be affected.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {isSaving ? 'Deleting...' : 'Delete Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
