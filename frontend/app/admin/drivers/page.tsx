'use client'

import { useState, useEffect } from 'react'
import { User, Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    license_type: 'C',
    status: 'active'
  })

  useEffect(() => {
    loadDrivers()
  }, [])

  async function loadDrivers() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      console.log('Loaded drivers:', data)
      setDrivers(data || [])
    } catch (error) {
      console.error('Failed to load drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleDriverStatus(driverId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      
      const { error } = await supabase
        .from('drivers')
        .update({ status: newStatus })
        .eq('id', driverId)
      
      if (error) throw error
      
      await loadDrivers()
    } catch (error) {
      console.error('Failed to update driver status:', error)
    }
  }

  async function addDriver() {
    try {
      const { error } = await supabase
        .from('drivers')
        .insert([{
          name: newDriver.name,
          phone: newDriver.phone,
          license_type: newDriver.license_type,
          status: newDriver.status,
          company_id: '52fff84f-0853-413b-bd3c-6ac2bb1a71b9'
        }])
      
      if (error) throw error
      
      setShowAddModal(false)
      setNewDriver({
        name: '',
        phone: '',
        license_type: 'C',
        status: 'active'
      })
      
      await loadDrivers()
    } catch (error) {
      console.error('Failed to add driver:', JSON.stringify(error, null, 2))
    }
  }

  async function deleteDriver(driverId: string) {
    if (!confirm('Weet je zeker dat je deze chauffeur wilt verwijderen?')) return
    
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId)
      
      if (error) throw error
      
      await loadDrivers()
    } catch (error) {
      console.error('Failed to delete driver:', error)
    }
  }

  const activeDrivers = drivers.filter(d => d.status === 'active')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading drivers...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <button className="p-2 hover:bg-gray-200 rounded-lg">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Chauffeurs</h1>
                <p className="text-gray-500">{activeDrivers.length} actief van {drivers.length} totaal</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nieuwe Chauffeur
          </button>
        </div>

        {/* Drivers Table */}
        <div className="bg-white rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefoon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rijbewijs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{driver.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{driver.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{driver.license_type || 'C'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleDriverStatus(driver.id, driver.status)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          driver.status === 'active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {driver.status === 'active' ? 'Actief' : 'Inactief'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteDriver(driver.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Driver Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Nieuwe Chauffeur</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
                  <input
                    type="text"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Voornaam Achternaam"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
                  <input
                    type="text"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="+31612345678"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rijbewijs</label>
                  <select
                    value={newDriver.license_type}
                    onChange={(e) => setNewDriver({...newDriver, license_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="C">C - Vrachtwagen</option>
                    <option value="CE">CE - Vrachtwagen met aanhanger</option>
                    <option value="B">B - Bestelbus</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={addDriver}
                  disabled={!newDriver.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
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
