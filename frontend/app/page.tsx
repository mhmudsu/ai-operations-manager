'use client'

import { useEffect, useState } from 'react'
import { Truck, Package, DollarSign, TrendingUp, MapPin } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { LiveRouteCard } from '@/components/dashboard/LiveRouteCard'
import { DashboardHeader } from '@/components/dashboard/Header'
import { useAuth } from '@/components/auth/AuthProvider'
import { api } from '@/lib/api-client'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [routes, setRoutes] = useState([])
  const [stats, setStats] = useState({
    pendingOrders: 0,
    activeRoutes: 0,
    revenue: 0,
    efficiency: 94
  })
  const [loading, setLoading] = useState(true)

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Goedemorgen 👋'
    if (hour >= 12 && hour < 18) return 'Goedemiddag ☀️'
    if (hour >= 18 && hour < 23) return 'Goedenavond 🌙'
    return 'Goedenacht 🌃'
  }

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Fetch pending orders
        const pendingData = await api.getOrders('pending')
        const allOrders = pendingData.orders || []
        setOrders(allOrders)

        // TODO: Fetch real routes from API when routes endpoint is ready
        // const routesData = await api.getRoutes('active')
        // setRoutes(routesData.routes || [])

        // Calculate stats
        const totalWeight = allOrders.reduce((sum: number, order: any) => 
          sum + (order.weight_kg || 0), 0
        )
        
        setStats({
          pendingOrders: allOrders.length,
          activeRoutes: routes.length,
          revenue: 0, // Will calculate from completed orders
          efficiency: 94 // Will calculate from route performance
        })
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [user, routes.length])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const totalWeight = orders.reduce((sum: number, order: any) => 
    sum + (order.weight_kg || 0), 0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
  {getGreeting()}
          </h1>
          <p className="text-gray-600">
            {stats.activeRoutes > 0 
              ? `Je hebt ${stats.activeRoutes} actieve routes vandaag`
              : `Je hebt ${stats.pendingOrders} orders klaarstaan voor optimalisatie`
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="In behandeling"
            value={stats.pendingOrders}
            subtitle="orders"
            icon={Package}
            trend={null}
            color="blue"
          />
          <DashboardCard
            title="Actieve routes"
            value={stats.activeRoutes}
            subtitle="onderweg"
            icon={Truck}
            trend={null}
            color="purple"
          />
          <DashboardCard
            title="Omzet vandaag"
            value={`€${stats.revenue}`}
            subtitle=""
            icon={DollarSign}
            trend={null}
            color="green"
          />
          <DashboardCard
            title="Efficiency"
            value={`${stats.efficiency}%`}
            subtitle=""
            icon={TrendingUp}
            trend={null}
            color="orange"
          />
        </div>

        {/* Live Routes Section - ONLY if routes exist */}
        {routes.length > 0 ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-bold text-gray-900">Live Routes</h2>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Alles tonen →
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {routes.map((route: any) => (
                <LiveRouteCard key={route.id} route={route} />
              ))}
            </div>
          </div>
        ) : stats.pendingOrders > 0 ? (
          /* Empty state - Encourage route optimization */
          <div className="mb-8 bg-white rounded-lg shadow-lg p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Klaar voor route optimalisatie
              </h3>
              <p className="text-gray-600 mb-6">
                Je hebt {stats.pendingOrders} orders. Laat AI de meest efficiënte routes berekenen.
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow-md">
                🤖 Optimaliseer Routes
              </button>
            </div>
          </div>
        ) : null}

        {/* Recent Orders Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Orders</h2>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all hover:shadow">
                📤 Upload CSV
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow">
                + Nieuwe Order
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Geen orders
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload een CSV of maak je eerste order om te beginnen
                </p>
                <div className="flex gap-3 justify-center">
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    📤 Upload CSV
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    + Nieuwe Order
                  </button>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gewicht
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.weight_kg} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
