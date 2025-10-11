import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  User, 
  LogOut, 
  BookOpen, 
  MessageCircle, 
  Target, 
  Database, 
  Home, 
  Plus, 
  Trophy, 
  ChevronDown,
  Menu,
  X,
  CreditCard,
  TrendingUp,
  Palette,
  Waves,
  Leaf,
  Flame,
  Sparkles,
  Moon,
  Flower2,
  Star,
  Rainbow,
  Clover,
  Heart,
  Drama
} from 'lucide-react'
import { PlounixLogo } from './logo'
import { useAuth } from '@/lib/auth-hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { LogoutModal, useLogoutModal } from './logout-modal'
import { AddTransactionModal } from '@/components/AddTransactionModal'
import { NotificationBell } from './notification-bell'

// Colorful avatar options (matching profile page)
const AVATAR_OPTIONS = [
  { id: 1, gradient: 'from-purple-400 via-pink-500 to-red-500', icon: Palette },
  { id: 2, gradient: 'from-blue-400 via-cyan-500 to-teal-500', icon: Waves },
  { id: 3, gradient: 'from-green-400 via-emerald-500 to-teal-500', icon: Leaf },
  { id: 4, gradient: 'from-yellow-400 via-orange-500 to-red-500', icon: Flame },
  { id: 5, gradient: 'from-pink-400 via-purple-500 to-indigo-500', icon: Sparkles },
  { id: 6, gradient: 'from-indigo-400 via-blue-500 to-purple-500', icon: Moon },
  { id: 7, gradient: 'from-rose-400 via-pink-500 to-purple-500', icon: Flower2 },
  { id: 8, gradient: 'from-amber-400 via-yellow-500 to-orange-500', icon: Star },
  { id: 9, gradient: 'from-cyan-400 via-blue-500 to-indigo-500', icon: Rainbow },
  { id: 10, gradient: 'from-lime-400 via-green-500 to-emerald-500', icon: Clover },
  { id: 11, gradient: 'from-fuchsia-400 via-pink-500 to-rose-500', icon: Heart },
  { id: 12, gradient: 'from-violet-400 via-purple-500 to-fuchsia-500', icon: Drama },
]

// Get avatar gradient by ID
const getAvatarGradient = (profilePicture: string) => {
  if (profilePicture?.startsWith('avatar-')) {
    const avatarId = parseInt(profilePicture.replace('avatar-', ''))
    return AVATAR_OPTIONS.find(a => a.id === avatarId)
  }
  return null
}

interface NavbarProps {
  currentPage?: string
}

interface NavItem {
  name: string
  href: string
  icon: any
  description?: string
}

interface DropdownSection {
  title: string
  icon: any
  items: NavItem[]
}

