import { useState, useEffect } from 'react'
import { Proposal } from '@/types'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ProposalListProps {
  proposals: Proposal[]
  loading: boolean
  onEdit: (proposal: Proposal) => void
  onDelete: (id: string) => void
}

const statusLabels: Record<Proposal['status'], string> = {
  draft: 'Rascunho',
  sent: 'Enviada',
  accepted: 'Aceita',
  rejected: 'Rejeitada',
  expired: 'Expirada',
}

const statusColors: Record<Proposal['status'], string> = {
  draft: 'bg-gray-500/20 text-gray-300',
  sent: 'bg-blue-500/20 text-blue-300',
  accepted: 'bg-green-500/20 text-green-300',
  rejected: 'bg-red-500/20 text-red-300',
  expired: 'bg-orange-500/20 text-orange-300',
}

export const ProposalList = ({ proposals, loading, onEdit, onDelete }: ProposalListProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  useEffect(() => {
    setCurrentPage(1)
  }, [proposals.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando propostas...</div>
      </div>
    )
  }

  const totalPages = Math.ceil(proposals.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProposals = proposals.slice(startIndex, endIndex)

  if (proposals.length === 0) {
    return (
      <div className="bg-background-darker border border-white/10 rounded-lg p-12 text-center">
        <p className="text-white/70 mb-4">Nenhuma proposta cadastrada</p>
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
                  Valor
                </th>
                <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                  Data de Criação
                </th>
                <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                  Data de Expiração
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paginatedProposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{proposal.title}</div>
                    {proposal.description && (
                      <div className="text-xs text-white/50 mt-1 line-clamp-1">
                        {proposal.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{formatCurrency(proposal.value, proposal.currency)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[proposal.status]}`}>
                      {statusLabels[proposal.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white/70">
                      {proposal.createdAt ? format(proposal.createdAt.toDate(), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white/70">
                      {proposal.expiresAt ? format(proposal.expiresAt.toDate(), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(proposal)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta proposta?')) {
                            onDelete(proposal.id)
                          }
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {proposals.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={proposals.length}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}

