import { useState, useEffect } from 'react'
import { Project } from '@/types'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'

interface ProjectTableProps {
  projects: Project[]
  loading: boolean
  currentProjectId?: string
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
  onSelect: (project: Project) => void
}

export const ProjectTable = ({ 
  projects, 
  loading, 
  currentProjectId,
  onEdit, 
  onDelete,
  onSelect 
}: ProjectTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  useEffect(() => {
    setCurrentPage(1)
  }, [projects.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando projetos...</div>
      </div>
    )
  }

  const totalPages = Math.ceil(projects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = projects.slice(startIndex, endIndex)

  if (projects.length === 0) {
    return (
      <div className="bg-background-darker border border-white/10 rounded-lg p-12 text-center">
        <p className="text-white/70 mb-4">Nenhum projeto cadastrado</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paginatedProjects.map((project) => (
                <tr
                  key={project.id}
                  className={`hover:bg-white/5 transition-colors cursor-pointer ${
                    currentProjectId === project.id ? 'bg-primary-blue/10' : ''
                  }`}
                  onClick={() => onSelect(project)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-white">{project.name}</div>
                      {currentProjectId === project.id && (
                        <span className="px-2 py-0.5 bg-primary-blue/20 text-primary-blue text-xs rounded">
                          Ativo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white/70 max-w-md truncate">
                      {project.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      project.plan === 'basic' ? 'bg-blue-500/20 text-blue-400' :
                      project.plan === 'premium' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {project.plan === 'basic' ? 'Básico' : project.plan === 'premium' ? 'Premium' : 'Enterprise'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      project.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {project.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(project)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este projeto?')) {
                            onDelete(project.id)
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

      {projects.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={projects.length}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}

