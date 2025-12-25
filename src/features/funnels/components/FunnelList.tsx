import { Funnel } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface FunnelListProps {
  funnels: Funnel[]
  onEdit: (funnel: Funnel) => void
  onDelete: (id: string) => void
  onSetActive: (id: string) => void
  loading?: boolean
}

export const FunnelList = ({ funnels, onEdit, onDelete, onSetActive, loading }: FunnelListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando funis...</div>
      </div>
    )
  }

  if (funnels.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-white/70 mb-4">Nenhum funil cadastrado</p>
          <p className="text-white/50 text-sm">Crie seu primeiro funil de vendas</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {funnels.map((funnel) => (
        <Card key={funnel.id} variant="elevated">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">{funnel.name}</h3>
                {funnel.active && (
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                    Ativo
                  </span>
                )}
                {funnel.type && (
                  <span className="px-2 py-1 text-xs bg-white/10 text-white/70 rounded">
                    {funnel.type === 'martech' ? 'Martech' : 'Personalizado'}
                  </span>
                )}
              </div>
              
              {funnel.description && (
                <p className="text-white/70 mb-3">{funnel.description}</p>
              )}

              <div className="flex items-center gap-4 mb-3">
                <span className="text-sm text-white/60">
                  {funnel.stages.length} estágio(s)
                </span>
                {funnel.createdAt && (
                  <span className="text-sm text-white/60">
                    Criado em {format(funnel.createdAt.toDate(), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {funnel.stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage) => (
                    <div
                      key={stage.id}
                      className="px-3 py-1 rounded text-sm text-white/90"
                      style={{ backgroundColor: stage.color + '20', border: `1px solid ${stage.color}40` }}
                    >
                      {stage.name}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              {!funnel.active && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSetActive(funnel.id)}
                >
                  Ativar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(funnel)}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir este funil?')) {
                    onDelete(funnel.id)
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
  )
}


