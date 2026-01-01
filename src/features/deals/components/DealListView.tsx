import { useState, useEffect } from 'react'
import { Deal } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { toDate } from '@/lib/utils/timestamp'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DealListViewProps {
  deals: Deal[]
  onDealClick: (deal: Deal) => void
  onEdit: (deal: Deal) => void
  onDelete: (id: string) => void
  onOpenTasks?: (deal: Deal) => void
  sortBy?: 'value' | 'createdAt' | 'title' | 'probability' | 'expectedCloseDate'
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: 'value' | 'createdAt' | 'title' | 'probability' | 'expectedCloseDate', sortOrder: 'asc' | 'desc') => void
  loading?: boolean
  selectedDealIds?: Set<string>
  onToggleSelect?: (dealId: string) => void
  onSelectAll?: () => void
  canDelete?: boolean
}

export const DealListView = ({ 
  deals, 
  onDealClick, 
  onEdit, 
  onDelete,
  onOpenTasks,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSortChange,
  loading,
  selectedDealIds = new Set(),
  onToggleSelect,
  onSelectAll,
  canDelete = true
}: DealListViewProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  const handleSortChange = (newSortBy: 'value' | 'createdAt' | 'title' | 'probability' | 'expectedCloseDate') => {
    if (onSortChange) {
      // Se já está ordenando por este campo, inverte a ordem
      if (newSortBy === sortBy) {
        onSortChange(newSortBy, sortOrder === 'asc' ? 'desc' : 'asc')
      } else {
        onSortChange(newSortBy, 'desc')
      }
    }
    // Resetar para primeira página ao mudar ordenação
    setCurrentPage(1)
  }

  // Resetar página quando os dados mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [deals.length])

  const sortedDeals = [...deals].sort((a, b) => {
    let aVal: any, bVal: any

    switch (sortBy) {
      case 'value':
        aVal = a.value
        bVal = b.value
        break
      case 'title':
        aVal = a.title.toLowerCase()
        bVal = b.title.toLowerCase()
        break
      case 'probability':
        aVal = a.probability
        bVal = b.probability
        break
      case 'expectedCloseDate':
        aVal = a.expectedCloseDate?.toMillis() || 0
        bVal = b.expectedCloseDate?.toMillis() || 0
        break
      case 'createdAt':
      default:
        aVal = a.createdAt?.toMillis() || 0
        bVal = b.createdAt?.toMillis() || 0
        break
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  // Calcular paginação
  const totalPages = Math.ceil(sortedDeals.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDeals = sortedDeals.slice(startIndex, endIndex)

  // Resetar página se necessário quando os dados mudarem
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando negociações...</div>
      </div>
    )
  }

  // Calcular resumo geral
  const totalDeals = deals.length
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
  const activeDeals = deals.filter(d => d.status === 'active').length
  const wonDeals = deals.filter(d => d.status === 'won').length
  const lostDeals = deals.filter(d => d.status === 'lost').length

  return (
    <div className="space-y-4">
      {/* Resumo Geral */}
      {totalDeals > 0 && (
        <Card className="bg-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            <div>
              <p className="text-xs text-white/60 mb-1">Total de Negociações</p>
              <p className="text-lg font-semibold text-white">{totalDeals}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Valor Total</p>
              <p className="text-lg font-semibold text-primary-red">{formatCurrency(totalValue, 'BRL')}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Ativas</p>
              <p className="text-lg font-semibold text-white">{activeDeals}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Ganhas / Perdidas</p>
              <p className="text-lg font-semibold text-white">{wonDeals} / {lostDeals}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        {onSortChange && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
            >
              <option value="createdAt">Data de Criação</option>
              <option value="value">Valor</option>
              <option value="title">Título</option>
              <option value="probability">Probabilidade</option>
              <option value="expectedCloseDate">Data de Fechamento</option>
            </select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
            </Button>
          </div>
        )}
        {onSelectAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
          >
            {selectedDealIds.size === paginatedDeals.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
          </Button>
        )}
      </div>

      {paginatedDeals.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-white/70 mb-4">
              Nenhuma negociação encontrada
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedDeals.map((deal) => {
              const isSelected = selectedDealIds.has(deal.id)
              return (
              <Card
                key={deal.id}
                variant="elevated"
                className={`cursor-pointer hover:border-primary-red/50 transition-all ${
                  isSelected ? 'border-primary-red border-2' : ''
                }`}
                onClick={(e) => {
                  if (onToggleSelect && (e.target as HTMLElement).closest('.checkbox-container')) {
                    e.stopPropagation()
                    onToggleSelect(deal.id)
                  } else {
                    onDealClick(deal)
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {onToggleSelect && (
                      <div 
                        className="checkbox-container flex-shrink-0"
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
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{deal.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        {deal.expectedCloseDate && (
                          <span>
                            Fechamento: {(() => {
                              const date = toDate(deal.expectedCloseDate)
                              return date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : '-'
                            })()}
                          </span>
                        )}
                        <span>{deal.probability}% de chance</span>
                        {deal.serviceIds && deal.serviceIds.length > 0 && (
                          <span>{deal.serviceIds.length} serviço(s)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right mr-4">
                    <p className="text-xl font-bold text-primary-red">
                      {formatCurrency(deal.value, deal.currency)}
                    </p>
                    {deal.contractUrl && (
                      <a
                        href={deal.contractUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary-blue hover:underline"
                      >
                        Ver Contrato
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {onOpenTasks && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenTasks(deal)
                        }}
                      >
                        Tarefas
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(deal)
                      }}
                    >
                      Editar
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Tem certeza que deseja excluir esta negociação?')) {
                            onDelete(deal.id)
                          }
                        }}
                      >
                        Excluir
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )})}
          </div>

          {sortedDeals.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={sortedDeals.length}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage)
                setCurrentPage(1) // Resetar para primeira página
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

