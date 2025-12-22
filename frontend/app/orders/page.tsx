import { Package, Plus } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const orders = [
    {
      id: '1',
      customer_name: 'Albert Heijn Utrecht',
      pickup_address: 'Depot Eindhoven',
      delivery_address: 'Amsterdamsestraatweg 123, Utrecht',
      weight_kg: 500,
      status: 'in-progress'
    },
    {
      id: '2',
      customer_name: 'Jumbo Haarlem',
      pickup_address: 'Depot Eindhoven',
      delivery_address: 'Grote Markt 45, Haarlem',
      weight_kg: 300,
      status: 'in-progress'
    },
    {
      id: '3',
      customer_name: 'Lidl Rotterdam',
      pickup_address: 'Depot Eindhoven',
      delivery_address: 'Coolsingel 67, Rotterdam',
      weight_kg: 450,
      status: 'in-progress'
    },
    {
      id: '4',
      customer_name: 'Plus Amsterdam',
      pickup_address: 'Depot Eindhoven',
      delivery_address: 'Dam 89, Amsterdam',
      weight_kg: 250,
      status: 'completed'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">AI Operations</h1>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
            </Link>
            
            <Link href="/orders/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-5 h-5" />
              Nieuwe Order
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-600">Beheer al je transport orders</p>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Klant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gewicht</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.pickup_address} → {order.delivery_address}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.weight_kg} kg</td>
                  <td className="px-6 py-4">
                    <span className={order.status === 'completed' ? 'px-2 py-1 text-xs rounded-full bg-green-50 text-green-700' : 'px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700'}>
                      {order.status === 'in-progress' ? 'In behandeling' : 'Compleet'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}