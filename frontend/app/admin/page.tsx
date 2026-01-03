'use client'

import { useEffect, useState } from 'react'
import { Truck, Package, DollarSign, TrendingUp } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { DashboardHeader } from '@/components/dashboard/Header'
import { useAuth } from '@/components/auth/AuthProvider'
import { api } from '@/lib/api-client'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const ordersData = await api.getOrders('pending')
        setOrders(ordersData.orders || [])
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const pendingOrders = orders.length
  const totalWeight = orders.reduce((sum: number, order: any) => sum + (order.weight_kg || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
            <p className="text-sm text-gray-600">Real-time dashboard for {user?.company_name}</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all hover:shadow">
              📤 Upload CSV
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow">
              + Nieuwe Order
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Pending Orders"
            value={pendingOrders}
            icon={Package}
            trend={null}
            color="blue"
          />
          <DashboardCard
            title="Total Weight"
            value={`${totalWeight} kg`}
            icon={TrendingUp}
            trend={null}
            color="green"
          />
          <DashboardCard
            title="Active Routes"
            value="0"
            icon={Truck}
            trend={null}
            color="purple"
          />
          <DashboardCard
            title="Savings Today"
            value="€0"
            icon={DollarSign}
            trend={null}
            color="orange"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Orders ({pendingOrders})
              </h3>
              {pendingOrders > 0 && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow">
                  🤖 Optimaliseer Routes
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload a CSV or create your first order to get started
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow">
                  + Create Order
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.weight_kg} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.priority >= 4 ? 'bg-red-100 text-red-800' :
                          order.priority >= 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.priority >= 4 ? 'Hoog' : order.priority >= 2 ? 'Normaal' : 'Laag'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
