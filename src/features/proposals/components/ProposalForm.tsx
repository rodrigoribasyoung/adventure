import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Proposal, ProposalService } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useDeals } from '@/features/deals/hooks/useDeals'
import { useServices } from '@/features/services/hooks/useServices'
import { useState } from 'react'
import { Timestamp } from '@/lib/firebase/db'

const proposalSchema = z.object({
  dealId: z.string().min(1, 'Negociação é obrigatória'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  value: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']),
  expiresAt: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  services: z.array(z.object({
    serviceId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })).optional(),
})

type ProposalFormData = z.infer<typeof proposalSchema>

interface ProposalFormProps {
  proposal?: Proposal
  onSubmit: (data: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId' | 'sentAt'>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const ProposalForm = ({ proposal, onSubmit, onCancel, loading = false }: ProposalFormProps) => {
  const { deals } = useDeals()
  const { services } = useServices()
  const [selectedServices, setSelectedServices] = useState<ProposalService[]>(
    proposal?.services || []
  )

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: proposal
      ? {
          dealId: proposal.dealId,
          title: proposal.title,
          description: proposal.description,
          value: proposal.value,
          status: proposal.status,
          expiresAt: proposal.expiresAt ? proposal.expiresAt.toDate().toISOString().split('T')[0] : '',
          terms: proposal.terms || '',
          notes: proposal.notes || '',
        }
      : {
          status: 'draft',
        },
  })


  const handleAddService = () => {
    if (services.length === 0) return
    const firstService = services[0]
    setSelectedServices([
      ...selectedServices,
      {
        serviceId: firstService.id,
        quantity: 1,
        unitPrice: firstService.price,
      },
    ])
    updateTotalValue()
  }

  const handleRemoveService = (index: number) => {
    const newServices = selectedServices.filter((_, i) => i !== index)
    setSelectedServices(newServices)
    updateTotalValue()
  }

  const handleServiceChange = (index: number, field: keyof ProposalService, value: any) => {
    const newServices = [...selectedServices]
    newServices[index] = { ...newServices[index], [field]: value }
    setSelectedServices(newServices)
    updateTotalValue()
  }

  const updateTotalValue = () => {
    const total = selectedServices.reduce((sum, service) => {
      const serviceData = services.find(s => s.id === service.serviceId)
      const price = serviceData?.price || service.unitPrice
      return sum + (price * service.quantity)
    }, 0)
    setValue('value', total)
  }

  const handleFormSubmit = async (data: ProposalFormData) => {
    await onSubmit({
      dealId: data.dealId,
      title: data.title,
      description: data.description,
      value: data.value,
      currency: 'BRL' as const,
      status: data.status,
      services: selectedServices.length > 0 ? selectedServices : [],
      expiresAt: data.expiresAt ? Timestamp.fromDate(new Date(data.expiresAt)) : undefined,
      terms: data.terms || undefined,
      notes: data.notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Negociação *
        </label>
        <select
          {...register('dealId')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
        >
          <option value="">Selecione uma negociação</option>
          {deals.map(deal => (
            <option key={deal.id} value={deal.id}>
              {deal.title}
            </option>
          ))}
        </select>
        {errors.dealId && (
          <p className="mt-1 text-sm text-red-400">{errors.dealId.message}</p>
        )}
      </div>

      <Input
        label="Título *"
        {...register('title')}
        error={errors.title?.message}
        placeholder="Título da proposta"
      />

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Descrição *
        </label>
        <textarea
          {...register('description')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
          placeholder="Descrição da proposta"
          rows={4}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Serviços
        </label>
        <div className="space-y-2">
                  {selectedServices.map((service, index) => {
                    return (
              <div key={index} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                <select
                  value={service.serviceId}
                  onChange={(e) => {
                    const selectedService = services.find(s => s.id === e.target.value)
                    handleServiceChange(index, 'serviceId', e.target.value)
                    if (selectedService) {
                      handleServiceChange(index, 'unitPrice', selectedService.price)
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  min="1"
                  value={service.quantity}
                  onChange={(e) => handleServiceChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-white/70 text-sm">x</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={service.unitPrice}
                  onChange={(e) => handleServiceChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveService(index)}
                >
                  Remover
                </Button>
              </div>
            )
          })}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddService}
            disabled={services.length === 0}
          >
            + Adicionar Serviço
          </Button>
        </div>
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

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Status *
        </label>
        <select
          {...register('status')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
        >
          <option value="draft">Rascunho</option>
          <option value="sent">Enviada</option>
          <option value="accepted">Aceita</option>
          <option value="rejected">Rejeitada</option>
          <option value="expired">Expirada</option>
        </select>
      </div>

      <Input
        label="Data de Expiração"
        type="date"
        {...register('expiresAt')}
        error={errors.expiresAt?.message}
      />

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Termos e Condições
        </label>
        <textarea
          {...register('terms')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
          placeholder="Termos e condições da proposta"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Observações
        </label>
        <textarea
          {...register('notes')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
          placeholder="Observações internas"
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : proposal ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

