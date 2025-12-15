'use client'

import { Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const orderData = {
      customer_name: formData.get('customer_name'),
      customer_phone: formData.get('customer_phone'),
      pickup_address: formData.get('pickup_address'),
      delivery_address: formData.get('delivery_address'),
      weight_kg: parseInt(formData.get('weight_kg') as string),
      packages: parseInt(formData.get('packages') as string),
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Order aangemaakt:', orderData)
    router.push('/orders')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-400 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Nieuwe Order</h1>
              <p className="text-xs text-gray-500">Voeg transport order toe</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Details</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Klant Naam</label>
              <input type="text" name="customer_name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="Albert Heijn Utrecht" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefoon</label>
              <input type="tel" name="customer_phone" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="+31 6 12345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ophaal Adres</label>
              <input type="text" name="pickup_address" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="Depot Eindhoven" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aflever Adres</label>
              <input type="text" name="delivery_address" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="Dam 123, Amsterdam" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gewicht (kg)</label>
              <input type="number" name="weight_kg" required min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pakketjes</label>
              <input type="number" name="packages" required min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="20" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium">
              {loading ? 'Bezig...' : 'Order Aanmaken'}
            </button>
            <Link href="/orders" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Annuleren
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}