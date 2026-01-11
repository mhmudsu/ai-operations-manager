'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { api } from '@/lib/api-client'
import { TrendingUp, Users, MapPin, Award, DollarSign } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const [routesHistory, setRoutesHistory] = useState<any[]>([])
  const [driverPerformance, setDriverPerformance] = useState<any[]>([])
  const [savingsTimeline, setSavingsTimeline] = useState<any[]>([])
  const [period, setPeriod] = useState('month')
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setLoadingData(true)
        const [historyData, performanceData, timelineData] = await Promise.all([
          api.getRoutesHistory({ limit: 50 }),
          api.getDriverPerformance(period),
          api.getSavingsTimeline(period)
        ])
        
        setRoutesHistory(historyData.routes || [])
        setDriverPerformance(performanceData.drivers || [])
        setSavingsTimeline(timelineData.timeline || [])
      } catch (err: any) {
        console.error('Error fetching analytics:', err)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user, period])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  // Calculate totals for summary cards
  const totalSavings = savingsTimeline.reduce((sum, day) => sum + day.savings, 0)
  const totalDistance = savingsTimeline.reduce((sum, day) => sum + day.distance, 0)
  const totalRoutes = savingsTimeline.reduce((sum, day) => sum + day.routes, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & History</h1>
            <p className="text-gray-600">Performance insights en route geschiedenis</p>
          </div>
          
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Deze week</option>
            <option value="month">Deze maand</option>
            <option value="3months">3 maanden</option>
            <option value="6months">6 maanden</option>
            <option value="12months">12 maanden</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Totale Besparingen</p>
                <p className="text-2xl font-bold text-gray-900">€{totalSavings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Totale Afstand</p>
                <p className="text-2xl font-bold text-gray-900">{totalDistance.toFixed(0)} km</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Totale Routes</p>
                <p className="text-2xl font-bold text-gray-900">{totalRoutes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Savings Over Time */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Besparingen Over Tijd</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.getDate() + '/' + (date.getMonth() + 1)
                  }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => '€' + value}
                  labelFormatter={(label) => {
                    const date = new Date(label)
                    return date.toLocaleDateString('nl-NL')
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Besparingen (€)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Driver Performance Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">KM per Chauffeur</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={driverPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="driver_name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value: any) => value + ' km'} />
                <Legend />
                <Bar dataKey="total_distance_km" fill="#3b82f6" name="Totale KM" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Driver Performance Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Driver Performance</h2>
          </div>

          {driverPerformance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Geen data beschikbaar</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chauffeur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Routes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Totaal KM</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Besparingen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {driverPerformance.map((driver, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {index === 0 && <Award className="w-5 h-5 text-yellow-500 inline" />}
                        {index === 1 && <Award className="w-5 h-5 text-gray-400 inline" />}
                        {index === 2 && <Award className="w-5 h-5 text-orange-600 inline" />}
                        <span className="ml-2 font-medium">{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {driver.driver_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {driver.total_routes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {driver.total_distance_km} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                        €{driver.total_savings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          driver.efficiency >= 80 ? 'bg-green-100 text-green-800' :
                          driver.efficiency >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {driver.efficiency}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Routes History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Routes Geschiedenis</h2>
          </div>

          {routesHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Geen routes gevonden</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chauffeur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voertuig</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stops</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Afstand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Besparing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {routesHistory.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {route.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {route.driver_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {route.vehicle_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {route.stops_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {route.distance_km} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        €{route.savings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          route.status === 'completed' ? 'bg-green-100 text-green-800' :
                          route.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {route.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
