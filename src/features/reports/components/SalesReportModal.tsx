import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useSalesReport, SalesReportFilters } from '../hooks/useSalesReport'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'

interface SalesReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SalesReportModal = ({ isOpen, onClose }: SalesReportModalProps) => {
  const { activeFunnel } = useFunnels()
  const [filters, setFilters] = useState<SalesReportFilters>({})
  const { reportData, loading } = useSalesReport(filters)


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Relatório de Vendas"
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

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    status: e.target.value as any || undefined,
                  })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                >
                  <option value="">Todos os status</option>
                  <option value="active">Ativa</option>
                  <option value="won">Vendida</option>
                  <option value="lost">Perdida</option>
                  <option value="paused">Pausada</option>
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
              <Button
                variant="primary-red"
              >
                Gerar Relatório
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <div className="p-4">
                  <p className="text-sm text-white/70 mb-1">Total de Negociações</p>
                  <p className="text-2xl font-bold text-white">{reportData.totalDeals}</p>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <p className="text-sm text-white/70 mb-1">Valor Total</p>
                  <p className="text-2xl font-bold text-primary-red">
                    {formatCurrency(reportData.totalValue, 'BRL')}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <p className="text-sm text-white/70 mb-1">Vendidas</p>
                  <p className="text-2xl font-bold text-green-400">
                    {reportData.wonDeals} ({formatCurrency(reportData.wonValue, 'BRL')})
                  </p>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <p className="text-sm text-white/70 mb-1">Perdidas</p>
                  <p className="text-2xl font-bold text-red-400">
                    {reportData.lostDeals} ({formatCurrency(reportData.lostValue, 'BRL')})
                  </p>
                </div>
              </Card>
            </div>

            {/* Por Estágio */}
            {reportData.dealsByStage.length > 0 && (
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Por Estágio</h3>
                  <div className="space-y-3">
                    {reportData.dealsByStage.map(item => (
                      <div key={item.stageId} className="flex items-center justify-between py-2 border-b border-white/10">
                        <div>
                          <p className="text-white font-medium">{item.stageName}</p>
                          <p className="text-sm text-white/70">{item.count} negociações</p>
                        </div>
                        <p className="text-lg font-bold text-primary-red">
                          {formatCurrency(item.value, 'BRL')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Por Responsável */}
            {reportData.dealsByResponsible.length > 0 && (
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Por Responsável</h3>
                  <div className="space-y-3">
                    {reportData.dealsByResponsible.map(item => (
                      <div key={item.userId} className="flex items-center justify-between py-2 border-b border-white/10">
                        <div>
                          <p className="text-white font-medium">{item.userName || item.userId}</p>
                          <p className="text-sm text-white/70">{item.count} negociações</p>
                        </div>
                        <p className="text-lg font-bold text-primary-red">
                          {formatCurrency(item.value, 'BRL')}
                        </p>
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

