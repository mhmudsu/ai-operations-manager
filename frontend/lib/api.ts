// Railway Backend API Client
const API_URL = 'https://routeplan-production.up.railway.app/api'

// Get JWT token from localStorage
function getAuthToken() {
  return localStorage.getItem('jwt_token')
}

// Generic fetch with auth
async function authFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken()
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

// Auth
export async function login(email: string, password: string) {
  const data = await authFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  
  localStorage.setItem('jwt_token', data.access_token)
  return data
}

export async function signup(company_name: string, email: string, password: string) {
  const data = await authFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ company_name, email, password }),
  })
  
  localStorage.setItem('jwt_token', data.access_token)
  return data
}

// Stats
export async function getCompanyStats() {
  return authFetch('/stats')
}

// Routes
export async function getRoutes() {
  return authFetch('/routes')
}

export async function getActiveRoutes() {
  const data = await authFetch('/routes')
  return data.routes || []
}

export async function deleteRoute(routeId: number) {
  return authFetch(`/routes/${routeId}`, { method: 'DELETE' })
}

// Orders
export async function getOrders() {
  const data = await authFetch('/orders')
  return data.orders || []
}

export async function createOrder(order: any) {
  return authFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  })
}

export async function deleteOrder(orderId: number) {
  return authFetch(`/orders/${orderId}`, { method: 'DELETE' })
}

// Planning (AI Optimization)
export async function optimizeRoutes(orders: any[]) {
  return authFetch('/planning/create', {
    method: 'POST',
    body: JSON.stringify({ orders }),
  })
}

// Driver Routes (public - no auth needed)
export async function getRouteByToken(token: string) {
  const response = await fetch(`${API_URL}/routes/public/${token}`)
  if (!response.ok) throw new Error('Route not found')
  return response.json()
}

// Update stop status (driver app)
export async function updateStopStatus(routeId: number, stopIndex: number, status: string, photo?: string, notes?: string) {
  return authFetch(`/routes/${routeId}/stops/${stopIndex}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, photo_url: photo, delivery_notes: notes }),
  })
}