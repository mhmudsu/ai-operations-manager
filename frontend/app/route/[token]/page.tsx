'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getRouteByToken } from '@/lib/api'
import { MapPin, Navigation, Copy, CheckCircle } from 'lucide-react'
import { Camera, Edit3, Check, X } from 'lucide-react'
import { useRef } from 'react'

const [completedStops, setCompletedStops] = useState<Set<number>>(new Set())
const [activeStop, setActiveStop] = useState<number | null>(null)
const [photos, setPhotos] = useState<{[key: number]: string}>({})
const [signatures, setSignatures] = useState<{[key: number]: string}>({})
const [notes, setNotes] = useState<{[key: number]: string}>({})
const fileInputRef = useRef<HTMLInputElement>(null)

export default function DriverRoutePage() {
  const params = useParams()
  const token = params.token as string
  const [route, setRoute] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadRoute()
  }, [token])

  async function loadRoute() {
  try {
    // TEST DATA - later vervangen met echte API call
    if (token === 'test123abc') {
      setRoute({
        route_date: '2025-12-11',
        total_distance_km: 156,
        total_time_minutes: 165,
        fuel_cost_eur: 181,
        orders: [
          {
            sequence: 1,
            orders: {
              customer_name: 'Bakkerij Amsterdam',
              address: 'Damrak 1, Amsterdam',
              weight_kg: 50
            }
          },
          {
            sequence: 2,
            orders: {
              customer_name: 'Restaurant Utrecht',
              address: 'Oudegracht 50, Utrecht',
              weight_kg: 30
            }
          },
          {
            sequence: 3,
            orders: {
              customer_name: 'Winkel Den Haag',
              address: 'Lange Voorhout 40, Den Haag',
              weight_kg: 40
            }
          }
        ]
      })
    } else {
      // Real API call
      const data = await getRouteByToken(token)
      setRoute(data)
    }
  } catch (error) {
    console.error('Error loading route:', error)
  } finally {
    setLoading(false)
  }
}

  function openGoogleMaps() {
    if (!route?.orders) return
    const addresses = route.orders.map((stop: any) => 
      encodeURIComponent(stop.orders.address)
    )
    const url = `https://www.google.com/maps/dir/${addresses.join('/')}`
    window.open(url, '_blank')
  }

  function copyAddresses() {
    if (!route?.orders) return
    const text = route.orders
      .map((stop: any, i: number) => 
        `${stop.sequence}. ${stop.orders.customer_name} - ${stop.orders.address}`
      )
      .join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePhotoUpload(stopSequence: number, event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    setPhotos(prev => ({ ...prev, [stopSequence]: e.target?.result as string }))
  }
  reader.readAsDataURL(file)
}

function completeStop(stopSequence: number) {
  setCompletedStops(prev => new Set([...prev, stopSequence]))
  setActiveStop(null)
  // TODO: Upload to Supabase
  console.log('Stop completed:', {
    sequence: stopSequence,
    photo: photos[stopSequence],
    signature: signatures[stopSequence],
    notes: notes[stopSequence]
  })
}

function toggleStopDetails(stopSequence: number) {
  setActiveStop(activeStop === stopSequence ? null : stopSequence)
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Route laden...</p>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Route niet gevonden</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">👋 Hallo chauffeur!</h1>
              <p className="text-gray-600">{new Date(route.route_date).toLocaleDateString('nl-NL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{route.orders?.length || 0}</div>
              <div className="text-sm text-gray-500">stops</div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Info */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{route.total_distance_km?.toFixed(0)} km</div>
            <div className="text-sm text-gray-500">Totale afstand</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{Math.floor((route.total_time_minutes || 0) / 60)}u {(route.total_time_minutes || 0) % 60}m</div>
            <div className="text-sm text-gray-500">Geschatte tijd</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">€{route.fuel_cost_eur?.toFixed(0)}</div>
            <div className="text-sm text-gray-500">Brandstof</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={openGoogleMaps}
            className="bg-blue-600 text-white rounded-xl py-4 px-6 font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Navigation className="w-5 h-5" />
            Open in Google Maps
          </button>
          <button
            onClick={copyAddresses}
            className="bg-white text-gray-900 rounded-xl py-4 px-6 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm border"
          >
            {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Gekopieerd!' : 'Kopieer adressen'}
          </button>
        </div>

        {/* Stops List */}
<div className="space-y-3">
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    capture="environment"
    className="hidden"
    onChange={(e) => {
      if (activeStop) handlePhotoUpload(activeStop, e)
    }}
  />
  
  {route.orders?.map((stop: any) => {
    const isCompleted = completedStops.has(stop.sequence)
    const isActive = activeStop === stop.sequence
    
    return (
      <div 
        key={stop.sequence} 
        className={`bg-white rounded-xl shadow-sm border transition-all ${
          isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100'
        }`}
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-500' : 'bg-blue-100'
              }`}>
                {isCompleted ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-blue-600 font-bold">{stop.sequence}</span>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                  {stop.orders.customer_name}
                </h3>
                {isCompleted && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Afgerond
                  </span>
                )}
              </div>
              
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{stop.orders.address}</p>
              </div>
              
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span>📦 {stop.orders.weight_kg} kg</span>
              </div>
            </div>
          </div>
          
          {!isCompleted && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => toggleStopDetails(stop.sequence)}
                className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors"
              >
                {isActive ? 'Sluiten' : 'Afronden'}
              </button>
            </div>
          )}
          
          {isActive && !isCompleted && (
            <div className="mt-4 space-y-3 pt-4 border-t">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📸 Foto bezorging
                </label>
                <button
                  onClick={() => {
                    setActiveStop(stop.sequence)
                    fileInputRef.current?.click()
                  }}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  {photos[stop.sequence] ? (
                    <img 
                      src={photos[stop.sequence]} 
                      alt="Delivery proof" 
                      className="w-full h-48 object-cover rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Camera className="w-8 h-8" />
                      <span>Foto maken</span>
                    </div>
                  )}
                </button>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Notities (optioneel)
                </label>
                <textarea
                  value={notes[stop.sequence] || ''}
                  onChange={(e) => setNotes(prev => ({ ...prev, [stop.sequence]: e.target.value }))}
                  placeholder="Bijv: Afgeleverd bij buren, deur 2..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              {/* Complete Button */}
              <button
                onClick={() => completeStop(stop.sequence)}
                className="w-full bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Bevestig afronding
              </button>
            </div>
          )}
        </div>
      </div>
    )
  })}
</div>