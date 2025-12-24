import { Modal } from '@/components/ui/Modal'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import { TaskList } from '@/features/tasks/components/TaskList'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { Task } from '@/types'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { Toast } from '@/components/ui/Toast'

interface DealTasksModalProps {
  isOpen: boolean
  dealId: string
  dealTitle?: string
  onClose: () => void
}

export const DealTasksModal = ({ isOpen, dealId, dealTitle, onClose }: DealTasksModalProps) => {
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskStatus } = useTasks(dealId)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const handleCreateNew = () => {
    setSelectedTask(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (task: Task) => {
    setSelectedTask(task)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      
      if (selectedTask) {
        await updateTask(selectedTask.id, data)
        setToast({ message: 'Tarefa atualizada com sucesso!', type: 'success', visible: true })
      } else {
        await createTask({ ...data, dealId })
        setToast({ message: 'Tarefa criada com sucesso!', type: 'success', visible: true })
      }
      setIsFormOpen(false)
      setSelectedTask(undefined)
    } catch (error: any) {
      console.error('[DealTasksModal] Erro ao salvar tarefa:', error)
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
      console.error('[DealTasksModal] Erro ao excluir tarefa:', error)
      setToast({ message: 'Erro ao excluir tarefa', type: 'error', visible: true })
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen && !isFormOpen}
        onClose={onClose}
        title={dealTitle ? `Tarefas - ${dealTitle}` : 'Tarefas da Negociação'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary-red" onClick={handleCreateNew}>
              + Nova Tarefa
            </Button>
          </div>

          <TaskList
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={toggleTaskStatus}
            loading={loading}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedTask(undefined)
        }}
        title={selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        size="md"
      >
        <TaskForm
          task={selectedTask}
          dealId={dealId}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false)
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
    </>
  )
}

