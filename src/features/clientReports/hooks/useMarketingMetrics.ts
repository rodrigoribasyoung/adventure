import { useMemo } from 'react'
import { MarketingReport, MarketingMetrics } from '../types'

export const useMarketingMetrics = (reports: MarketingReport[]) => {
  const metrics = useMemo(() => {
    const totals: MarketingMetrics = {
      impressions: 0,
      linkClicks: 0,
      registrations: 0,
      conversationsStarted: 0,
      totalLeads: 0,
      investmentValue: 0,
      platformBalance: 0,
    }

    reports.forEach(report => {
      totals.impressions += report.metrics.impressions || 0
      totals.linkClicks += report.metrics.linkClicks || 0
      totals.registrations += report.metrics.registrations || 0
      totals.conversationsStarted += report.metrics.conversationsStarted || 0
      totals.totalLeads += report.metrics.totalLeads || 0
      totals.investmentValue += report.metrics.investmentValue || 0
      totals.platformBalance = (totals.platformBalance || 0) + (report.metrics.platformBalance || 0)
    })

    // Métricas calculadas
    const ctr = totals.impressions > 0 ? (totals.linkClicks / totals.impressions) * 100 : 0
    const conversionRate = totals.linkClicks > 0 ? (totals.totalLeads / totals.linkClicks) * 100 : 0
    const costPerLead = totals.totalLeads > 0 ? totals.investmentValue / totals.totalLeads : 0
    const costPerClick = totals.linkClicks > 0 ? totals.investmentValue / totals.linkClicks : 0

    // Agrupar por canal
    const byChannel = reports.reduce((acc, report) => {
      const channel = report.channel
      if (!acc[channel]) {
        acc[channel] = {
          impressions: 0,
          linkClicks: 0,
          registrations: 0,
          conversationsStarted: 0,
          totalLeads: 0,
          investmentValue: 0,
        }
      }
      acc[channel].impressions += report.metrics.impressions || 0
      acc[channel].linkClicks += report.metrics.linkClicks || 0
      acc[channel].registrations += report.metrics.registrations || 0
      acc[channel].conversationsStarted += report.metrics.conversationsStarted || 0
      acc[channel].totalLeads += report.metrics.totalLeads || 0
      acc[channel].investmentValue += report.metrics.investmentValue || 0
      return acc
    }, {} as Record<string, MarketingMetrics>)

    // Agrupar por ativo/propriedade
    const byProperty = reports.reduce((acc, report) => {
      const property = report.activeProperty
      if (!acc[property]) {
        acc[property] = {
          impressions: 0,
          linkClicks: 0,
          registrations: 0,
          conversationsStarted: 0,
          totalLeads: 0,
          investmentValue: 0,
        }
      }
      acc[property].impressions += report.metrics.impressions || 0
      acc[property].linkClicks += report.metrics.linkClicks || 0
      acc[property].registrations += report.metrics.registrations || 0
      acc[property].conversationsStarted += report.metrics.conversationsStarted || 0
      acc[property].totalLeads += report.metrics.totalLeads || 0
      acc[property].investmentValue += report.metrics.investmentValue || 0
      return acc
    }, {} as Record<string, MarketingMetrics>)

    return {
      totals,
      ctr,
      conversionRate,
      costPerLead,
      costPerClick,
      byChannel,
      byProperty,
    }
  }, [reports])

  return metrics
}
