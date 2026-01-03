import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; isPositive: boolean } | null
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

export function DashboardCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  color = 'blue'
}: DashboardCardProps) {
  const colorClasses = {
    blue: 'from-blue-50 to-transparent bg-blue-50 group-hover:bg-blue-100 text-blue-600',
    green: 'from-green-50 to-transparent bg-green-50 group-hover:bg-green-100 text-green-600',
    purple: 'from-purple-50 to-transparent bg-purple-50 group-hover:bg-purple-100 text-purple-600',
    orange: 'from-orange-50 to-transparent bg-orange-50 group-hover:bg-orange-100 text-orange-600',
  }
  
  const [gradientClass, bgClass, iconClass] = colorClasses[color].split(' ')
  
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:border-blue-300 group">
      {/* Gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientClass} rounded-full blur-3xl opacity-50`} />
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            {title}
          </span>
          <div className={`p-2 ${bgClass} rounded-lg transition-colors`}>
            <Icon className={`w-5 h-5 ${iconClass}`} />
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-gray-900">
            {value}
          </h3>
          {trend && (
            <span className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
