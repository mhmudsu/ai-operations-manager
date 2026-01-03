'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getUser, isAuthenticated, logout as doLogout, type User } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {}
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check auth on mount and when pathname changes
    const checkAuth = () => {
      const currentUser = getUser()
      setUser(currentUser)
      setLoading(false)

      // Redirect to login if not authenticated and not on public pages
      const publicPages = ['/login', '/signup']
      if (!currentUser && !publicPages.includes(pathname)) {
        router.push('/login')
      }

      // Redirect to admin if authenticated and on login/signup
      if (currentUser && publicPages.includes(pathname)) {
        router.push('/admin')
      }
    }

    checkAuth()
  }, [pathname, router])

  const logout = () => {
    doLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
