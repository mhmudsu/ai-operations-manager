'use client'

import { useState, useEffect } from 'react'
import { Settings, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [company, setCompany] = useState({
    id: '',
    name: '',
    depot_address: '',
    depot_city: '',
    depot_postal_code: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    loadCompanySettings()
  }, [])

  async function loadCompanySettings() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', '52fff84f-0853-413b-bd3c-6ac2bb1a71b9')
        .single()
      
      if (error) throw error
      
      console.log('Loaded company settings:', data)
      setCompany({
        id: data.id,
        name: data.name || '',
        depot_address: data.depot_address || '',
        depot_city: data.depot_city || '',
        depot_postal_code: data.depot_postal_code || '',
        phone: data.phone || '',
        email: data.email || ''
      })
    } catch (error) {
      console.error('Failed to load company settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('companies')
        .update({
          name: company.name,
          depot_address: company.depot_address,
          depot_city: company.depot_city,
          depot_postal_code: company.depot_postal_code,
          phone: company.phone,
          email: company.email
        })
        .eq('id', company.id)
      
      if (error) throw error
      
      alert('Instellingen opgeslagen!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Fout bij opslaan. Probeer opnieuw.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <button className="p-2 hover:bg-gray-200 rounded-lg">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Bedrijfsinstellingen</h1>
                <p className="text-gray-500">Configureer je depot en bedrijfsgegevens</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-xl border p-8 space-y-8">
          {/* Bedrijfsgegevens */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Bedrijfsgegevens</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrijfsnaam *
                </label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany({...company, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Mijn Transport BV"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefoon
                  </label>
                  <input
                    type="text"
                    value={company.phone}
                    onChange={(e) => setCompany({...company, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="+31 20 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={company.email}
                    onChange={(e) => setCompany({...company, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="info@bedrijf.nl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Depot Locatie */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-2">Depot Locatie</h2>
            <p className="text-sm text-gray-600 mb-4">
              Dit adres wordt gebruikt als startpunt voor alle routes
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Depot Adres *
                </label>
                <input
                  type="text"
                  value={company.depot_address}
                  onChange={(e) => setCompany({...company, depot_address: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Industrieweg 123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={company.depot_postal_code}
                    onChange={(e) => setCompany({...company, depot_postal_code: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="1234 AB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stad *
                  </label>
                  <input
                    type="text"
                    value={company.depot_city}
                    onChange={(e) => setCompany({...company, depot_city: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="Rotterdam"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {company.depot_address && company.depot_city && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-1">
                Depot volledig adres:
              </p>
              <p className="text-blue-900">
                {company.depot_address}, {company.depot_postal_code} {company.depot_city}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
