import { useEffect, useState } from 'react'
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
import { useProjectMembers } from '@/features/projectMembers/hooks/useProjectMembers'
import { RenderCustomFields } from '@/components/customFields/RenderCustomFields'
import { ContactForm } from '@/features/contacts/components/ContactForm'
import { CompanyForm } from '@/features/companies/components/CompanyForm'
import { QuickCreateButton } from '@/components/forms/QuickCreateButton'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { shortenUrl } from '@/lib/utils/shortenUrl'
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore'

const dealSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  stage: z.string().min(1, 'Estágio é obrigatório'),
  value: z.number().min(0, 'Valor deve ser maior ou igual a zero').optional(),
  probability: z.number().min(0).max(100, 'Probabilidade deve estar entre 0 e 100').optional(),
  expectedCloseDate: z.string().optional(),
  serviceIds: z.array(z.string()).optional(),
  assignedTo: z.string().optional(),
  paymentType: z.enum(['cash', 'installment']).optional(),
  paymentMethod: z.enum(['pix', 'boleto', 'credit_card', 'debit_card', 'bank_transfer', 'exchange', 'other']).optional(),
  contractUrl: z.union([
    z.string().url('URL inválida'),
    z.literal('')
  ]).optional(),
  customFields: z.record(z.any()).optional(),
})

type DealFormData = z.infer<typeof dealSchema>

interface DealFormProps {
  deal?: Deal
  onSubmit: (data: DealFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const DealForm = ({ deal, onSubmit, onCancel, loading = false }: DealFormProps) => {
  const { contacts, createContact } = useContacts()
  const { companies, createCompany } = useCompanies()
  const { services } = useServices()
  const { activeFunnel } = useFunnels()
  const { customFields } = useCustomFields('deal')
  const { members } = useProjectMembers()
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [quickCreateLoading, setQuickCreateLoading] = useState(false)

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: deal
      ? {
          title: deal.title,
          contactId: deal.contactId,
          companyId: deal.companyId || '',
          stage: deal.stage,
          value: deal.value,
          probability: deal.probability,
          expectedCloseDate: deal.expectedCloseDate
            ? new Date(deal.expectedCloseDate.toMillis()).toISOString().split('T')[0]
            : '',
          serviceIds: deal.serviceIds || [],
          assignedTo: deal.assignedTo || '',
          customFields: deal.customFields || {},
        }
      : {
          serviceIds: [],
          probability: 50,
          value: 0,
          contactId: '',
          stage: activeFunnel?.stages[0]?.id || '',
          customFields: {},
        },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = form

  useEffect(() => {
    form.reset(deal
      ? {
          title: deal.title,
          contactId: deal.contactId,
          companyId: deal.companyId || '',
          stage: deal.stage,
          value: deal.value,
          probability: deal.probability,
          expectedCloseDate: deal.expectedCloseDate
            ? new Date(deal.expectedCloseDate.toMillis()).toISOString().split('T')[0]
            : '',
          serviceIds: deal.serviceIds || [],
          assignedTo: deal.assignedTo || '',
          customFields: deal.customFields || {},
        }
      : {
          serviceIds: [],
          probability: 50,
          value: 0,
          contactId: '',
          stage: activeFunnel?.stages[0]?.id || '',
          customFields: {},
        })
  }, [deal, activeFunnel, form])

  const selectedServiceIds = watch('serviceIds') || []
  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id))
  const totalValue = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const paymentType = watch('paymentType')

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
      const companyId = await createCompany(companyData)
      setValue('companyId', companyId)
      setIsCompanyModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar empresa:', error)
      throw error
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

  const handleSubmitForm = async (data: DealFormData) => {
    try {
      if (!activeFunnel) {
        throw new Error('É necessário ter um funil ativo para criar negociações. Por favor, crie um funil primeiro.')
      }
      
      if (!data.stage || data.stage.trim() === '') {
        throw new Error('Selecione um estágio para a negociação.')
      }
      
      console.log('[DealForm] Dados do formulário:', data)
      
      const submitData: any = {
        title: data.title,
        stage: data.stage,
        contactId: data.contactId && typeof data.contactId === 'string' && data.contactId.trim() !== '' ? data.contactId : undefined,
        value: data.value || 0,
        probability: data.probability || 50,
        serviceIds: data.serviceIds || [],
        companyId: data.companyId && typeof data.companyId === 'string' && data.companyId.trim() !== '' ? data.companyId : undefined,
        assignedTo: data.assignedTo && typeof data.assignedTo === 'string' && data.assignedTo.trim() !== '' ? data.assignedTo : undefined,
        paymentType: data.paymentType || undefined,
        paymentMethod: data.paymentMethod || undefined,
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
      
      console.log('[DealForm] Dados preparados para envio:', submitData)
      await onSubmit(submitData)
    } catch (error) {
      console.error('[DealForm] Erro ao preparar dados:', error)
      throw error
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
      <Input
        label="Título *"
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
        <label className="block text-sm font-medium text-white/90 mb-2">
          Empresa
        </label>
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
          </select>
          {errors.stage && (
            <p className="mt-1 text-sm text-red-400">{errors.stage.message}</p>
          )}
        </div>
      )}

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

      <Input
        label="Data de Fechamento Esperada"
        type="date"
        {...register('expectedCloseDate')}
        error={errors.expectedCloseDate?.message}
      />

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Responsável
        </label>
        <select
          {...register('assignedTo')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
        >
          <option value="">Nenhum responsável</option>
          {members.filter(m => m.active).map(member => (
            <option key={member.id} value={member.id}>
              {member.name} {member.role ? `- ${member.role}` : ''}
            </option>
          ))}
        </select>
        {errors.assignedTo && (
          <p className="mt-1 text-sm text-red-400">{errors.assignedTo.message}</p>
        )}
      </div>

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
        {errors.paymentType && (
          <p className="mt-1 text-sm text-red-400">{errors.paymentType.message}</p>
        )}
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
          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-400">{errors.paymentMethod.message}</p>
          )}
        </div>
      )}

      <Input
        label="Link do Contrato (Drive ou outro)"
        type="url"
        {...register('contractUrl')}
        error={errors.contractUrl?.message}
        placeholder="https://drive.google.com/..."
      />

      <RenderCustomFields
        customFields={customFields}
        control={control}
        entityCustomFields={deal?.customFields}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : deal ? 'Atualizar' : 'Criar'}
        </Button>
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
        onClose={() => setIsCompanyModalOpen(false)}
        title="Nova Empresa"
        size="md"
      >
        <CompanyForm
          onSubmit={handleQuickCreateCompany}
          onCancel={() => setIsCompanyModalOpen(false)}
          loading={quickCreateLoading}
        />
      </Modal>
    </form>
  )
}

