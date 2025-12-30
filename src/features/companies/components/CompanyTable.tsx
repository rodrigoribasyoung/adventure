import { useState, useEffect } from 'react'
import { Company } from '@/types'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'

interface CompanyTableProps {
  companies: Company[]
  loading: boolean
  onEdit: (company: Company) => void
  onDelete: (id: string) => void
  onCreateNew?: () => void
  canDelete?: boolean
}

export const CompanyTable = ({ companies, loading, onEdit, onDelete, canDelete = true }: CompanyTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  useEffect(() => {
    setCurrentPage(1)
  }, [companies.length])

  const totalPages = Math.ceil(companies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCompanies = companies.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando empresas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {companies.length === 0 ? (
        <div className="bg-background-darker border border-white/10 rounded-lg p-12 text-center">
          <p className="text-white/70 mb-4">Nenhuma empresa cadastrada</p>
        </div>
      ) : (
        <>
          <div className="bg-background-darker border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                      CNPJ
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-white/60 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paginatedCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => onEdit(company)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{company.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/70">{company.cnpj || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/70">{company.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/70">{company.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(company)}
                        >
                          Editar
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir esta empresa?')) {
                                onDelete(company.id)
                              }
                            }}
                          >
                            Excluir
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          {companies.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={companies.length}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage)
                setCurrentPage(1)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

