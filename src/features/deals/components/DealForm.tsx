import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Deal } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { useServices } from '@/features/services/hooks/useServices'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'
import { useCustomFields } from '@/features/customFields/hooks/useCustomFields'
import { useProjectUsers } from '@/features/projectMembers/hooks/useProjectUsers'
import { useAutoAssignResponsible } from '@/hooks/useAutoAssignResponsible'
import { RenderCustomFields } from '@/components/customFields/RenderCustomFields'
import { ContactForm } from '@/features/contacts/components/ContactForm'
import { CompanyForm } from '@/features/companies/components/CompanyForm'
import { QuickCreateButton } from '@/components/forms/QuickCreateButton'
import { Steps } from '@/components/forms/Steps'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { shortenUrl } from '@/lib/utils/shortenUrl'
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore'

// Schema base - validação dinâmica será feita manualmente no submit
const dealSchema = z.object({
  title: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  stage: z.string().min(1, 'Estágio é obrigatório'),
  value: z.number().min(0, 'Valor deve ser maior ou igual a zero').optional(),
  probability: z.number().min(0).max(100, 'Probabilidade deve estar entre 0 e 100').optional(),
  expectedCloseDate: z.string().optional(),
  serviceIds: z.array(z.string()).optional(),
  assignedTo: z.string().min(1, 'Responsável é obrigatório'),
  paymentType: z.enum(['cash', 'installment']).optional(),
  paymentMethod: z.enum(['pix', 'boleto', 'credit_card', 'debit_card', 'bank_transfer', 'exchange', 'other']).optional(),
  contractUrl: z.union([
    z.string().url('URL inválida'),
    z.literal('')
  ]).optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
})

type DealFormData = z.infer<typeof dealSchema>

