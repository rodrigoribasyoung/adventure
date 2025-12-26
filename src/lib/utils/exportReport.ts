import { formatCurrency } from './formatCurrency'
import type { SalesReportData } from '@/features/reports/hooks/useSalesReport'
import type { ConversionReportData } from '@/features/reports/hooks/useConversionReport'
import type { PipelineReportData } from '@/features/reports/hooks/usePipelineReport'

/**
 * Exporta dados para CSV
 */
export const exportToCSV = (data: string[][], filename: string) => {
  const csvContent = data.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n')
  
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Exporta relatório de vendas para CSV
 */
export const exportSalesReportToCSV = (reportData: SalesReportData, filters?: { startDate?: Date; endDate?: Date; stageId?: string; status?: string }) => {
  const rows: string[][] = []
  
  // Cabeçalho
  rows.push(['Relatório de Vendas'])
  if (filters?.startDate || filters?.endDate) {
    const period = `${filters.startDate?.toLocaleDateString('pt-BR') || 'Início'} a ${filters.endDate?.toLocaleDateString('pt-BR') || 'Fim'}`
    rows.push(['Período:', period])
  }
  rows.push([])
  
  // Métricas principais
  rows.push(['Métricas Principais'])
  rows.push(['Total de Negociações', reportData.totalDeals.toString()])
  rows.push(['Valor Total', formatCurrency(reportData.totalValue, 'BRL')])
  rows.push(['Negociações Vendidas', `${reportData.wonDeals} (${formatCurrency(reportData.wonValue, 'BRL')})`])
  rows.push(['Negociações Perdidas', `${reportData.lostDeals} (${formatCurrency(reportData.lostValue, 'BRL')})`])
  rows.push(['Negociações Ativas', `${reportData.activeDeals} (${formatCurrency(reportData.activeValue, 'BRL')})`])
  rows.push([])
  
  // Por estágio
  if (reportData.dealsByStage.length > 0) {
    rows.push(['Por Estágio'])
    rows.push(['Estágio', 'Quantidade', 'Valor'])
    reportData.dealsByStage.forEach(item => {
      rows.push([item.stageName, item.count.toString(), formatCurrency(item.value, 'BRL')])
    })
    rows.push([])
  }
  
  // Por responsável
  if (reportData.dealsByResponsible.length > 0) {
    rows.push(['Por Responsável'])
    rows.push(['Responsável', 'Quantidade', 'Valor'])
    reportData.dealsByResponsible.forEach(item => {
      rows.push([item.userName || item.userId, item.count.toString(), formatCurrency(item.value, 'BRL')])
    })
  }
  
  const filename = `relatorio-vendas-${new Date().toISOString().split('T')[0]}`
  exportToCSV(rows, filename)
}

/**
 * Exporta relatório de conversão para CSV
 */
export const exportConversionReportToCSV = (reportData: ConversionReportData, filters?: { startDate?: Date; endDate?: Date }) => {
  const rows: string[][] = []
  
  // Cabeçalho
  rows.push(['Relatório de Conversão'])
  if (filters?.startDate || filters?.endDate) {
    const period = `${filters.startDate?.toLocaleDateString('pt-BR') || 'Início'} a ${filters.endDate?.toLocaleDateString('pt-BR') || 'Fim'}`
    rows.push(['Período:', period])
  }
  rows.push([])
  
  // Métricas principais
  rows.push(['Métricas Principais'])
  rows.push(['Taxa de Conversão Geral', `${reportData.overallConversionRate.toFixed(2)}%`])
  rows.push(['Total Vendidas', reportData.totalWon.toString()])
  rows.push(['Total Perdidas', reportData.totalLost.toString()])
  rows.push(['Total Fechadas', reportData.totalClosed.toString()])
  rows.push([])
  
  // Por estágio
  if (reportData.conversionByStage.length > 0) {
    rows.push(['Conversão por Estágio'])
    rows.push(['Estágio', 'Vendidas', 'Perdidas', 'Total', 'Taxa de Conversão (%)'])
    reportData.conversionByStage.forEach(item => {
      rows.push([
        item.stageName,
        item.won.toString(),
        item.lost.toString(),
        (item.won + item.lost).toString(),
        item.conversionRate.toFixed(2)
      ])
    })
    rows.push([])
  }
  
  // Por período
  if (reportData.conversionByPeriod.length > 0) {
    rows.push(['Conversão por Período (Mensal)'])
    rows.push(['Período', 'Vendidas', 'Perdidas', 'Total', 'Taxa de Conversão (%)'])
    reportData.conversionByPeriod.forEach(item => {
      rows.push([
        item.period,
        item.won.toString(),
        item.lost.toString(),
        (item.won + item.lost).toString(),
        item.conversionRate.toFixed(2)
      ])
    })
  }
  
  const filename = `relatorio-conversao-${new Date().toISOString().split('T')[0]}`
  exportToCSV(rows, filename)
}

/**
 * Exporta relatório de pipeline para CSV
 */
export const exportPipelineReportToCSV = (reportData: PipelineReportData, filters?: { startDate?: Date; endDate?: Date }) => {
  const rows: string[][] = []
  
  // Cabeçalho
  rows.push(['Relatório de Pipeline'])
  if (filters?.startDate || filters?.endDate) {
    const period = `${filters.startDate?.toLocaleDateString('pt-BR') || 'Início'} a ${filters.endDate?.toLocaleDateString('pt-BR') || 'Fim'}`
    rows.push(['Período:', period])
  }
  rows.push([])
  
  // Métricas principais
  rows.push(['Métricas Principais'])
  rows.push(['Total de Negociações', reportData.totalDeals.toString()])
  rows.push(['Valor Total do Pipeline', formatCurrency(reportData.totalValue, 'BRL')])
  rows.push(['Ticket Médio', formatCurrency(reportData.averageDealValue, 'BRL')])
  if (reportData.averageTimeToClose !== undefined) {
    rows.push(['Tempo Médio para Fechamento', `${reportData.averageTimeToClose.toFixed(1)} dias`])
  }
  rows.push([])
  
  // Por estágio
  if (reportData.distributionByStage.length > 0) {
    rows.push(['Distribuição por Estágio'])
    rows.push(['Estágio', 'Quantidade', 'Valor', 'Percentual (%)', 'Tempo Médio no Estágio (dias)'])
    reportData.distributionByStage.forEach(item => {
      rows.push([
        item.stageName,
        item.count.toString(),
        formatCurrency(item.value, 'BRL'),
        item.percentage.toFixed(2),
        item.averageTimeInStage !== undefined ? item.averageTimeInStage.toFixed(1) : 'N/A'
      ])
    })
  }
  
  const filename = `relatorio-pipeline-${new Date().toISOString().split('T')[0]}`
  exportToCSV(rows, filename)
}

/**
 * Exporta relatório para PDF usando jsPDF
 */
export const exportToPDF = async (
  title: string,
  content: Array<{ label: string; value: string }>,
  tables?: Array<{ title: string; headers: string[]; rows: string[][] }>,
  filename?: string
) => {
  try {
    // Importação dinâmica do jsPDF
    const { default: jsPDF } = await import('jspdf')
    
    const doc = new jsPDF()
    let yPos = 20
    
    // Título
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(title, 14, yPos)
    yPos += 10
    
    // Data do relatório
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, yPos)
    yPos += 15
    
    // Conteúdo principal (métricas)
    if (content.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Métricas Principais', 14, yPos)
      yPos += 8
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      content.forEach(item => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.setFont('helvetica', 'bold')
        doc.text(item.label + ':', 14, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(item.value, 80, yPos)
        yPos += 7
      })
      yPos += 5
    }
    
    // Tabelas
    if (tables && tables.length > 0) {
      tables.forEach(table => {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }
        
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(table.title, 14, yPos)
        yPos += 10
        
        // Criar tabela
        const colWidths = table.headers.map(() => 45) // Largura fixa por coluna
        const startX = 14
        
        // Cabeçalho da tabela
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        let xPos = startX
        table.headers.forEach((header, index) => {
          doc.text(header, xPos, yPos)
          xPos += colWidths[index]
        })
        yPos += 8
        
        // Linhas da tabela
        doc.setFont('helvetica', 'normal')
        table.rows.forEach(row => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          xPos = startX
          row.forEach((cell, index) => {
            const text = String(cell)
            const maxWidth = colWidths[index] - 2
            const lines = doc.splitTextToSize(text, maxWidth)
            doc.text(lines, xPos, yPos)
            xPos += colWidths[index]
          })
          yPos += 8
        })
        yPos += 10
      })
    }
    
    // Salvar PDF
    doc.save(filename || `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    throw new Error('Erro ao gerar PDF. Certifique-se de que a biblioteca jsPDF está instalada.')
  }
}

/**
 * Exporta relatório de vendas para PDF
 */
export const exportSalesReportToPDF = async (reportData: SalesReportData, filters?: { startDate?: Date; endDate?: Date; stageId?: string; status?: string }) => {
  const content: Array<{ label: string; value: string }> = [
    { label: 'Total de Negociações', value: reportData.totalDeals.toString() },
    { label: 'Valor Total', value: formatCurrency(reportData.totalValue, 'BRL') },
    { label: 'Negociações Vendidas', value: `${reportData.wonDeals} (${formatCurrency(reportData.wonValue, 'BRL')})` },
    { label: 'Negociações Perdidas', value: `${reportData.lostDeals} (${formatCurrency(reportData.lostValue, 'BRL')})` },
    { label: 'Negociações Ativas', value: `${reportData.activeDeals} (${formatCurrency(reportData.activeValue, 'BRL')})` },
  ]
  
  const tables: Array<{ title: string; headers: string[]; rows: string[][] }> = []
  
  if (reportData.dealsByStage.length > 0) {
    tables.push({
      title: 'Por Estágio',
      headers: ['Estágio', 'Quantidade', 'Valor'],
      rows: reportData.dealsByStage.map(item => [
        item.stageName,
        item.count.toString(),
        formatCurrency(item.value, 'BRL')
      ])
    })
  }
  
  if (reportData.dealsByResponsible.length > 0) {
    tables.push({
      title: 'Por Responsável',
      headers: ['Responsável', 'Quantidade', 'Valor'],
      rows: reportData.dealsByResponsible.map(item => [
        item.userName || item.userId,
        item.count.toString(),
        formatCurrency(item.value, 'BRL')
      ])
    })
  }
  
  let title = 'Relatório de Vendas'
  if (filters?.startDate || filters?.endDate) {
    const period = `${filters.startDate?.toLocaleDateString('pt-BR') || 'Início'} a ${filters.endDate?.toLocaleDateString('pt-BR') || 'Fim'}`
    title += ` - ${period}`
  }
  
  await exportToPDF(title, content, tables, `relatorio-vendas-${new Date().toISOString().split('T')[0]}.pdf`)
}

/**
 * Exporta relatório de conversão para PDF
 */
export const exportConversionReportToPDF = async (reportData: ConversionReportData, filters?: { startDate?: Date; endDate?: Date }) => {
  const content: Array<{ label: string; value: string }> = [
    { label: 'Taxa de Conversão Geral', value: `${reportData.overallConversionRate.toFixed(2)}%` },
    { label: 'Total Vendidas', value: reportData.totalWon.toString() },
    { label: 'Total Perdidas', value: reportData.totalLost.toString() },
    { label: 'Total Fechadas', value: reportData.totalClosed.toString() },
  ]
  
  const tables: Array<{ title: string; headers: string[]; rows: string[][] }> = []
  
  if (reportData.conversionByStage.length > 0) {
    tables.push({
      title: 'Conversão por Estágio',
      headers: ['Estágio', 'Vendidas', 'Perdidas', 'Total', 'Taxa (%)'],
      rows: reportData.conversionByStage.map(item => [
        item.stageName,
        item.won.toString(),
        item.lost.toString(),
        (item.won + item.lost).toString(),
        item.conversionRate.toFixed(2)
      ])
    })
  }
  
  if (reportData.conversionByPeriod.length > 0) {
    tables.push({
      title: 'Conversão por Período (Mensal)',
      headers: ['Período', 'Vendidas', 'Perdidas', 'Total', 'Taxa (%)'],
      rows: reportData.conversionByPeriod.map(item => [
        item.period,
        item.won.toString(),
        item.lost.toString(),
        (item.won + item.lost).toString(),
        item.conversionRate.toFixed(2)
      ])
    })
  }
  
  let title = 'Relatório de Conversão'
  if (filters?.startDate || filters?.endDate) {
    const period = `${filters.startDate?.toLocaleDateString('pt-BR') || 'Início'} a ${filters.endDate?.toLocaleDateString('pt-BR') || 'Fim'}`
    title += ` - ${period}`
  }
  
  await exportToPDF(title, content, tables, `relatorio-conversao-${new Date().toISOString().split('T')[0]}.pdf`)
}

/**
 * Exporta relatório de pipeline para PDF
 */
export const exportPipelineReportToPDF = async (reportData: PipelineReportData, filters?: { startDate?: Date; endDate?: Date }) => {
  const content: Array<{ label: string; value: string }> = [
    { label: 'Total de Negociações', value: reportData.totalDeals.toString() },
    { label: 'Valor Total do Pipeline', value: formatCurrency(reportData.totalValue, 'BRL') },
    { label: 'Ticket Médio', value: formatCurrency(reportData.averageDealValue, 'BRL') },
  ]
  
  if (reportData.averageTimeToClose !== undefined) {
    content.push({
      label: 'Tempo Médio para Fechamento',
      value: `${reportData.averageTimeToClose.toFixed(1)} dias`
    })
  }
  
  const tables: Array<{ title: string; headers: string[]; rows: string[][] }> = []
  
  if (reportData.distributionByStage.length > 0) {
    tables.push({
      title: 'Distribuição por Estágio',
      headers: ['Estágio', 'Quantidade', 'Valor', 'Percentual (%)', 'Tempo Médio (dias)'],
      rows: reportData.distributionByStage.map(item => [
        item.stageName,
        item.count.toString(),
        formatCurrency(item.value, 'BRL'),
        item.percentage.toFixed(2),
        item.averageTimeInStage !== undefined ? item.averageTimeInStage.toFixed(1) : 'N/A'
      ])
    })
  }
  
  let title = 'Relatório de Pipeline'
  if (filters?.startDate || filters?.endDate) {
    const period = `${filters.startDate?.toLocaleDateString('pt-BR') || 'Início'} a ${filters.endDate?.toLocaleDateString('pt-BR') || 'Fim'}`
    title += ` - ${period}`
  }
  
  await exportToPDF(title, content, tables, `relatorio-pipeline-${new Date().toISOString().split('T')[0]}.pdf`)
}


