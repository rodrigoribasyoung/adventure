import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BackButton } from '@/components/common/BackButton'
import { useCompanies } from '../hooks/useCompanies'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { useDeals } from '@/features/deals/hooks/useDeals'
import { CompanyForm } from '../components/CompanyForm'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatWhatsAppLink } from '@/lib/utils/whatsapp'

const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { companies, loading, updateCompany, deleteCompany } = useCompanies()
  const { contacts } = useContacts()
  const { deals } = useDeals()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const company = companies.find(c => c.id === id)
  
  // Buscar contatos relacionados
  const relatedContacts = company 
    ? contacts.filter(c => 
        (company.contactIds?.includes(c.id)) || 
        (c.companyId === company.id) ||
        (c.companyIds?.includes(company.id))
      )
    : []
  
  // Buscar negociações relacionadas
  const relatedDeals = company 
    ? deals.filter(d => d.companyId === company.id)
    : []

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (!isEditModalOpen) {
          navigate('/companies')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, isEditModalOpen])

  const handleSubmit = async (data: any) => {
    if (!company) return
    
    try {
      setFormLoading(true)
      await updateCompany(company.id, data)
      setToast({ message: 'Empresa atualizada com sucesso!', type: 'success', visible: true })
      setIsEditModalOpen(false)
    } catch (error: any) {
      console.error('[CompanyDetailPage] Erro ao atualizar empresa:', error)
      const errorMessage = error?.message || 'Erro ao atualizar empresa'
      setToast({ message: errorMessage, type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!company) return
    
    if (!confirm(`Tem certeza que deseja excluir a empresa "${company.name}"?`)) {
      return
    }

    try {
      await deleteCompany(company.id)
      setToast({ message: 'Empresa excluída com sucesso!', type: 'success', visible: true })
      navigate('/companies')
    } catch (error: any) {
      console.error('[CompanyDetailPage] Erro ao excluir empresa:', error)
      setToast({ message: 'Erro ao excluir empresa', type: 'error', visible: true })
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

  if (!company) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-white/70 mb-4">Empresa não encontrada</p>
            <Button variant="primary-red" onClick={() => navigate('/companies')}>
              Voltar para Empresas
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
            <BackButton to="/companies" />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{company.name}</h1>
              <div className="flex items-center gap-4 text-white/70">
                {company.createdAt && (
                  <span className="text-sm">
                    Criada em {format(company.createdAt.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
                  <p className="text-white">{company.name}</p>
                </div>
                
                {company.cnpj && (
                  <div>
                    <label className="text-sm text-white/60">CNPJ</label>
                    <p className="text-white">{company.cnpj}</p>
                  </div>
                )}
                
                {company.email && (
                  <div>
                    <label className="text-sm text-white/60">Email</label>
                    <p className="text-white">
                      <a href={`mailto:${company.email}`} className="text-primary-red hover:underline">
                        {company.email}
                      </a>
                    </p>
                  </div>
                )}
                
                {company.phone && (
                  <div>
                    <label className="text-sm text-white/60">Telefone</label>
                    <p className="text-white">
                      <a 
                        href={formatWhatsAppLink(company.phone)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-red hover:underline"
                      >
                        {company.phone}
                      </a>
                    </p>
                  </div>
                )}
                
                {company.website && (
                  <div>
                    <label className="text-sm text-white/60">Website</label>
                    <p className="text-white">
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary-red hover:underline">
                        {company.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Segmentação */}
            {(company.segment || company.industry || company.size || company.annualRevenue || company.employeeCount) && (
              <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Segmentação</h2>
                <div className="grid grid-cols-2 gap-4">
                  {company.segment && (
                    <div>
                      <label className="text-sm text-white/60">Segmento</label>
                      <p className="text-white">{company.segment}</p>
                    </div>
                  )}
                  
                  {company.industry && (
                    <div>
                      <label className="text-sm text-white/60">Setor/Indústria</label>
                      <p className="text-white">{company.industry}</p>
                    </div>
                  )}
                  
                  {company.size && (
                    <div>
                      <label className="text-sm text-white/60">Porte</label>
                      <p className="text-white capitalize">{company.size}</p>
                    </div>
                  )}
                  
                  {company.annualRevenue && (
                    <div>
                      <label className="text-sm text-white/60">Faturamento Anual</label>
                      <p className="text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(company.annualRevenue)}
                      </p>
                    </div>
                  )}
                  
                  {company.employeeCount && (
                    <div>
                      <label className="text-sm text-white/60">Número de Funcionários</label>
                      <p className="text-white">{company.employeeCount}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Redes Sociais */}
            {company.socialMedia && (
              <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Redes Sociais</h2>
                <div className="space-y-2">
                  {company.socialMedia.linkedin && (
                    <div>
                      <a href={company.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-red hover:underline">
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {company.socialMedia.instagram && (
                    <div>
                      <a href={`https://instagram.com/${company.socialMedia.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary-red hover:underline">
                        Instagram: {company.socialMedia.instagram}
                      </a>
                    </div>
                  )}
                  {company.socialMedia.facebook && (
                    <div>
                      <a href={company.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-primary-red hover:underline">
                        Facebook
                      </a>
                    </div>
                  )}
                  {company.socialMedia.twitter && (
                    <div>
                      <a href={`https://twitter.com/${company.socialMedia.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary-red hover:underline">
                        Twitter: {company.socialMedia.twitter}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Endereço */}
            {company.address && (
              <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Endereço</h2>
                <div className="space-y-2 text-white">
                  {company.address.street && <p>{company.address.street}</p>}
                  {company.address.city && company.address.state && (
                    <p>{company.address.city} - {company.address.state}</p>
                  )}
                  {company.address.zipCode && <p>CEP: {company.address.zipCode}</p>}
                  {company.address.country && <p>{company.address.country}</p>}
                </div>
              </Card>
            )}

            {/* Observações */}
            {company.notes && (
              <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Observações</h2>
                <p className="text-white whitespace-pre-wrap">{company.notes}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contatos Relacionados */}
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">
                Contatos ({relatedContacts.length})
              </h2>
              {relatedContacts.length > 0 ? (
                <div className="space-y-2">
                  {relatedContacts.map(contact => (
                    <div 
                      key={contact.id}
                      className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                    >
                      <p className="text-white font-medium">{contact.name}</p>
                      {contact.email && <p className="text-white/60 text-sm">{contact.email}</p>}
                      {contact.jobTitle && <p className="text-white/60 text-sm">{contact.jobTitle}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-sm">Nenhum contato vinculado</p>
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
        title="Editar Empresa"
        size="lg"
      >
        <CompanyForm
          company={company}
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

export default CompanyDetailPage

