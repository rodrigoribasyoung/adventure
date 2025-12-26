import { Deal } from '@/types'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'

interface RecentDealsListProps {
  deals: Deal[]
  onDealClick?: (deal: Deal) => void
}

export const RecentDealsList = ({ deals, onDealClick }: RecentDealsListProps) => {
  if (deals.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-white/70">Nenhuma negociação recente</p>
        </div>
      </Card>
    )
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-500/20 text-green-400'
      case 'lost':
        return 'bg-red-500/20 text-red-400'
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'active':
      default:
        return 'bg-blue-500/20 text-blue-400'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'won':
        return 'Vendida'
      case 'lost':
        return 'Perdida'
      case 'paused':
        return 'Pausada'
      case 'active':
      default:
        return 'Ativa'
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Negociações Recentes</h3>
        <Link 
          to="/deals" 
          className="text-primary-red text-sm hover:underline"
        >
          Ver todas
        </Link>
      </div>
      <div className="space-y-3">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => onDealClick?.(deal)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">{deal.title}</h4>
                <div className="flex items-center gap-3 text-xs text-white/60">
                  {deal.createdAt && (
                    <span>
                      {format(deal.createdAt.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  )}
                  <span>{deal.probability}% chance</span>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-primary-red font-bold text-lg">
                  {formatCurrency(deal.value, deal.currency)}
                </p>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(deal.status)}`}>
                  {getStatusLabel(deal.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}



