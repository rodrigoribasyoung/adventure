import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TaskList } from '../components/TaskList'
import { TaskForm } from '../components/TaskForm'
import { Modal } from '@/components/ui/Modal'
import { useTasks } from '../hooks/useTasks'
import { Task } from '@/types'
import { Toast } from '@/components/ui/Toast'

const TasksPage = () => {
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskStatus } = useTasks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  // Filtrar tarefas por status
  const overdueTasks = tasks.filter(task => 
    task.dueDate && 
    task.dueDate.toDate() < new Date() && 
    task.status === 'pending'
  )
  const pendingTasks = tasks.filter(task => 
    task.status === 'pending' && 
    (!task.dueDate || task.dueDate.toDate() >= new Date())
  )
  const completedTasks = tasks.filter(task => task.status === 'completed')

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
            <h1 className="text-3xl font-bold text-white mb-2">Tarefas</h1>
            <p className="text-white/70">Gerencie suas tarefas e atividades</p>
          </div>
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Nova Tarefa
          </Button>
        </div>

        {/* Resumo por Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="elevated" className="border-red-500/30">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400 mb-2">{overdueTasks.length}</p>
              <p className="text-white/70">Atrasadas</p>
            </div>
          </Card>
          <Card variant="elevated" className="border-yellow-500/30">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400 mb-2">{pendingTasks.length}</p>
              <p className="text-white/70">Pendentes</p>
            </div>
          </Card>
          <Card variant="elevated" className="border-green-500/30">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400 mb-2">{completedTasks.length}</p>
              <p className="text-white/70">Concluídas</p>
            </div>
          </Card>
        </div>

        {/* Lista de Tarefas */}
        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-white/70">Carregando tarefas...</div>
            </div>
          </Card>
        ) : (
          <TaskList
            tasks={tasks}
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

