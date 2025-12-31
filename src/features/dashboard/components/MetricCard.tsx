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
  relevance?: 'high' | 'medium' | 'low' // Relevância/volume da métrica
  heatLevel?: number // 0-1: 0 = frio (azul), 1 = quente (vermelho)
}

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  format = 'number',
  icon,
  relevance,
  heatLevel
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

  // Calcular cor baseado em relevância/volume
  const getCardColor = () => {
    if (heatLevel !== undefined) {
      // Interpolar entre azul (frio) e vermelho (quente)
      const red = Math.round(218 + (255 - 218) * heatLevel)
      const green = Math.round(0 + (0 - 0) * heatLevel)
      const blue = Math.round(161 + (40 - 161) * heatLevel)
      return `rgba(${red}, ${green}, ${blue}, 0.2)`
    }
    
    if (relevance === 'high') {
      return 'rgba(218, 0, 40, 0.2)' // Vermelho para alta relevância
    } else if (relevance === 'low') {
      return 'rgba(4, 42, 161, 0.2)' // Azul para baixa relevância
    }
    
    return undefined
  }

  const cardColor = getCardColor()
  const borderColor = cardColor ? cardColor.replace('0.2', '0.5') : undefined

  return (
    <Card 
      variant="elevated" 
      className="hover:border-white/20 transition-all"
      style={{
        backgroundColor: cardColor,
        borderColor: borderColor,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            {icon && <div className="text-white/50 text-xs">{icon}</div>}
            <h3 className="text-white/60 text-xs">{title}</h3>
          </div>
          <p className="text-xl text-white/90 mb-1">
            {formatValue(value)}
          </p>
          {subtitle && (
            <p className="text-white/50 text-xs">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs ${
              trend.isPositive ? 'text-green-400/80' : 'text-red-400/80'
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



