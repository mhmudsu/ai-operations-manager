import { getToken } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Authenticated fetch wrapper
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Token expired or invalid
    if (typeof window !== 'undefined') {
      localStorage.removeItem('routegenius_token')
      localStorage.removeItem('routegenius_user')
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

// API functions with auth
export const api = {
  // Drivers
  getDrivers: () => apiFetch('/api/drivers'),
  createDriver: (data: any) => apiFetch('/api/drivers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Orders
  getOrders: (status?: string) => {
    const params = status ? `?status=${status}` : ''
    return apiFetch(`/api/orders${params}`)
  },
  createOrder: (data: any) => apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  bulkCreateOrders: (orders: any[]) => apiFetch('/api/orders/bulk', {
    method: 'POST',
    body: JSON.stringify(orders)
  }),
  
  // Routes
  createPlanning: (orders: any[]) => apiFetch('/api/planning/create', {
    method: 'POST',
    body: JSON.stringify({ orders })
  }),
}
