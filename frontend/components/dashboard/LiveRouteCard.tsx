import { MapPin, Clock, TrendingDown, Trash2, Bell, Smartphone, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface LiveRouteCardProps {
  route: any
  onClick: () => void
  onDelete: (routeId: string) => void
  onNotifyCustomers?: (routeId: string) => void
  onManageSkipped?: (route: any) => void
  onManageOrders?: (route: any) => void
}

export function LiveRouteCard({ route, onClick, onDelete, onNotifyCustomers, onManageSkipped, onManageOrders }: LiveRouteCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Weet je zeker dat je deze route wilt verwijderen?')) {
      onDelete(route.id)
    }
  }

  const handleNotifyCustomers = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onNotifyCustomers) {
      onNotifyCustomers(route.id)
    }
  }

  // Calculate progress
  const stops = route.stops || []
  const completedStops = stops.filter((s: any) => s.status === 'delivered').length
  const skippedStops = stops.filter((s: any) => s.status === 'skipped').length
  const totalStops = stops.length
  // Route is completed when ALL stops have a final status (delivered OR skipped)
const stopsWithFinalStatus = stops.filter((s: any) => s.status === 'delivered' || s.status === 'skipped').length
const allCompleted = stopsWithFinalStatus === totalStops && totalStops > 0
  const hasStarted = completedStops > 0

  // Determine status
  const routeStatus = allCompleted ? 'completed' : hasStarted ? 'active' : 'planned'
  const statusColors = {
    completed: 'bg-green-100 text-green-700 border-green-200',
    active: 'bg-orange-100 text-orange-700 border-orange-200',
    planned: 'bg-gray-100 text-gray-700 border-gray-200'
  }
  const statusText = {
    completed: '✓ Voltooid',
    active: '⚡ Actief',
    planned: '📋 Gepland'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border-2 border-blue-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900">
              Route {route.id}
            </h3>
            {route.driver_name && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {route.driver_name}
              </span>
            )}
            {/* Progress Badge */}
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {completedStops}/{totalStops} stops
            </span>
            {skippedStops > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                ⚠️ {skippedStops} niet uitgevoerd
            </span>
          )}
            {/* Status Badge */}
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[routeStatus]}`}>
              {statusText[routeStatus]}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            {!allCompleted && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Volgende: {stops.find((s: any) => s.status !== 'delivered' && s.status !== 'skipped')?.address || stops[0]?.address || 'Geen stops'}</span>
              </div>
            )}
            {allCompleted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">Alle stops voltooid!</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleDelete}
          className="text-red-400 hover:text-red-600 transition-colors p-2"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-medium">Afstand</span>
          </div>
          <p className="text-lg font-bold text-green-900">
            {route.total_distance_km?.toFixed(1) || 0} km
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Tijd</span>
          </div>
          <p className="text-lg font-bold text-blue-900">
            {route.total_duration_min || 0} min
          </p>
        </div>
      </div>

      {route.savings > 0 && (
        <div className="bg-orange-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-orange-700 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">Besparing</span>
          </div>
          <p className="text-lg font-bold text-orange-900">€{route.savings}</p>
        </div>
      )}

      <div className="pt-4 border-t border-gray-100 space-y-2">
        <button
          onClick={onClick}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          Bekijk Route
        </button>

        {onNotifyCustomers && !allCompleted && (
          <button
            onClick={handleNotifyCustomers}
            className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Notificeer Klanten
          </button>
        )}

{onManageSkipped && skippedStops > 0 && (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onManageSkipped(route)
      }}
      className="w-full px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium flex items-center justify-center gap-2 border border-orange-200"
    >
      ⚠️ Beheer Niet-uitgevoerde Orders
    </button>
  )}

        {onManageOrders && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onManageOrders(route)
            }}
            className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2 border border-blue-200"
          >
            🔄 Beheer Orders ({totalStops})
          </button>
        )}

        <Link
          href={`/driver/${route.id}`}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
          className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          📱 Open Driver View
        </Link>
      </div>
    </div>
  )
}
