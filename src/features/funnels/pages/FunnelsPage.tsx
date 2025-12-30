import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { FunnelList } from '../components/FunnelList'
import { FunnelForm } from '../components/FunnelForm'
import { Modal } from '@/components/ui/Modal'
import { useFunnels } from '../hooks/useFunnels'
import { Funnel } from '@/types'
import { Toast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'

const FunnelsPage = () => {
  const { funnels, loading, createFunnel, updateFunnel, deleteFunnel } = useFunnels()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const handleCreateNew = () => {
    setSelectedFunnel(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (funnel: Funnel) => {
    setSelectedFunnel(funnel)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      
      // Atualizar ordem dos estágios baseado na posição no array
      const stagesWithOrder = data.stages.map((stage: any, index: number) => ({
        ...stage,
        order: index + 1,
      }))

      // Aplicar cores automaticamente baseado na ordem (será feito no backend também)
      const { updateStagesColors } = await import('@/utils/stageColors')
      const stagesWithColors = updateStagesColors(stagesWithOrder)

      const submitData = {
        ...data,
        stages: stagesWithColors,
      }

      if (selectedFunnel) {
        await updateFunnel(selectedFunnel.id, submitData)
        setToast({ message: 'Funil atualizado com sucesso!', type: 'success', visible: true })
      } else {
        await createFunnel(submitData)
        setToast({ message: 'Funil criado com sucesso!', type: 'success', visible: true })
      }
      setIsModalOpen(false)
      setSelectedFunnel(undefined)
    } catch (error: any) {
      console.error('[FunnelsPage] Erro ao salvar funil:', error)
      const errorMessage = error?.message || 'Erro ao salvar funil'
      setToast({ message: errorMessage, type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFunnel(id)
      setToast({ message: 'Funil excluído com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('[FunnelsPage] Erro ao excluir funil:', error)
      setToast({ message: 'Erro ao excluir funil', type: 'error', visible: true })
    }
  }

  const handleSetActive = async (id: string) => {
    try {
      // Desativar todos os funis
      await Promise.all(
        funnels
          .filter(f => f.active && f.id !== id)
          .map(f => updateFunnel(f.id, { active: false }))
      )
      // Ativar o funil selecionado
      await updateFunnel(id, { active: true })
      setToast({ message: 'Funil ativado com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('[FunnelsPage] Erro ao ativar funil:', error)
      setToast({ message: 'Erro ao ativar funil', type: 'error', visible: true })
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-white/90 mb-1">Funis de Vendas</h1>
            <p className="text-white/60 text-sm">Gerencie seus funis e estágios de vendas</p>
          </div>
          
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Novo Funil
          </Button>
        </div>

        <FunnelList
          funnels={funnels}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetActive={handleSetActive}
          loading={loading}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedFunnel(undefined)
        }}
        title={selectedFunnel ? 'Editar Funil' : 'Novo Funil'}
        size="lg"
      >
        <FunnelForm
          funnel={selectedFunnel}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedFunnel(undefined)
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

export default FunnelsPage

