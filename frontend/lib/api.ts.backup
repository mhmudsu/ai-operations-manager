import { supabase } from './supabase'

export async function getCompanyStats(companyId: string) {
  // Get today's orders count
  const { count: todayOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'in-progress')

  // Get active routes count
  const { count: activeRoutes } = await supabase
    .from('routes')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'active')

  // Calculate today's revenue (mock for now)
  const revenue = (todayOrders || 0) * 117 // avg €117 per order

  return {
    todayOrders: todayOrders || 0,
    activeRoutes: activeRoutes || 0,
    revenue: revenue,
    efficiency: 94
  }
}

export async function getActiveRoutes(companyId: string) {
  const { data: routes, error } = await supabase
    .from('routes')
    .select(`
      *,
      driver:drivers(name),
      stops:route_stops(
        *,
        order:orders(*)
      )
    `)
    .eq('company_id', companyId)
    .in('status', ['planned', 'active'])
    .order('route_number', { ascending: true })

  if (error) {
    console.error('Error fetching routes:', error)
    return []
  }

  return routes || []
}

export async function getOrders(companyId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data || []
}

// Railway Backend API (for AI route optimization)
const RAILWAY_API = 'https://routeplan-production.up.railway.app/api'

export async function getRouteByToken(token: string) {
  const response = await fetch(`${RAILWAY_API}/routes/${token}`)
  if (!response.ok) throw new Error('Route not found')
  return response.json()
}

export async function optimizeRouteAI(orders: any[]) {
  const response = await fetch(`${RAILWAY_API}/planning/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      orders: orders.map(o => ({
        customer_name: o.customer_name,
        address: o.delivery_address,
        weight_kg: o.weight_kg,
        priority: o.priority || 1
      }))
    })
  })
  if (!response.ok) throw new Error('Optimization failed')
  return response.json()
}