'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Trash2, RefreshCw, Database, User, LogOut } from 'lucide-react'

export default function DebugPage() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState<string>('')

  const clearAllUserData = async () => {
    setLoading('Clearing all data...')
    try {
      // Clear browser storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        
        // Clear all cookies
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        })
      }
      
      // Sign out from Supabase
      await auth.signOut()
      
      setStatus('✅ All local data cleared!')
    } catch (error) {
      setStatus(`❌ Error: ${error}`)
    } finally {
      setLoading('')
    }
  }

  const checkCurrentUser = async () => {
    setLoading('Checking user...')
    try {
      const result = await auth.getCurrentUser()
      setStatus(`Current user: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      setStatus(`❌ Error checking user: ${error}`)
    } finally {
      setLoading('')
    }
  }

  const testSupabaseConnection = async () => {
    setLoading('Testing Supabase...')
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      if (error) {
        setStatus(`❌ Supabase error: ${error.message}`)
      } else {
        setStatus('✅ Supabase connection working!')
      }
    } catch (error) {
      setStatus(`❌ Connection error: ${error}`)
    } finally {
      setLoading('')
    }
  }

  const forcePageReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/ai-assistant">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to AI Assistant
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Debug & Clear Cache</h1>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Authentication Debug Tools</h2>
          <div className="space-y-4">
            <Button
              onClick={clearAllUserData}
              disabled={!!loading}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {loading === 'Clearing all data...' ? 'Clearing...' : 'Clear All Cached Data & Logout'}
            </Button>

            <Button
              onClick={checkCurrentUser}
              disabled={!!loading}
              variant="outline"
              className="w-full"
            >
              <User className="w-4 h-4 mr-2" />
              {loading === 'Checking user...' ? 'Checking...' : 'Check Current User Status'}
            </Button>

            <Button
              onClick={testSupabaseConnection}
              disabled={!!loading}
              variant="outline"
              className="w-full"
            >
              <Database className="w-4 h-4 mr-2" />
              {loading === 'Testing Supabase...' ? 'Testing...' : 'Test Supabase Connection'}
            </Button>

            <Button
              onClick={forcePageReload}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Force Page Reload
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Manual Steps to Clear Cache</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-blue-50 p-3 rounded">
              <h3 className="font-medium text-blue-900 mb-2">Browser Storage:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open Developer Tools (F12)</li>
                <li>Go to Application → Storage</li>
                <li>Clear Local Storage, Session Storage, Cookies</li>
                <li>Clear IndexedDB if present</li>
              </ol>
            </div>
            
            <div className="bg-green-50 p-3 rounded">
              <h3 className="font-medium text-green-900 mb-2">Supabase Data:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to Supabase Dashboard → Authentication → Users</li>
                <li>Delete the unwanted user account</li>
                <li>Check Table Editor → profiles table and delete entries if needed</li>
              </ol>
            </div>
          </div>
        </Card>

        {status && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Debug Output</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
              {status}
            </pre>
          </Card>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            If you're still seeing cached data, try:
            <br />
            1. Clear browser data manually
            <br />
            2. Use incognito/private browsing
            <br />
            3. Restart your browser completely
          </p>
        </div>
      </div>
    </div>
  )
}
