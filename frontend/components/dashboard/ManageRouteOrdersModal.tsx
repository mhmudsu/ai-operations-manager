import { X, Package, MapPin, Weight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface ManageRouteOrdersModalProps {
  route: any
  onClose: () => void
  onActionComplete: () => void
}

export function ManageRouteOrdersModal({ route, onClose, onActionComplete }: ManageRouteOrdersModalProps) {
  const [processing, setProcessing] = useState<string | null>(null)
  
  const stops = (route.stops || []).map((stop: any, index: number) => ({ 
    ...stop, 
    originalIndex: index 
  }))

  const handleResetSingleOrder = async (stop: any) => {
    if (stop.status === 'pending') {
      alert('Deze order is al in behandeling!')
      return
    }

    if (!confirm(`Order van ${stop.customer} terugzetten naar planning?\n\nDe order wordt beschikbaar voor nieuwe route optimalisatie.`)) {
      return
    }

    setProcessing(`reset-${stop.originalIndex}`)
    
    try {
      const token = localStorage.getItem('jwt_token')
      const response = await fetch(`https://routeplan-production.up.railway.app/api/routes/${route.id}/stops/${stop.originalIndex}/reschedule`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Reset mislukt')
      }

      // Check if message indicates route was deleted
      const result = await response.json()
      if (result.message.includes('Route was leeg')) {
        alert('✅ Order teruggezet! Route was leeg en is verwijderd.')
      } else {
        alert('✅ Order succesvol teruggezet naar planning!')
      }
      onActionComplete()
      onClose()
    } catch (error: any) {
      alert(`❌ Fout bij terugzetten: ${error.message}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleResetAllOrders = async () => {
    const pendingCount = stops.filter((s: any) => s.status !== 'pending').length
    
    if (pendingCount === 0) {
      alert('Alle orders zijn al in behandeling!')
      return
    }

    if (!confirm(`🔄 HELE ROUTE RESETTEN?\n\n${pendingCount} order(s) worden teruggezet naar planning.\nDe route wordt verwijderd.\n\n⚠️ Deze actie kan niet ongedaan worden gemaakt!`)) {
      return
    }

    setProcessing('reset-all')
    
    try {
      const token = localStorage.getItem('jwt_token')
      const response = await fetch(`https://routeplan-production.up.railway.app/api/routes/${route.id}/reset-all-orders`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Reset mislukt')
      }

      const result = await response.json()
      alert(`✅ Route gereset!\n\n${result.orders_reset} order(s) teruggezet naar planning.`)
      onActionComplete()
      onClose()
    } catch (error: any) {
      alert(`❌ Fout bij resetten: ${error.message}`)
    } finally {
      setProcessing(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 border-green-200'
      case 'skipped': return 'bg-red-50 border-red-200'
      case 'pending': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'skipped': return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'pending': return <Clock className="w-5 h-5 text-blue-600" />
      default: return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return '✓ Afgeleverd'
      case 'skipped': return '⚠ Overgeslagen'
      case 'pending': return '⏳ In behandeling'
      default: return status
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🔄 Beheer Route Orders
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Route {route.id} - {stops.length} order(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {stops.map((stop: any) => (
              <div
                key={stop.originalIndex}
                className={`border-2 rounded-lg p-4 ${getStatusColor(stop.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(stop.status)}
                      <h3 className="font-bold text-gray-900">
                        {stop.customer}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-white border">
                        {getStatusText(stop.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{stop.address}</span>
                      </div>
                      {stop.weight && (
                        <div className="flex items-center gap-2">
                          <Weight className="w-4 h-4 text-gray-400" />
                          <span>{stop.weight} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {stop.status !== 'pending' && (
                  <button
                    onClick={() => handleResetSingleOrder(stop)}
                    disabled={processing !== null}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {processing === `reset-${stop.originalIndex}` ? (
                      <>🔄 Bezig...</>
                    ) : (
                      <>🔄 Terugzetten naar Planning</>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
          <button
            onClick={handleResetAllOrders}
            disabled={processing !== null}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {processing === 'reset-all' ? (
              <>⏳ Bezig met resetten...</>
            ) : (
              <>🔄 RESET HELE ROUTE (Alle orders terug naar planning)</>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  )
}
