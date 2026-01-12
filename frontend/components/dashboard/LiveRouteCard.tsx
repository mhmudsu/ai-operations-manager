'use client'
import { Trash2, Bell } from 'lucide-react'

interface LiveRouteCardProps {
  route: {
    id: string
    routeNumber: number
    driverName: string
    nextStop: string
    totalStops: number
    completedStops: number
    estimatedTime: string
    status: 'on_schedule' | 'delayed' | 'early'
  }
  onClick?: () => void
  onDelete?: () => void
  onNotifyCustomers?: () => void
}

export function LiveRouteCard({ route, onClick, onDelete, onNotifyCustomers }: LiveRouteCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Weet je zeker dat je Route ${route.routeNumber} wilt verwijderen?`)) {
      onDelete?.()
    }
  }

  const handleNotify = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`WhatsApp notificaties sturen naar alle klanten op Route ${route.routeNumber}?`)) {
      onNotifyCustomers?.()
    }
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer p-6 relative border border-gray-100"
    >
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Verwijder route"
        >
          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
        </button>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Route {route.routeNumber}
          </h3>
          <p className="text-sm text-gray-600">· {route.driverName}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
          route.status === 'on_schedule' ? 'bg-green-100 text-green-800' :
          route.status === 'delayed' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          📍 {route.status === 'on_schedule' ? 'Op schema' : route.status === 'delayed' ? 'Vertraagd' : 'Vroeg'}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Volgende:</span> {route.nextStop}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {route.completedStops} van {route.totalStops} stops
          </span>
          <span className="text-blue-600 font-medium">{route.estimatedTime}</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(route.completedStops / route.totalStops) * 100}%` }}
          />
        </div>
      </div>

      {/* Notify Customers Button */}
      {onNotifyCustomers && (
        <button
          onClick={handleNotify}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
        >
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium">Notificeer Klanten</span>
        </button>
      )}
    </div>
  )
}
