import { useState, useEffect } from 'react'
import { useDeals } from '@/features/deals/hooks/useDeals'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'
import { Deal } from '@/types'
import { PeriodOption } from '../components/PeriodFilter'

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
  lossRate: number
  averageDealValue: number
  averageTimeToClose?: number
  totalContacts: number
  totalCompanies: number
  dealsByStage: Array<{ stageId: string; stageName: string; count: number; value: number }>
  dealsByStatus: Array<{ status: string; count: number; value: number }>
  recentDeals: Deal[]
}

const getDateRange = (period: PeriodOption, customStartDate?: Date, customEndDate?: Date) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case 'today':
      return { startDate: today, endDate: now }

    case 'week':
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay()) // Domingo da semana
      return { startDate: weekStart, endDate: now }

    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      return { startDate: monthStart, endDate: now }

    case 'custom':
      if (customStartDate && customEndDate) {
        return { startDate: customStartDate, endDate: customEndDate }
      }
      return null

    case 'all':
    default:
      return null
  }
}

export const useDashboardStats = (period: PeriodOption = 'all', customStartDate?: Date, customEndDate?: Date) => {
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
    lossRate: 0,
    averageDealValue: 0,
    averageTimeToClose: undefined,
    totalContacts: 0,
    totalCompanies: 0,
    dealsByStage: [],
    dealsByStatus: [],
    recentDeals: [],
  })

  const loading = dealsLoading || contactsLoading || companiesLoading || funnelsLoading

  useEffect(() => {
    if (loading) return

    // Filtrar negociações por período
    const dateRange = getDateRange(period, customStartDate, customEndDate)
    let filteredDeals = [...deals]

    if (dateRange) {
      filteredDeals = filteredDeals.filter(deal => {
        const dealDate = deal.createdAt?.toDate()
        if (!dealDate) return false
        return dealDate >= dateRange.startDate && dealDate <= dateRange.endDate
      })
    }

    // Calcular estatísticas básicas
    const totalDeals = filteredDeals.length
    const activeDeals = filteredDeals.filter(d => d.status === 'active').length
    const wonDeals = filteredDeals.filter(d => d.status === 'won').length
    const lostDeals = filteredDeals.filter(d => d.status === 'lost').length
    const pausedDeals = filteredDeals.filter(d => d.status === 'paused').length

    // Calcular valores
    const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0)
    const activeValue = filteredDeals.filter(d => d.status === 'active').reduce((sum, deal) => sum + deal.value, 0)
    const wonValue = filteredDeals.filter(d => d.status === 'won').reduce((sum, deal) => sum + deal.value, 0)
    const lostValue = filteredDeals.filter(d => d.status === 'lost').reduce((sum, deal) => sum + deal.value, 0)

    // Taxa de conversão (won / (won + lost))
    const closedDeals = wonDeals + lostDeals
    const conversionRate = closedDeals > 0 ? (wonDeals / closedDeals) * 100 : 0
    const lossRate = closedDeals > 0 ? (lostDeals / closedDeals) * 100 : 0

    // Valor médio por negociação
    const averageDealValue = totalDeals > 0 ? totalValue / totalDeals : 0

    // Tempo médio para fechamento (apenas negociações fechadas)
    const closedDealsWithDates = filteredDeals.filter(d => d.status === 'won' || d.status === 'lost')
    let averageTimeToClose: number | undefined

    if (closedDealsWithDates.length > 0) {
      const totalDays = closedDealsWithDates.reduce((sum, deal) => {
        const createdAt = deal.createdAt?.toDate()
        const updatedAt = deal.updatedAt?.toDate()
        if (createdAt && updatedAt) {
          const diffTime = updatedAt.getTime() - createdAt.getTime()
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          return sum + diffDays
        }
        return sum
      }, 0)
      averageTimeToClose = totalDays / closedDealsWithDates.length
    }

    // Negociações por estágio (com nomes do funil)
    const stageMap = new Map<string, { stageName: string; count: number; value: number }>()
    filteredDeals.forEach(deal => {
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
    filteredDeals.forEach(deal => {
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
    const recentDeals = [...filteredDeals]
      .sort((a, b) => {
        const aTime = a.updatedAt?.toMillis() || 0
        const bTime = b.updatedAt?.toMillis() || 0
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
      lossRate,
      averageDealValue,
      averageTimeToClose,
      totalContacts: contacts.length,
      totalCompanies: companies.length,
      dealsByStage,
      dealsByStatus,
      recentDeals,
    })
  }, [deals, contacts, companies, activeFunnel, loading, period, customStartDate, customEndDate])

  return {
    stats,
    loading,
  }
}

