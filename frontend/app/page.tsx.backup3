import { Truck, Package, DollarSign, TrendingUp } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { LiveRouteCard } from '@/components/dashboard/LiveRouteCard'
import { getCompanyStats, getOrders } from '@/lib/api'
import { supabase } from '@/lib/supabase'

export default async function Dashboard() {
  // Get company ID (for now we'll use the first company)
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .limit(1)
    .single()

  const companyId = companies?.id || ''

  // Fetch real stats
  const stats = await getCompanyStats(companyId)
  const orders = await getOrders(companyId)

  // Mock route data (we'll make real routes next)
  const routes = [
    { 
      routeNumber: 1, 
      driver: 'Piet van Dam', 
      completed: 5, 
      total: 7, 
      nextStop: 'Utrecht', 
      eta: 12, 
      status: 'on-time' as const 
    },
    { 
      routeNumber: 2, 
      driver: 'Marie Bakker', 
      completed: 3, 
      total: 7, 
      nextStop: 'Haarlem', 
      eta: 8, 
      status: 'on-time' as const 
    },
    { 
      routeNumber: 3, 
      driver: 'Jan de Vries', 
      completed: 6, 
      total: 8, 
      nextStop: 'Rotterdam', 
      eta: 25, 
      status: 'delayed' as const 
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-400 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">AI Operations</h1>
                <p className="text-xs text-gray-500">{companies?.name || 'Loading...'}</p>
              </div>
            </div>
            
            {/* User */}
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full" />
          </div>
        </div>
      </header>
      
      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Goedemorgen, Jan 👋
          </h2>
          <p className="text-gray-600">
            Je hebt {stats.activeRoutes} actieve routes vandaag
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="In behandeling"
            value={stats.todayOrders}
            subtitle="orders"
            icon={Package}
            trend={12}
          />
          <DashboardCard
            title="Actieve routes"
            value={stats.activeRoutes}
            subtitle="onderweg"
            icon={Truck}
          />
          <DashboardCard
            title="Omzet vandaag"
            value={`€${stats.revenue.toLocaleString()}`}
            icon={DollarSign}
            trend={8}
          />
          <DashboardCard
            title="Efficiency"
            value="94%"
            icon={TrendingUp}
            trend={3}
          />
        </div>
        
        {/* Live Routes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              🔴 Live Routes
            </h3>
            <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              Alles tonen →
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {routes.map((route) => (
              <LiveRouteCard key={route.routeNumber} {...route} />
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📦 Recente Orders
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Klant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Van → Naar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gewicht</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.pickup_address} → {order.delivery_address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.weight_kg} kg
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'completed' ? 'bg-success-50 text-success-700' :
                        order.status === 'in-progress' ? 'bg-brand-50 text-brand-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}