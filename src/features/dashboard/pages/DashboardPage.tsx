import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { MetricCard } from '../components/MetricCard'
import { DealsByStageChart } from '../components/DealsByStageChart'
import { RecentDealsList } from '../components/RecentDealsList'
import { PeriodFilter, PeriodOption } from '../components/PeriodFilter'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils/formatCurrency'

const DashboardPage = () => {
  const [period, setPeriod] = useState<PeriodOption>('all')
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>()
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>()
  const { stats, loading } = useDashboardStats(period, customStartDate, customEndDate)
  const navigate = useNavigate()

  const handleCustomDateRange = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate)
    setCustomEndDate(endDate)
  }

  const handleDealClick = (_deal?: any) => {
    navigate(`/deals`)
  }

  // Calcular heat levels baseado em valores relativos
  const calculateHeatLevel = (value: number, maxValue: number): number => {
    if (maxValue === 0) return 0
    return Math.min(value / maxValue, 1)
  }

  // Encontrar valores máximos para normalização
  const maxDeals = Math.max(stats.totalDeals, stats.activeDeals, stats.wonDeals, stats.lostDeals, 1)
  const maxValue = Math.max(stats.totalValue, stats.activeValue, stats.wonValue, stats.lostValue, stats.averageDealValue, 1)
  const maxContacts = Math.max(stats.totalContacts, stats.totalCompanies, 1)

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl text-white/90 mb-1">Dashboard</h1>
              <p className="text-white/60 text-sm">Visão geral do seu pipeline de vendas</p>
            </div>
            <PeriodFilter
              selectedPeriod={period}
              onPeriodChange={setPeriod}
              onCustomDateRange={handleCustomDateRange}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
            />
          </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Negociações"
            value={stats.totalDeals}
            subtitle={`${stats.activeDeals} ativas`}
            format="number"
            heatLevel={calculateHeatLevel(stats.totalDeals, maxDeals)}
          />
          
          <MetricCard
            title="Valor Total"
            value={stats.totalValue}
            subtitle={`${stats.activeDeals} negociações ativas`}
            format="currency"
            heatLevel={calculateHeatLevel(stats.totalValue, maxValue)}
          />
          
          <MetricCard
            title="Taxa de Conversão"
            value={stats.conversionRate.toFixed(1)}
            subtitle={`${stats.wonDeals} ganhas / ${stats.wonDeals + stats.lostDeals} fechadas`}
            format="percentage"
            heatLevel={calculateHeatLevel(stats.conversionRate, 100)}
          />
          
          <MetricCard
            title="Taxa de Perda"
            value={stats.lossRate.toFixed(1)}
            subtitle={`${stats.lostDeals} perdidas`}
            format="percentage"
            heatLevel={calculateHeatLevel(stats.lossRate, 100)}
          />
        </div>

        {/* Cards Secundários */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Ticket Médio"
            value={stats.averageDealValue}
            subtitle="Valor médio por negociação"
            format="currency"
            heatLevel={calculateHeatLevel(stats.averageDealValue, maxValue)}
          />

          {stats.averageTimeToClose !== undefined && (
            <MetricCard
              title="Tempo Médio de Fechamento"
              value={`${Math.round(stats.averageTimeToClose)} dias`}
              subtitle="Baseado em negociações fechadas"
              heatLevel={0.3} // Tempo médio é neutro
            />
          )}
          
          <MetricCard
            title="Negociações Ativas"
            value={stats.activeDeals}
            subtitle={formatCurrency(stats.activeValue, 'BRL')}
            format="number"
            heatLevel={calculateHeatLevel(stats.activeDeals, maxDeals)}
          />
          
          <MetricCard
            title="Vendidas"
            value={stats.wonDeals}
            subtitle={formatCurrency(stats.wonValue, 'BRL')}
            format="number"
            heatLevel={calculateHeatLevel(stats.wonDeals, maxDeals)}
          />
          
          <MetricCard
            title="Perdidas"
            value={stats.lostDeals}
            subtitle={formatCurrency(stats.lostValue, 'BRL')}
            format="number"
            heatLevel={calculateHeatLevel(stats.lostDeals, maxDeals)}
          />
          
          <MetricCard
            title="Contatos"
            value={stats.totalContacts}
            format="number"
            heatLevel={calculateHeatLevel(stats.totalContacts, maxContacts)}
          />
          
          <MetricCard
            title="Empresas"
            value={stats.totalCompanies}
            format="number"
            heatLevel={calculateHeatLevel(stats.totalCompanies, maxContacts)}
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
