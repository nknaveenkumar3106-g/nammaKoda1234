import { useState, useEffect } from 'react'

export default function StatCard({ title, value, change, changeType, icon, color = "primary", trend = [] }) {
  const [animatedValue, setAnimatedValue] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success'
    if (changeType === 'negative') return 'text-error'
    return 'text-base-content'
  }

  const getChangeIcon = () => {
    if (changeType === 'positive') return '↗'
    if (changeType === 'negative') return '↘'
    return '→'
  }

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-base-content/70 mb-1">{title}</h3>
            <div className="text-3xl font-bold text-base-content mb-2">
              {typeof animatedValue === 'number' ? animatedValue.toLocaleString() : animatedValue}
            </div>
            {change && (
              <div className={`text-sm flex items-center gap-1 ${getChangeColor()}`}>
                <span>{getChangeIcon()}</span>
                <span>{change}</span>
                <span className="text-base-content/50">vs last period</span>
              </div>
            )}
          </div>
          <div className={`text-4xl opacity-20 text-${color}`}>
            {icon}
          </div>
        </div>
        
        {/* Mini trend line */}
        {trend.length > 0 && (
          <div className="mt-4">
            <div className="flex items-end gap-1 h-8">
              {trend.map((point, index) => (
                <div
                  key={index}
                  className="bg-primary opacity-60 rounded-sm flex-1"
                  style={{ height: `${(point / Math.max(...trend)) * 100}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
