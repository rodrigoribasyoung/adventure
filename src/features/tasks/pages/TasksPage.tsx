import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TaskList } from '../components/TaskList'
import { TaskTable } from '../components/TaskTable'
import { TaskForm } from '../components/TaskForm'
import { TaskScorecards } from '../components/TaskScorecards'
import { Modal } from '@/components/ui/Modal'
import { toDate } from '@/lib/utils/timestamp'
import { useTasks } from '../hooks/useTasks'
import { Task } from '@/types'
import { Toast } from '@/components/ui/Toast'
import { AdvancedFilter } from '@/components/common/AdvancedFilter'
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter'
import { FilterField } from '@/components/common/AdvancedFilter'

interface TaskFilters {
  search: string
  status: string[]
  type: string[]
  assignedTo: string
  dateFrom: string
  dateTo: string
}

const TasksPage = () => {
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskStatus } = useTasks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'table'>('table')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const initialFilters: TaskFilters = {
    search: '',
    status: [],
    type: [],
    assignedTo: '',
    dateFrom: '',
    dateTo: '',
  }

  const { filters, setFilters, resetFilters } = useAdvancedFilter<TaskFilters>({
    initialFilters,
    persistKey: 'tasks_filters',
  })

  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'pending', label: 'Pendente' },
        { value: 'completed', label: 'Concluída' },
      ],
    },
    {
      key: 'type',
      label: 'Tipo',
      type: 'multiselect',
      options: [
        { value: 'call', label: 'Ligação' },
        { value: 'email', label: 'E-mail' },
        { value: 'meeting', label: 'Reunião' },
        { value: 'follow_up', label: 'Follow-up' },
        { value: 'proposal', label: 'Enviar Proposta' },
        { value: 'quote', label: 'Enviar Orçamento' },
        { value: 'contract', label: 'Enviar Contrato' },
        { value: 'payment', label: 'Cobrança' },
        { value: 'other', label: 'Outro' },
      ],
    },
    {
      key: 'dateFrom',
      label: 'Data de Vencimento (De)',
      type: 'date',
    },
    {
      key: 'dateTo',
      label: 'Data de Vencimento (Até)',
      type: 'date',
    },
  ]

  const filteredTasks = tasks.filter(task => {
    // Busca por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Filtro por status
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false
    }

    // Filtro por tipo
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(task.type)) return false
    }

    // Filtro por responsável
    if (filters.assignedTo) {
      if (task.assignedTo !== filters.assignedTo) return false
    }

    // Filtro por data de vencimento
    if (filters.dateFrom && task.dueDate) {
      const fromDate = new Date(filters.dateFrom)
      const dueDate = toDate(task.dueDate)
      if (dueDate && dueDate < fromDate) return false
    }

    if (filters.dateTo && task.dueDate) {
      const toDateFilter = new Date(filters.dateTo)
      toDateFilter.setHours(23, 59, 59, 999)
      const dueDate = toDate(task.dueDate)
      if (dueDate && dueDate > toDateFilter) return false
    }

    return true
  })


  const handleCreateNew = () => {
    setSelectedTask(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedTask) {
        await updateTask(selectedTask.id, data)
        setToast({ message: 'Tarefa atualizada com sucesso!', type: 'success', visible: true })
      } else {
        await createTask(data)
        setToast({ message: 'Tarefa criada com sucesso!', type: 'success', visible: true })
      }
      setIsModalOpen(false)
      setSelectedTask(undefined)
    } catch (error: any) {
      console.error('[TasksPage] Erro ao salvar tarefa:', error)
      const errorMessage = error?.message || 'Erro ao salvar tarefa'
      setToast({ message: errorMessage, type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id)
      setToast({ message: 'Tarefa excluída com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('[TasksPage] Erro ao excluir tarefa:', error)
      setToast({ message: 'Erro ao excluir tarefa', type: 'error', visible: true })
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleTaskStatus(id)
      setToast({ message: 'Status da tarefa atualizado!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('[TasksPage] Erro ao atualizar status:', error)
      setToast({ message: 'Erro ao atualizar status', type: 'error', visible: true })
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-white/90 mb-1">Tarefas</h1>
            <p className="text-white/60 text-sm">Gerencie suas tarefas e atividades</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'primary-red' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Lista
              </Button>
              <Button
                variant={viewMode === 'table' ? 'primary-red' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Tabela
              </Button>
            </div>
            <Button variant="primary-red" onClick={handleCreateNew}>
              + Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Scorecards de Métricas */}
        <TaskScorecards tasks={tasks} />

        <AdvancedFilter
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          searchPlaceholder="Buscar por título ou descrição..."
          fields={filterFields}
        />

        {/* Lista de Tarefas */}
        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-white/70">Carregando tarefas...</div>
            </div>
          </Card>
        ) : viewMode === 'table' ? (
          <TaskTable
            tasks={filteredTasks}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            loading={loading}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTask(undefined)
        }}
        title={selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        size="md"
      >
        <TaskForm
          task={selectedTask}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedTask(undefined)
          }}
          loading={formLoading}
        />
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </Container>
  )
}

export default TasksPage


