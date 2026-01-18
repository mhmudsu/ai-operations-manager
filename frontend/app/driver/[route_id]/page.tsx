'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Navigation, CheckCircle, XCircle, Clock, Package, Truck } from 'lucide-react'

export default function DriverRoutePage() {
  const params = useParams()
  const routeId = params.route_id as string
  
  const [route, setRoute] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchRoute()
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchRoute, 10000)
    return () => clearInterval(interval)
  }, [routeId])

  const fetchRoute = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/routes/public/${routeId}`)
      
      if (!response.ok) {
        throw new Error('Route niet gevonden')
      }
      
      const data = await response.json()
      console.log('Route data:', data) // DEBUG
      setRoute(data)
      setError(null)
    } catch (err: any) {
      console.error('Fetch error:', err) // DEBUG
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (stopIndex: number, status: 'delivered' | 'skipped') => {
    console.log(`Updating stop ${stopIndex} to ${status}`) // DEBUG
    
    try {
      setUpdating(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/routes/${routeId}/stops/${stopIndex}/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }
      )
      
      const result = await response.json()
      console.log('Status update result:', result) // DEBUG
      
      if (response.ok) {
        console.log('Success! Refreshing...') // DEBUG
        await fetchRoute() // Refresh immediately
        alert(`✅ Stop gemarkeerd als ${status === 'delivered' ? 'afgeleverd' : 'overgeslagen'}!`)
      } else {
        alert('❌ Error: ' + (result.detail || 'Update failed'))
      }
    } catch (err) {
      console.error('Error updating status:', err)
      alert('❌ Network error')
    } finally {
      setUpdating(false)
    }
  }

  const handleNavigate = (address: string) => {
    // Open Google Maps with address
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    window.open(mapsUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !route) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Route Niet Gevonden</h1>
          <p className="text-gray-600">{error || 'Deze route bestaat niet of is niet meer beschikbaar.'}</p>
        </div>
      </div>
    )
  }

  const stops = route.stops || []
  const completedStops = stops.filter((s: any) => s.status === 'delivered').length
  const totalStops = stops.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Jouw Route</h1>
            </div>
            <div className="text-sm text-gray-600">
              {completedStops}/{totalStops} stops
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalStops > 0 ? (completedStops / totalStops) * 100 : 0}%` }}
            ></div>
          </div>
          
          {/* Route info */}
          <div className="mt-3 flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {route.total_distance_km?.toFixed(1) || 0} km
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {route.total_duration_min || 0} min
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              {totalStops} stops
            </div>
          </div>
        </div>
      </div>

      {/* Stops List */}
      <div className="p-4 space-y-3">
        {stops.map((stop: any, index: number) => {
          const isCompleted = stop.status === 'delivered'
          const isSkipped = stop.status === 'skipped'
          const isCurrent = !isCompleted && !isSkipped && index === completedStops

          return (
            <div 
              key={index}
              className={`bg-white rounded-xl shadow-md overflow-hidden ${
                isCurrent ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Stop header */}
              <div className={`p-4 ${
                isCompleted ? 'bg-green-50' : 
                isSkipped ? 'bg-gray-50' : 
                isCurrent ? 'bg-blue-50' : 'bg-white'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      isCompleted ? 'bg-green-600 text-white' :
                      isSkipped ? 'bg-gray-400 text-white' :
                      isCurrent ? 'bg-blue-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{stop.customer || 'Klant'}</h3>
                      <p className="text-sm text-gray-600">{stop.address}</p>
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      Afgeleverd
                    </span>
                  )}
                  {isSkipped && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded">
                      Overgeslagen
                    </span>
                  )}
                  {isCurrent && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded animate-pulse">
                      Huidige Stop
                    </span>
                  )}
                </div>

                {/* Stop details */}
                {stop.weight_kg && (
                  <div className="text-sm text-gray-600 ml-11">
                    📦 Gewicht: {stop.weight_kg} kg
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isCompleted && !isSkipped && (
                <div className="p-3 bg-gray-50 flex gap-2">
                  <button
                    onClick={() => handleNavigate(stop.address)}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  >
                    <Navigation className="w-4 h-4" />
                    Navigeren
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(index, 'delivered')}
                    disabled={updating}
                    className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(index, 'skipped')}
                    disabled={updating}
                    className="flex items-center justify-center px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Completion message */}
        {completedStops === totalStops && totalStops > 0 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Route Voltooid! 🎉</h2>
            <p className="text-green-700">Alle stops zijn afgerond. Goed gedaan!</p>
          </div>
        )}
      </div>
    </div>
  )
}
