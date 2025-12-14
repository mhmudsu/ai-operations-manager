interface LiveRouteCardProps {
  routeNumber: number
  driver: string
  completed: number
  total: number
  nextStop: string
  eta: number
  status: 'on-time' | 'delayed' | 'completed'
}

export function LiveRouteCard({ 
  routeNumber, 
  driver, 
  completed, 
  total, 
  nextStop, 
  eta,
  status 
}: LiveRouteCardProps) {
  const progress = (completed / total) * 100
  
  const statusStyles = {
    'on-time': 'bg-success-50 text-success-700 border-success-200',
    'delayed': 'bg-warning-50 text-warning-700 border-warning-200',
    'completed': 'bg-brand-50 text-brand-700 border-brand-200',
  }
  
  const statusLabels = {
    'on-time': 'Op schema',
    'delayed': 'Vertraging',
    'completed': 'Compleet',
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-brand-300 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">
              Route {routeNumber}
            </h4>
            <span className="text-sm text-gray-500">
              · {driver}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Volgende: {nextStop}
          </p>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {completed} van {total} stops
          </span>
          <span className="font-medium text-brand-600">
            {eta} min
          </span>
        </div>
        
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: progress + '%' }}
          />
        </div>
      </div>
    </div>
  )
}