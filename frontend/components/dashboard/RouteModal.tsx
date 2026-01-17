'use client'

import { X, MapPin, Clock, Navigation, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'

interface RouteModalProps {
  isOpen: boolean
  onClose: () => void
  routeId: string
}

export function RouteModal({ isOpen, onClose, routeId }: RouteModalProps) {
  const [route, setRoute] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !routeId) return

    const fetchRoute = async () => {
      try {
        setLoading(true)
        const routes = await api.getRoutes()
        const foundRoute = routes.routes?.find((r: any) => r.id === routeId)
        setRoute(foundRoute)
      } catch (err) {
        console.error('Error fetching route:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRoute()
  }, [isOpen, routeId])

  if (!isOpen) return null

  const stops = route?.stops || []
  const depot = route?.depot_address || 'Bosseplaat 68, Rozenburg'
  
  const mapsUrl = stops.length > 0 
    ? 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(depot) + '&destination=' + encodeURIComponent(depot) + '&waypoints=' + stops.map((s: any) => encodeURIComponent(s.address)).join('|') + '&travelmode=driving'
    : '#'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Route - {route?.driver_name || 'Onbekend'}</h2>
            <p className="text-sm text-gray-600">{stops.length} stops</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <Clock className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-sm">Tijd</p>
                <p className="text-lg font-semibold">{route?.estimated_duration_minutes || 0} min</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <Navigation className="w-5 h-5 text-green-600 mb-2" />
                <p className="text-sm">Afstand</p>
                <p className="text-lg font-semibold">{(route?.total_distance_km || 0).toFixed(1)} km</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <DollarSign className="w-5 h-5 text-orange-600 mb-2" />
                <p className="text-sm">Besparing</p>
                <p className="text-lg font-semibold">€{(route?.savings_euros || 0).toFixed(0)}</p>
              </div>
            </div>

            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium">
              🗺️ Open in Google Maps
            </a>

            <div>
              <h3 className="font-semibold mb-4">Stops</h3>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">🏢</div>
                  <div>
                    <p className="font-medium">Start - Depot</p>
                    <p className="text-sm text-gray-600">{depot}</p>
                  </div>
                </div>
                {stops.map((stop: any, idx: number) => (
                  <div key={idx} className="flex gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">{idx + 1}</div>
                    <div>
                      <p className="font-medium">{stop.customer_name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{stop.address}
                      </p>
                      {stop.weight_kg && <p className="text-xs text-gray-500">{stop.weight_kg} kg</p>}
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">✓</div>
                  <div>
                    <p className="font-medium">Einde - Depot</p>
                    <p className="text-sm text-gray-600">{depot}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}