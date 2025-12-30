import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { CompanyTable } from '../components/CompanyTable'
import { CompanyForm } from '../components/CompanyForm'
import { Modal } from '@/components/ui/Modal'
import { useCompanies } from '../hooks/useCompanies'
import { Company } from '@/types'
import { Toast } from '@/components/ui/Toast'
import { AdvancedFilter } from '@/components/common/AdvancedFilter'
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter'
import { FilterField } from '@/components/common/AdvancedFilter'
import { Button } from '@/components/ui/Button'

interface CompanyFilters {
  search: string
  city: string
  state: string
}

const CompaniesPage = () => {
  const { companies, loading, createCompany, updateCompany, deleteCompany } = useCompanies()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const initialFilters: CompanyFilters = {
    search: '',
    city: '',
    state: '',
  }

  const { filters, setFilters, resetFilters } = useAdvancedFilter<CompanyFilters>({
    initialFilters,
    persistKey: 'companies_filters',
  })

  const filterFields: FilterField[] = [
    {
      key: 'city',
      label: 'Cidade',
      type: 'text',
      placeholder: 'Buscar por cidade...',
    },
    {
      key: 'state',
      label: 'Estado',
      type: 'text',
      placeholder: 'Buscar por estado...',
    },
  ]

  const filteredCompanies = companies.filter(company => {
    // Busca por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        company.name.toLowerCase().includes(searchLower) ||
        company.email?.toLowerCase().includes(searchLower) ||
        company.cnpj?.includes(searchLower) ||
        company.phone?.includes(searchLower)
      if (!matchesSearch) return false
    }

    // Filtro por cidade
    if (filters.city) {
      const cityLower = filters.city.toLowerCase()
      if (!company.address?.city?.toLowerCase().includes(cityLower)) return false
    }

    // Filtro por estado
    if (filters.state) {
      const stateLower = filters.state.toLowerCase()
      if (!company.address?.state?.toLowerCase().includes(stateLower)) return false
    }

    return true
  })

  const handleCreateNew = () => {
    setSelectedCompany(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (company: Company) => {
    setSelectedCompany(company)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      console.log('[CompaniesPage] Submetendo formulário:', data)
      if (selectedCompany) {
        console.log('[CompaniesPage] Atualizando empresa:', selectedCompany.id)
        await updateCompany(selectedCompany.id, data)
        setToast({ message: 'Empresa atualizada com sucesso!', type: 'success', visible: true })
      } else {
        console.log('[CompaniesPage] Criando nova empresa')
        const id = await createCompany(data)
        console.log('[CompaniesPage] Empresa criada com ID:', id)
        setToast({ message: 'Empresa criada com sucesso!', type: 'success', visible: true })
      }
      setIsModalOpen(false)
      setSelectedCompany(undefined)
    } catch (error: any) {
      console.error('[CompaniesPage] Erro ao salvar empresa:', error)
      const errorMessage = error?.message || 'Erro ao salvar empresa'
      setToast({ message: errorMessage, type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCompany(id)
      setToast({ message: 'Empresa excluída com sucesso!', type: 'success', visible: true })
    } catch (error) {
      setToast({ message: 'Erro ao excluir empresa', type: 'error', visible: true })
    }
  }


  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-white/90 mb-1">Empresas</h1>
            <p className="text-white/60 text-sm">Gerencie suas empresas</p>
          </div>
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Nova Empresa
          </Button>
        </div>

        <AdvancedFilter
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          searchPlaceholder="Buscar por nome, email, CNPJ ou telefone..."
          fields={filterFields}
        />

        <CompanyTable
          companies={filteredCompanies}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCompany(undefined)
        }}
        title={selectedCompany ? 'Editar Empresa' : 'Nova Empresa'}
        size="md"
      >
        <CompanyForm
          company={selectedCompany}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedCompany(undefined)
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

export default CompaniesPage

