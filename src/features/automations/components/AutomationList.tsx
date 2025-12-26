import { Automation } from '../types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface AutomationListProps {
  automations: Automation[]
  onEdit: (automation: Automation) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  loading?: boolean
}

const TRIGGER_LABELS: Record<string, string> = {
  deal_inactive: 'Negociação Inativa',
  deal_created: 'Negociação Criada',
  deal_stage_changed: 'Estágio Alterado',
  deal_status_changed: 'Status Alterado',
}

const ACTION_LABELS: Record<string, string> = {
  create_task: 'Criar Tarefa',
  send_notification: 'Enviar Notificação',
  assign_to: 'Atribuir Para',
  move_stage: 'Mover Estágio',
}

export const AutomationList = ({ automations, onEdit, onDelete, onToggle, loading }: AutomationListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white/70">Carregando automações...</div>
      </div>
    )
  }

  if (automations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70 mb-4">Nenhuma automação cadastrada.</p>
        <p className="text-white/50 text-sm">Crie automações para automatizar tarefas e workflows no seu CRM.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {automations.map(automation => (
        <Card key={automation.id} variant="elevated">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white">{automation.name}</h4>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    automation.enabled
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {automation.enabled ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                {automation.description && (
                  <p className="text-sm text-white/70 mt-1">{automation.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-xs text-white/60 w-20">Gatilho:</span>
                <div className="flex-1">
                  <span className="text-xs text-white/80">
                    {TRIGGER_LABELS[automation.trigger.type] || automation.trigger.type}
                    {automation.trigger.type === 'deal_inactive' && ` (${automation.trigger.days} dias)`}
                    {automation.trigger.type === 'deal_status_changed' && ` (${automation.trigger.status})`}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-xs text-white/60 w-20">Ações:</span>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1">
                    {automation.actions.map((action, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-xs bg-white/10 text-white/80 rounded">
                        {ACTION_LABELS[action.type] || action.type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(automation.id)}
              >
                {automation.enabled ? 'Desativar' : 'Ativar'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(automation)}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir esta automação?')) {
                    onDelete(automation.id)
                  }
                }}
                className="text-red-400 hover:text-red-300"
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

