import { useState, useEffect } from 'react'
import { useDeals } from '@/features/deals/hooks/useDeals'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'

export interface ConversionReportFilters {
  startDate?: Date
  endDate?: Date
  stageId?: string
}

export interface ConversionReportData {
  overallConversionRate: number
  totalWon: number
  totalLost: number
  totalClosed: number
  conversionByStage: Array<{
    stageId: string
    stageName: string
    won: number
    lost: number
    conversionRate: number
  }>
  conversionByPeriod: Array<{
    period: string
    won: number
    lost: number
    conversionRate: number
  }>
}

export const useConversionReport = (filters: ConversionReportFilters) => {
  const { deals, loading: dealsLoading } = useDeals()
  const { funnels } = useFunnels()
  const [reportData, setReportData] = useState<ConversionReportData | null>(null)
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
    const wonDeals = filteredDeals.filter(d => d.status === 'won')
    const lostDeals = filteredDeals.filter(d => d.status === 'lost')
    const closedDeals = wonDeals.length + lostDeals.length
    const overallConversionRate = closedDeals > 0 
      ? (wonDeals.length / closedDeals) * 100 
      : 0

    // Calcular conversão por estágio
    const stageConversionMap = new Map<string, { won: number; lost: number }>()
    
    // Processar negociações ganhas
    wonDeals.forEach(deal => {
      const current = stageConversionMap.get(deal.stage) || { won: 0, lost: 0 }
      stageConversionMap.set(deal.stage, { ...current, won: current.won + 1 })
    })

    // Processar negociações perdidas
    lostDeals.forEach(deal => {
      const current = stageConversionMap.get(deal.stage) || { won: 0, lost: 0 }
      stageConversionMap.set(deal.stage, { ...current, lost: current.lost + 1 })
    })

    const conversionByStage = Array.from(stageConversionMap.entries())
      .map(([stageId, data]) => {
        const stage = activeFunnel?.stages.find(s => s.id === stageId)
        const total = data.won + data.lost
        const conversionRate = total > 0 ? (data.won / total) * 100 : 0

        return {
          stageId,
          stageName: stage?.name || stageId,
          won: data.won,
          lost: data.lost,
          conversionRate,
        }
      })
      .filter(item => item.won > 0 || item.lost > 0) // Apenas estágios com negociações fechadas
      .sort((a, b) => {
        // Ordenar pelos estágios na ordem do funil
        const aOrder = activeFunnel?.stages.find(s => s.id === a.stageId)?.order || 999
        const bOrder = activeFunnel?.stages.find(s => s.id === b.stageId)?.order || 999
        return aOrder - bOrder
      })

    // Calcular conversão por período (mensal)
    const periodConversionMap = new Map<string, { won: number; lost: number }>()
    
    const addToPeriod = (deal: typeof deals[0], status: 'won' | 'lost') => {
      const dealDate = deal.createdAt?.toDate()
      if (!dealDate) return
      
      const period = `${dealDate.getFullYear()}-${String(dealDate.getMonth() + 1).padStart(2, '0')}`
      const current = periodConversionMap.get(period) || { won: 0, lost: 0 }
      periodConversionMap.set(period, { ...current, [status]: current[status] + 1 })
    }

    wonDeals.forEach(deal => addToPeriod(deal, 'won'))
    lostDeals.forEach(deal => addToPeriod(deal, 'lost'))

    const conversionByPeriod = Array.from(periodConversionMap.entries())
      .map(([period, data]) => {
        const total = data.won + data.lost
        const conversionRate = total > 0 ? (data.won / total) * 100 : 0

        // Formatar período (YYYY-MM para "Mês/YYYY")
        const [year, month] = period.split('-')
        const monthNames = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ]
        const formattedPeriod = `${monthNames[parseInt(month) - 1]}/${year}`

        return {
          period: formattedPeriod,
          won: data.won,
          lost: data.lost,
          conversionRate,
        }
      })
      .sort((a, b) => {
        // Ordenar do mais antigo para o mais recente
        return a.period.localeCompare(b.period)
      })

    setReportData({
      overallConversionRate,
      totalWon: wonDeals.length,
      totalLost: lostDeals.length,
      totalClosed: closedDeals,
      conversionByStage,
      conversionByPeriod,
    })

    setLoading(false)
  }, [deals, dealsLoading, filters, funnels])

  return { reportData, loading }
}


