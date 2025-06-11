import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User, LogOut, BookOpen, MessageCircle, Target, Database, Home, Plus, Trophy } from 'lucide-react'
import { PlounixLogo } from './logo'

interface NavbarProps {
  currentPage?: string
}

export function Navbar({ currentPage }: NavbarProps) {
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Learning', href: '/learning', icon: BookOpen },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'AI Assistant', href: '/ai-assistant', icon: MessageCircle },
    { name: 'Money Missions', href: '/money-missions', icon: Trophy },
    { name: 'Resources', href: '/resource-hub', icon: Database },
  ]

  const handleLogout = () => {
    // Add actual logout functionality
    if (confirm('Are you sure you want to log out?')) {
      // Clear any stored user data
      localStorage.removeItem('userToken')
      localStorage.removeItem('userData')
      
      // Redirect to landing page
      window.location.href = '/'
    }
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
                  variant={currentPage === item.name.toLowerCase() ? "default" : "ghost"}
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
            <span className="text-sm text-gray-600 hidden sm:block">Welcome back, Juan!</span>
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
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
