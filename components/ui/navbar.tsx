import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User, LogOut, BookOpen, MessageCircle, Target, Database, Home, Plus, Trophy, Wrench } from 'lucide-react'
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

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Learning', href: '/learning', icon: BookOpen },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'AI Assistant', href: '/ai-assistant', icon: MessageCircle },
    { name: 'Digital Tools', href: '/digital-tools', icon: Wrench },
    { name: 'Money Missions', href: '/money-missions', icon: Trophy },
    { name: 'Resources', href: '/resource-hub', icon: Database },
  ]

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      try {
        await signOut()
        // Clear any cached data
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
        // Redirect to login with success message
        router.push('/auth/login?message=logged-out')
      } catch (error) {
        console.error('Logout error:', error)
        // Fallback: force redirect even if signOut fails
        router.push('/auth/login')
      }
    }
  }

  // Don't render user info until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <PlounixLogo className="text-primary" size="md" />
              <span className="text-xl font-bold text-primary">Plounix</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <PlounixLogo className="text-primary" size="md" />
            <span className="text-xl font-bold text-primary">Plounix</span>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant={currentPage === item.name.toLowerCase() || (currentPage === 'tools' && item.name === 'Digital Tools') ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}
            <Link href="/add-transaction">
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </Button>
            </Link>
          </nav>

          {/* User Profile/Logout */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  Hi, {user.name || user.email.split('@')[0]}!
                </span>
                <Link href="/profile">
                  <Button 
                    variant={currentPage === "profile" ? "default" : "ghost"} 
                    size="icon"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-primary"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="default">Log In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
