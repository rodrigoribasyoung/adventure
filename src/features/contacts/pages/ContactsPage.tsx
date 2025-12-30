import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { ContactTable } from '../components/ContactTable'
import { ContactForm } from '../components/ContactForm'
import { Modal } from '@/components/ui/Modal'
import { CsvImport } from '@/components/imports/CsvImport'
import { useContacts } from '../hooks/useContacts'
import { Contact } from '@/types'
import { Toast } from '@/components/ui/Toast'
import { AdvancedFilter } from '@/components/common/AdvancedFilter'
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter'
import { FilterField } from '@/components/common/AdvancedFilter'
import { Button } from '@/components/ui/Button'
import { useCompanies } from '@/features/companies/hooks/useCompanies'

interface ContactFilters {
  search: string
  companyId: string
}

const ContactsPage = () => {
  const { contacts, loading, createContact, updateContact, deleteContact } = useContacts()
  const { companies } = useCompanies()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const initialFilters: ContactFilters = {
    search: '',
    companyId: '',
  }

  const { filters, setFilters, resetFilters } = useAdvancedFilter<ContactFilters>({
    initialFilters,
    persistKey: 'contacts_filters',
  })

  const filterFields: FilterField[] = [
    {
      key: 'companyId',
      label: 'Empresa',
      type: 'select',
      options: [
        { value: '', label: 'Todas as empresas' },
        ...companies.map(c => ({ value: c.id, label: c.name })),
      ],
    },
  ]

  const filteredContacts = contacts.filter(contact => {
    // Busca por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.phone?.includes(searchLower)
      if (!matchesSearch) return false
    }

    // Filtro por empresa
    if (filters.companyId) {
      if (contact.companyId !== filters.companyId) return false
    }

    return true
  })

  const handleCreateNew = () => {
    setSelectedContact(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      console.log('[ContactsPage] Submetendo formulário:', data)
      if (selectedContact) {
        console.log('[ContactsPage] Atualizando contato:', selectedContact.id)
        await updateContact(selectedContact.id, data)
        setToast({ message: 'Contato atualizado com sucesso!', type: 'success', visible: true })
      } else {
        console.log('[ContactsPage] Criando novo contato')
        const id = await createContact(data)
        console.log('[ContactsPage] Contato criado com ID:', id)
        setToast({ message: 'Contato criado com sucesso!', type: 'success', visible: true })
      }
      setIsModalOpen(false)
      setSelectedContact(undefined)
    } catch (error: any) {
      console.error('[ContactsPage] Erro ao salvar contato:', error)
      const errorMessage = error?.message || 'Erro ao salvar contato'
      setToast({ message: errorMessage, type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteContact(id)
      setToast({ message: 'Contato excluído com sucesso!', type: 'success', visible: true })
    } catch (error) {
      setToast({ message: 'Erro ao excluir contato', type: 'error', visible: true })
    }
  }

  const handleContactsImport = async (data: any[]) => {
    for (const row of data) {
      const fullName = row.name || row.nome || ''
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || undefined
      
      await createContact({
        firstName,
        lastName,
        email: row.email || undefined,
        phone: row.phone || row.telefone || undefined,
        companyId: row.companyId || row.empresaId || undefined,
      })
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Contatos</h1>
            <p className="text-white/70">Gerencie seus contatos</p>
          </div>
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Novo Contato
          </Button>
        </div>

        <CsvImport
          entityType="contacts"
          onImport={handleContactsImport}
          sampleFileName="contatos-modelo.csv"
          sampleHeaders={['name', 'email', 'phone', 'companyId']}
          sampleData={[
            ['João Silva', 'joao@example.com', '(11) 98765-4321', ''],
            ['Maria Santos', 'maria@example.com', '(11) 91234-5678', ''],
          ]}
        />

        <AdvancedFilter
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          searchPlaceholder="Buscar por nome, email ou telefone..."
          fields={filterFields}
        />

        <ContactTable
          contacts={filteredContacts}
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
          setSelectedContact(undefined)
        }}
        title={selectedContact ? 'Editar Contato' : 'Novo Contato'}
        size="md"
      >
        <ContactForm
          contact={selectedContact}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedContact(undefined)
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

export default ContactsPage

