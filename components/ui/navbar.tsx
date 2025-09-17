'use client'

import Link from 'next/link'
import { User, LogOut, BookOpen, MessageCircle, Target, Database, Home, Plus, Trophy, Calculator, Menu, X } from 'lucide-react'
import { PlounixLogo } from './logo'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface NavbarProps {
  currentPage?: string
}

export function Navbar({ currentPage }: NavbarProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, key: 'dashboard' },
    { name: 'Learn', href: '/learning', icon: BookOpen, key: 'learning' },
    { name: 'Goals', href: '/goals', icon: Target, key: 'goals' },
    { name: 'Fili', href: '/ai-assistant', icon: MessageCircle, key: 'fili' },
    { name: 'Tools', href: '/digital-tools', icon: Calculator, key: 'tools' },
    { name: 'Challenges', href: '/challenges', icon: Trophy, key: 'challenges' },
    { name: 'Resources', href: '/resource-hub', icon: Database, key: 'resources' },
  ]

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const isActive = (itemKey: string) => currentPage === itemKey

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <PlounixLogo className="text-primary w-8 h-8" size="md" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                Plounix
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link key={item.key} href={item.href} className="inline-block">
                <button className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(item.key)
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              </Link>
            ))}
            
            {/* Track Button */}
            <div className="ml-2 pl-2 border-l border-gray-200">
              <Link href="/add-transaction" className="inline-block">
                <button className="inline-flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  <span>Track</span>
                </button>
              </Link>
            </div>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Desktop Auth */}
            <div className="hidden sm:flex items-center space-x-3">
              {user ? (
                <>
                  <div className="text-right min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {user.name || user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">Welcome back</p>
                  </div>
                  <Link href="/profile" className="inline-block">
                    <button className={`p-2 rounded-md transition-all duration-200 ${
                      currentPage === 'profile'
                        ? 'bg-primary text-white'
                        : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                    }`}>
                      <User className="w-4 h-4" />
                    </button>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="inline-block">
                    <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-200">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/auth/register" className="inline-block">
                    <button className="px-3 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-all duration-200">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile User Icon */}
            {user && (
              <div className="sm:hidden">
                <Link href="/profile" className="inline-block">
                  <button className="p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-50 transition-all duration-200">
                    <User className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-50 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.key} 
                  href={item.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <div className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-all duration-200 ${
                    isActive(item.key)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                  }`}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              ))}
              
              {/* Track Button */}
              <Link 
                href="/add-transaction" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block pt-2 mt-2 border-t border-gray-200"
              >
                <div className="flex items-center space-x-3 px-3 py-3 rounded-md text-primary hover:bg-primary/5 transition-all duration-200">
                  <Plus className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Track Transaction</span>
                </div>
              </Link>
              
              {/* Mobile Auth Actions */}
              <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
                {user ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                ) : (
                  <>
                    <Link 
                      href="/auth/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block"
                    >
                      <div className="px-3 py-2 text-center text-gray-700 hover:text-primary transition-colors duration-200">
                        Sign In
                      </div>
                    </Link>
                    <Link 
                      href="/auth/register" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block"
                    >
                      <div className="mx-3 py-2 bg-primary text-white text-center rounded-md hover:bg-primary/90 transition-all duration-200">
                        Get Started Free
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
