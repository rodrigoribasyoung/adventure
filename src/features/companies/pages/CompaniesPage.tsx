import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { CompanyTable } from '../components/CompanyTable'
import { CompanyForm } from '../components/CompanyForm'
import { Modal } from '@/components/ui/Modal'
import { CsvImport } from '@/components/imports/CsvImport'
import { useCompanies } from '../hooks/useCompanies'
import { Company } from '@/types'
import { Toast } from '@/components/ui/Toast'

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

  const handleCompaniesImport = async (data: any[]) => {
    for (const row of data) {
      await createCompany({
        name: row.name || row.nome || '',
        cnpj: row.cnpj || undefined,
        email: row.email || undefined,
        phone: row.phone || row.telefone || undefined,
        address: row.address || row.endereco ? {
          street: row.street || row.rua || undefined,
          city: row.city || row.cidade || undefined,
          state: row.state || row.estado || undefined,
          zipCode: row.zipCode || row.cep || undefined,
          country: row.country || row.pais || 'Brasil',
        } : undefined,
      })
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Empresas</h1>
          <p className="text-white/70">Gerencie suas empresas</p>
        </div>

        <CsvImport
          entityType="companies"
          onImport={handleCompaniesImport}
          sampleFileName="empresas-modelo.csv"
          sampleHeaders={['name', 'cnpj', 'email', 'phone', 'city', 'state']}
          sampleData={[
            ['Tech Solutions Ltda', '12.345.678/0001-90', 'contato@techsolutions.com.br', '(11) 98765-4321', 'São Paulo', 'SP'],
            ['Digital Marketing Agency', '', 'hello@digitalmarketing.com.br', '(11) 91234-5678', 'Rio de Janeiro', 'RJ'],
          ]}
        />

        <CompanyTable
          companies={companies}
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

