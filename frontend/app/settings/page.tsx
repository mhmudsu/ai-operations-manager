'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { DashboardHeader } from '@/components/dashboard/Header'
import { api } from '@/lib/api-client'
import { Settings as SettingsIcon, Mail, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const [company, setCompany] = useState<any>(null)
  const [emailDomain, setEmailDomain] = useState('')
  const [emailWhitelist, setEmailWhitelist] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    if (!user) return
    fetchCompanySettings()
  }, [user])

  const fetchCompanySettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/company/settings`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('routegenius_token')
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCompany(data)
        setEmailDomain(data.email_domain || '')
        
        // Parse email_whitelist - handle both array and JSON string
        let whitelist = data.email_whitelist || []
        if (typeof whitelist === 'string') {
          try {
            whitelist = JSON.parse(whitelist)
          } catch (e) {
            whitelist = []
          }
        }
        setEmailWhitelist(Array.isArray(whitelist) ? whitelist : [])
        
        setEmailEnabled(data.email_enabled !== false)
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/company/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('routegenius_token')
        },
        body: JSON.stringify({
          email_domain: emailDomain,
          email_whitelist: emailWhitelist,
          email_enabled: emailEnabled
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Instellingen opgeslagen!' })
        fetchCompanySettings()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.detail || 'Opslaan mislukt' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const addEmail = () => {
    if (newEmail && !emailWhitelist.includes(newEmail)) {
      setEmailWhitelist([...emailWhitelist, newEmail])
      setNewEmail('')
    }
  }

  const removeEmail = (email: string) => {
    setEmailWhitelist(emailWhitelist.filter(e => e !== email))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader />
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Instellingen</h1>
          </div>
          <p className="text-gray-600">Configureer je email automatisering en voorkeuren</p>
        </div>

        {/* Email Automation Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Email Automatisering</h2>
          </div>

          {/* Email Domain */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Domein
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="demo"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">@orders.routegenius.nl</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              📧 Jouw unieke email adres: <span className="font-mono font-semibold text-blue-600">{emailDomain || 'jouw-domein'}@orders.routegenius.nl</span>
            </p>
          </div>

          {/* Enable/Disable */}
          <div className="mb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Email automatisering inschakelen
              </span>
            </label>
            <p className="text-sm text-gray-500 ml-8">
              Wanneer ingeschakeld worden emails naar jouw adres automatisch verwerkt tot orders
            </p>
          </div>

          {/* Email Whitelist */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Toegestane Afzenders (Whitelist)
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Alleen emails van deze adressen worden verwerkt. Laat leeg om alle afzenders toe te staan.
            </p>

            {/* Current whitelist */}
            {Array.isArray(emailWhitelist) && emailWhitelist.length > 0 && (
              <div className="space-y-2 mb-3">
                {emailWhitelist.map((email, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="flex-1 text-sm font-mono">{email}</span>
                    <button
                      onClick={() => removeEmail(email)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new email */}
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                placeholder="manager@bedrijf.nl"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Toevoegen
              </button>
            </div>
          </div>

          {/* Status message */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !emailDomain}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Opslaan...' : 'Instellingen Opslaan'}
          </button>
        </div>

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">📧 Hoe Email Automatisering te gebruiken</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li><strong>1.</strong> Configureer je email domein hierboven (bijv. "demo")</li>
            <li><strong>2.</strong> Voeg toegestane afzender emails toe aan whitelist (optioneel maar aanbevolen)</li>
            <li><strong>3.</strong> Email CSV bestanden naar: <span className="font-mono bg-white px-2 py-1 rounded">{emailDomain || 'jouw-domein'}@orders.routegenius.nl</span></li>
            <li><strong>4.</strong> Orders worden automatisch aangemaakt en klaar voor optimalisatie!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
