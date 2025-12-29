import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { ContactTable } from '../components/ContactTable'
import { ContactForm } from '../components/ContactForm'
import { Modal } from '@/components/ui/Modal'
import { CsvImport } from '@/components/imports/CsvImport'
import { useContacts } from '../hooks/useContacts'
import { Contact } from '@/types'
import { Toast } from '@/components/ui/Toast'

const ContactsPage = () => {
  const { contacts, loading, createContact, updateContact, deleteContact } = useContacts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
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
      await createContact({
        name: row.name || row.nome || '',
        email: row.email || undefined,
        phone: row.phone || row.telefone || undefined,
        companyId: row.companyId || row.empresaId || undefined,
      })
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Contatos</h1>
          <p className="text-white/70">Gerencie seus contatos</p>
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

        <ContactTable
          contacts={contacts}
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

