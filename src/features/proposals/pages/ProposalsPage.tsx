import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { ProposalList } from '../components/ProposalList'
import { ProposalForm } from '../components/ProposalForm'
import { useProposals } from '../hooks/useProposals'
import { Proposal } from '@/types'
import { AdvancedFilter } from '@/components/common/AdvancedFilter'
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter'
import { FilterField } from '@/components/common/AdvancedFilter'

interface ProposalFilters {
  search: string
  status: string[]
  dealId: string
  minValue: number | null
  maxValue: number | null
  dateFrom: string
  dateTo: string
}

const ProposalsPage = () => {
  const { proposals, loading, createProposal, updateProposal, deleteProposal } = useProposals()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const initialFilters: ProposalFilters = {
    search: '',
    status: [],
    dealId: '',
    minValue: null,
    maxValue: null,
    dateFrom: '',
    dateTo: '',
  }

  const { filters, setFilters, resetFilters } = useAdvancedFilter<ProposalFilters>({
    initialFilters,
    persistKey: 'proposals_filters',
  })

  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'draft', label: 'Rascunho' },
        { value: 'sent', label: 'Enviada' },
        { value: 'accepted', label: 'Aceita' },
        { value: 'rejected', label: 'Rejeitada' },
        { value: 'expired', label: 'Expirada' },
      ],
    },
    {
      key: 'minValue',
      label: 'Valor Mínimo (R$)',
      type: 'number',
      placeholder: '0.00',
    },
    {
      key: 'maxValue',
      label: 'Valor Máximo (R$)',
      type: 'number',
      placeholder: '0.00',
    },
    {
      key: 'dateFrom',
      label: 'Data de Criação (De)',
      type: 'date',
    },
    {
      key: 'dateTo',
      label: 'Data de Criação (Até)',
      type: 'date',
    },
  ]

  const filteredProposals = proposals.filter(proposal => {
    // Busca por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        proposal.title.toLowerCase().includes(searchLower) ||
        proposal.description.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Filtro por status
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(proposal.status)) return false
    }

    // Filtro por negociação
    if (filters.dealId) {
      if (proposal.dealId !== filters.dealId) return false
    }

    // Filtro por valor mínimo
    if (filters.minValue !== null && filters.minValue !== undefined) {
      if (proposal.value < filters.minValue) return false
    }

    // Filtro por valor máximo
    if (filters.maxValue !== null && filters.maxValue !== undefined) {
      if (proposal.value > filters.maxValue) return false
    }

    // Filtro por data de criação
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      if (proposal.createdAt && proposal.createdAt.toDate() < fromDate) return false
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999)
      if (proposal.createdAt && proposal.createdAt.toDate() > toDate) return false
    }

    return true
  })

  const handleCreateNew = () => {
    setSelectedProposal(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedProposal) {
        await updateProposal(selectedProposal.id, data)
        setToast({ message: 'Proposta atualizada com sucesso!', type: 'success', visible: true })
      } else {
        await createProposal(data)
        setToast({ message: 'Proposta criada com sucesso!', type: 'success', visible: true })
      }
      setIsModalOpen(false)
      setSelectedProposal(undefined)
    } catch (error: any) {
      console.error('Erro ao salvar proposta:', error)
      setToast({ message: error?.message || 'Erro ao salvar proposta', type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProposal(id)
      setToast({ message: 'Proposta excluída com sucesso!', type: 'success', visible: true })
    } catch (error) {
      setToast({ message: 'Erro ao excluir proposta', type: 'error', visible: true })
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-white/90 mb-1">Propostas</h1>
            <p className="text-white/60 text-sm">Gerencie suas propostas comerciais</p>
          </div>
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Nova Proposta
          </Button>
        </div>

        <AdvancedFilter
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          searchPlaceholder="Buscar por título ou descrição..."
          fields={filterFields}
        />

        <ProposalList
          proposals={filteredProposals}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedProposal(undefined)
          }}
          title={selectedProposal ? 'Editar Proposta' : 'Nova Proposta'}
        >
          <ProposalForm
            proposal={selectedProposal}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false)
              setSelectedProposal(undefined)
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
      </div>
    </Container>
  )
}

export default ProposalsPage

