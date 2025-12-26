import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  format?: 'currency' | 'percentage' | 'number'
  icon?: React.ReactNode
}

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  format = 'number',
  icon 
}: MetricCardProps) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'number':
      default:
        return val.toLocaleString('pt-BR')
    }
  }

  return (
    <Card variant="elevated" className="hover:border-primary-red/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && <div className="text-white/70">{icon}</div>}
            <h3 className="text-white/70 text-sm font-medium">{title}</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {formatValue(value)}
          </p>
          {subtitle && (
            <p className="text-white/60 text-xs">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}



