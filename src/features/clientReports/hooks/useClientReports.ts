import { useMarketingReports } from './useMarketingReports'
import { useSalesReports } from './useSalesReports'
import { MarketingReport, SalesReport } from '../types'

export const useClientReports = (projectId?: string) => {
  const marketingReports = useMarketingReports(projectId)
  const salesReports = useSalesReports(projectId)

  // Métodos combinados
  const createMarketingReport = async (data: Omit<MarketingReport, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    return marketingReports.createReport(data)
  }

  const createSalesReport = async (data: Omit<SalesReport, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    return salesReports.createReport(data)
  }

  // Métodos para criar com todos os campos (incluindo id temporário para importação)
  const createMarketingReportFull = async (data: MarketingReport) => {
    const { id, createdAt, updatedAt, createdBy, ...reportData } = data
    return marketingReports.createReport(reportData)
  }

  const createSalesReportFull = async (data: SalesReport) => {
    const { id, createdAt, updatedAt, createdBy, ...reportData } = data
    return salesReports.createReport(reportData)
  }

  const refetchAll = async () => {
    await Promise.all([marketingReports.refetch(), salesReports.refetch()])
  }

  return {
    // Marketing
    marketingReports: marketingReports.reports,
    marketingLoading: marketingReports.loading,
    marketingError: marketingReports.error,
    createMarketingReport,
    updateMarketingReport: marketingReports.updateReport,
    deleteMarketingReport: marketingReports.deleteReport,
    
    // Sales
    salesReports: salesReports.reports,
    salesLoading: salesReports.loading,
    salesError: salesReports.error,
    createSalesReport,
    updateSalesReport: salesReports.updateReport,
    deleteSalesReport: salesReports.deleteReport,
    
    // Full report creators (for CSV import)
    createMarketingReportFull,
    createSalesReportFull,
    
    // Combined
    loading: marketingReports.loading || salesReports.loading,
    error: marketingReports.error || salesReports.error,
    refetchAll,
  }
}
