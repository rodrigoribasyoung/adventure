import { useState, useEffect } from 'react'
import { Task } from '@/types'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toDate } from '@/lib/utils/timestamp'

interface TaskTableProps {
  tasks: Task[]
  loading: boolean
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
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

export const TaskTable = ({ tasks, loading, onEdit, onDelete, onToggleStatus }: TaskTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  useEffect(() => {
    setCurrentPage(1)
  }, [tasks.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando tarefas...</div>
      </div>
    )
  }

  const totalPages = Math.ceil(tasks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTasks = tasks.slice(startIndex, endIndex)

  if (tasks.length === 0) {
    return (
      <div className="bg-background-darker border border-white/10 rounded-lg p-12 text-center">
        <p className="text-white/70 mb-4">Nenhuma tarefa cadastrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-background-darker border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                  Data de Vencimento
                </th>
                <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paginatedTasks.map((task) => {
                const dueDate = toDate(task.dueDate)
                const isOverdue = dueDate && 
                  dueDate < new Date() && 
                  task.status === 'pending'
                
                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-white/5 transition-colors ${
                      isOverdue ? 'bg-red-500/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-white/50 mt-1 line-clamp-1">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white/70">
                        {TASK_TYPE_LABELS[task.type] || task.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/70">
                        {dueDate 
                          ? format(dueDate, 'dd/MM/yyyy', { locale: ptBR })
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onToggleStatus(task.id)}
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          task.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : isOverdue
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {task.status === 'completed' ? 'Concluída' : isOverdue ? 'Atrasada' : 'Pendente'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {tasks.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={tasks.length}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}

