const TOKEN_KEY = 'routegenius_token'
const USER_KEY = 'routegenius_user'

export interface User {
  id: string
  email: string
  company_id: string
  company_name: string
  role: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

// Get stored token
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

// Get stored user
export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

// Save auth data
export function saveAuth(data: AuthResponse): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))
}

// Clear auth data
export function clearAuth(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getToken()
}

// Signup
export async function signup(email: string, password: string, companyName: string, fullName: string): Promise<AuthResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      company_name: companyName,
      full_name: fullName
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Signup failed')
  }

  const data: AuthResponse = await response.json()
  saveAuth(data)
  return data
}

// Login
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  const data: AuthResponse = await response.json()
  saveAuth(data)
  return data
}

// Logout
export function logout(): void {
  clearAuth()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}
