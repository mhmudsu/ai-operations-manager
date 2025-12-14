import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: number
}

export function DashboardCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend 
}: DashboardCardProps) {
  return (
    <div className="
      relative overflow-hidden
      bg-white rounded-2xl
      border border-gray-200
      p-6
      transition-all duration-200
      hover:shadow-medium hover:border-brand-300
      group
    ">
      {/* Gradient accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-50 to-transparent rounded-full blur-3xl opacity-50" />
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            {title}
          </span>
          <div className="p-2 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors">
            <Icon className="w-5 h-5 text-brand-600" />
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-gray-900">
            {value}
          </h3>
          {trend !== undefined && (
            <span className={`text-sm font-medium ${
              trend > 0 ? 'text-success-600' : 'text-danger-600'
            }`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
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