import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { ProjectMemberForm } from '../components/ProjectMemberForm'
import { ProjectMemberList } from '../components/ProjectMemberList'
import { ProjectMemberTable } from '../components/ProjectMemberTable'
import { useProjectMembers } from '../hooks/useProjectMembers'
import { ProjectMember } from '@/types'
import { AdvancedFilter } from '@/components/common/AdvancedFilter'
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter'
import { FilterField } from '@/components/common/AdvancedFilter'

interface ProjectMemberFilters {
  search: string
  functionLevel: string[]
  active: string
}

const ProjectMembersPage = () => {
  const { members, loading, createMember, updateMember, deleteMember } = useProjectMembers()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<ProjectMember | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'table'>('table')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const initialFilters: ProjectMemberFilters = {
    search: '',
    functionLevel: [],
    active: '',
  }

  const { filters, setFilters, resetFilters } = useAdvancedFilter<ProjectMemberFilters>({
    initialFilters,
    persistKey: 'projectMembers_filters',
  })

  const filterFields: FilterField[] = [
    {
      key: 'functionLevel',
      label: 'Nível de Função',
      type: 'multiselect',
      options: [
        { value: 'vendedor', label: 'Vendedor' },
        { value: 'analista', label: 'Analista' },
        { value: 'coordenador', label: 'Coordenador' },
        { value: 'gerente', label: 'Gerente' },
        { value: 'diretor', label: 'Diretor' },
      ],
    },
    {
      key: 'active',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Ativo' },
        { value: 'false', label: 'Inativo' },
      ],
    },
  ]

  const filteredMembers = members.filter(member => {
    // Busca por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        member.name.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.phone?.includes(searchLower) ||
        member.role?.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Filtro por nível de função
    if (filters.functionLevel && filters.functionLevel.length > 0) {
      if (!member.functionLevel || !filters.functionLevel.includes(member.functionLevel)) return false
    }

    // Filtro por status
    if (filters.active) {
      const isActive = filters.active === 'true'
      if (member.active !== isActive) return false
    }

    return true
  })

  const handleCreateNew = () => {
    setSelectedMember(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (member: ProjectMember) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedMember) {
        await updateMember(selectedMember.id, data)
        setToast({ message: 'Responsável atualizado com sucesso!', type: 'success', visible: true })
      } else {
        await createMember(data)
        setToast({ message: 'Responsável criado com sucesso!', type: 'success', visible: true })
      }
      setIsModalOpen(false)
      setSelectedMember(undefined)
    } catch (error: any) {
      console.error('Erro ao salvar responsável:', error)
      setToast({ message: error?.message || 'Erro ao salvar responsável', type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMember(id)
      setToast({ message: 'Responsável excluído com sucesso!', type: 'success', visible: true })
    } catch (error) {
      setToast({ message: 'Erro ao excluir responsável', type: 'error', visible: true })
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Responsáveis</h1>
            <p className="text-white/70">Gerencie os responsáveis e colaboradores do projeto</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'primary-red' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Lista
              </Button>
              <Button
                variant={viewMode === 'table' ? 'primary-red' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Tabela
              </Button>
            </div>
            <Button variant="primary-red" onClick={handleCreateNew}>
              + Novo Responsável
            </Button>
          </div>
        </div>

        <AdvancedFilter
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          searchPlaceholder="Buscar por nome, email, telefone ou cargo..."
          fields={filterFields}
        />

        {viewMode === 'table' ? (
          <ProjectMemberTable
            members={filteredMembers}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <ProjectMemberList
            members={filteredMembers}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMember(undefined)
        }}
        title={selectedMember ? 'Editar Responsável' : 'Novo Responsável'}
        size="md"
      >
        <ProjectMemberForm
          member={selectedMember}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedMember(undefined)
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

export default ProjectMembersPage

