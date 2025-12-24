import { useState } from 'react'
import { Deal } from '@/types'
import { FunnelStage } from '@/types'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DealKanbanProps {
  deals: Deal[]
  stages: FunnelStage[]
  onDealClick: (deal: Deal) => void
  onStageChange: (dealId: string, newStage: string) => void
  onOpenTasks?: (deal: Deal) => void
  loading?: boolean
}

export const DealKanban = ({ deals, stages, onDealClick, onStageChange, onOpenTasks, loading }: DealKanbanProps) => {
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
              {stageTotal > 0 && (
                <p className="text-sm text-primary-red font-semibold">
                  {formatCurrency(stageTotal, 'BRL')}
                </p>
              )}
            </div>

            <div className="space-y-3 min-h-[200px]">
              {stageDeals.map((deal) => (
                <Card
                  key={deal.id}
                  variant="elevated"
                  className="cursor-pointer hover:border-primary-red/50 transition-all"
                  draggable
                  onDragStart={() => handleDragStart(deal)}
                  onClick={() => onDealClick(deal)}
                >
                  <div className="space-y-2">
                    <h4 className="font-medium text-white">{deal.title}</h4>
                    <p className="text-lg font-bold text-primary-red">
                      {formatCurrency(deal.value, deal.currency)}
                    </p>
                    {deal.expectedCloseDate && (
                      <p className="text-xs text-white/60">
                        Fechamento: {format(deal.expectedCloseDate.toDate(), "dd/MM/yyyy", { locale: ptBR })}
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
              ))}
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

