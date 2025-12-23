import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Deal } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { useServices } from '@/features/services/hooks/useServices'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { shortenUrl } from '@/lib/utils/shortenUrl'
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore'

const dealSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  contactId: z.string().min(1, 'Contato é obrigatório'),
  companyId: z.string().optional(),
  stage: z.string().min(1, 'Estágio é obrigatório'),
  value: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  probability: z.number().min(0).max(100, 'Probabilidade deve estar entre 0 e 100'),
  expectedCloseDate: z.string().optional(),
  serviceIds: z.array(z.string()),
  assignedTo: z.string().optional(),
  paymentType: z.enum(['cash', 'installment']).optional(),
  paymentMethod: z.enum(['pix', 'boleto', 'credit_card', 'debit_card', 'bank_transfer', 'exchange', 'other']).optional(),
  contractUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})

type DealFormData = z.infer<typeof dealSchema>

interface DealFormProps {
  deal?: Deal
  onSubmit: (data: DealFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const DealForm = ({ deal, onSubmit, onCancel, loading = false }: DealFormProps) => {
  const { contacts } = useContacts()
  const { companies } = useCompanies()
  const { services } = useServices()
  const { activeFunnel } = useFunnels()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DealFormData>({
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
        }
      : {
          serviceIds: [],
          probability: 50,
          stage: activeFunnel?.stages[0]?.id || '',
        },
  })

  const selectedServiceIds = watch('serviceIds')
  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id))
  const totalValue = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const paymentType = watch('paymentType')

  // Atualizar valor quando serviços mudarem (apenas se não houver valor manual)
  useEffect(() => {
    if (selectedServices.length > 0) {
      const currentValue = watch('value')
      if (currentValue === 0 || Math.abs(currentValue - totalValue) < 0.01) {
        setValue('value', totalValue, { shouldDirty: false })
      }
    }
  }, [selectedServiceIds, totalValue, setValue, watch])

  const handleServiceToggle = (serviceId: string) => {
    const current = watch('serviceIds')
    if (current.includes(serviceId)) {
      setValue('serviceIds', current.filter(id => id !== serviceId))
    } else {
      setValue('serviceIds', [...current, serviceId])
    }
  }

  const handleSubmitForm = async (data: DealFormData) => {
    const submitData: any = {
      ...data,
      companyId: data.companyId || undefined,
      assignedTo: data.assignedTo || undefined,
      paymentType: data.paymentType || undefined,
      paymentMethod: data.paymentMethod || undefined,
    }
    
    if (data.expectedCloseDate) {
      submitData.expectedCloseDate = FirestoreTimestamp.fromDate(new Date(data.expectedCloseDate))
    }
    
    // Encurtar URL do contrato se existir
    if (data.contractUrl) {
      try {
        submitData.contractUrl = await shortenUrl(data.contractUrl)
      } catch (error) {
        console.warn('Erro ao encurtar URL, usando URL original:', error)
        submitData.contractUrl = data.contractUrl
      }
    } else {
      submitData.contractUrl = undefined
    }
    
    await onSubmit(submitData)
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
        <label className="block text-sm font-medium text-white/90 mb-2">
          Contato *
        </label>
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

      {activeFunnel && (
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Estágio *
          </label>
          <select
            {...register('stage')}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
          >
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
                checked={selectedServiceIds.includes(service.id)}
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
        label="Valor Total (R$) *"
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

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : deal ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

