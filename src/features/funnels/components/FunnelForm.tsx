import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Funnel } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getStageColor, updateStagesColors } from '@/utils/stageColors'

const stageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome do estágio é obrigatório'),
  order: z.number().min(0),
  color: z.string().min(1, 'Cor é obrigatória'),
  isWonStage: z.boolean().optional(),
  isLostStage: z.boolean().optional(),
  requiredFields: z.array(z.string()).optional(),
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
              color: getStageColor(1, 1),
              isWonStage: false,
              isLostStage: false,
              requiredFields: [],
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
    const totalStages = fields.length + 1
    const newOrder = maxOrder + 1
    append({
      id: `stage-${Date.now()}`,
      name: '',
      order: newOrder,
      color: getStageColor(newOrder, totalStages),
      isWonStage: false,
      isLostStage: false,
      requiredFields: [],
    })
  }

  const moveStageUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1)
      // Atualizar ordem e cores após mover
      setTimeout(() => {
        const stages = watch('stages')
        const totalStages = stages.length
        stages.forEach((_, i) => {
          const newOrder = i + 1
          setValue(`stages.${i}.order`, newOrder)
          setValue(`stages.${i}.color`, getStageColor(newOrder, totalStages))
        })
      }, 0)
    }
  }

  const moveStageDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1)
      // Atualizar ordem e cores após mover
      setTimeout(() => {
        const stages = watch('stages')
        const totalStages = stages.length
        stages.forEach((_, i) => {
          const newOrder = i + 1
          setValue(`stages.${i}.order`, newOrder)
          setValue(`stages.${i}.color`, getStageColor(newOrder, totalStages))
        })
      }, 0)
    }
  }

  const handleFormSubmit = async (data: FunnelFormData) => {
    // Garantir que as cores estão atualizadas baseado na ordem final
    const finalStages = updateStagesColors(data.stages)
    await onSubmit({ ...data, stages: finalStages })
  }

  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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

              <Input
                label="Nome do Estágio *"
                {...register(`stages.${index}.name`)}
                error={errors.stages?.[index]?.name?.message}
                placeholder="Ex: Qualificação"
              />

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

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Campos Obrigatórios (para esta etapa)
                </label>
                <p className="text-xs text-white/60 mb-2">
                  Selecione quais campos devem ser obrigatórios quando uma negociação estiver nesta etapa
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'title', label: 'Título' },
                    { value: 'contactId', label: 'Contato' },
                    { value: 'value', label: 'Valor' },
                  ].map(field => {
                    const currentRequiredFields = watch(`stages.${index}.requiredFields`) || []
                    const isChecked = currentRequiredFields.includes(field.value)
                    return (
                      <label key={field.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = currentRequiredFields
                            if (e.target.checked) {
                              setValue(`stages.${index}.requiredFields`, [...current, field.value])
                            } else {
                              setValue(`stages.${index}.requiredFields`, current.filter(f => f !== field.value))
                            }
                          }}
                          className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
                        />
                        <span className="text-sm text-white/90">{field.label}</span>
                      </label>
                    )
                  })}
                </div>
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

