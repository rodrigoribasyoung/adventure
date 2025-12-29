import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useDeals } from '../hooks/useDeals'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { useServices } from '@/features/services/hooks/useServices'
import { DealCloseModal } from '@/components/deals/DealCloseModal'
import { DealTasksModal } from '../components/DealTasksModal'
import { DealForm } from '../components/DealForm'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const DealDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { deals, loading, updateDeal, closeDeal, reopenDeal } = useDeals()
  const { activeFunnel } = useFunnels()
  const { contacts } = useContacts()
  const { companies } = useCompanies()
  const { services } = useServices()
  
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [closeStatus, setCloseStatus] = useState<'won' | 'lost'>('won')
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const deal = deals.find(d => d.id === id)
  const contact = deal ? contacts.find(c => c.id === deal.contactId) : null
  const company = deal?.companyId ? companies.find(c => c.id === deal.companyId) : null
  const stage = deal && activeFunnel ? activeFunnel.stages.find(s => s.id === deal.stage) : null
  const dealServices = deal ? services.filter(s => deal.serviceIds?.includes(s.id)) : []

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC ou Backspace para voltar
      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (!isCloseModalOpen && !isTasksModalOpen && !isEditModalOpen) {
          navigate('/deals')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, isCloseModalOpen, isTasksModalOpen, isEditModalOpen])

  const handleCloseDeal = async (status: 'won' | 'lost', closeReason?: string) => {
    if (!deal) return
    
    try {
      const stage = activeFunnel?.stages.find(s => 
        (status === 'won' && s.isWonStage) || (status === 'lost' && s.isLostStage)
      )
      
      if (stage) {
        await updateDeal(deal.id, { stage: stage.id })
      }
      
      await closeDeal(deal.id, status, closeReason)
      setToast({ 
        message: `Negociação ${status === 'won' ? 'ganha' : 'perdida'} com sucesso!`, 
        type: 'success', 
        visible: true 
      })
      setIsCloseModalOpen(false)
    } catch (error: any) {
      console.error('[DealDetailPage] Erro ao fechar negociação:', error)
      setToast({ message: 'Erro ao fechar negociação', type: 'error', visible: true })
    }
  }

  const handleReopenDeal = async () => {
    if (!deal) return
    
    try {
      await reopenDeal(deal.id)
      setToast({ 
        message: 'Negociação reaberta com sucesso!', 
        type: 'success', 
        visible: true 
      })
    } catch (error: any) {
      console.error('[DealDetailPage] Erro ao reabrir negociação:', error)
      setToast({ message: 'Erro ao reabrir negociação', type: 'error', visible: true })
    }
  }

  const handleSubmit = async (data: any) => {
    if (!deal) return
    
    try {
      setFormLoading(true)
      await updateDeal(deal.id, data)
      setToast({ message: 'Negociação atualizada com sucesso!', type: 'success', visible: true })
      setIsEditModalOpen(false)
    } catch (error: any) {
      console.error('[DealDetailPage] Erro ao atualizar negociação:', error)
      const errorMessage = error?.message || 'Erro ao atualizar negociação'
      setToast({ message: errorMessage, type: 'error', visible: true })
    } finally {
      setFormLoading(false)
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

  if (!deal) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-white/70 mb-4">Negociação não encontrada</p>
            <Button variant="primary-red" onClick={() => navigate('/deals')}>
              Voltar para Negociações
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  const isClosed = deal.status === 'won' || deal.status === 'lost'

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/deals')}
              className="text-white/70 hover:text-white"
            >
              ← Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{deal.title}</h1>
              <div className="flex items-center gap-4 text-white/70">
                {stage && (
                  <span className="px-3 py-1 rounded-full text-sm" style={{ 
                    backgroundColor: `${stage.color}20`, 
                    color: stage.color,
                    border: `1px solid ${stage.color}40`
                  }}>
                    {stage.name}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm ${
                  deal.status === 'won' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                  deal.status === 'lost' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  deal.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                }`}>
                  {deal.status === 'won' ? 'Ganho' :
                   deal.status === 'lost' ? 'Perda' :
                   deal.status === 'paused' ? 'Pausada' :
                   'Em Andamento'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isClosed && (
              <>
                <Button
                  variant="primary-blue"
                  onClick={() => {
                    setCloseStatus('won')
                    setIsCloseModalOpen(true)
                  }}
                  className="flex items-center gap-2"
                >
                  <span>↑</span>
                  Ganho
                </Button>
                <Button
                  variant="primary-red"
                  onClick={() => {
                    setCloseStatus('lost')
                    setIsCloseModalOpen(true)
                  }}
                  className="flex items-center gap-2"
                >
                  <span>↓</span>
                  Perda
                </Button>
              </>
            )}
            {isClosed && (
              <Button
                variant="ghost"
                onClick={handleReopenDeal}
              >
                Reabrir Negociação
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setIsEditModalOpen(true)}
            >
              Editar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">Informações Gerais</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/70">Valor</label>
                  <p className="text-2xl font-bold text-primary-red">
                    {formatCurrency(deal.value, deal.currency)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-white/70">Probabilidade</label>
                  <p className="text-lg text-white">{deal.probability}%</p>
                </div>

                {deal.expectedCloseDate && (
                  <div>
                    <label className="text-sm text-white/70">Data de Fechamento Esperada</label>
                    <p className="text-white">
                      {format(deal.expectedCloseDate.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}

                {deal.closedAt && (
                  <div>
                    <label className="text-sm text-white/70">Data de Fechamento</label>
                    <p className="text-white">
                      {format(deal.closedAt.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}

                {deal.paymentType && (
                  <div>
                    <label className="text-sm text-white/70">Forma de Pagamento</label>
                    <p className="text-white">
                      {deal.paymentType === 'cash' ? 'À Vista' : 'À Prazo'}
                      {deal.paymentMethod && ` - ${
                        deal.paymentMethod === 'pix' ? 'PIX' :
                        deal.paymentMethod === 'boleto' ? 'Boleto' :
                        deal.paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
                        deal.paymentMethod === 'debit_card' ? 'Cartão de Débito' :
                        deal.paymentMethod === 'bank_transfer' ? 'Transferência Bancária' :
                        deal.paymentMethod === 'exchange' ? 'Permuta' :
                        'Outro'
                      }`}
                    </p>
                  </div>
                )}

                {deal.contractUrl && (
                  <div>
                    <label className="text-sm text-white/70">Contrato</label>
                    <p className="text-white">
                      <a
                        href={deal.contractUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-blue hover:underline"
                      >
                        Ver Contrato
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Contato e Empresa */}
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">Contato e Empresa</h2>
              <div className="space-y-4">
                {contact && (
                  <div>
                    <label className="text-sm text-white/70">Contato</label>
                    <p className="text-white">{contact.name}</p>
                    {contact.email && (
                      <p className="text-white/70 text-sm">{contact.email}</p>
                    )}
                    {contact.phone && (
                      <p className="text-white/70 text-sm">{contact.phone}</p>
                    )}
                  </div>
                )}
                
                {company && (
                  <div>
                    <label className="text-sm text-white/70">Empresa</label>
                    <p className="text-white">{company.name}</p>
                    {company.email && (
                      <p className="text-white/70 text-sm">{company.email}</p>
                    )}
                    {company.phone && (
                      <p className="text-white/70 text-sm">{company.phone}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Serviços */}
            {dealServices.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Serviços</h2>
                <div className="space-y-2">
                  {dealServices.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white">{service.name}</span>
                      <span className="text-primary-red font-semibold">
                        {formatCurrency(service.price, service.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Tarefas */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Tarefas</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTasksModalOpen(true)}
                >
                  Gerenciar Tarefas
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">Informações do Sistema</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-white/70">Criado em</label>
                  <p className="text-white">
                    {format(deal.createdAt.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <label className="text-white/70">Atualizado em</label>
                  <p className="text-white">
                    {format(deal.updatedAt.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DealCloseModal
        isOpen={isCloseModalOpen}
        deal={deal}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseDeal}
        loading={formLoading}
        initialStatus={closeStatus}
      />

      {deal && (
        <DealTasksModal
          isOpen={isTasksModalOpen}
          dealId={deal.id}
          dealTitle={deal.title}
          onClose={() => setIsTasksModalOpen(false)}
        />
      )}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Negociação"
        size="lg"
      >
        <DealForm
          deal={deal}
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

export default DealDetailPage

