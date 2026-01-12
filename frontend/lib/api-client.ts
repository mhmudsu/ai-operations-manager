import { getToken } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) {
    headers['Authorization'] = 'Bearer ' + token
  }
  const response = await fetch(API_URL + endpoint, {
    ...options,
    headers,
  })
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('routegenius_token')
      localStorage.removeItem('routegenius_user')
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'HTTP ' + response.status)
  }
  return response.json()
}

export const api = {
  getDrivers: () => apiFetch('/api/drivers'),
  createDriver: (data: any) => apiFetch('/api/drivers', { method: 'POST', body: JSON.stringify(data) }),
  updateDriver: (driverId: number, data: any) => apiFetch('/api/drivers/' + driverId, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDriver: (driverId: number) => apiFetch('/api/drivers/' + driverId, { method: 'DELETE' }),
  getOrders: (status?: string) => apiFetch('/api/orders' + (status ? '?status=' + status : '')),
  createOrder: (data: any) => apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  bulkCreateOrders: (orders: any[]) => apiFetch('/api/orders/bulk', { method: 'POST', body: JSON.stringify(orders) }),
  deleteOrder: (orderId: number) => apiFetch('/api/orders/' + orderId, { method: 'DELETE' }),
  createPlanning: (orders: any[]) => apiFetch('/api/planning/create', { method: 'POST', body: JSON.stringify({ orders }) }),
  getRoutes: (status?: string) => apiFetch('/api/routes' + (status ? '?status=' + status : '')),
  deleteRoute: (routeId: string) => apiFetch('/api/routes/' + routeId, { method: 'DELETE' }),
  getStats: (period?: string) => apiFetch('/api/stats?period=' + (period || 'today')),
  getRoutesHistory: (filters?: any) => {
    const params = new URLSearchParams()
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)
    if (filters?.driver_id) params.append('driver_id', filters.driver_id)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.limit) params.append('limit', filters.limit)
    return apiFetch('/api/analytics/routes-history?' + params.toString())
  },
  getDriverPerformance: (period?: string) => apiFetch('/api/analytics/driver-performance?period=' + (period || 'month')),
  getSavingsTimeline: (period?: string) => apiFetch('/api/analytics/savings-timeline?period=' + (period || 'month')),
  notifyCustomers: (routeId: string) => apiFetch('/api/routes/' + routeId + '/notify-customers', { method: 'POST' }),
}
