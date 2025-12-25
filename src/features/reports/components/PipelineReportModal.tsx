import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { usePipelineReport, PipelineReportFilters } from '../hooks/usePipelineReport'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { exportPipelineReportToCSV, exportPipelineReportToPDF } from '@/lib/utils/exportReport'
import { Toast } from '@/components/ui/Toast'

interface PipelineReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PipelineReportModal = ({ isOpen, onClose }: PipelineReportModalProps) => {
  const [filters, setFilters] = useState<PipelineReportFilters>({})
  const { reportData, loading } = usePipelineReport(filters)
  const [exportLoading, setExportLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const formatDays = (days?: number) => {
    if (!days) return 'N/A'
    if (days < 1) return '< 1 dia'
    if (days === 1) return '1 dia'
    return `${Math.round(days)} dias`
  }

  const handleExportCSV = () => {
    if (!reportData) return
    try {
      exportPipelineReportToCSV(reportData, filters)
      setToast({ message: 'Relatório exportado para CSV com sucesso!', type: 'success', visible: true })
    } catch (error) {
      setToast({ message: 'Erro ao exportar CSV', type: 'error', visible: true })
    }
  }

  const handleExportPDF = async () => {
    if (!reportData) return
    try {
      setExportLoading(true)
      await exportPipelineReportToPDF(reportData, filters)
      setToast({ message: 'Relatório exportado para PDF com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      setToast({ message: error.message || 'Erro ao exportar PDF', type: 'error', visible: true })
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Relatório de Pipeline"
      size="xl"
    >
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Filtros</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data Início"
                type="date"
                value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFilters({
                  ...filters,
                  startDate: e.target.value ? new Date(e.target.value) : undefined,
                })}
              />

              <Input
                label="Data Fim"
                type="date"
                value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFilters({
                  ...filters,
                  endDate: e.target.value ? new Date(e.target.value) : undefined,
                })}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setFilters({})}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white/70">Carregando relatório...</div>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="p-4">
                  <p className="text-sm text-white/70 mb-1">Total de Negociações</p>
                  <p className="text-2xl font-bold text-white">{reportData.totalDeals}</p>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <p className="text-sm text-white/70 mb-1">Valor Total do Pipeline</p>
                  <p className="text-2xl font-bold text-primary-red">
                    {formatCurrency(reportData.totalValue, 'BRL')}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <p className="text-sm text-white/70 mb-1">Ticket Médio</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(reportData.averageDealValue, 'BRL')}
                  </p>
                </div>
              </Card>
            </div>

            {reportData.averageTimeToClose !== undefined && (
              <Card>
                <div className="p-4">
                  <p className="text-sm text-white/70 mb-1">Tempo Médio para Fechamento</p>
                  <p className="text-2xl font-bold text-white">
                    {formatDays(reportData.averageTimeToClose)}
                  </p>
                </div>
              </Card>
            )}

            {/* Distribuição por Estágio */}
            {reportData.distributionByStage.length > 0 && (
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Estágio</h3>
                  <div className="space-y-4">
                    {reportData.distributionByStage.map(item => (
                      <div key={item.stageId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{item.stageName}</p>
                            <p className="text-sm text-white/70">
                              {item.count} negociações ({item.percentage.toFixed(1)}% do valor)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary-red">
                              {formatCurrency(item.value, 'BRL')}
                            </p>
                            {item.averageTimeInStage !== undefined && (
                              <p className="text-xs text-white/60">
                                {formatDays(item.averageTimeInStage)} no estágio
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-blue to-primary-red transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : null}

        <div className="flex justify-between items-center">
          {reportData && (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleExportCSV}
                disabled={exportLoading}
              >
                Exportar CSV
              </Button>
              <Button
                variant="ghost"
                onClick={handleExportPDF}
                disabled={exportLoading}
              >
                {exportLoading ? 'Exportando...' : 'Exportar PDF'}
              </Button>
            </div>
          )}
          <div className="flex gap-3 ml-auto">
            <Button variant="primary-red" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </Modal>
  )
}


