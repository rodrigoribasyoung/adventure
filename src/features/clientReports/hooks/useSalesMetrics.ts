import { useMemo } from 'react'
import { SalesReport, SalesMetrics } from '../types'

export const useSalesMetrics = (reports: SalesReport[]) => {
  const metrics = useMemo(() => {
    const totals: SalesMetrics = {
      activities: 0,
      dealsCreated: 0,
      leadsReceived: 0,
      contactsMade: 0,
      scheduledVisits: 0,
      completedVisits: 0,
      signedContracts: 0,
      internalSales: 0,
      losses: 0,
      realEstateContacts: 0,
      realEstateVideoCalls: 0,
      realEstateVisits: 0,
      realEstateLeadsInProcess: 0,
      sales: 0,
    }

    reports.forEach(report => {
      totals.activities = (totals.activities || 0) + (report.metrics.activities || 0)
      totals.dealsCreated = (totals.dealsCreated || 0) + (report.metrics.dealsCreated || 0)
      totals.leadsReceived = (totals.leadsReceived || 0) + (report.metrics.leadsReceived || 0)
      totals.contactsMade = (totals.contactsMade || 0) + (report.metrics.contactsMade || 0)
      totals.scheduledVisits = (totals.scheduledVisits || 0) + (report.metrics.scheduledVisits || 0)
      totals.completedVisits = (totals.completedVisits || 0) + (report.metrics.completedVisits || 0)
      totals.signedContracts = (totals.signedContracts || 0) + (report.metrics.signedContracts || 0)
      totals.internalSales = (totals.internalSales || 0) + (report.metrics.internalSales || 0)
      totals.losses = (totals.losses || 0) + (report.metrics.losses || 0)
      totals.realEstateContacts = (totals.realEstateContacts || 0) + (report.metrics.realEstateContacts || 0)
      totals.realEstateVideoCalls = (totals.realEstateVideoCalls || 0) + (report.metrics.realEstateVideoCalls || 0)
      totals.realEstateVisits = (totals.realEstateVisits || 0) + (report.metrics.realEstateVisits || 0)
      totals.realEstateLeadsInProcess = (totals.realEstateLeadsInProcess || 0) + (report.metrics.realEstateLeadsInProcess || 0)
      totals.sales = (totals.sales || 0) + (report.metrics.sales || 0)
    })

    // Métricas calculadas
    const leadsReceived = totals.leadsReceived || 0
    const contactsMade = totals.contactsMade || 0
    const completedVisits = totals.completedVisits || 0
    const sales = totals.sales || 0
    const dealsCreated = totals.dealsCreated || 0
    const losses = totals.losses || 0

    const leadToContactRate = leadsReceived > 0 ? (contactsMade / leadsReceived) * 100 : 0
    const contactToVisitRate = contactsMade > 0 ? (completedVisits / contactsMade) * 100 : 0
    const visitToSaleRate = completedVisits > 0 ? (sales / completedVisits) * 100 : 0
    const conversionRate = leadsReceived > 0 ? (sales / leadsReceived) * 100 : 0
    const winRate = dealsCreated > 0 && (sales + losses) > 0 ? (sales / (sales + losses)) * 100 : 0

    // Funil de vendas
    const funnel = {
      leads: totals.leadsReceived,
      contacts: totals.contactsMade,
      scheduledVisits: totals.scheduledVisits,
      completedVisits: totals.completedVisits,
      signedContracts: totals.signedContracts,
      sales: totals.sales,
    }

    // Agrupar por propriedade/ativo
    const byProperty = reports.reduce((acc, report) => {
      const property = report.activeProperty
      if (!acc[property]) {
        acc[property] = {
          activities: 0,
          dealsCreated: 0,
          leadsReceived: 0,
          contactsMade: 0,
          scheduledVisits: 0,
          completedVisits: 0,
          signedContracts: 0,
          internalSales: 0,
          losses: 0,
          realEstateContacts: 0,
          realEstateVideoCalls: 0,
          realEstateVisits: 0,
          realEstateLeadsInProcess: 0,
          sales: 0,
        }
      }
      Object.keys(report.metrics).forEach(key => {
        const value = report.metrics[key as keyof SalesMetrics]
        if (typeof value === 'number') {
          acc[property][key as keyof SalesMetrics] = (acc[property][key as keyof SalesMetrics] || 0) + value
        }
      })
      return acc
    }, {} as Record<string, SalesMetrics>)

    // Agrupar por responsável
    const byResponsible: Record<string, { internal: number; external: number; total: number }> = {}
    reports.forEach(report => {
      if (report.internalSalesResponsible) {
        if (!byResponsible[report.internalSalesResponsible]) {
          byResponsible[report.internalSalesResponsible] = { internal: 0, external: 0, total: 0 }
        }
        byResponsible[report.internalSalesResponsible].internal += report.metrics.internalSales || 0
        byResponsible[report.internalSalesResponsible].total += report.metrics.internalSales || 0
      }
      if (report.externalSalesResponsible) {
        if (!byResponsible[report.externalSalesResponsible]) {
          byResponsible[report.externalSalesResponsible] = { internal: 0, external: 0, total: 0 }
        }
        byResponsible[report.externalSalesResponsible].external += (report.metrics.sales || 0) - (report.metrics.internalSales || 0)
        byResponsible[report.externalSalesResponsible].total += (report.metrics.sales || 0) - (report.metrics.internalSales || 0)
      }
    })

    return {
      totals,
      funnel,
      leadToContactRate,
      contactToVisitRate,
      visitToSaleRate,
      conversionRate,
      winRate,
      byProperty,
      byResponsible,
    }
  }, [reports])

  return metrics
}