export function Navbar({ currentPage }: NavbarProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string>('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const logoutModal = useLogoutModal()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch profile picture
  useEffect(() => {
    async function fetchProfilePicture() {
      if (!user?.id) return
      
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data } = await supabase
          .from('user_profiles')
          .select('profile_picture')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (data) {
          setProfilePicture((data as any).profile_picture || '')
        }
      } catch (err) {
        console.error('Error fetching profile picture:', err)
      }
    }

    fetchProfilePicture()
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Main navigation items
  const mainNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Your financial overview' },
    { name: 'AI Assistant', href: '/ai-assistant', icon: MessageCircle, description: 'Get personalized help' }
  ]

  // Dropdown sections
  const dropdownSections: DropdownSection[] = [
    {
      title: 'Learning',
      icon: BookOpen,
      items: [
        { name: 'Learning Hub', href: '/learning', icon: BookOpen, description: 'Financial education' },
        { name: 'Challenges', href: '/challenges', icon: Trophy, description: 'Complete financial challenges & missions' },
        { name: 'Goals', href: '/goals', icon: Target, description: 'Set and track goals' }
      ]
    },
    {
      title: 'Finance',
      icon: TrendingUp,
      items: [
        { name: 'Financial Overview', href: '/transactions', icon: TrendingUp, description: 'View all transactions' },
        { name: 'Pricing', href: '/pricing', icon: CreditCard, description: 'Subscription plans' }
      ]
    }
  ]

  const quickActions: NavItem[] = [
    { name: 'Resources', href: '/resource-hub', icon: Database, description: 'Helpful resources' }
  ]

  const handleDropdownClick = (title: string) => {
    setOpenDropdown(openDropdown === title ? null : title)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      // Clear cached data BUT preserve Remember Me credentials
      if (typeof window !== 'undefined') {
        // Save Remember Me data before clearing
        const savedEmail = localStorage.getItem('plounix_saved_email')
        const savedPassword = localStorage.getItem('plounix_saved_password')
        const rememberMe = localStorage.getItem('plounix_remember_me')
        
        // Clear all storage
        localStorage.clear()
        sessionStorage.clear()
        
        // Restore Remember Me data if it existed
        if (rememberMe === 'true' && savedEmail) {
          localStorage.setItem('plounix_saved_email', savedEmail)
          localStorage.setItem('plounix_saved_password', savedPassword || '')
          localStorage.setItem('plounix_remember_me', 'true')
        }
      }
      // Close modal and redirect to login with success message
      logoutModal.close()
      router.push('/auth/login?message=logged-out')
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: force redirect even if signOut fails
      logoutModal.close()
      router.push('/auth/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Don't render user info until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <PlounixLogo 
                  size="md" 
                  className="text-primary"
                />
                <span className="text-xl font-bold text-gray-900">Plounix</span>
              </Link>
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
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <PlounixLogo 
                size="md" 
                className="text-primary"
              />
              <span className="text-xl font-bold text-gray-900">Plounix</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
            {/* Main nav items */}
            {mainNavItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant={currentPage === item.name.toLowerCase() ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2 h-9"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}

            {/* Dropdown sections */}
            {dropdownSections.map((section) => (
              <div key={section.title} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 h-9"
                  onClick={() => handleDropdownClick(section.title)}
                  onMouseEnter={() => setOpenDropdown(section.title)}
                >
                  <section.icon className="w-4 h-4" />
                  <span>{section.title}</span>
                  <ChevronDown className="w-3 h-3 transition-transform duration-200" 
                    style={{ transform: openDropdown === section.title ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </Button>

                {/* Dropdown menu */}
                {openDropdown === section.title && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {section.items.map((item) => (
                      <Link key={item.name} href={item.href} onClick={() => setOpenDropdown(null)}>
                        <div className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                          <item.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Quick actions */}
            {quickActions.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant={currentPage === item.name.toLowerCase() ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2 h-9"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* User Profile/Logout - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <NotificationBell />
                {/* Add Transaction Button */}
                <Button
                  onClick={() => setShowAddTransactionModal(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 h-9 px-3"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
                {/* Profile Picture & Name - Clickable to profile */}
                <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {(() => {
                    const avatarData = getAvatarGradient(profilePicture)
                    
                    if (avatarData) {
                      // Show colorful gradient avatar
                      const IconComponent = avatarData.icon
                      return (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarData.gradient} flex items-center justify-center border-2 border-gray-200`}>
                          <IconComponent className="w-4 h-4 text-white" strokeWidth={1.5} />
                        </div>
                      )
                    } else if (profilePicture && !profilePicture.startsWith('avatar-')) {
                      // Show uploaded image (legacy support)
                      return (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                        />
                      )
                    } else {
                      // Show default avatar
                      return (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-gray-200">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )
                    }
                  })()}
                  <span className="text-sm text-gray-600 hidden xl:block hover:text-primary font-medium cursor-pointer">
                    Hi, {user.name || user.email.split('@')[0]}!
                  </span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={logoutModal.open}
                  className="text-gray-600 hover:text-red-600 h-9"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="default" size="sm">Log In</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white py-4 space-y-2">
            {/* Main nav items */}
            {mainNavItems.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant={currentPage === item.name.toLowerCase() ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start space-x-3"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}

            {/* Dropdown sections - Mobile */}
            {dropdownSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center space-x-2">
                  <section.icon className="w-3 h-3" />
                  <span>{section.title}</span>
                </div>
                {section.items.map((item) => (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start pl-8 space-x-3"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            ))}

            {/* Quick actions */}
            {quickActions.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant={currentPage === item.name.toLowerCase() ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start space-x-3"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}

            {/* User actions - Mobile */}
            <div className="border-t pt-4 mt-4 space-y-2">
              {user ? (
                <>
                  {/* Notification Bell - Mobile */}
                  <div className="flex justify-center mb-2">
                    <NotificationBell />
                  </div>
                  {/* Add Transaction Button - Mobile */}
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setShowAddTransactionModal(true)
                    }}
                    size="sm"
                    className="w-full justify-start space-x-3 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Transaction</span>
                  </Button>
                  {/* Profile Picture & Name - Clickable to profile */}
                  <Link 
                    href="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors rounded-lg mx-2"
                  >
                    {(() => {
                      const avatarData = getAvatarGradient(profilePicture)
                      
                      if (avatarData) {
                        // Show colorful gradient avatar
                        const IconComponent = avatarData.icon
                        return (
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarData.gradient} flex items-center justify-center border-2 border-gray-200`}>
                            <IconComponent className="w-6 h-6 text-white" strokeWidth={1.5} />
                          </div>
                        )
                      } else if (profilePicture && !profilePicture.startsWith('avatar-')) {
                        // Show uploaded image (legacy support)
                        return (
                          <img
                            src={profilePicture}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        )
                      } else {
                        // Show default avatar
                        return (
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center border-2 border-gray-200">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )
                      }
                    })()}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-primary mt-0.5">View Profile →</p>
                    </div>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      logoutModal.open()
                    }}
                    className="w-full justify-start space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </Button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="default" size="sm" className="w-full">Log In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={logoutModal.isOpen}
        onClose={logoutModal.close}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        onSuccess={() => {
          // Optionally refresh data or show success message
          console.log('Transaction added successfully!')
        }}
      />
    </nav>
  )
}
