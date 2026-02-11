import {
  LayoutDashboard,
  Trophy,
  Plus,
  Settings,
  Store,
  User,
  Tv,
  X,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

interface SidebarProps {
  readonly currentPage: string
  readonly onNavigate: (page: string) => void
  readonly isOpen?: boolean
  readonly onClose?: () => void
}

export function Sidebar({ currentPage, onNavigate, isOpen = true, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'creator', label: 'Create Achievement', icon: Plus },
    { id: 'management', label: 'Manage Achievements', icon: Trophy },
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'overlay', label: 'Twitch Overlay', icon: Tv },
  ]

  const handleNavigation = (page: string) => {
    onNavigate(page)
    if (onClose) {
      onClose()
    }
  }

  const handleLogout = () => {
    logout()
    handleNavigation('landing')
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden w-full h-full cursor-default"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#18181b] dark:bg-white border-r border-[#2d2d31] dark:border-gray-200 h-screen flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#2d2d31] dark:border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-white dark:text-gray-900">Stream Quest</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white dark:text-gray-600 dark:hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon
              const isActive = currentPage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#9146FF] text-white'
                      : 'text-gray-400 hover:bg-[#2d2d31] hover:text-white dark:text-gray-600 dark:hover:bg-gray-100 dark:hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-left">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Settings & Theme Toggle */}
        <div className="p-4 border-t border-[#2d2d31] dark:border-gray-200 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#2d2d31] hover:text-white dark:text-gray-600 dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#2d2d31] hover:text-white dark:text-gray-600 dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            style={{ color: '#ff4b4b' }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2d2d31] hover:brightness-125 dark:hover:bg-gray-100 transition-all shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}
