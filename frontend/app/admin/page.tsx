'use client'

import { useState, useRef } from 'react'
import { Upload, Plus, Package, Truck, TrendingUp, Navigation, X } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [orders, setOrders] = useState([
    {
      id: '1',
      customer_name: 'Albert Heijn Utrecht',
      delivery_address: 'Amsterdamsestraatweg 123, Utrecht',
      weight_kg: 500,
      priority: 1,
      delivery_date: '2025-12-28',
      status: 'pending'
    },
    {
      id: '2',
      customer_name: 'Jumbo Haarlem',
      delivery_address: 'Grote Markt 45, Haarlem',
      weight_kg: 300,
      priority: 2,
      delivery_date: '2025-12-28',
      status: 'pending'
    },
    {
      id: '3',
      customer_name: 'Lidl Rotterdam',
      delivery_address: 'Coolsingel 67, Rotterdam',
      weight_kg: 450,
      priority: 1,
      delivery_date: '2025-12-28',
      status: 'pending'
    }
  ])
  
  const [routes, setRoutes] = useState<any[]>([])
  const [optimizing, setOptimizing] = useState(false)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    delivery_address: '',
    weight_kg: 0,
    priority: 1,
    delivery_date: new Date().toISOString().split('T')[0]
  })

  function handleCSVUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').slice(1)
      
      const newOrders = lines
        .filter(line => line.trim())
        .map((line, index) => {
          const [order_id, customer_name, address, weight_kg, priority] = line.split(',')
          return {
            id: `csv-${Date.now()}-${index}`,
            customer_name: customer_name?.trim() || '',
            delivery_address: address?.trim() || '',
            weight_kg: parseInt(weight_kg?.trim() || '0'),
            priority: parseInt(priority?.trim() || '1'),
            delivery_date: new Date().toISOString().split('T')[0],
            status: 'pending'
          }
        })
      
      setOrders(prev => [...prev, ...newOrders])
      setUploadStatus(`✅ ${newOrders.length} orders toegevoegd!`)
      setTimeout(() => setUploadStatus(''), 3000)
    }
    reader.readAsText(file)
  }

  function addNewOrder() {
    const order = {
      id: `manual-${Date.now()}`,
      ...newOrder,
      status: 'pending'
    }
    setOrders(prev => [...prev, order])
    setNewOrder({
      customer_name: '',
      delivery_address: '',
      weight_kg: 0,
      priority: 1,
      delivery_date: new Date().toISOString().split('T')[0]
    })
    setShowNewOrderModal(false)
  }

  async function optimizeRoutes() {
    setOptimizing(true)
    
    setTimeout(() => {
      const optimizedRoutes = [
        {
          id: '1',
          route_number: 1,
          driver_name: 'Piet van Dam',
          total_distance_km: 156,
          total_time_minutes: 165,
          fuel_cost_eur: 181,
          savings_eur: 93,
          stops: 3,
          orders: pendingOrders,
          access_token: 'test123abc'
        }
      ]
      
      setRoutes(optimizedRoutes)
      setOptimizing(false)
    }, 2000)
  }

  function sendToDrivers() {
    const message = routes.map(r => 
      `✅ Route ${r.route_number} verstuurd naar ${r.driver_name}\n` +
      `📱 WhatsApp link: https://routegenius.app/route/${r.access_token}`
    ).join('\n\n')
    
    alert(`WhatsApp berichten verzonden!\n\n${message}\n\n(Twilio integratie komt in volgende stap)`)
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const totalWeight = pendingOrders.reduce((sum, o) => sum + o.weight_kg, 0)
  const totalSavings = routes.reduce((sum, r) => sum + (r.savings_eur || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">RouteGenius Admin</h1>
                <p className="text-xs text-gray-500">Demo Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSVUpload}
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Upload className="w-5 h-5" />
                Upload CSV
              </button>
              
              <button
                onClick={() => setShowNewOrderModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Nieuwe Order
              </button>
            </div>
          </div>
          
          {uploadStatus && (
            <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
              {uploadStatus}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Pending Orders</span>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{pendingOrders.length}</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Weight</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalWeight} kg</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Active Routes</span>
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{routes.length}</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Savings Today</span>
              <Navigation className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">€{totalSavings}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Orders ({pendingOrders.length})</h2>
            {pendingOrders.length > 0 && (
              <button
                onClick={optimizeRoutes}
                disabled={optimizing}
                className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                  optimizing 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {optimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Optimaliseren...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    Optimaliseer Routes
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Klant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adres</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gewicht</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioriteit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.delivery_address}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.weight_kg} kg</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.priority === 1 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {order.priority === 1 ? 'Hoog' : 'Normaal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.delivery_date).toLocaleDateString('nl-NL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {routes.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Geoptimaliseerde Routes ({routes.length})</h2>
              <button
                onClick={sendToDrivers}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
              >
                📱 Verstuur naar Chauffeurs
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {routes.map((route) => (
                <div key={route.id} className="border border-gray-200 rounded-lg p-5 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Route {route.route_number}</h3>
                      <p className="text-sm text-gray-600">Chauffeur: {route.driver_name}</p>
                    </div>
                    <Link
                      href={`/route/${route.access_token}`}
                      target="_blank"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      👁️ Preview Route
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{route.stops}</div>
                      <div className="text-sm text-gray-500">Stops</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{route.total_distance_km} km</div>
                      <div className="text-sm text-gray-500">Afstand</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.floor(route.total_time_minutes / 60)}u {route.total_time_minutes % 60}m
                      </div>
                      <div className="text-sm text-gray-500">Tijd</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">€{route.fuel_cost_eur}</div>
                      <div className="text-sm text-gray-500">Brandstof</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">€{route.savings_eur}</div>
                      <div className="text-sm text-gray-500">Bespaard!</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nieuwe Order Toevoegen</h3>
              <button onClick={() => setShowNewOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Klantnaam</label>
                <input
                  type="text"
                  value={newOrder.customer_name}
                  onChange={(e) => setNewOrder({...newOrder, customer_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Albert Heijn Utrecht"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bezorgadres</label>
                <input
                  type="text"
                  value={newOrder.delivery_address}
                  onChange={(e) => setNewOrder({...newOrder, delivery_address: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Damrak 1, Amsterdam"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gewicht (kg)</label>
                  <input
                    type="number"
                    value={newOrder.weight_kg}
                    onChange={(e) => setNewOrder({...newOrder, weight_kg: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioriteit</label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({...newOrder, priority: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>Hoog</option>
                    <option value={2}>Normaal</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bezorgdatum</label>
                <input
                  type="date"
                  value={newOrder.delivery_date}
                  onChange={(e) => setNewOrder({...newOrder, delivery_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={addNewOrder}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
