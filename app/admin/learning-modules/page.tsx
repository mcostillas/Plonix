'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { BookOpen, Plus, Pencil, Trash2, Save, X, Eye, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

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
    key_concepts: '',
    key_takeaways: '',
    practical_tips: '',
    common_mistakes: '',
    total_steps: 10
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
      key_concepts: '',
      key_takeaways: '',
      practical_tips: '',
      common_mistakes: '',
      total_steps: 10
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
      core: 'bg-blue-100 text-blue-800 border-blue-200',
      essential: 'bg-purple-100 text-purple-800 border-purple-200',
      advanced: 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[category as keyof typeof colors] || colors.core
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Modules</h1>
          <p className="text-gray-600 mt-1">Create, edit, and manage learning hub modules</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Module
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{modules.length}</div>
            <div className="text-sm text-gray-600">Total Modules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
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
              <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
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
                      className="hover:bg-blue-50"
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreateOpen ? 'Create New Module' : 'Edit Module'}</DialogTitle>
            <DialogDescription>
              Fill in the module details. Arrays can be comma-separated (key concepts) or line-separated (other fields).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                  onChange={(e) => setFormData({ ...formData, total_steps: parseInt(e.target.value) || 10 })}
                  min="1"
                />
              </div>
            </div>

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
          </div>

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
            <Button onClick={saveModule} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
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
