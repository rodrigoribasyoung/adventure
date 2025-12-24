import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Funnel, FunnelStage } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const stageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome do estágio é obrigatório'),
  order: z.number().min(0),
  color: z.string().min(1, 'Cor é obrigatória'),
  isWonStage: z.boolean().optional(),
  isLostStage: z.boolean().optional(),
})

const funnelSchema = z.object({
  name: z.string().min(1, 'Nome do funil é obrigatório'),
  description: z.string().optional(),
  active: z.boolean(),
  type: z.enum(['martech', 'custom']).optional(),
  stages: z.array(stageSchema).min(1, 'Adicione pelo menos um estágio'),
})

type FunnelFormData = z.infer<typeof funnelSchema>

interface FunnelFormProps {
  funnel?: Funnel
  onSubmit: (data: FunnelFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const COLORS = [
  { value: '#4285F4', label: 'Azul (Google)' },
  { value: '#34A853', label: 'Verde (Google)' },
  { value: '#FBBC04', label: 'Amarelo (Google)' },
  { value: '#EA4335', label: 'Vermelho (Google)' },
  { value: '#FF9800', label: 'Laranja' },
  { value: '#9C27B0', label: 'Roxo' },
  { value: '#10B981', label: 'Verde Sucesso' },
  { value: '#EF4444', label: 'Vermelho Erro' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#8B5CF6', label: 'Roxo Claro' },
]

export const FunnelForm = ({ funnel, onSubmit, onCancel, loading = false }: FunnelFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FunnelFormData>({
    resolver: zodResolver(funnelSchema),
    defaultValues: funnel
      ? {
          name: funnel.name,
          description: funnel.description || '',
          active: funnel.active,
          type: funnel.type || 'custom',
          stages: funnel.stages || [],
        }
      : {
          active: true,
          type: 'custom',
          stages: [
            {
              id: 'novo',
              name: 'Novo',
              order: 1,
              color: '#4285F4',
              isWonStage: false,
              isLostStage: false,
            },
          ],
        },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'stages',
  })


  const addStage = () => {
    const maxOrder = fields.length > 0 ? Math.max(...fields.map(f => f.order || 0)) : 0
    append({
      id: `stage-${Date.now()}`,
      name: '',
      order: maxOrder + 1,
      color: '#4285F4',
      isWonStage: false,
      isLostStage: false,
    })
  }

  const moveStageUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1)
      // Atualizar ordem após mover
      setTimeout(() => {
        const stages = watch('stages')
        stages.forEach((stage, i) => {
          setValue(`stages.${i}.order`, i + 1)
        })
      }, 0)
    }
  }

  const moveStageDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1)
      // Atualizar ordem após mover
      setTimeout(() => {
        const stages = watch('stages')
        stages.forEach((stage, i) => {
          setValue(`stages.${i}.order`, i + 1)
        })
      }, 0)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Nome do Funil *"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Ex: Funil de Vendas Martech"
      />

      <Input
        label="Descrição"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Descrição do funil"
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="active"
          {...register('active')}
          className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
        />
        <label htmlFor="active" className="text-sm font-medium text-white/90">
          Funil Ativo
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-white/90">
            Estágios *
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={addStage}>
            + Adicionar Estágio
          </Button>
        </div>

        {errors.stages && (
          <p className="mb-2 text-sm text-red-400">{errors.stages.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white/90">
                  Estágio {index + 1}
                </h4>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStageUp(index)}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStageDown(index)}
                    disabled={index === fields.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    Remover
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    label="Nome do Estágio *"
                    {...register(`stages.${index}.name`)}
                    error={errors.stages?.[index]?.name?.message}
                    placeholder="Ex: Qualificação"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Cor *
                  </label>
                  <select
                    {...register(`stages.${index}.color`)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
                  >
                    {COLORS.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <input
                type="hidden"
                {...register(`stages.${index}.id`)}
              />
              <input
                type="hidden"
                {...register(`stages.${index}.order`, { valueAsNumber: true, value: index + 1 })}
              />

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`stages.${index}.isWonStage`)}
                    className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
                  />
                  <span className="text-sm text-white/90">Estágio de Ganho</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`stages.${index}.isLostStage`)}
                    className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
                  />
                  <span className="text-sm text-white/90">Estágio de Perda</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : funnel ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

