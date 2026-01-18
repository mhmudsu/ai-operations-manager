import { X, Package, MapPin, Weight, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface SkippedStopsModalProps {
  route: any
  onClose: () => void
  onActionComplete: () => void
}

export function SkippedStopsModal({ route, onClose, onActionComplete }: SkippedStopsModalProps) {
  const [processing, setProcessing] = useState<string | null>(null)

  const skippedStops = (route.stops || [])
    .map((stop: any, index: number) => ({ ...stop, originalIndex: index }))
    .filter((stop: any) => stop.status === 'skipped')

  const handleReschedule = async (stop: any) => {
    if (!confirm(`Order van ${stop.customer} herplannen?\n\nDe order wordt teruggezet naar "pending" en kan in een nieuwe route worden geplaatst.`)) {
      return
    }

    setProcessing(`reschedule-${stop.originalIndex}`)
    
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
        throw new Error(error.detail || 'Herplannen mislukt')
      }

      alert('✅ Order succesvol hergepland!\n\nDe order staat nu weer in de orders lijst en kan in een nieuwe route worden geplaatst.')
      onActionComplete()
      onClose()
    } catch (error: any) {
      alert(`❌ Fout bij herplannen: ${error.message}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleDelete = async (stop: any) => {
    if (!confirm(`Order van ${stop.customer} verwijderen?\n\n⚠️ LET OP: Deze actie kan niet ongedaan worden gemaakt!\n\nDe order wordt definitief geannuleerd.`)) {
      return
    }

    setProcessing(`delete-${stop.originalIndex}`)
    
    try {
      const token = localStorage.getItem('jwt_token')
      const response = await fetch(`https://routeplan-production.up.railway.app/api/routes/${route.id}/stops/${stop.originalIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Verwijderen mislukt')
      }

      alert('✅ Order succesvol verwijderd!')
      onActionComplete()
      onClose()
    } catch (error: any) {
      alert(`❌ Fout bij verwijderen: ${error.message}`)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              ⚠️ Niet-uitgevoerde Orders
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Route {route.id} - {skippedStops.length} order(s) niet uitgevoerd
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
          {skippedStops.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Geen niet-uitgevoerde orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {skippedStops.map((stop: any) => (
                <div
                  key={stop.originalIndex}
                  className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-red-600" />
                        <h3 className="font-bold text-gray-900">
                          {stop.customer}
                        </h3>
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

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReschedule(stop)}
                      disabled={processing !== null}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      {processing === `reschedule-${stop.originalIndex}` ? (
                        <>🔄 Bezig...</>
                      ) : (
                        <>🔄 Herplannen</>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(stop)}
                      disabled={processing !== null}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      {processing === `delete-${stop.originalIndex}` ? (
                        <>⏳ Bezig...</>
                      ) : (
                        <>🗑️ Verwijderen</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
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
