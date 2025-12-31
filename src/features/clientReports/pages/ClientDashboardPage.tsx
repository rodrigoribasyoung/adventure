import { Container } from '@/components/layout/Container'
import { useClientReports } from '../hooks/useClientReports'
import { useMarketingMetrics } from '../hooks/useMarketingMetrics'
import { useSalesMetrics } from '../hooks/useSalesMetrics'
import { MarketingMetricsCard } from '../components/MarketingMetricsCard'
import { SalesMetricsCard } from '../components/SalesMetricsCard'
import { useParams } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'

const ClientDashboardPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects } = useProjects()
  const project = projects.find(p => p.id === projectId)
  
  const { marketingReports, salesReports, loading, error } = useClientReports(projectId)
  const marketingMetrics = useMarketingMetrics(marketingReports)
  const salesMetrics = useSalesMetrics(salesReports)

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white">Carregando...</div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-400">Erro ao carregar dados: {error}</div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Dashboard - {project?.name || 'Cliente'}
          </h1>
          <p className="text-white/60 text-sm">
            Visão geral de marketing e vendas
          </p>
        </div>

        <MarketingMetricsCard metrics={marketingMetrics.totals} />

        <SalesMetricsCard metrics={salesMetrics.totals} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance por Canal</h3>
            <div className="space-y-3">
              {Object.entries(marketingMetrics.byChannel).map(([channel, metrics]) => (
                <div key={channel} className="flex items-center justify-between">
                  <span className="text-white/80 capitalize">{channel.replace('_', ' ')}</span>
                  <div className="text-right">
                    <p className="text-white font-semibold">{metrics.totalLeads} leads</p>
                    <p className="text-white/60 text-sm">
                      {metrics.investmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Funil de Vendas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Leads</span>
                <span className="text-white font-semibold">{salesMetrics.funnel.leads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Contatos</span>
                <span className="text-white font-semibold">{salesMetrics.funnel.contacts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Visitas Agendadas</span>
                <span className="text-white font-semibold">{salesMetrics.funnel.scheduledVisits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Visitas Realizadas</span>
                <span className="text-white font-semibold">{salesMetrics.funnel.completedVisits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Contratos Assinados</span>
                <span className="text-white font-semibold">{salesMetrics.funnel.signedContracts}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-white font-semibold">Vendas</span>
                <span className="text-primary-red font-bold text-lg">{salesMetrics.funnel.sales}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default ClientDashboardPage
