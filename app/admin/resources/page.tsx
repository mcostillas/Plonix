'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Globe,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  Save,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Resource {
  id: string
  name: string
  url: string
  type: string
  category: string
  description: string
  topics: string[]
  services?: string[]
  is_active: boolean
  created_at: string
}

const CATEGORIES = [
  'Financial Education',
  'Financial Motivation',
  'Traditional Banking',
  'Fintech',
  'Government Regulatory',
  'Deposit Insurance',
  'Public Finance',
  'Online Learning',
  'Investment Platform',
  'Budgeting Strategy'
]

const TYPES = [
  'YouTube Channel',
  'YouTube Content',
  'YouTube Channel & Blog',
  'Banking Institution',
  'Digital Wallet',
  'Digital Bank',
  'Online Brokerage',
  'Central Bank',
  'Regulatory Agency',
  'Government Corporation',
  'Government Department',
  'Educational Platform',
  'Educational Resource'
]

export default function ResourcesManagementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: '',
    category: '',
    description: '',
    topics: '',
    services: ''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    filterResources()
  }, [resources, searchQuery, categoryFilter])

  async function checkAuth() {
    try {
      const response = await fetch('/api/admin/session')
      const data = await response.json()

      if (!data.authenticated) {
        router.push('/auth/login')
        return
      }

      await loadResources()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login')
    }
  }

  async function loadResources() {
    try {
      const response = await fetch('/api/admin/resources')
      if (!response.ok) throw new Error('Failed to fetch resources')
      
      const data = await response.json()
      setResources(data)
    } catch (error) {
      console.error('Failed to load resources:', error)
      toast.error('Failed to load resources')
    } finally {
      setIsLoading(false)
    }
  }

  function filterResources() {
    let filtered = [...resources]

    if (searchQuery) {
      filtered = filtered.filter(resource => 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(resource => resource.category === categoryFilter)
    }

    setFilteredResources(filtered)
  }

  function openCreateModal() {
    setFormData({
      name: '',
      url: '',
      type: '',
      category: '',
      description: '',
      topics: '',
      services: ''
    })
    setEditingResource(null)
    setIsEditModalOpen(true)
  }

  function openEditModal(resource: Resource) {
    setFormData({
      name: resource.name,
      url: resource.url,
      type: resource.type,
      category: resource.category,
      description: resource.description || '',
      topics: resource.topics?.join(', ') || '',
      services: resource.services?.join(', ') || ''
    })
    setEditingResource(resource)
    setIsEditModalOpen(true)
  }

  async function handleSave() {
    if (!formData.name || !formData.url || !formData.type || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsCreating(true)
    try {
      const payload = {
        ...formData,
        topics: formData.topics.split(',').map(t => t.trim()).filter(Boolean),
        services: formData.services.split(',').map(s => s.trim()).filter(Boolean)
      }

      const response = await fetch('/api/admin/resources', {
        method: editingResource ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingResource ? { id: editingResource.id, ...payload } : payload)
      })

      if (!response.ok) throw new Error('Failed to save resource')

      toast.success(editingResource ? 'Resource updated successfully!' : 'Resource created successfully!')
      setIsEditModalOpen(false)
      await loadResources()
    } catch (error) {
      console.error('Failed to save resource:', error)
      toast.error('Failed to save resource')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(resourceId: string) {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const response = await fetch('/api/admin/resources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resourceId })
      })

      if (!response.ok) throw new Error('Failed to delete resource')

      toast.success('Resource deleted successfully!')
      await loadResources()
    } catch (error) {
      console.error('Failed to delete resource:', error)
      toast.error('Failed to delete resource')
    }
  }

  async function toggleActiveStatus(resource: Resource) {
    try {
      const response = await fetch('/api/admin/resources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resource.id, is_active: !resource.is_active })
      })

      if (!response.ok) throw new Error('Failed to update status')

      toast.success(`Resource ${!resource.is_active ? 'activated' : 'deactivated'}!`)
      await loadResources()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="xl" color="primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <Globe className="w-6 h-6 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Resources Management</h1>
                  <p className="text-xs text-gray-500">{filteredResources.length} resources</p>
                </div>
              </div>
            </div>
            <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{resources.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {resources.filter(r => r.is_active).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {new Set(resources.map(r => r.category)).size}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Types</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {new Set(resources.map(r => r.type)).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Resources List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredResources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No resources found
              </CardContent>
            </Card>
          ) : (
            filteredResources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
                        {!resource.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {resource.type}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                          {resource.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {resource.url}
                        </a>
                      </div>

                      {resource.topics && resource.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {resource.topics.map((topic, idx) => (
                            <span 
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActiveStatus(resource)}
                      >
                        {resource.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(resource)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(resource.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingResource ? 'Edit Resource' : 'Create New Resource'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Resource name"
                />
              </div>

              <div>
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="topics">Topics (comma-separated)</Label>
                <Input
                  id="topics"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  placeholder="Budgeting, Saving, Investing"
                />
              </div>

              <div>
                <Label htmlFor="services">Services (comma-separated)</Label>
                <Input
                  id="services"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  placeholder="Savings, Loans, Credit Cards"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isCreating} className="bg-green-600 hover:bg-green-700">
                  {isCreating ? (
                    <><Spinner size="sm" className="mr-2" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> {editingResource ? 'Update' : 'Create'}</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
