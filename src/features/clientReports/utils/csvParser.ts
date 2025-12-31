import { Timestamp } from 'firebase/firestore'
import { MarketingReport, SalesReport, MarketingChannel, MarketingMetrics, SalesMetrics } from '../types'

// Converter formato brasileiro de número (1.234,56) para number
const parseBrazilianNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0
  const cleaned = value.replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

// Converter formato brasileiro de data (DD/MM/YYYY) para Timestamp
const parseBrazilianDate = (value: string): Timestamp | null => {
  if (!value || value.trim() === '') return null
  const parts = value.split('/')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1 // JavaScript months are 0-indexed
  const year = parseInt(parts[2])
  const date = new Date(year, month, day)
  if (isNaN(date.getTime())) return null
  return Timestamp.fromDate(date)
}

// Mapear canal do CSV para MarketingChannel
const mapChannel = (canal: string): MarketingChannel => {
  const lower = canal.toLowerCase()
  if (lower.includes('google')) return 'google_ads'
  if (lower.includes('meta') || lower.includes('facebook')) return 'meta_ads'
  if (lower.includes('hotsite')) return 'hotsite'
  if (lower.includes('imobiliária') || lower.includes('imobiliaria')) return 'real_estate'
  return 'other'
}

// Parse de uma linha CSV considerando aspas e vírgulas
export const parseCsvLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

// Parse completo do CSV
export const parseCsv = (text: string): any[] => {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) {
    throw new Error('CSV deve ter pelo menos um cabeçalho e uma linha de dados')
  }

  const headers = parseCsvLine(lines[0])
  const data: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const row: any = {}
    
    headers.forEach((header, index) => {
      let value = values[index] || ''
      // Remove aspas do início e fim se existirem
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      }
      row[header.trim()] = value
    })
    
    data.push(row)
  }

  return data
}

// Transformar dados CSV em MarketingReport
export const transformToMarketingReport = (
  row: any,
  projectId: string,
  createdBy: string
): MarketingReport | null => {
  // Verificar se é tipo Marketing
  const tipoRelatorio = row['Tipo de relatório'] || ''
  if (!tipoRelatorio.includes('1.Marketing')) return null

  const date = parseBrazilianDate(row['Data'])
  if (!date) return null

  const activeProperty = row['Ativo'] || ''
  const canal = row['Canal'] || ''
  const channel = mapChannel(canal)

  const metrics: MarketingMetrics = {
    impressions: parseFloat(row['Impressões'] || '0') || 0,
    linkClicks: parseFloat(row['Cliques no link'] || '0') || 0,
    registrations: parseFloat(row['Cadastros'] || '0') || 0,
    conversationsStarted: parseFloat(row['Conversas iniciadas'] || '0') || 0,
    totalLeads: parseFloat(row['Leads totais (soma)'] || '0') || 0,
    investmentValue: parseBrazilianNumber(row['Valor do investimento - R$'] || '0'),
    platformBalance: parseBrazilianNumber(row['Saldo atual na plataforma - R$'] || '0'),
  }

  const weekISO = parseInt(row['Semana ISO'] || '0') || 0

  return {
    id: '', // Será gerado pelo Firestore
    projectId,
    date,
    weekISO,
    activeProperty,
    channel,
    investmentCategory: row['Categoria do investimento'] || undefined,
    investmentDetail: row['Detalhamento do investimento'] || undefined,
    metrics,
    campaignObjective: row['Objetivo da campanha'] || undefined,
    adLink: row['Link do anúncio'] || undefined,
    conversionChannel: row['Canal de conversão'] || undefined,
    conversionDetails: row['Detalhes da conversão'] || undefined,
    purchaseInterest: row['Interesse de compra'] || undefined,
    medium: row['medium'] || undefined,
    source: row['source'] || undefined,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy,
  } as MarketingReport
}

