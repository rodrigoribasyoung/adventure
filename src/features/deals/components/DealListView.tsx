import { Deal } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DealListViewProps {
  deals: Deal[]
  onDealClick: (deal: Deal) => void
  onEdit: (deal: Deal) => void
  onDelete: (id: string) => void
  sortBy?: 'value' | 'createdAt' | 'title' | 'probability' | 'expectedCloseDate'
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: 'value' | 'createdAt' | 'title' | 'probability' | 'expectedCloseDate', sortOrder: 'asc' | 'desc') => void
  loading?: boolean
}

export const DealListView = ({ 
  deals, 
  onDealClick, 
  onEdit, 
  onDelete, 
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSortChange,
  loading 
}: DealListViewProps) => {
  const handleSortChange = (newSortBy: 'value' | 'createdAt' | 'title' | 'probability' | 'expectedCloseDate') => {
    if (onSortChange) {
      // Se já está ordenando por este campo, inverte a ordem
      if (newSortBy === sortBy) {
        onSortChange(newSortBy, sortOrder === 'asc' ? 'desc' : 'asc')
      } else {
        onSortChange(newSortBy, 'desc')
      }
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando negociações...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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

      {sortedDeals.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-white/70 mb-4">
              Nenhuma negociação encontrada
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedDeals.map((deal) => (
            <Card
              key={deal.id}
              variant="elevated"
              className="cursor-pointer hover:border-primary-red/50 transition-all"
              onClick={() => onDealClick(deal)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{deal.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    {deal.expectedCloseDate && (
                      <span>
                        Fechamento: {format(deal.expectedCloseDate.toDate(), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    )}
                    <span>{deal.probability}% de chance</span>
                    {deal.serviceIds && deal.serviceIds.length > 0 && (
                      <span>{deal.serviceIds.length} serviço(s)</span>
                    )}
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

