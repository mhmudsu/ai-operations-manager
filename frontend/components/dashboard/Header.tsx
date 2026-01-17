'use client'
import { useAuth } from '@/components/auth/AuthProvider'
import { LogOut, User, BarChart3, Home, Users, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  
  if (!user) return null

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.company_name}
            </h1>
            <p className="text-sm text-gray-600">Operations Dashboard</p>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Link 
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                pathname === '/' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link 
              href="/analytics"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                pathname === '/analytics' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link 
              href="/drivers"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                pathname === '/drivers' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Chauffeurs
            </Link>
            <Link 
              href="/settings"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                pathname === '/settings' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{user.email}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {user.role}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all shadow-sm border border-gray-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