// Transformar dados CSV em SalesReport
export const transformToSalesReport = (
  row: any,
  projectId: string,
  createdBy: string
): SalesReport | null => {
  // Verificar se é tipo Vendas
  const tipoRelatorio = row['Tipo de relatório'] || ''
  if (!tipoRelatorio.includes('2.Vendas')) return null

  const date = parseBrazilianDate(row['Data'])
  if (!date) return null

  const activeProperty = row['Ativo'] || ''

  // Criar metrics apenas com valores válidos (não undefined)
  const metrics: SalesMetrics = {}
  
  const activities = parseFloat(row['Atividades'] || '0')
  if (!isNaN(activities) && activities > 0) metrics.activities = activities
  
  const dealsCreated = parseFloat(row['Negociações criadas'] || '0')
  if (!isNaN(dealsCreated) && dealsCreated > 0) metrics.dealsCreated = dealsCreated
  
  const leadsReceived = parseFloat(row['Leads recebidos'] || '0')
  if (!isNaN(leadsReceived) && leadsReceived > 0) metrics.leadsReceived = leadsReceived
  
  const contactsMade = parseFloat(row['Contatos feitos'] || '0')
  if (!isNaN(contactsMade) && contactsMade > 0) metrics.contactsMade = contactsMade
  
  const scheduledVisits = parseFloat(row['Visitas agendadas'] || '0')
  if (!isNaN(scheduledVisits) && scheduledVisits > 0) metrics.scheduledVisits = scheduledVisits
  
  const completedVisits = parseFloat(row['Visitas realizadas'] || '0')
  if (!isNaN(completedVisits) && completedVisits > 0) metrics.completedVisits = completedVisits
  
  const signedContracts = parseFloat(row['Fichas assinadas'] || '0')
  if (!isNaN(signedContracts) && signedContracts > 0) metrics.signedContracts = signedContracts
  
  const internalSales = parseFloat(row['Vendas internas'] || '0')
  if (!isNaN(internalSales) && internalSales > 0) metrics.internalSales = internalSales
  
  const losses = parseFloat(row['Perdas'] || '0')
  if (!isNaN(losses) && losses > 0) metrics.losses = losses
  
  const realEstateContacts = parseFloat(row['Contatos com imobiliárias'] || '0')
  if (!isNaN(realEstateContacts) && realEstateContacts > 0) metrics.realEstateContacts = realEstateContacts
  
  const realEstateVideoCalls = parseFloat(row['Videochamadas com imobiliárias'] || '0')
  if (!isNaN(realEstateVideoCalls) && realEstateVideoCalls > 0) metrics.realEstateVideoCalls = realEstateVideoCalls
  
  const realEstateVisits = parseFloat(row['Visitas com imobiliárias'] || '0')
  if (!isNaN(realEstateVisits) && realEstateVisits > 0) metrics.realEstateVisits = realEstateVisits
  
  const realEstateLeadsInProcess = parseFloat(row['Leads de imobiliárias em atendimento'] || '0')
  if (!isNaN(realEstateLeadsInProcess) && realEstateLeadsInProcess > 0) metrics.realEstateLeadsInProcess = realEstateLeadsInProcess
  
  const sales = parseFloat(row['Vendas'] || '0')
  if (!isNaN(sales) && sales > 0) metrics.sales = sales

  const weekISO = parseInt(row['Semana ISO'] || '0') || 0

  return {
    id: '', // Será gerado pelo Firestore
    projectId,
    date,
    weekISO,
    activeProperty,
    reportCategory: row['Categoria do relatório'] || undefined,
    crmFunnel: row['Funil do CRM'] || undefined,
    metrics,
    saleIntermediation: row['Intermediação da venda'] || undefined,
    internalSalesResponsible: row['Responsável pela venda interna'] || undefined,
    externalSalesResponsible: row['Responsável pela venda externa'] || undefined,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy,
  } as SalesReport
}

// Processar CSV completo e retornar arrays de MarketingReports e SalesReports
export const processClientReportsCsv = (
  csvData: any[],
  projectId: string,
  createdBy: string
): { marketingReports: MarketingReport[]; salesReports: SalesReport[] } => {
  const marketingReports: MarketingReport[] = []
  const salesReports: SalesReport[] = []

  csvData.forEach(row => {
    const marketingReport = transformToMarketingReport(row, projectId, createdBy)
    if (marketingReport) {
      marketingReports.push(marketingReport)
    }

    const salesReport = transformToSalesReport(row, projectId, createdBy)
    if (salesReport) {
      salesReports.push(salesReport)
    }
  })

  return { marketingReports, salesReports }
}
