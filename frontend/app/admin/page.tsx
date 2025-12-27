'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Plus, Package, Truck, TrendingUp, Navigation, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
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

  // Load orders from Supabase on mount
  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error loading orders:', error)
        throw error
      }
      
      console.log('Loaded orders from Supabase:', data)
      setOrders(data || [])
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleOptimizeRoutes() {
    setOptimizing(true)
    
    try {
      // Call Railway backend to optimize routes
      const response = await fetch('https://routeplan-production.up.railway.app/api/optimize-routes-from-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: '52fff84f-0853-413b-bd3c-6ac2bb1a71b9',
          start_address: 'Depot Eindhoven'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setRoutes([result.route])
        await loadOrders() // Reload orders to see status updates
      }
    } catch (error) {
      console.error('Route optimization failed:', error)
    } finally {
      setOptimizing(false)
    }
  }

  async function addNewOrder() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_name: newOrder.customer_name,
          delivery_address: newOrder.delivery_address,
          weight_kg: newOrder.weight_kg,
          priority: newOrder.priority,
          delivery_date: newOrder.delivery_date,
          status: 'pending',
          customer_phone: '+31612345678',
          pickup_address: 'Depot Eindhoven'
        }])
        .select()
      
      if (error) throw error
      
      setShowNewOrderModal(false)
      setNewOrder({
        customer_name: '',
        delivery_address: '',
        weight_kg: 0,
        priority: 1,
        delivery_date: new Date().toISOString().split('T')[0]
      })
      
      await loadOrders()
    } catch (error) {
      console.error('Error adding order:', error)
    }
  }

  function handleCSVUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      
      const newOrders = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        return {
          customer_name: values[0] || '',
          delivery_address: values[1] || '',
          weight_kg: parseFloat(values[2]) || 0,
          priority: parseInt(values[3]) || 1,
          delivery_date: values[4] || new Date().toISOString().split('T')[0],
          status: 'pending',
          customer_phone: '+31612345678',
          pickup_address: 'Depot Eindhoven'
        }
      })
      
      try {
        const { error } = await supabase
          .from('orders')
          .insert(newOrders)
        
        if (error) throw error
        
        setUploadStatus(`✅ ${newOrders.length} orders uploaded!`)
        await loadOrders()
        
        setTimeout(() => setUploadStatus(''), 3000)
      } catch (error) {
        console.error('Error uploading CSV:', error)
        setUploadStatus('❌ Upload failed')
      }
    }
    
    reader.readAsText(file)
  }

  const pendingOrders = orders.filter((o: any) => o.status === 'pending')
  const totalWeight = orders.reduce((sum: number, o: any) => sum + (o.weight_kg || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">RouteGenius Admin</h1>
              <p className="text-gray-500">Demo Dashboard</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-50"
            >
              <Upload className="w-5 h-5" />
              Upload CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
            <button 
              onClick={() => setShowNewOrderModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nieuwe Order
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-lg">
            {uploadStatus}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Pending Orders</span>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold">{pendingOrders.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Weight</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold">{totalWeight} kg</div>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Active Routes</span>
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold">{routes.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Savings Today</span>
              <Navigation className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              €{routes.reduce((sum, r) => sum + (r.fuel_cost_eur || 0) * 0.5, 0).toFixed(0)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border mb-8">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Orders ({orders.length})</h2>
            <button 
              onClick={handleOptimizeRoutes}
              disabled={optimizing || pendingOrders.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              {optimizing ? 'Optimizing...' : 'Optimaliseer Routes'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Klant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adres</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gewicht</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioriteit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{order.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.delivery_address}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.weight_kg} kg</td>
                    <td className="px-6 py-4">
                      <span className={order.priority === 1 ? 'text-red-600 font-medium' : 'text-yellow-600'}>
                        {order.priority === 1 ? 'Hoog' : 'Normaal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.delivery_date || order.created_at).toLocaleDateString('nl-NL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {routes.length > 0 && (
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Geoptimaliseerde Routes ({routes.length})</h2>
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold">
                <Navigation className="w-5 h-5" />
                Verstuur naar Chauffeurs
              </button>
            </div>
            <div className="p-6 space-y-6">
              {routes.map((route, idx) => (
                <div key={idx} className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Route {idx + 1}</h3>
                      <p className="text-sm text-gray-600">Chauffeur: Piet van Dam</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Preview Route
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Stops</div>
                      <div className="text-2xl font-bold">{route.optimized_orders?.length || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Afstand</div>
                      <div className="text-2xl font-bold">{route.total_distance_km} km</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Tijd</div>
                      <div className="text-2xl font-bold">{Math.floor((route.total_time_minutes || 0) / 60)}u {(route.total_time_minutes || 0) % 60}m</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Brandstof</div>
                      <div className="text-2xl font-bold">€{route.fuel_cost_eur}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Bespaard!</div>
                      <div className="text-2xl font-bold text-green-600">€{Math.floor(route.fuel_cost_eur * 0.5)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showNewOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Nieuwe Order</h3>
                <button onClick={() => setShowNewOrderModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Klant</label>
                  <input
                    type="text"
                    value={newOrder.customer_name}
                    onChange={(e) => setNewOrder({...newOrder, customer_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Bedrijfsnaam"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bezorgadres</label>
                  <input
                    type="text"
                    value={newOrder.delivery_address}
                    onChange={(e) => setNewOrder({...newOrder, delivery_address: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Straat 123, Stad"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gewicht (kg)</label>
                    <input
                      type="number"
                      value={newOrder.weight_kg}
                      onChange={(e) => setNewOrder({...newOrder, weight_kg: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioriteit</label>
                    <select
                      value={newOrder.priority}
                      onChange={(e) => setNewOrder({...newOrder, priority: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
    </div>
  )
}
