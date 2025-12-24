import { useState, useEffect } from 'react'
import { useDeals } from '@/features/deals/hooks/useDeals'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'

export interface PipelineReportFilters {
  startDate?: Date
  endDate?: Date
}

export interface PipelineReportData {
  totalDeals: number
  totalValue: number
  distributionByStage: Array<{
    stageId: string
    stageName: string
    count: number
    value: number
    percentage: number
    averageTimeInStage?: number // em dias
  }>
  averageDealValue: number
  averageTimeToClose?: number // em dias (apenas para negociações fechadas)
}

export const usePipelineReport = (filters: PipelineReportFilters) => {
  const { deals, loading: dealsLoading } = useDeals()
  const { funnels } = useFunnels()
  const [reportData, setReportData] = useState<PipelineReportData | null>(null)
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

    // Buscar funil ativo
    const activeFunnel = funnels.find(f => f.active)

    // Calcular métricas gerais
    const totalDeals = filteredDeals.length
    const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0)
    const averageDealValue = totalDeals > 0 ? totalValue / totalDeals : 0

    // Calcular tempo médio para fechamento (apenas negociações fechadas)
    const closedDeals = filteredDeals.filter(d => d.status === 'won' || d.status === 'lost')
    let averageTimeToClose: number | undefined

    if (closedDeals.length > 0) {
      const totalDays = closedDeals.reduce((sum, deal) => {
        const createdAt = deal.createdAt?.toDate()
        const updatedAt = deal.updatedAt?.toDate()
        if (createdAt && updatedAt) {
          const diffTime = updatedAt.getTime() - createdAt.getTime()
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          return sum + diffDays
        }
        return sum
      }, 0)
      averageTimeToClose = totalDays / closedDeals.length
    }

    // Agrupar por estágio
    const stageMap = new Map<string, { 
      count: number
      value: number
      deals: typeof filteredDeals
    }>()

    filteredDeals.forEach(deal => {
      const current = stageMap.get(deal.stage) || { count: 0, value: 0, deals: [] }
      stageMap.set(deal.stage, {
        count: current.count + 1,
        value: current.value + deal.value,
        deals: [...current.deals, deal],
      })
    })

    // Calcular tempo médio em cada estágio
    // Para isso, assumimos que o tempo em estágio é baseado na última atualização
    // Se uma negociação está em um estágio há muito tempo, consideramos esse tempo
    const distributionByStage = Array.from(stageMap.entries()).map(([stageId, data]) => {
      const stage = activeFunnel?.stages.find(s => s.id === stageId)
      
      // Calcular tempo médio no estágio atual (baseado na última atualização)
      let averageTimeInStage: number | undefined
      if (data.deals.length > 0) {
        const now = new Date()
        const totalDays = data.deals.reduce((sum, deal) => {
          const updatedAt = deal.updatedAt?.toDate()
          if (updatedAt) {
            const diffTime = now.getTime() - updatedAt.getTime()
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
            return sum + diffDays
          }
          return sum
        }, 0)
        averageTimeInStage = totalDays / data.deals.length
      }

      const percentage = totalValue > 0 ? (data.value / totalValue) * 100 : 0

      return {
        stageId,
        stageName: stage?.name || stageId,
        count: data.count,
        value: data.value,
        percentage,
        averageTimeInStage,
      }
    })

    // Ordenar pelos estágios na ordem do funil
    const sortedDistribution = distributionByStage.sort((a, b) => {
      const aOrder = activeFunnel?.stages.find(s => s.id === a.stageId)?.order || 999
      const bOrder = activeFunnel?.stages.find(s => s.id === b.stageId)?.order || 999
      return aOrder - bOrder
    })

    setReportData({
      totalDeals,
      totalValue,
      distributionByStage: sortedDistribution,
      averageDealValue,
      averageTimeToClose,
    })

    setLoading(false)
  }, [deals, dealsLoading, filters, funnels])

  return { reportData, loading }
}

