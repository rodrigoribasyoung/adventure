import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { AutomationForm } from '../components/AutomationForm'
import { AutomationList } from '../components/AutomationList'
import { useAutomations } from '../hooks/useAutomations'
import { Automation } from '../types'
import { Toast } from '@/components/ui/Toast'

const AutomationsPage = () => {
  const { automations, loading, createAutomation, updateAutomation, deleteAutomation, toggleAutomation } = useAutomations()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const handleCreateNew = () => {
    setSelectedAutomation(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (automation: Automation) => {
    setSelectedAutomation(automation)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedAutomation) {
        await updateAutomation(selectedAutomation.id, data)
        setToast({ message: 'Automação atualizada com sucesso!', type: 'success', visible: true })
      } else {
        await createAutomation(data)
        setToast({ message: 'Automação criada com sucesso!', type: 'success', visible: true })
      }
      setIsFormOpen(false)
      setSelectedAutomation(undefined)
    } catch (error: any) {
      console.error('Erro ao salvar automação:', error)
      setToast({ message: error.message || 'Erro ao salvar automação', type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAutomation(id)
      setToast({ message: 'Automação excluída com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('Erro ao excluir automação:', error)
      setToast({ message: 'Erro ao excluir automação', type: 'error', visible: true })
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Automações</h1>
            <p className="text-white/70">Configure automações para agilizar processos e tarefas</p>
          </div>
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Nova Automação
          </Button>
        </div>

        <Card>
          <AutomationList
            automations={automations}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={toggleAutomation}
            loading={loading}
          />
        </Card>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedAutomation(undefined)
        }}
        title={selectedAutomation ? 'Editar Automação' : 'Nova Automação'}
        size="lg"
      >
        <AutomationForm
          automation={selectedAutomation}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false)
            setSelectedAutomation(undefined)
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

export default AutomationsPage

