import { Truck, Package, DollarSign, TrendingUp } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { LiveRouteCard } from '@/components/dashboard/LiveRouteCard'

export default function Dashboard() {
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
    { 
      routeNumber: 4, 
      driver: 'Lisa de Jong', 
      completed: 7, 
      total: 7, 
      nextStop: 'Depot', 
      eta: 0, 
      status: 'completed' as const 
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
                <p className="text-xs text-gray-500">Transport Jan BV</p>
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
            Je hebt 4 actieve routes vandaag
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Vandaag"
            value={23}
            subtitle="leveringen"
            icon={Package}
            trend={12}
          />
          <DashboardCard
            title="Actieve routes"
            value={5}
            subtitle="onderweg"
            icon={Truck}
          />
          <DashboardCard
            title="Omzet vandaag"
            value="€2.340"
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
        <div>
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
      </main>
    </div>
  )
}