import { Card } from '@/components/ui/Card'
import { SalesMetrics } from '../types'

interface SalesMetricsCardProps {
  metrics: SalesMetrics
  title?: string
  className?: string
}

export const SalesMetricsCard = ({ metrics, title = 'Métricas de Vendas', className = '' }: SalesMetricsCardProps) => {
  const leadsReceived = metrics.leadsReceived || 0
  const contactsMade = metrics.contactsMade || 0
  const completedVisits = metrics.completedVisits || 0
  const sales = metrics.sales || 0
  const dealsCreated = metrics.dealsCreated || 0
  const losses = metrics.losses || 0

  const leadToContactRate = leadsReceived > 0 ? (contactsMade / leadsReceived) * 100 : 0
  const contactToVisitRate = contactsMade > 0 ? (completedVisits / contactsMade) * 100 : 0
  const visitToSaleRate = completedVisits > 0 ? (sales / completedVisits) * 100 : 0
  const conversionRate = leadsReceived > 0 ? (sales / leadsReceived) * 100 : 0
  const winRate = dealsCreated > 0 && (sales + losses) > 0 ? (sales / (sales + losses)) * 100 : 0

  return (
    <Card className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-white/60 text-sm">Leads Recebidos</p>
            <p className="text-white text-xl font-bold">{leadsReceived.toLocaleString('pt-BR')}</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Contatos Feitos</p>
            <p className="text-white text-xl font-bold">{contactsMade.toLocaleString('pt-BR')}</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Visitas Realizadas</p>
            <p className="text-white text-xl font-bold">{completedVisits.toLocaleString('pt-BR')}</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Vendas</p>
            <p className="text-white text-xl font-bold text-primary-red">{sales.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-white/60 text-sm">Leads → Contatos</p>
            <p className="text-white text-xl font-bold">{leadToContactRate.toFixed(2)}%</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Contatos → Visitas</p>
            <p className="text-white text-xl font-bold">{contactToVisitRate.toFixed(2)}%</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Visitas → Vendas</p>
            <p className="text-white text-xl font-bold">{visitToSaleRate.toFixed(2)}%</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Taxa de Conversão</p>
            <p className="text-white text-xl font-bold">{conversionRate.toFixed(2)}%</p>
          </div>
          
          <div>
            <p className="text-white/60 text-sm">Taxa de Ganho</p>
            <p className="text-white text-xl font-bold">{winRate.toFixed(2)}%</p>
          </div>
        </div>

        {(dealsCreated > 0 || losses > 0) && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-white/60 text-sm">Negociações Criadas</p>
              <p className="text-white text-xl font-bold">{dealsCreated.toLocaleString('pt-BR')}</p>
            </div>
            
            <div>
              <p className="text-white/60 text-sm">Perdas</p>
              <p className="text-white text-xl font-bold">{losses.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
