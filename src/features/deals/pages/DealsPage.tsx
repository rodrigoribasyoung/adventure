import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { DealKanban } from '../components/DealKanban'
import { DealListView } from '../components/DealListView'
import { DealForm } from '../components/DealForm'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { DealCloseModal } from '@/components/deals/DealCloseModal'
import { useDeals } from '../hooks/useDeals'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'
import { Deal } from '@/types'
import { Toast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'

type ViewMode = 'kanban' | 'list'

const DealsPage = () => {
  const { deals, loading, createDeal, updateDeal, deleteDeal, updateDealStage, closeDeal } = useDeals()
  const { activeFunnel } = useFunnels()
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const handleCreateNew = () => {
    setSelectedDeal(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsModalOpen(true)
  }

  const handleDealClick = (deal: Deal) => {
    // TODO: Abrir página de detalhes da negociação
    handleEdit(deal)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      console.log('[DealsPage] Submetendo formulário:', data)
      
      if (selectedDeal) {
        console.log('[DealsPage] Atualizando negociação:', selectedDeal.id)
        await updateDeal(selectedDeal.id, data)
        setToast({ message: 'Negociação atualizada com sucesso!', type: 'success', visible: true })
      } else {
        console.log('[DealsPage] Criando nova negociação')
        const id = await createDeal(data)
        console.log('[DealsPage] Negociação criada com ID:', id)
        setToast({ message: 'Negociação criada com sucesso!', type: 'success', visible: true })
      }
      setIsModalOpen(false)
      setSelectedDeal(undefined)
    } catch (error: any) {
      console.error('[DealsPage] Erro ao salvar negociação:', error)
      const errorMessage = error?.message || 'Erro ao salvar negociação'
      setToast({ message: errorMessage, type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDeal(id)
      setToast({ message: 'Negociação excluída com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('[DealsPage] Erro ao excluir negociação:', error)
      setToast({ message: 'Erro ao excluir negociação', type: 'error', visible: true })
    }
  }

  const handleStageChange = async (dealId: string, newStage: string) => {
    try {
      const deal = deals.find(d => d.id === dealId)
      const stage = activeFunnel?.stages.find(s => s.id === newStage)
      
      // Se mover para estágio de ganho/perda, abre modal de fechamento
      if (stage?.isWonStage || stage?.isLostStage) {
        setSelectedDeal(deal)
        setIsCloseModalOpen(true)
      } else {
        await updateDealStage(dealId, newStage)
        setToast({ message: 'Estágio atualizado!', type: 'success', visible: true })
      }
    } catch (error: any) {
      console.error('[DealsPage] Erro ao atualizar estágio:', error)
      setToast({ message: 'Erro ao atualizar estágio', type: 'error', visible: true })
    }
  }

  const handleCloseDeal = async (status: 'won' | 'lost', closeReason?: string) => {
    if (!selectedDeal) return
    
    try {
      const stage = activeFunnel?.stages.find(s => 
        (status === 'won' && s.isWonStage) || (status === 'lost' && s.isLostStage)
      )
      
      if (stage) {
        await updateDealStage(selectedDeal.id, stage.id)
      }
      
      await closeDeal(selectedDeal.id, status, closeReason)
      setToast({ 
        message: `Negociação ${status === 'won' ? 'vendiada' : 'perdida'} com sucesso!`, 
        type: 'success', 
        visible: true 
      })
      setIsCloseModalOpen(false)
      setSelectedDeal(undefined)
    } catch (error: any) {
      console.error('[DealsPage] Erro ao fechar negociação:', error)
      setToast({ message: 'Erro ao fechar negociação', type: 'error', visible: true })
    }
  }

  const stages = activeFunnel?.stages || []

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Negociações</h1>
            <p className="text-white/70">Gerencie seu pipeline de vendas</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-background-darker border border-white/10 rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'primary-blue' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary-blue' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Lista
              </Button>
            </div>
            
            <Button variant="primary-red" onClick={handleCreateNew}>
              + Nova Negociação
            </Button>
          </div>
        </div>

        {!activeFunnel ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">Nenhum funil ativo encontrado</p>
              <p className="text-white/50 text-sm">Configure um funil em Configurações</p>
            </div>
          </Card>
        ) : viewMode === 'kanban' ? (
          <DealKanban
            deals={deals}
            stages={stages}
            onDealClick={handleDealClick}
            onStageChange={handleStageChange}
            loading={loading}
          />
        ) : (
          <DealListView
            deals={deals}
            onDealClick={handleDealClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDeal(undefined)
        }}
        title={selectedDeal ? 'Editar Negociação' : 'Nova Negociação'}
        size="lg"
      >
        <DealForm
          deal={selectedDeal}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedDeal(undefined)
          }}
          loading={formLoading}
        />
      </Modal>

      <DealCloseModal
        isOpen={isCloseModalOpen}
        deal={selectedDeal || null}
        onClose={() => {
          setIsCloseModalOpen(false)
          setSelectedDeal(undefined)
        }}
        onConfirm={handleCloseDeal}
        loading={formLoading}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </Container>
  )
}

export default DealsPage

