import { useState, useEffect } from 'react'
import { useDeals } from '@/features/deals/hooks/useDeals'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'
import { Deal } from '@/types'

export interface DashboardStats {
  totalDeals: number
  activeDeals: number
  wonDeals: number
  lostDeals: number
  pausedDeals: number
  totalValue: number
  activeValue: number
  wonValue: number
  lostValue: number
  conversionRate: number
  averageDealValue: number
  totalContacts: number
  totalCompanies: number
  dealsByStage: Array<{ stageId: string; stageName: string; count: number; value: number }>
  dealsByStatus: Array<{ status: string; count: number; value: number }>
  recentDeals: Deal[]
}

export const useDashboardStats = () => {
  const { deals, loading: dealsLoading } = useDeals()
  const { contacts, loading: contactsLoading } = useContacts()
  const { companies, loading: companiesLoading } = useCompanies()
  const { activeFunnel, loading: funnelsLoading } = useFunnels()

  const [stats, setStats] = useState<DashboardStats>({
    totalDeals: 0,
    activeDeals: 0,
    wonDeals: 0,
    lostDeals: 0,
    pausedDeals: 0,
    totalValue: 0,
    activeValue: 0,
    wonValue: 0,
    lostValue: 0,
    conversionRate: 0,
    averageDealValue: 0,
    totalContacts: 0,
    totalCompanies: 0,
    dealsByStage: [],
    dealsByStatus: [],
    recentDeals: [],
  })

  const loading = dealsLoading || contactsLoading || companiesLoading || funnelsLoading

  useEffect(() => {
    if (loading) return

    // Calcular estatísticas básicas
    const totalDeals = deals.length
    const activeDeals = deals.filter(d => d.status === 'active').length
    const wonDeals = deals.filter(d => d.status === 'won').length
    const lostDeals = deals.filter(d => d.status === 'lost').length
    const pausedDeals = deals.filter(d => d.status === 'paused').length

    // Calcular valores
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
    const activeValue = deals.filter(d => d.status === 'active').reduce((sum, deal) => sum + deal.value, 0)
    const wonValue = deals.filter(d => d.status === 'won').reduce((sum, deal) => sum + deal.value, 0)
    const lostValue = deals.filter(d => d.status === 'lost').reduce((sum, deal) => sum + deal.value, 0)

    // Taxa de conversão (won / (won + lost))
    const closedDeals = wonDeals + lostDeals
    const conversionRate = closedDeals > 0 ? (wonDeals / closedDeals) * 100 : 0

    // Valor médio por negociação
    const averageDealValue = totalDeals > 0 ? totalValue / totalDeals : 0

    // Negociações por estágio (com nomes do funil)
    const stageMap = new Map<string, { stageName: string; count: number; value: number }>()
    deals.forEach(deal => {
      // Buscar nome do estágio no funil ativo
      const stage = activeFunnel?.stages.find(s => s.id === deal.stage)
      const stageName = stage?.name || deal.stage
      
      const existing = stageMap.get(deal.stage) || { stageName, count: 0, value: 0 }
      stageMap.set(deal.stage, {
        stageName,
        count: existing.count + 1,
        value: existing.value + deal.value,
      })
    })
    const dealsByStage = Array.from(stageMap.entries()).map(([stageId, data]) => ({
      stageId,
      ...data,
    }))

    // Negociações por status
    const statusMap = new Map<string, { count: number; value: number }>()
    deals.forEach(deal => {
      const status = deal.status || 'active'
      const existing = statusMap.get(status) || { count: 0, value: 0 }
      statusMap.set(status, {
        count: existing.count + 1,
        value: existing.value + deal.value,
      })
    })
    const dealsByStatus = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      ...data,
    }))

    // Negociações recentes (últimas 5)
    const recentDeals = [...deals]
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0
        const bTime = b.createdAt?.toMillis() || 0
        return bTime - aTime
      })
      .slice(0, 5)

    setStats({
      totalDeals,
      activeDeals,
      wonDeals,
      lostDeals,
      pausedDeals,
      totalValue,
      activeValue,
      wonValue,
      lostValue,
      conversionRate,
      averageDealValue,
      totalContacts: contacts.length,
      totalCompanies: companies.length,
      dealsByStage,
      dealsByStatus,
      recentDeals,
    })
  }, [deals, contacts, companies, activeFunnel, loading])

  return {
    stats,
    loading,
  }
}

