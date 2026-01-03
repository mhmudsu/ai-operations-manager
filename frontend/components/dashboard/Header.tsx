'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { LogOut, User } from 'lucide-react'

export function DashboardHeader() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user.company_name}
          </h1>
          <p className="text-sm text-gray-600">Operations Dashboard</p>
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
