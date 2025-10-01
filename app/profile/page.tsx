'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { AuthGuard } from '@/components/AuthGuard'
import { User, Mail, Calendar, DollarSign, Target, Trophy, Edit, MessageCircle } from 'lucide-react'
import { useState } from 'react'

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}

function ProfileContent() {
  const [conversationStats, setConversationStats] = useState({
    totalChats: 0,
    totalMessages: 0,
    favoriteTopics: []
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="profile" />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Juan Dela Cruz</h1>
              <p className="text-gray-600">Financial Learning Journey Since Jan 2024</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Personal Information
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input value="Juan" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input value="Dela Cruz" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value="juan.delacruz@email.com" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Age</label>
                    <Input type="number" value="22" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Monthly Income (₱)</label>
                    <Input type="number" value="18000" />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            {/* Financial Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Set and track your money goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Emergency Fund</h4>
                      <p className="text-sm text-gray-600">₱54,000 target (3 months expenses)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">₱32,000</p>
                      <p className="text-xs text-gray-600">59% complete</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">First Investment</h4>
                      <p className="text-sm text-gray-600">₱10,000 for mutual fund</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₱10,500</p>
                      <p className="text-xs text-gray-600">Achieved!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Vacation Fund</h4>
                      <p className="text-sm text-gray-600">₱25,000 for Boracay trip</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">₱8,500</p>
                      <p className="text-xs text-gray-600">34% complete</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">Add New Goal</Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Achievements */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Learning Streak</p>
                    <p className="text-sm text-gray-600">12 days</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Goals Completed</p>
                    <p className="text-sm text-gray-600">3 of 5</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Total Saved</p>
                    <p className="text-sm text-gray-600">₱51,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">First Saver</p>
                    <p className="text-xs text-gray-600">Saved your first ₱1,000</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Goal Getter</p>
                    <p className="text-xs text-gray-600">Completed first financial goal</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Consistent Learner</p>
                    <p className="text-xs text-gray-600">7-day learning streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Interaction History */}
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant History</CardTitle>
            <CardDescription>Your conversations and learned preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">47</p>
                <p className="text-sm text-gray-600">Total Conversations</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">156</p>
                <p className="text-sm text-gray-600">Messages Exchanged</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">23</p>
                <p className="text-sm text-gray-600">Receipts Scanned</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Frequently Discussed Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {['Budgeting', 'Emergency Fund', 'Food Expenses', 'Investment', 'Savings Goals'].map((topic) => (
                  <span key={topic} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              View Full Chat History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
