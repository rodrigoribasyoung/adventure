import { useState } from 'react'
import { Deal } from '@/types'
import { FunnelStage } from '@/types'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { toDate } from '@/lib/utils/timestamp'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FiArrowUp, FiArrowDown, FiPause, FiPlay } from 'react-icons/fi'

interface DealKanbanProps {
  deals: Deal[]
  stages: FunnelStage[]
  onDealClick: (deal: Deal) => void
  onStageChange: (dealId: string, newStage: string) => void
  onOpenTasks?: (deal: Deal) => void
  onWinDeal?: (dealId: string) => void
  onLoseDeal?: (dealId: string) => void
  onPauseDeal?: (dealId: string) => void
  onResumeDeal?: (dealId: string) => void
  loading?: boolean
  selectedDealIds?: Set<string>
  onToggleSelect?: (dealId: string) => void
  onSelectAll?: () => void
}

export const DealKanban = ({ 
  deals, 
  stages, 
  onDealClick, 
  onStageChange, 
  onOpenTasks,
  onWinDeal,
  onLoseDeal,
  onPauseDeal,
  onResumeDeal,
  loading,
  selectedDealIds = new Set(),
  onToggleSelect
}: DealKanbanProps) => {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)

  const sortedStages = [...stages].sort((a, b) => a.order - b.order)

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId)
  }

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    if (draggedDeal && draggedDeal.stage !== stageId) {
      onStageChange(draggedDeal.id, stageId)
    }
    setDraggedDeal(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando negociações...</div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {sortedStages.map((stage) => {
        const stageDeals = getDealsByStage(stage.id)
        const stageTotal = stageDeals.reduce((sum, deal) => sum + deal.value, 0)

        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80 bg-background-darker border border-white/10 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{stage.name}</h3>
                <span className="px-2 py-1 text-xs bg-white/10 text-white/70 rounded">
                  {stageDeals.length}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-primary-red font-semibold">
                  {formatCurrency(stageTotal, 'BRL')}
                </p>
                <p className="text-xs text-white/60">
                  {stageDeals.length} {stageDeals.length === 1 ? 'negociação' : 'negociações'}
                </p>
              </div>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {stageDeals.map((deal) => {
                const isSelected = selectedDealIds.has(deal.id)
                return (
                  <Card
                    key={deal.id}
                    variant="elevated"
                    className={`cursor-pointer hover:border-primary-red/50 transition-all ${
                      isSelected ? 'border-primary-red border-2' : ''
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    onClick={(e) => {
                      if (onToggleSelect && (e.target as HTMLElement).closest('.checkbox-container')) {
                        e.stopPropagation()
                        onToggleSelect(deal.id)
                      } else {
                        onDealClick(deal)
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        {onToggleSelect && (
                          <div 
                            className="checkbox-container flex-shrink-0 mt-0.5"
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleSelect(deal.id)
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleSelect(deal.id)}
                              className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-red focus:ring-primary-red focus:ring-offset-0 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                        <h4 className="font-medium text-white flex-1">{deal.title}</h4>
                      </div>
                    <p className="text-lg font-bold text-primary-red">
                      {formatCurrency(deal.value, deal.currency)}
                    </p>
                    {deal.expectedCloseDate && (
                      <p className="text-xs text-white/60">
                        Fechamento: {(() => {
                          const date = toDate(deal.expectedCloseDate)
                          return date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : '-'
                        })()}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">
                        {deal.probability}% de chance
                      </span>
                      {deal.serviceIds && deal.serviceIds.length > 0 && (
                        <span className="text-xs text-white/60">
                          {deal.serviceIds.length} serviço(s)
                        </span>
                      )}
                    </div>
                    {deal.contractUrl && (
                      <a
                        href={deal.contractUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary-blue hover:underline mt-2 block"
                      >
                        📄 Ver Contrato
                      </a>
                    )}
                    {/* Botões de Ação Rápida */}
                    {deal.status === 'active' && (
                      <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                        {onWinDeal && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onWinDeal(deal.id)
                            }}
                            className="flex-1 px-2 py-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 transition-all flex items-center justify-center gap-1"
                            title="Marcar como ganho"
                          >
                            <FiArrowUp className="w-3 h-3" />
                            Ganho
                          </button>
                        )}
                        {onLoseDeal && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onLoseDeal(deal.id)
                            }}
                            className="flex-1 px-2 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 transition-all flex items-center justify-center gap-1"
                            title="Marcar como perda"
                          >
                            <FiArrowDown className="w-3 h-3" />
                            Perda
                          </button>
                        )}
                        {onPauseDeal && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onPauseDeal(deal.id)
                            }}
                            className="px-2 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-400 transition-all"
                            title="Pausar negociação"
                          >
                            <FiPause className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                    {deal.status === 'paused' && onResumeDeal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onResumeDeal(deal.id)
                        }}
                        className="w-full mt-2 px-3 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-400 transition-all flex items-center justify-center gap-1"
                        title="Retomar negociação"
                      >
                        <FiPlay className="w-3 h-3" />
                        Retomar
                      </button>
                    )}
                    {onOpenTasks && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenTasks(deal)
                        }}
                        className="w-full mt-2 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/90 transition-all"
                      >
                        📋 Tarefas
                      </button>
                    )}
                  </div>
                </Card>
              )})}
              {stageDeals.length === 0 && (
                <div className="text-center py-8 text-white/40 text-sm">
                  Nenhuma negociação
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

