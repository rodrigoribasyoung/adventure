import { useState, useEffect } from 'react'
import { ProjectResponsible } from '../hooks/useProjectUsers'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'

interface ProjectMemberTableProps {
  members: ProjectResponsible[]
  loading: boolean
  onEdit: (member: ProjectResponsible) => void
  onDelete: (id: string) => void
}

const FUNCTION_LEVEL_LABELS: Record<string, string> = {
  vendedor: 'Vendedor',
  analista: 'Analista',
  coordenador: 'Coordenador',
  gerente: 'Gerente',
  diretor: 'Diretor',
}

export const ProjectMemberTable = ({ members, loading, onEdit, onDelete }: ProjectMemberTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  useEffect(() => {
    setCurrentPage(1)
  }, [members.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando responsáveis...</div>
      </div>
    )
  }

  const totalPages = Math.ceil(members.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMembers = members.slice(startIndex, endIndex)

  if (members.length === 0) {
    return (
      <div className="bg-background-darker border border-white/10 rounded-lg p-12 text-center">
        <p className="text-white/70 mb-4">Nenhum responsável cadastrado</p>
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
                  Nome
                </th>
                <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                  Cargo/Função
                </th>
                <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                  Nível de Função
                </th>
                <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                  Telefone
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
              {paginatedMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white/70">{member.jobTitle || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.functionLevel ? (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400">
                        {FUNCTION_LEVEL_LABELS[member.functionLevel] || member.functionLevel}
                      </span>
                    ) : (
                      <span className="text-sm text-white/50">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white/70">{member.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white/70">{member.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      member.active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {member.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(member)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir ${member.name}?`)) {
                            onDelete(member.id)
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

      {members.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={members.length}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}

