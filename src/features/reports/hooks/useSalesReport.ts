import { useState, useEffect } from 'react'
import { useDeals } from '@/features/deals/hooks/useDeals'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'
import { useProjectUsers } from '@/features/projectMembers/hooks/useProjectUsers'

export interface SalesReportFilters {
  startDate?: Date
  endDate?: Date
  stageId?: string
  status?: 'active' | 'won' | 'lost' | 'paused'
  assignedTo?: string
}

export interface SalesReportData {
  totalDeals: number
  totalValue: number
  wonDeals: number
  wonValue: number
  lostDeals: number
  lostValue: number
  activeDeals: number
  activeValue: number
  dealsByStage: Array<{
    stageId: string
    stageName: string
    count: number
    value: number
  }>
  dealsByResponsible: Array<{
    userId: string
    userName?: string
    count: number
    value: number
  }>
}

export const useSalesReport = (filters: SalesReportFilters) => {
  const { deals, loading: dealsLoading } = useDeals()
  const { funnels } = useFunnels()
  const { responsibles } = useProjectUsers()
  const [reportData, setReportData] = useState<SalesReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dealsLoading) return

    setLoading(true)

    // Filtrar negociações
    let filteredDeals = [...deals]

    // Filtro por período (data de criação)
    if (filters.startDate) {
      filteredDeals = filteredDeals.filter(deal => {
        const dealDate = deal.createdAt?.toDate()
        return dealDate && dealDate >= filters.startDate!
      })
    }

    if (filters.endDate) {
      filteredDeals = filteredDeals.filter(deal => {
        const dealDate = deal.createdAt?.toDate()
        return dealDate && dealDate <= filters.endDate!
      })
    }

    // Filtro por estágio
    if (filters.stageId) {
      filteredDeals = filteredDeals.filter(deal => deal.stage === filters.stageId)
    }

    // Filtro por status
    if (filters.status) {
      filteredDeals = filteredDeals.filter(deal => deal.status === filters.status)
    }

    // Filtro por responsável
    if (filters.assignedTo) {
      filteredDeals = filteredDeals.filter(deal => deal.assignedTo === filters.assignedTo)
    }

    // Buscar funil ativo para mapear nomes dos estágios
    const activeFunnel = funnels.find(f => f.active)

    // Calcular métricas
    const totalDeals = filteredDeals.length
    const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0)

    const wonDeals = filteredDeals.filter(d => d.status === 'won')
    const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0)

    const lostDeals = filteredDeals.filter(d => d.status === 'lost')
    const lostValue = lostDeals.reduce((sum, deal) => sum + deal.value, 0)

    const activeDeals = filteredDeals.filter(d => d.status === 'active')
    const activeValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0)

    // Agrupar por estágio
    const dealsByStageMap = new Map<string, { count: number; value: number }>()
    filteredDeals.forEach(deal => {
      const current = dealsByStageMap.get(deal.stage) || { count: 0, value: 0 }
      dealsByStageMap.set(deal.stage, {
        count: current.count + 1,
        value: current.value + deal.value,
      })
    })

    const dealsByStage = Array.from(dealsByStageMap.entries()).map(([stageId, data]) => {
      const stage = activeFunnel?.stages.find(s => s.id === stageId)
      return {
        stageId,
        stageName: stage?.name || stageId,
        count: data.count,
        value: data.value,
      }
    })

    // Agrupar por responsável
    const dealsByResponsibleMap = new Map<string, { count: number; value: number }>()
    filteredDeals.forEach(deal => {
      if (deal.assignedTo) {
        const current = dealsByResponsibleMap.get(deal.assignedTo) || { count: 0, value: 0 }
        dealsByResponsibleMap.set(deal.assignedTo, {
          count: current.count + 1,
          value: current.value + deal.value,
        })
      }
    })

    // Criar mapa de responsáveis para lookup rápido
    const responsiblesMap = new Map<string, string>()
    responsibles.forEach(r => {
      responsiblesMap.set(r.id, r.name)
    })

    const dealsByResponsible = Array.from(dealsByResponsibleMap.entries()).map(([responsibleId, data]) => ({
      userId: responsibleId,
      userName: responsiblesMap.get(responsibleId) || responsibleId,
      count: data.count,
      value: data.value,
    }))

    setReportData({
      totalDeals,
      totalValue,
      wonDeals: wonDeals.length,
      wonValue,
      lostDeals: lostDeals.length,
      lostValue,
      activeDeals: activeDeals.length,
      activeValue,
      dealsByStage,
      dealsByResponsible,
    })

    setLoading(false)
  }, [deals, dealsLoading, filters, funnels, responsibles])

  return { reportData, loading }
}

