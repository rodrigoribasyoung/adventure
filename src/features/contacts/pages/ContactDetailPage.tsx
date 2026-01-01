import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BackButton } from '@/components/common/BackButton'
import { useContacts } from '../hooks/useContacts'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { useDeals } from '@/features/deals/hooks/useDeals'
import { ContactForm } from '../components/ContactForm'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatWhatsAppLink } from '@/lib/utils/whatsapp'

const ContactDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { contacts, loading, updateContact, deleteContact } = useContacts()
  const { companies } = useCompanies()
  const { deals } = useDeals()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const contact = contacts.find(c => c.id === id)
  
  // Buscar empresas relacionadas
  const relatedCompanies = contact 
    ? companies.filter(c => 
        (contact.companyIds?.includes(c.id)) || 
        (c.contactIds?.includes(contact.id)) ||
        (contact.companyId === c.id)
      )
    : []
  
  // Buscar negociações relacionadas
  const relatedDeals = contact 
    ? deals.filter(d => d.contactId === contact.id || d.contactIds?.includes(contact.id))
    : []

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (!isEditModalOpen) {
          navigate('/contacts')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, isEditModalOpen])

  const handleSubmit = async (data: any) => {
    if (!contact) return
    
    try {
      setFormLoading(true)
      await updateContact(contact.id, data)
      setToast({ message: 'Contato atualizado com sucesso!', type: 'success', visible: true })
      setIsEditModalOpen(false)
    } catch (error: any) {
      console.error('[ContactDetailPage] Erro ao atualizar contato:', error)
      const errorMessage = error?.message || 'Erro ao atualizar contato'
      setToast({ message: errorMessage, type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!contact) return
    
    if (!confirm(`Tem certeza que deseja excluir o contato "${contact.name}"?`)) {
      return
    }

    try {
      await deleteContact(contact.id)
      setToast({ message: 'Contato excluído com sucesso!', type: 'success', visible: true })
      navigate('/contacts')
    } catch (error: any) {
      console.error('[ContactDetailPage] Erro ao excluir contato:', error)
      setToast({ message: 'Erro ao excluir contato', type: 'error', visible: true })
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <div className="text-white/70">Carregando...</div>
        </div>
      </Container>
    )
  }

  if (!contact) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-white/70 mb-4">Contato não encontrado</p>
            <Button variant="primary-red" onClick={() => navigate('/contacts')}>
              Voltar para Contatos
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton to="/contacts" />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{contact.name}</h1>
              <div className="flex items-center gap-4 text-white/70">
                {contact.createdAt && (
                  <span className="text-sm">
                    Criado em {format(contact.createdAt.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(true)}>
              Editar
            </Button>
            <Button variant="primary-red" onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">Informações Principais</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60">Nome</label>
                  <p className="text-white">{contact.name}</p>
                </div>
                
                {contact.email && (
                  <div>
                    <label className="text-sm text-white/60">Email</label>
                    <p className="text-white">
                      <a href={`mailto:${contact.email}`} className="text-primary-red hover:underline">
                        {contact.email}
                      </a>
                    </p>
                  </div>
                )}
                
                {contact.phone && (
                  <div>
                    <label className="text-sm text-white/60">Telefone</label>
                    <p className="text-white">
                      <a 
                        href={formatWhatsAppLink(contact.phone)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-red hover:underline"
                      >
                        {contact.phone}
                      </a>
                    </p>
                  </div>
                )}
                
                {contact.jobTitle && (
                  <div>
                    <label className="text-sm text-white/60">Cargo/Função</label>
                    <p className="text-white">{contact.jobTitle}</p>
                  </div>
                )}
                
                {contact.department && (
                  <div>
                    <label className="text-sm text-white/60">Departamento</label>
                    <p className="text-white">{contact.department}</p>
                  </div>
                )}
                
                {contact.linkedin && (
                  <div>
                    <label className="text-sm text-white/60">LinkedIn</label>
                    <p className="text-white">
                      <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-red hover:underline">
                        {contact.linkedin}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Observações */}
            {contact.notes && (
              <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Observações</h2>
                <p className="text-white whitespace-pre-wrap">{contact.notes}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Empresas Relacionadas */}
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">
                Empresas ({relatedCompanies.length})
              </h2>
              {relatedCompanies.length > 0 ? (
                <div className="space-y-2">
                  {relatedCompanies.map(company => (
                    <div 
                      key={company.id}
                      className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => navigate(`/companies/${company.id}`)}
                    >
                      <p className="text-white font-medium">{company.name}</p>
                      {company.email && <p className="text-white/60 text-sm">{company.email}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-sm">Nenhuma empresa vinculada</p>
              )}
            </Card>

            {/* Negociações Relacionadas */}
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">
                Negociações ({relatedDeals.length})
              </h2>
              {relatedDeals.length > 0 ? (
                <div className="space-y-2">
                  {relatedDeals.map(deal => (
                    <div 
                      key={deal.id}
                      className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => navigate(`/deals/${deal.id}`)}
                    >
                      <p className="text-white font-medium">{deal.title}</p>
                      <p className="text-white/60 text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-sm">Nenhuma negociação vinculada</p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Contato"
        size="lg"
      >
        <ContactForm
          contact={contact}
          onSubmit={handleSubmit}
          onCancel={() => setIsEditModalOpen(false)}
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

export default ContactDetailPage

