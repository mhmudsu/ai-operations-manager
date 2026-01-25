'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { DashboardHeader } from '@/components/dashboard/Header'
import { api } from '@/lib/api-client'
import { Users, Plus, Trash2, Phone, Mail, Edit2 } from 'lucide-react'

export default function DriversPage() {
  const { user, loading } = useAuth()
  const [drivers, setDrivers] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState<any>(null)
  // Toggle driver availability
  const toggleDriverAvailability = async (driverId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drivers/${driverId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ is_available: !currentStatus }),
      })

      if (response.ok) {
        setDrivers(prev => prev.map(d => 
          d.id === driverId ? { ...d, is_available: !currentStatus } : d
        ))
      } else {
        alert("Fout bij het updaten van chauffeur status")
      }
    } catch (error) {
      console.error("Error toggling driver:", error)
      alert("Fout bij het updaten van chauffeur status")
    }
  }
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchDrivers()
  }, [user])

  const fetchDrivers = async () => {
    try {
      setLoadingData(true)
      const data = await api.getDrivers()
      setDrivers(data.drivers || [])
    } catch (err) {
      console.error('Error fetching drivers:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const openAddModal = () => {
    setEditingDriver(null)
    setFormData({ name: '', phone: '', email: '' })
    setShowModal(true)
  }

  const openEditModal = (driver: any) => {
    setEditingDriver(driver)
    setFormData({ 
      name: driver.name, 
      phone: driver.phone || '', 
      email: driver.email || '' 
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (editingDriver) {
        await api.updateDriver(editingDriver.id, formData)
      } else {
        await api.createDriver(formData)
      }
      setFormData({ name: '', phone: '', email: '' })
      setShowModal(false)
      setEditingDriver(null)
      fetchDrivers()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (driverId: number) => {
    if (!confirm('Weet je zeker dat je deze chauffeur wilt verwijderen?')) return
    try {
      await api.deleteDriver(driverId)
      fetchDrivers()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chauffeurs</h1>
            <p className="text-gray-600">Beheer je chauffeurs en hun gegevens</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nieuwe Chauffeur
          </button>
        </div>

        {/* Drivers List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {drivers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Geen chauffeurs</h3>
              <p className="text-gray-600 mb-4">Voeg je eerste chauffeur toe om te beginnen</p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Voeg Chauffeur Toe
              </button>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefoon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acties</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {driver.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {driver.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleDriverAvailability(driver.id, driver.is_available)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          driver.is_available ? "bg-green-500" : "bg-gray-300"
                        }`}
                        title={driver.is_available ? "Actief - klik om uit te schakelen" : "Niet actief - klik om te activeren"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            driver.is_available ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(driver)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Bewerk chauffeur"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Verwijder chauffeur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDriver ? 'Bewerk Chauffeur' : 'Nieuwe Chauffeur'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Jan de Vries"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Nummer *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+31612345678"
                />
                <p className="text-xs text-gray-500 mt-1">📱 Voor route notificaties</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="jan@example.com"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingDriver(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={saving}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
