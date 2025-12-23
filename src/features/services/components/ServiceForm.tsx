import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Service } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  active: z.boolean(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  service?: Service
  onSubmit: (data: ServiceFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const ServiceForm = ({ service, onSubmit, onCancel, loading = false }: ServiceFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          name: service.name,
          description: service.description || '',
          price: service.price,
          active: service.active,
        }
      : {
          active: true,
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome *"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Nome do serviço"
      />

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Descrição
        </label>
        <textarea
          {...register('description')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
          placeholder="Descrição do serviço"
          rows={3}
        />
      </div>

      <Input
        label="Preço (R$) *"
        type="number"
        step="0.01"
        min="0"
        {...register('price', { valueAsNumber: true })}
        error={errors.price?.message}
        placeholder="0.00"
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="active"
          {...register('active')}
          className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
        />
        <label htmlFor="active" className="text-white/90">
          Serviço ativo
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : service ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

