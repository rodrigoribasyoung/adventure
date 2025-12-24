import { Task } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  loading?: boolean
  showDealInfo?: boolean
}

const TASK_TYPE_LABELS: Record<string, string> = {
  call: 'Ligação',
  email: 'E-mail',
  meeting: 'Reunião',
  follow_up: 'Follow-up',
  proposal: 'Enviar Proposta',
  quote: 'Enviar Orçamento',
  contract: 'Enviar Contrato',
  payment: 'Cobrança',
  other: 'Outro',
}

export const TaskList = ({ 
  tasks, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  loading,
  showDealInfo = false 
}: TaskListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white/70">Carregando tarefas...</div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-white/70">Nenhuma tarefa cadastrada</p>
        </div>
      </Card>
    )
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    // Tarefas pendentes primeiro, depois concluídas
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1
    }
    // Ordenar por data de vencimento (sem vencimento por último)
    const aDue = a.dueDate?.toMillis() || Number.MAX_SAFE_INTEGER
    const bDue = b.dueDate?.toMillis() || Number.MAX_SAFE_INTEGER
    return aDue - bDue
  })

  return (
    <div className="space-y-3">
      {sortedTasks.map((task) => {
        const isOverdue = task.dueDate && 
          task.dueDate.toDate() < new Date() && 
          task.status === 'pending'
        const isCompleted = task.status === 'completed'

        return (
          <Card
            key={task.id}
            variant="elevated"
            className={`transition-all ${
              isCompleted ? 'opacity-60' : ''
            } ${isOverdue ? 'border-red-500/50' : ''}`}
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => onToggleStatus(task.id)}
                className="mt-1 w-5 h-5 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50 cursor-pointer"
              />

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className={`font-medium ${isCompleted ? 'line-through text-white/50' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-white/70">
                      <span className="px-2 py-1 bg-white/10 rounded text-xs">
                        {TASK_TYPE_LABELS[task.type] || task.type}
                      </span>
                      {task.dueDate && (
                        <span className={isOverdue && !isCompleted ? 'text-red-400 font-semibold' : ''}>
                          Vence: {format(task.dueDate.toDate(), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-green-400">✓ Concluída</span>
                      )}
                    </div>
                    {task.description && (
                      <p className="mt-2 text-sm text-white/60">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(task)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                          onDelete(task.id)
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

