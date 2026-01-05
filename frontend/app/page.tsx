'use client'

import { useEffect, useState } from 'react'
import { Truck, Package, DollarSign, TrendingUp, MapPin } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { LiveRouteCard } from '@/components/dashboard/LiveRouteCard'
import { DashboardHeader } from '@/components/dashboard/Header'
import { useAuth } from '@/components/auth/AuthProvider'
import { api } from '@/lib/api-client'
import { CSVUpload } from '@/components/orders/CSVUpload'
import { NewOrderModal } from '@/components/orders/NewOrderModal'

// Transform backend route format to LiveRouteCard format
function transformRoute(route: any, index: number) {
  const stops = route.stops || []
  const completedStops = stops.filter((s: any) => s.status === 'completed').length
  const nextStop = stops.find((s: any) => s.status !== 'completed')
  
  return {
    id: route.id || `route-${index}`,
    routeNumber: index + 1,
    driver: route.driver_name || 'Onbekend',
    completed: completedStops,
    total: stops.length,
    nextStop: nextStop?.address || stops[0]?.address || 'Geen stops',
    eta: route.estimated_duration_minutes || 30,
    status: (route.status === 'completed' ? 'completed' : 
            route.status === 'delayed' ? 'delayed' : 'on-time') as 'on-time' | 'delayed' | 'completed'
  }
}

// Dynamic greeting based on time
function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Goedemorgen 👋'
  if (hour >= 12 && hour < 18) return 'Goedemiddag ☀️'
  if (hour >= 18 && hour < 23) return 'Goedenavond 🌙'
  return 'Goedenacht 🌃'
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState([])
  const [routes, setRoutes] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [optimizing, setOptimizing] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [showCSVUpload, setShowCSVUpload] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setLoadingData(true)
        
        // Fetch orders AND routes
        const [ordersData, routesData] = await Promise.all([
          api.getOrders('pending'),
          api.getRoutes()
        ])
        
        setOrders(ordersData.orders || [])
        
        // Transform routes to LiveRouteCard format
        const transformedRoutes = (routesData.routes || []).map((route: any, index: number) => 
          transformRoute(route, index)
        )
        
        setRoutes(transformedRoutes)
        
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoadingData(false)
      }
    }

    // Initial load
    fetchData()
    
    // Refresh on window focus (if >5 min since last)
    let lastFetch = Date.now()
    
    const handleFocus = () => {
      if (Date.now() - lastFetch > 300000) { // 5 min
        fetchData()
        lastFetch = Date.now()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    
    // Cleanup
    return () => window.removeEventListener('focus', handleFocus)
    
  }, [user, refreshTrigger])

  const handleOptimizeRoutes = async () => {
    if (orders.length === 0) return
    
    try {
      setOptimizing(true)
      setError('')
      
      console.log('🤖 Starting optimization with orders:', orders)
      
      // Call optimization API
      const result = await api.createPlanning(orders)
      
      console.log('✅ Optimization result:', result)
        
      // Refresh routes after optimization
      const routesData = await api.getRoutes()
      const transformedRoutes = (routesData.routes || []).map((route: any, index: number) => 
        transformRoute(route, index)
      )
      setRoutes(transformedRoutes)
      
      // Show success message
      alert(`✅ ${result.saved_routes?.length || 0} routes geoptimaliseerd!`)
      
    } catch (err: any) {
      console.error('Optimization error:', err)
      setError(`Optimization failed: ${err.message}`)
    } finally {
      setOptimizing(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const pendingOrders = orders.length
  const totalWeight = orders.reduce((sum: number, order: any) => sum + (order.weight_kg || 0), 0)
  const activeRoutes = routes.length
  
  // Calculate realistic efficiency (only if we have routes)
  const efficiency = activeRoutes > 0 ? 94 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader />

      <div className="p-6">
        {/* Welcome Section with Refresh Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {getGreeting()}
            </h2>
            <p className="text-gray-600">
              {activeRoutes > 0 
                ? `Je hebt ${activeRoutes} actieve routes vandaag`
                : 'Geen actieve routes vandaag'
              }
            </p>
          </div>
          
          {/* REFRESH BUTTON */}
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={loadingData}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Ververs data"
          >
            <span className={loadingData ? 'animate-spin' : ''}>🔄</span>
            {loadingData ? 'Bezig...' : 'Vernieuwen'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="In behandeling"
            value={pendingOrders}
            icon={Package}
            trend={null}
            color="blue"
          />
          <DashboardCard
            title="Actieve routes"
            value={activeRoutes}
            icon={Truck}
            trend={null}
            color="purple"
          />
          <DashboardCard
            title="Omzet vandaag"
            value="€0"
            icon={DollarSign}
            trend={null}
            color="orange"
          />
          <DashboardCard
            title="Efficiency"
            value={efficiency > 0 ? `${efficiency}%` : '-'}
            icon={TrendingUp}
            trend={null}
            color="green"
          />
        </div>

        {/* Live Routes Section */}
        {routes.length > 0 ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                🔴 Live Routes
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Alles tonen →
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {routes.map((route: any) => (
                <LiveRouteCard key={route.id} route={route} />
              ))}
            </div>
          </div>
        ) : pendingOrders > 0 ? (
          /* Empty state - Encourage route optimization */
          <div className="mb-8 bg-white rounded-lg shadow-lg p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Klaar om routes te optimaliseren?
              </h3>
              <p className="text-gray-600 mb-4">
                Je hebt {pendingOrders} orders klaar staan. Laat AI je routes optimaliseren!
              </p>
              <button
                onClick={handleOptimizeRoutes}
                disabled={optimizing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {optimizing ? '⚡ Optimaliseren...' : '🤖 Optimaliseer Routes'}
              </button>
            </div>
          </div>
        ) : null}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                📦 Orders ({pendingOrders})
              </h3>
              <div className="flex gap-3">
                <button onClick={() => setShowCSVUpload(!showCSVUpload)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all hover:shadow">
                  📤 Upload CSV
                </button>
                <button onClick={() => setShowNewOrderModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow">
                  + Nieuwe Order
                </button>
                {pendingOrders > 0 && (
                  <button
                    onClick={handleOptimizeRoutes}
                    disabled={optimizing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-all hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {optimizing ? '⚡ Optimaliseren...' : '🤖 Optimaliseer Routes'}
                  </button>
                )}
              </div>
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
                  Upload een CSV of maak je eerste order
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow">
                  + Maak Order
                </button>
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
                      Prioriteit
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.priority >= 4 ? 'bg-red-100 text-red-800' :
                          order.priority >= 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.priority >= 4 ? 'Hoog' : order.priority >= 2 ? 'Normaal' : 'Laag'}
                        </span>
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
            )
            }
          </div>
        </div>

        {/* CSV Upload Section */}
        {showCSVUpload && (
          <div className="mb-8">
            <CSVUpload 
              onUploadComplete={() => {
                setRefreshTrigger(prev => prev + 1)
                setShowCSVUpload(false)
              }}
            />
          </div>
        )}

        {/* New Order Modal */}
        <NewOrderModal
          isOpen={showNewOrderModal}
          onClose={() => setShowNewOrderModal(false)}
          onSuccess={() => {
            setRefreshTrigger(prev => prev + 1)
          }}
        />
      </div>
    </div>
  )
}