interface DealFormProps {
  deal?: Deal
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const FORM_STEPS = [
  { id: 'basic', title: 'Informações Básicas', description: 'Título, contato e estágio' },
  { id: 'products', title: 'Produtos e Valores', description: 'Serviços e valores' },
  { id: 'details', title: 'Detalhes Avançados', description: 'Pagamento e responsável' },
  { id: 'additional', title: 'Informações Adicionais', description: 'Contrato e anotações' },
]

export const DealForm = ({ deal, onSubmit, onCancel, loading = false }: DealFormProps) => {
  const navigate = useNavigate()
  const { contacts, createContact } = useContacts()
  const { companies, createCompany } = useCompanies()
  const { services } = useServices()
  const { activeFunnel } = useFunnels()
  const { customFields } = useCustomFields('deal')
  const { responsibles, loading: membersLoading } = useProjectUsers()
  
  // Filtrar apenas responsáveis ativos
  const activeMembers = responsibles.filter(m => m.active)
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [quickCreateLoading, setQuickCreateLoading] = useState(false)
  const [quickCreateError, setQuickCreateError] = useState<string | null>(null)

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: deal
      ? {
          title: deal.title,
          contactId: deal.contactId || '',
          companyId: deal.companyId || '',
          stage: deal.stage,
          value: deal.value,
          probability: deal.probability,
          expectedCloseDate: deal.expectedCloseDate
            ? new Date(deal.expectedCloseDate.toMillis()).toISOString().split('T')[0]
            : '',
          serviceIds: deal.serviceIds || [],
          assignedTo: deal.assignedTo || (activeMembers[0]?.id || ''),
          notes: deal.notes || '',
          customFields: deal.customFields || {},
        }
      : {
          serviceIds: [],
          probability: 50,
          value: 0,
          contactId: '',
          stage: activeFunnel?.stages[0]?.id || '',
          assignedTo: '',
          notes: '',
          customFields: {},
        },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = form

  // Detectar responsável automaticamente baseado em empresa/projeto
  const watchedCompanyId = watch('companyId')
  const autoAssignedResponsible = useAutoAssignResponsible(watchedCompanyId)

  useEffect(() => {
    if (membersLoading) return // Aguardar carregamento dos membros
    
    // Calcular assignedTo com base no autoAssignedResponsible ou primeiro membro ativo
    const defaultAssignedTo = deal?.assignedTo || autoAssignedResponsible?.id || activeMembers[0]?.id || ''
    
    form.reset(deal
      ? {
          title: deal.title,
          contactId: deal.contactId || '',
          companyId: deal.companyId || '',
          stage: deal.stage,
          value: deal.value,
          probability: deal.probability,
          expectedCloseDate: deal.expectedCloseDate
            ? new Date(deal.expectedCloseDate.toMillis()).toISOString().split('T')[0]
            : '',
          serviceIds: deal.serviceIds || [],
          assignedTo: defaultAssignedTo,
          notes: deal.notes || '',
          customFields: deal.customFields || {},
        }
      : {
          serviceIds: [],
          probability: 50,
          value: 0,
          contactId: '',
          stage: activeFunnel?.stages[0]?.id || '',
          assignedTo: defaultAssignedTo,
          notes: '',
          customFields: {},
        })
  }, [deal, activeFunnel, form, activeMembers, membersLoading, autoAssignedResponsible])
  
  // Atualizar assignedTo quando companyId mudar
  useEffect(() => {
    if (!deal && watchedCompanyId && autoAssignedResponsible) {
      setValue('assignedTo', autoAssignedResponsible.id)
    }
  }, [watchedCompanyId, autoAssignedResponsible, deal, setValue])

  const selectedServiceIds = watch('serviceIds') || []
  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id))
  const totalValue = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const paymentType = watch('paymentType')
  const watchedStage = watch('stage')

  // Atualizar campos obrigatórios quando o estágio muda
  useEffect(() => {
    if (watchedStage && activeFunnel) {
      // A validação será refeita no próximo submit
    }
  }, [watchedStage, activeFunnel])

  const handleQuickCreateContact = async (contactData: any) => {
    try {
      setQuickCreateLoading(true)
      const contactId = await createContact(contactData)
      setValue('contactId', contactId)
      setIsContactModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar contato:', error)
      throw error
    } finally {
      setQuickCreateLoading(false)
    }
  }

  const handleQuickCreateCompany = async (companyData: any) => {
    try {
      setQuickCreateLoading(true)
      setQuickCreateError(null)
      // Garantir que os dados estão no formato correto
      const formattedData = {
        name: companyData.name || '',
        cnpj: companyData.cnpj || undefined,
        email: companyData.email || undefined,
        phone: companyData.phone || undefined,
        address: companyData.address || undefined,
        customFields: companyData.customFields || undefined,
      }
      const companyId = await createCompany(formattedData)
      if (companyId) {
        setValue('companyId', companyId)
        setIsCompanyModalOpen(false)
        setQuickCreateError(null)
      } else {
        throw new Error('Não foi possível criar a empresa. ID não retornado.')
      }
    } catch (error: any) {
      console.error('[DealForm] Erro ao criar empresa:', error)
      const errorMessage = error?.message || 'Erro ao criar empresa. Verifique os dados e tente novamente.'
      setQuickCreateError(errorMessage)
      // Não fechar o modal em caso de erro para que o usuário possa corrigir
    } finally {
      setQuickCreateLoading(false)
    }
  }

  // Atualizar valor quando serviços mudarem (apenas se não houver valor manual)
  useEffect(() => {
    if (selectedServices.length > 0) {
      const currentValue = watch('value') || 0
      if (currentValue === 0 || Math.abs(currentValue - totalValue) < 0.01) {
        setValue('value', totalValue, { shouldDirty: false })
      }
    }
  }, [selectedServiceIds, totalValue, setValue, watch, selectedServices.length])

  const handleServiceToggle = (serviceId: string) => {
    const current = watch('serviceIds') || []
    if (current.includes(serviceId)) {
      setValue('serviceIds', current.filter(id => id !== serviceId))
    } else {
      setValue('serviceIds', [...current, serviceId])
    }
  }

  const handleNextStep = async () => {
    // Validar campos da etapa atual antes de avançar
    const stepFields: Record<number, (keyof DealFormData)[]> = {
      0: ['title', 'stage', 'contactId'], // Informações Básicas
      1: ['serviceIds', 'value'], // Produtos e Valores
      2: ['assignedTo', 'expectedCloseDate', 'paymentType'], // Detalhes Avançados
      3: [], // Informações Adicionais (sem validação obrigatória)
    }

    const fieldsToValidate = stepFields[currentStep] || []
    const isValid = await trigger(fieldsToValidate as any)
    
    if (isValid && currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitForm = async (data: DealFormData) => {
    try {
      if (!activeFunnel) {
        throw new Error('É necessário ter um funil ativo para criar negociações. Por favor, crie um funil primeiro.')
      }
      
      // Validar se há responsáveis ativos no projeto
      if (activeMembers.length === 0) {
        throw new Error('É necessário ter pelo menos um responsável ativo no projeto para criar negociações. Por favor, cadastre um responsável primeiro.')
      }
      
      if (!data.stage || data.stage.trim() === '') {
        throw new Error('Selecione um estágio para a negociação.')
      }
      
      // Validar se responsável foi selecionado
      if (!data.assignedTo || data.assignedTo.trim() === '') {
        throw new Error('É obrigatório selecionar um responsável para a negociação.')
      }
      
      // Validar se o responsável selecionado existe e está ativo
      const selectedMember = activeMembers.find(m => m.id === data.assignedTo)
      if (!selectedMember) {
        throw new Error('O responsável selecionado não é válido ou está inativo.')
      }

      // Validar campos obrigatórios da etapa selecionada
      const selectedStage = activeFunnel.stages.find(s => s.id === data.stage)
      // Se o stage não existe no funil ativo, permitir edição mesmo assim (pode ser deal perdido/ganho)
      // Não validar campos obrigatórios se o stage não existir (deal pode estar fechado)
      if (!selectedStage) {
        console.warn('Stage não encontrado no funil ativo, pulando validação de campos obrigatórios')
      }
      
      const requiredFields = selectedStage?.requiredFields || []
      const validationErrors: string[] = []
      
      // Só validar campos obrigatórios se o stage existir
      if (selectedStage) {
        if (requiredFields.includes('title') && (!data.title || data.title.trim() === '')) {
          validationErrors.push('Título é obrigatório para esta etapa')
        }
        
        if (requiredFields.includes('contactId') && (!data.contactId || data.contactId.trim() === '')) {
          validationErrors.push('Contato é obrigatório para esta etapa')
        }
        
        if (requiredFields.includes('value') && (!data.value || data.value <= 0)) {
          validationErrors.push('Valor é obrigatório e deve ser maior que zero para esta etapa')
        }
      }
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '))
      }
      
      const submitData: any = {
        title: data.title || '',
        stage: data.stage,
        contactId: data.contactId && typeof data.contactId === 'string' && data.contactId.trim() !== '' ? data.contactId : undefined,
        value: data.value || 0,
        probability: data.probability || 50,
        serviceIds: data.serviceIds || [],
        companyId: data.companyId && typeof data.companyId === 'string' && data.companyId.trim() !== '' ? data.companyId : undefined,
        assignedTo: data.assignedTo && typeof data.assignedTo === 'string' && data.assignedTo.trim() !== '' ? data.assignedTo : undefined,
        paymentType: data.paymentType || undefined,
        paymentMethod: data.paymentMethod || undefined,
        notes: data.notes && data.notes.trim() !== '' ? data.notes.trim() : undefined,
        customFields: data.customFields && Object.keys(data.customFields).length > 0 ? data.customFields : undefined,
      }
      
      if (data.expectedCloseDate && data.expectedCloseDate.trim() !== '') {
        submitData.expectedCloseDate = FirestoreTimestamp.fromDate(new Date(data.expectedCloseDate))
      }
      
      // Encurtar URL do contrato se existir
      if (data.contractUrl && data.contractUrl.trim() !== '') {
        try {
          submitData.contractUrl = await shortenUrl(data.contractUrl)
        } catch (error) {
          console.warn('Erro ao encurtar URL, usando URL original:', error)
          submitData.contractUrl = data.contractUrl
        }
      }
      
      await onSubmit(submitData)
    } catch (error) {
      console.error('[DealForm] Erro ao preparar dados:', error)
      throw error
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Informações Básicas
        return (
          <div className="space-y-4">
            <Input
              label="Título"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Nome da negociação"
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/90">
                  Contato
                </label>
                <QuickCreateButton onClick={() => setIsContactModalOpen(true)} />
              </div>
              <select
                {...register('contactId')}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
              >
                <option value="">Selecione um contato</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
              {errors.contactId && (
                <p className="mt-1 text-sm text-red-400">{errors.contactId.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/90">
                  Empresa
                </label>
                <QuickCreateButton onClick={() => setIsCompanyModalOpen(true)} />
              </div>
              <select
                {...register('companyId')}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
              >
                <option value="">Nenhuma empresa</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {!activeFunnel ? (
              <div className="p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                <p className="text-purple-400 text-sm font-medium mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Nenhum funil ativo encontrado
                </p>
                <p className="text-purple-300/80 text-sm">
                  É necessário criar e ativar um funil antes de criar negociações. 
                  <a href="/settings/funnels" className="underline ml-1">Criar funil agora</a>
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Estágio *
                </label>
                <select
                  {...register('stage')}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
                >
                  <option value="">Selecione um estágio</option>
                  {activeFunnel.stages
                    .sort((a, b) => a.order - b.order)
                    .map(stage => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  {/* Mostrar stage atual se não estiver no funil ativo (deal perdido/ganho) */}
                  {deal && deal.stage && !activeFunnel.stages.find(s => s.id === deal.stage) && (
                    <option value={deal.stage} disabled>
                      {deal.stage} (Não disponível no funil atual)
                    </option>
                  )}
                </select>
                {errors.stage && (
                  <p className="mt-1 text-sm text-red-400">{errors.stage.message}</p>
                )}
                {deal && deal.stage && !activeFunnel.stages.find(s => s.id === deal.stage) && (
                  <p className="mt-1 text-sm text-yellow-400">
                    ⚠️ Este estágio não está mais disponível no funil ativo. A negociação pode estar fechada.
                  </p>
                )}
              </div>
            )}
          </div>
        )

      case 1: // Produtos e Valores
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Serviços
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto bg-white/5 border border-white/10 rounded-lg p-3">
                {services.filter(s => s.active).map(service => (
                  <label key={service.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(selectedServiceIds || []).includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
                    />
                    <span className="text-white/90">{service.name}</span>
                    <span className="ml-auto text-primary-red font-semibold">
                      {formatCurrency(service.price, service.currency)}
                    </span>
                  </label>
                ))}
              </div>
              {selectedServices.length > 0 && (
                <p className="mt-2 text-sm text-white/70">
                  Total dos serviços: <span className="font-bold text-primary-red">
                    {formatCurrency(totalValue, 'BRL')}
                  </span>
                </p>
              )}
            </div>

            <Input
              label="Valor Total (R$)"
              type="number"
              step="0.01"
              min="0"
              {...register('value', { valueAsNumber: true })}
              error={errors.value?.message}
              placeholder="0.00"
            />

            <Input
              label="Probabilidade (%)"
              type="number"
              min="0"
              max="100"
              {...register('probability', { valueAsNumber: true })}
              error={errors.probability?.message}
              placeholder="50"
            />
          </div>
        )

      case 2: // Detalhes Avançados
        return (
          <div className="space-y-4">
            {activeMembers.length === 0 ? (
              <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <p className="text-yellow-400 text-sm font-medium mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Nenhum responsável ativo encontrado
                </p>
                <p className="text-yellow-300/80 text-sm">
                  É necessário ter pelo menos um responsável ativo no projeto para criar negociações. 
                  <button
                    type="button"
                    onClick={() => navigate('/project-members')}
                    className="underline ml-1 hover:text-yellow-200 transition-colors"
                  >
                    Cadastrar responsável agora
                  </button>
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Responsável *
                </label>
                <select
                  {...register('assignedTo')}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
                  disabled={membersLoading}
                >
                  <option value="">Selecione um responsável</option>
                  {activeMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.jobTitle ? `- ${member.jobTitle}` : ''}
                    </option>
                  ))}
                </select>
                {errors.assignedTo && (
                  <p className="mt-1 text-sm text-red-400">{errors.assignedTo.message}</p>
                )}
              </div>
            )}

            <Input
              label="Data de Fechamento Esperada"
              type="date"
              {...register('expectedCloseDate')}
              error={errors.expectedCloseDate?.message}
            />

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Forma de Pagamento
              </label>
              <select
                {...register('paymentType')}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
              >
                <option value="">Selecione</option>
                <option value="cash">À Vista</option>
                <option value="installment">À Prazo</option>
              </select>
            </div>

            {paymentType && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Método de Pagamento
                </label>
                <select
                  {...register('paymentMethod')}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
                >
                  <option value="">Selecione</option>
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="bank_transfer">Transferência Bancária</option>
                  <option value="exchange">Permuta</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            )}
          </div>
        )

      case 3: // Informações Adicionais
        return (
          <div className="space-y-4">
            <Input
              label="Link do Contrato (Drive ou outro)"
              type="url"
              {...register('contractUrl')}
              error={errors.contractUrl?.message}
              placeholder="https://drive.google.com/..."
            />

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Anotações
              </label>
              <textarea
                {...register('notes')}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200 resize-none"
                placeholder="Adicione observações sobre esta negociação..."
                rows={4}
              />
            </div>

            <RenderCustomFields
              customFields={customFields}
              control={control}
              entityCustomFields={deal?.customFields}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
      <Steps
        steps={FORM_STEPS}
        currentStep={currentStep}
        onStepClick={(stepIndex) => {
          // Permitir voltar para etapas anteriores
          if (stepIndex < currentStep) {
            setCurrentStep(stepIndex)
          }
        }}
        className="mb-6"
      />

      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      <div className="flex justify-between gap-3 pt-4 border-t border-white/10">
        <div>
          {currentStep > 0 && (
            <Button type="button" variant="ghost" onClick={handlePrevStep} disabled={loading}>
              Voltar
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          {currentStep < FORM_STEPS.length - 1 ? (
            <Button type="button" variant="primary-red" onClick={handleNextStep} disabled={loading}>
              Próximo
            </Button>
          ) : (
            <Button type="submit" variant="primary-red" disabled={loading}>
              {loading ? 'Salvando...' : deal ? 'Atualizar' : 'Criar'}
            </Button>
          )}
        </div>
      </div>

      {/* Modal rápido de criação de contato */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Novo Contato"
        size="md"
      >
        <ContactForm
          onSubmit={handleQuickCreateContact}
          onCancel={() => setIsContactModalOpen(false)}
          loading={quickCreateLoading}
        />
      </Modal>

      {/* Modal rápido de criação de empresa */}
      <Modal
        isOpen={isCompanyModalOpen}
        onClose={() => {
          setIsCompanyModalOpen(false)
          setQuickCreateError(null)
        }}
        title="Nova Empresa"
        size="md"
      >
        <div className="space-y-4">
          {quickCreateError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{quickCreateError}</p>
            </div>
          )}
          <CompanyForm
            onSubmit={handleQuickCreateCompany}
            onCancel={() => {
              setIsCompanyModalOpen(false)
              setQuickCreateError(null)
            }}
            loading={quickCreateLoading}
          />
        </div>
      </Modal>
    </form>
  )
}
