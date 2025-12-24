import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useConversionReport, ConversionReportFilters } from '../hooks/useConversionReport'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'

interface ConversionReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ConversionReportModal = ({ isOpen, onClose }: ConversionReportModalProps) => {
  const { activeFunnel } = useFunnels()
  const [filters, setFilters] = useState<ConversionReportFilters>({})
  const { reportData, loading } = useConversionReport(filters)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Relatório de Conversão"
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

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Estágio
                </label>
                <select
                  value={filters.stageId || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    stageId: e.target.value || undefined,
                  })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                >
                  <option value="">Todos os estágios</option>
                  {activeFunnel?.stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>
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
            {/* Métrica Principal */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Taxa de Conversão Geral</h3>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-white/70 mb-1">Taxa de Conversão</p>
                    <p className="text-4xl font-bold text-primary-red">
                      {reportData.overallConversionRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/70">Vendidas: {reportData.totalWon}</span>
                      <span className="text-white/70">Perdidas: {reportData.totalLost}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                        style={{ width: `${reportData.overallConversionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Por Estágio */}
            {reportData.conversionByStage.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Taxa de Conversão por Estágio</h3>
                  <div className="space-y-4">
                    {reportData.conversionByStage.map(item => (
                      <div key={item.stageId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">{item.stageName}</p>
                          <p className="text-lg font-bold text-primary-red">
                            {item.conversionRate.toFixed(1)}%
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Vendidas: {item.won} | Perdidas: {item.lost}</span>
                          <span>Total: {item.won + item.lost}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                            style={{ width: `${item.conversionRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Por Período */}
            {reportData.conversionByPeriod.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Taxa de Conversão por Período (Mensal)</h3>
                  <div className="space-y-4">
                    {reportData.conversionByPeriod.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">{item.period}</p>
                          <p className="text-lg font-bold text-primary-red">
                            {item.conversionRate.toFixed(1)}%
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Vendidas: {item.won} | Perdidas: {item.lost}</span>
                          <span>Total: {item.won + item.lost}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                            style={{ width: `${item.conversionRate}%` }}
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

        <div className="flex justify-end">
          <Button variant="primary-red" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

