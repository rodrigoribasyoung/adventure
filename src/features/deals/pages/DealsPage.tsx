import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { DealKanban } from '../components/DealKanban'
import { DealListView } from '../components/DealListView'
import { DealForm } from '../components/DealForm'
import { DealFilters as DealFiltersComponent, DealFilters as DealFiltersType } from '../components/DealFilters'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { DealCloseModal } from '@/components/deals/DealCloseModal'
import { DealTasksModal } from '../components/DealTasksModal'
import { useDeals } from '../hooks/useDeals'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { Deal } from '@/types'
import { Toast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { filterDeals } from '../utils/filterDeals'
import { usePermissions } from '@/hooks/usePermissions'

type ViewMode = 'kanban' | 'list'

const initialFilters: DealFiltersType = {
  search: '',
  status: [],
  stage: [],
  contactId: '',
  companyId: '',
  assignedTo: '',
  minValue: null,
  maxValue: null,
  dateFrom: '',
  dateTo: '',
}

const DealsPage = () => {
  const navigate = useNavigate()
  const { deals, loading, createDeal, updateDeal, deleteDeal, updateDealStage, closeDeal, pauseDeal, reopenDeal } = useDeals()
  const { canDeleteDealsAndCompanies } = usePermissions()
  const { activeFunnel } = useFunnels()
  const { contacts } = useContacts()
  const { companies } = useCompanies()
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [filters, setFilters] = useState<DealFiltersType>(initialFilters)
  const [sortBy, setSortBy] = useState<'value' | 'createdAt' | 'title' | 'probability' | 'expectedCloseDate'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })
  const [selectedDealIds, setSelectedDealIds] = useState<Set<string>>(new Set())

  const handleToggleSelect = (dealId: string) => {
    setSelectedDealIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dealId)) {
        newSet.delete(dealId)
      } else {
        newSet.add(dealId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedDealIds.size === filteredDeals.length) {
      setSelectedDealIds(new Set())
    } else {
      setSelectedDealIds(new Set(filteredDeals.map(d => d.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedDealIds.size === 0) return
    
    if (!confirm(`Tem certeza que deseja excluir ${selectedDealIds.size} negociação(ões)?`)) {
      return
    }

    try {
      const deletePromises = Array.from(selectedDealIds).map(id => deleteDeal(id))
      await Promise.all(deletePromises)
      setToast({ 
        message: `${selectedDealIds.size} negociação(ões) excluída(s) com sucesso!`, 
        type: 'success', 
        visible: true 
      })
      setSelectedDealIds(new Set())
    } catch (error: any) {
      console.error('[DealsPage] Erro ao excluir negociações:', error)
      setToast({ message: 'Erro ao excluir negociações', type: 'error', visible: true })
    }
  }

  const handleCreateNew = () => {
    setSelectedDeal(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsModalOpen(true)
  }

  const handleDealClick = (deal: Deal) => {
    navigate(`/deals/${deal.id}`)
  }

  const handleOpenTasks = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsTasksModalOpen(true)
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

  const handleWinDeal = async (dealId: string) => {
    try {
      const deal = deals.find(d => d.id === dealId)
      if (!deal) return
      
      const stage = activeFunnel?.stages.find(s => s.isWonStage)
      if (stage) {
        await updateDealStage(dealId, stage.id)
      }
      await closeDeal(dealId, 'won')
      setToast({ 
        message: 'Negociação marcada como ganha!', 
        type: 'success', 
        visible: true 
      })
    } catch (error: any) {
      console.error('[DealsPage] Erro ao marcar como ganho:', error)
      setToast({ message: 'Erro ao marcar como ganho', type: 'error', visible: true })
    }
  }

  const handleLoseDeal = async (dealId: string) => {
    try {
      const deal = deals.find(d => d.id === dealId)
      if (!deal) return
      
      const stage = activeFunnel?.stages.find(s => s.isLostStage)
      if (stage) {
        await updateDealStage(dealId, stage.id)
      }
      await closeDeal(dealId, 'lost')
      setToast({ 
        message: 'Negociação marcada como perdida!', 
        type: 'success', 
        visible: true 
      })
    } catch (error: any) {
      console.error('[DealsPage] Erro ao marcar como perda:', error)
      setToast({ message: 'Erro ao marcar como perda', type: 'error', visible: true })
    }
  }

  const handlePauseDeal = async (dealId: string) => {
    try {
      await pauseDeal(dealId)
      setToast({ 
        message: 'Negociação pausada!', 
        type: 'success', 
        visible: true 
      })
    } catch (error: any) {
      console.error('[DealsPage] Erro ao pausar negociação:', error)
      setToast({ message: 'Erro ao pausar negociação', type: 'error', visible: true })
    }
  }

  const handleResumeDeal = async (dealId: string) => {
    try {
      await updateDeal(dealId, { status: 'active' })
      setToast({ 
        message: 'Negociação retomada!', 
        type: 'success', 
        visible: true 
      })
    } catch (error: any) {
      console.error('[DealsPage] Erro ao retomar negociação:', error)
      setToast({ message: 'Erro ao retomar negociação', type: 'error', visible: true })
    }
  }

  const stages = activeFunnel?.stages || []

  // Filtrar negociações: se houver filtro de status, usar todas; senão, apenas ativas
  const dealsToFilter = filters.status && filters.status.length > 0
    ? deals // Se há filtro de status, mostrar todas (incluindo ganhas/perdidas)
    : deals.filter(deal => deal.status === 'active' || !deal.status) // Senão, apenas ativas
  
  // Aplicar filtros
  const filteredDeals = filterDeals(
    dealsToFilter,
    filters,
    contacts.map(c => ({ id: c.id, name: c.name })),
    companies.map(c => ({ id: c.id, name: c.name }))
  )

  const handleFiltersReset = () => {
    setFilters(initialFilters)
  }

  const handleSortChange = (newSortBy: 'value' | 'createdAt' | 'title' | 'probability' | 'expectedCloseDate', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }


  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-white/90 mb-1">Negociações</h1>
            <p className="text-white/60 text-sm">Gerencie seu pipeline de vendas</p>
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
            
            <div className="flex items-center gap-3">
              {selectedDealIds.size > 0 && (
                <Button 
                  variant="primary-red" 
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2"
                >
                  Excluir Selecionadas ({selectedDealIds.size})
                </Button>
              )}
              <Button variant="primary-red" onClick={handleCreateNew}>
                + Nova Negociação
              </Button>
            </div>
          </div>
        </div>

        {!activeFunnel ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">Nenhum funil ativo encontrado</p>
              <p className="text-white/50 text-sm">Configure um funil em Configurações</p>
            </div>
          </Card>
        ) : (
          <>
            <DealFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              onReset={handleFiltersReset}
            />
            
            {viewMode === 'kanban' ? (
              <DealKanban
                deals={filteredDeals}
                stages={stages}
                onDealClick={handleDealClick}
                onStageChange={handleStageChange}
                onOpenTasks={handleOpenTasks}
                onWinDeal={handleWinDeal}
                onLoseDeal={handleLoseDeal}
                onPauseDeal={handlePauseDeal}
                onResumeDeal={handleResumeDeal}
                loading={loading}
                selectedDealIds={selectedDealIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
              />
            ) : (
              <DealListView
                deals={filteredDeals}
                onDealClick={handleDealClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onOpenTasks={handleOpenTasks}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                loading={loading}
                selectedDealIds={selectedDealIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                canDelete={canDeleteDealsAndCompanies}
              />
            )}
          </>
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

      {selectedDeal && (
        <DealTasksModal
          isOpen={isTasksModalOpen}
          dealId={selectedDeal.id}
          dealTitle={selectedDeal.title}
          onClose={() => {
            setIsTasksModalOpen(false)
            setSelectedDeal(undefined)
          }}
        />
      )}

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

