import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User, LogOut, BookOpen, MessageCircle, Target, Database, Home, Plus, Trophy, Calculator, Menu, X, TrendingUp } from 'lucide-react'
import { PlounixLogo } from './logo'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NavbarProps {
  currentPage?: string
}

export function Navbar({ currentPage }: NavbarProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Your financial overview' },
    { name: 'Learn', href: '/learning', icon: BookOpen, description: 'Financial education' },
    { name: 'Goals', href: '/goals', icon: Target, description: 'Track your progress' },
    { name: 'Fili', href: '/ai-assistant', icon: MessageCircle, description: 'Your AI financial assistant' },
    { name: 'Tools', href: '/tools', icon: Calculator, description: 'Budget & savings calculators' },
    { name: 'Challenges', href: '/challenges', icon: Trophy, description: 'Fun money challenges' },
    { name: 'Resources', href: '/resource-hub', icon: Database, description: 'Philippine financial guides' },
  ]

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await signOut()
        // Clear any cached data
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
        // Redirect to home with success message
        router.push('/?message=signed-out')
      } catch (error) {
        console.error('Sign out error:', error)
        // Fallback: force redirect even if signOut fails
        router.push('/auth/login')
      }
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Don't render user info until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <PlounixLogo className="text-primary" size="md" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">Plounix</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <PlounixLogo className="text-primary" size="md" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">Plounix</span>
            </Link>

            {/* Desktop Navigation Items */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button 
                    variant={currentPage === item.name.toLowerCase() || 
                             (currentPage === 'tools' && item.name === 'Tools') ||
                             (currentPage === 'challenges' && item.name === 'Challenges') ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2 h-9 px-3 text-sm font-medium"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              ))}
              <div className="ml-2 pl-2 border-l border-gray-200">
                <Link href="/add-transaction">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 h-9 px-3 text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Track</span>
                  </Button>
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button & User Profile */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500">Welcome back!</p>
                    </div>
                    <Link href="/profile">
                      <Button 
                        variant={currentPage === "profile" ? "default" : "ghost"} 
                        size="icon"
                        className="w-9 h-9"
                      >
                        <User className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      size="sm"
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      <span className="hidden md:block">Sign Out</span>
                    </Button>
                  </div>
                  <div className="sm:hidden flex items-center space-x-2">
                    <Link href="/profile">
                      <Button variant="ghost" size="icon" className="w-9 h-9">
                        <User className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="default" size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
              
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="lg:hidden w-9 h-9"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <item.icon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <Link href="/add-transaction" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                    <Plus className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-primary">Track Transaction</p>
                      <p className="text-xs text-gray-500">Add income or expense</p>
                    </div>
                  </div>
                </Link>
              </div>
              {user && (
                <div className="border-t border-gray-200 pt-3 mt-3 sm:hidden">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-600">Sign Out</p>
                      <p className="text-xs text-gray-500">See you soon!</p>
                    </div>
                  </button>
                </div>
              )}
              {!user && (
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2 sm:hidden">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full justify-start">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
