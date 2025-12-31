import { Card } from '@/components/ui/Card'
import { MarketingMetrics } from '../types'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface MarketingMetricsCardProps {
  metrics: MarketingMetrics
  title?: string
  className?: string
}

export const MarketingMetricsCard = ({ metrics, title = 'Métricas de Marketing', className = '' }: MarketingMetricsCardProps) => {
  const ctr = metrics.impressions > 0 ? (metrics.linkClicks / metrics.impressions) * 100 : 0
  const conversionRate = metrics.linkClicks > 0 ? (metrics.totalLeads / metrics.linkClicks) * 100 : 0
  const costPerLead = metrics.totalLeads > 0 ? metrics.investmentValue / metrics.totalLeads : 0
  const costPerClick = metrics.linkClicks > 0 ? metrics.investmentValue / metrics.linkClicks : 0

  return (
    <Card className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-white/60 text-sm">Investimento</p>
            <p className="text-white text-xl font-bold">{formatCurrency(metrics.investmentValue, 'BRL')}</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Impressões</p>
            <p className="text-white text-xl font-bold">{metrics.impressions.toLocaleString('pt-BR')}</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Cliques</p>
            <p className="text-white text-xl font-bold">{metrics.linkClicks.toLocaleString('pt-BR')}</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Leads Gerados</p>
            <p className="text-white text-xl font-bold">{metrics.totalLeads.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-white/60 text-sm">CTR</p>
            <p className="text-white text-xl font-bold">{ctr.toFixed(2)}%</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Taxa de Conversão</p>
            <p className="text-white text-xl font-bold">{conversionRate.toFixed(2)}%</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Custo por Lead</p>
            <p className="text-white text-xl font-bold">{formatCurrency(costPerLead, 'BRL')}</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Custo por Clique</p>
            <p className="text-white text-xl font-bold">{formatCurrency(costPerClick, 'BRL')}</p>
          </div>
        </div>

        {metrics.registrations > 0 && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/60 text-sm">Cadastros</p>
            <p className="text-white text-xl font-bold">{metrics.registrations.toLocaleString('pt-BR')}</p>
          </div>
        )}

        {metrics.conversationsStarted > 0 && (
          <div>
            <p className="text-white/60 text-sm">Conversas Iniciadas</p>
            <p className="text-white text-xl font-bold">{metrics.conversationsStarted.toLocaleString('pt-BR')}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
