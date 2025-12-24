import { Container } from '@/components/layout/Container'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { MetricCard } from '../components/MetricCard'
import { DealsByStageChart } from '../components/DealsByStageChart'
import { RecentDealsList } from '../components/RecentDealsList'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils/formatCurrency'

const DashboardPage = () => {
  const { stats, loading } = useDashboardStats()
  const navigate = useNavigate()

  const handleDealClick = (_deal?: any) => {
    navigate(`/deals`)
  }

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white/70">Carregando dashboard...</div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">Visão geral do seu pipeline de vendas</p>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Negociações"
            value={stats.totalDeals}
            subtitle={`${stats.activeDeals} ativas`}
            format="number"
          />
          
          <MetricCard
            title="Valor Total"
            value={stats.totalValue}
            subtitle={`${stats.activeDeals} negociações ativas`}
            format="currency"
          />
          
          <MetricCard
            title="Taxa de Conversão"
            value={stats.conversionRate}
            subtitle={`${stats.wonDeals} ganhas / ${stats.wonDeals + stats.lostDeals} fechadas`}
            format="percentage"
          />
          
          <MetricCard
            title="Ticket Médio"
            value={stats.averageDealValue}
            subtitle="Valor médio por negociação"
            format="currency"
          />
        </div>

        {/* Cards Secundários */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Negociações Ativas"
            value={stats.activeDeals}
            subtitle={formatCurrency(stats.activeValue)}
            format="number"
          />
          
          <MetricCard
            title="Vendidas"
            value={stats.wonDeals}
            subtitle={formatCurrency(stats.wonValue)}
            format="number"
          />
          
          <MetricCard
            title="Contatos"
            value={stats.totalContacts}
            format="number"
          />
          
          <MetricCard
            title="Empresas"
            value={stats.totalCompanies}
            format="number"
          />
        </div>

        {/* Gráficos e Listas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DealsByStageChart data={stats.dealsByStage} />
          <RecentDealsList deals={stats.recentDeals} onDealClick={handleDealClick} />
        </div>
      </div>
    </Container>
  )
}

export default DashboardPage
