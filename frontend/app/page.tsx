'use client'

import { useEffect, useState, useRef } from 'react'
import { ManageRouteOrdersModal } from '@/components/dashboard/ManageRouteOrdersModal'
import { Truck, Package, DollarSign, TrendingUp, MapPin, Trash2 } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { LiveRouteCard } from '@/components/dashboard/LiveRouteCard'
import { SkippedStopsModal } from '@/components/dashboard/SkippedStopsModal'
import { RouteModal } from '@/components/dashboard/RouteModal'
import { DashboardHeader } from '@/components/dashboard/Header'
import { useAuth } from '@/components/auth/AuthProvider'
import { api } from '@/lib/api-client'
import { CSVUpload } from '@/components/orders/CSVUpload'
import { NewOrderModal } from '@/components/orders/NewOrderModal'

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
  const [stats, setStats] = useState<any>(null)
  const [statsPeriod, setStatsPeriod] = useState("today")
  const [routes, setRoutes] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [optimizing, setOptimizing] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [showCSVUpload, setShowCSVUpload] = useState(false)
  const csvUploadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showCSVUpload && csvUploadRef.current) {
      csvUploadRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showCSVUpload])
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [showSkippedModal, setShowSkippedModal] = useState<any>(null)
  const [showManageOrdersModal, setShowManageOrdersModal] = useState<any>(null)

  // Define fetchData OUTSIDE useEffect so it can be reused
  const fetchData = async () => {
    if (!user) return
    
    try {
      setLoadingData(true)
      
      // Fetch orders AND routes
      const [ordersData, routesData, statsData] = await Promise.all([
        api.getOrders('pending'),
        api.getRoutes(),
        api.getStats(statsPeriod),
      ])
      
      setOrders(ordersData.orders || [])
      
      // Use original route data (no transform needed)
      setRoutes(routesData.routes || [])
      setStats(statsData?.stats || null)
      
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (!user) return
    
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
    
  }, [user, refreshTrigger, statsPeriod])

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
      setRoutes(routesData)
      
      // Refresh orders to show updated status
      fetchData()
      
      // Show success message
      alert(`✅ ${result.saved_routes?.length || 0} routes geoptimaliseerd!`)
      
    } catch (err: any) {
      console.error('Optimization error:', err)
      setError(`Optimization failed: ${err.message}`)
    } finally {
      setOptimizing(false)
    }
  }


  const handleDeleteRoute = async (routeId: string) => {
    try {
      await api.deleteRoute(routeId)
      // Refresh routes
      fetchData()
    } catch (err: any) {
      console.error("Delete route error:", err)
      alert("Fout bij verwijderen route: " + err.message)
    }
  }

  const handleManageSkipped = (route: any) => {
  setShowSkippedModal(route)
}

const handleSkippedActionComplete = () => {

const handleManageOrders = (route: any) => {
  setShowManageOrdersModal(route)
}

const handleManageOrdersComplete = () => {
  setShowManageOrdersModal(null)
  fetchData()
}
  // Refresh data after reschedule/delete
  setShowSkippedModal(null)
  // Trigger data refresh
  if (user) {
    fetchData()
  }
}

  const handleNotifyCustomers = async (routeId: string) => {
    try {
      const result = await api.notifyCustomers(routeId)
      alert(`✅ ${result.sent} klanten genotificeerd!`)
    } catch (err: any) {
      console.error("Notify error:", err)
      alert("Fout bij notificeren: " + err.message)
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Weet je zeker dat je deze order wilt verwijderen?")) return
    try {
      await api.deleteOrder(orderId)
      fetchData()
    } catch (err: any) {
      console.error("Delete order error:", err)
      alert("Fout bij verwijderen: " + err.message)
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

  const activeRoutes = routes.length
  const pendingOrders = orders.length
  
  // Calculate realistic efficiency (only if we have routes)
  const efficiency = activeRoutes > 0 ? 94 : 0

// Check if we should show empty state
  const hasPendingOrders = pendingOrders > 0

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
            onClick={() => fetchData()}
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
        {/* Period Selector */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Overzicht</h3>
          <select
            value={statsPeriod}
            onChange={(e) => setStatsPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Vandaag</option>
            <option value="week">Deze week</option>
            <option value="month">Deze maand</option>
            <option value="3months">3 maanden</option>
            <option value="6months">6 maanden</option>
            <option value="12months">12 maanden</option>
          </select>
        </div>

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
            value={stats ? `€${stats.revenue}` : "€0"}
            icon={DollarSign}
            trend={null}
            color="orange"
          />
          <DashboardCard
            title="Efficiency"
            value={stats?.efficiency ? `${stats.efficiency}%` : "-"}
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
                <LiveRouteCard 
                key={route.id} 
                route={route}
                onClick={() => setSelectedRouteId(route.id)}
                onNotifyCustomers={() => handleNotifyCustomers(route.id)}
                onDelete={() => handleDeleteRoute(route.id)}
                onManageSkipped={() => handleManageSkipped(route)}
                onManageOrders={() => handleManageOrders(route)}
              />
           ))}
          </div>
        </div>
        ) : hasPendingOrders ? (
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
                {hasPendingOrders && (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                          title="Verwijder order"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* CSV Upload Section */}
        {showCSVUpload && (
          <div ref={csvUploadRef} className="mb-8">
            <CSVUpload 
              onUploadComplete={() => {
                fetchData()
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
            fetchData()
          }}
        />

        {/* Route Details Modal */}
        <RouteModal
          isOpen={!!selectedRouteId}
          onClose={() => setSelectedRouteId(null)}
          routeId={selectedRouteId || ''}
        />

        {showSkippedModal && (

      {showManageOrdersModal && (
        <ManageRouteOrdersModal
          route={showManageOrdersModal}
          onClose={() => setShowManageOrdersModal(null)}
          onActionComplete={handleManageOrdersComplete}
        />
      )}
        <SkippedStopsModal

      {showManageOrdersModal && (
        <ManageRouteOrdersModal
          route={showManageOrdersModal}
          onClose={() => setShowManageOrdersModal(null)}
          onActionComplete={handleManageOrdersComplete}
        />
      )}
          route={showSkippedModal}

      {showManageOrdersModal && (
        <ManageRouteOrdersModal
          route={showManageOrdersModal}
          onClose={() => setShowManageOrdersModal(null)}
          onActionComplete={handleManageOrdersComplete}
        />
      )}
          onClose={() => setShowSkippedModal(null)}

      {showManageOrdersModal && (
        <ManageRouteOrdersModal
          route={showManageOrdersModal}
          onClose={() => setShowManageOrdersModal(null)}
          onActionComplete={handleManageOrdersComplete}
        />
      )}
          onActionComplete={handleSkippedActionComplete}

      {showManageOrdersModal && (
        <ManageRouteOrdersModal
          route={showManageOrdersModal}
          onClose={() => setShowManageOrdersModal(null)}
          onActionComplete={handleManageOrdersComplete}
        />
      )}
        />

      {showManageOrdersModal && (
        <ManageRouteOrdersModal
          route={showManageOrdersModal}
          onClose={() => setShowManageOrdersModal(null)}
          onActionComplete={handleManageOrdersComplete}
        />
      )}
      )}

      {showManageOrdersModal && (
        <ManageRouteOrdersModal
          route={showManageOrdersModal}
          onClose={() => setShowManageOrdersModal(null)}
          onActionComplete={handleManageOrdersComplete}
        />
      )}
      </div>
    </div>
  )
}
