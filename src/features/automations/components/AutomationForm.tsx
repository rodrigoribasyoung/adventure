import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Automation, AutomationTrigger, AutomationCondition, AutomationAction } from '../types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'
import { useUsers } from '@/features/users/hooks/useUsers'

const automationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  enabled: z.boolean(),
  trigger: z.any(), // Será validado manualmente
  conditions: z.array(z.any()).optional(),
  actions: z.array(z.any()).min(1, 'Pelo menos uma ação é obrigatória'),
})

type AutomationFormData = z.infer<typeof automationSchema>

interface AutomationFormProps {
  automation?: Automation
  onSubmit: (data: AutomationFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const TRIGGER_TYPES = [
  { value: 'deal_inactive', label: 'Negociação Inativa (por X dias)' },
  { value: 'deal_created', label: 'Negociação Criada' },
  { value: 'deal_stage_changed', label: 'Estágio da Negociação Alterado' },
  { value: 'deal_status_changed', label: 'Status da Negociação Alterado' },
]

const ACTION_TYPES = [
  { value: 'create_task', label: 'Criar Tarefa' },
  { value: 'send_notification', label: 'Enviar Notificação' },
  { value: 'assign_to', label: 'Atribuir Para' },
  { value: 'move_stage', label: 'Mover Para Estágio' },
]

export const AutomationForm = ({ automation, onSubmit, onCancel, loading = false }: AutomationFormProps) => {
  const { activeFunnel } = useFunnels()
  const { users } = useUsers()
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<AutomationFormData>({
    resolver: zodResolver(automationSchema),
    defaultValues: automation
      ? {
          name: automation.name,
          description: automation.description || '',
          enabled: automation.enabled,
          trigger: automation.trigger,
          conditions: automation.conditions || [],
          actions: automation.actions || [],
        }
      : {
          enabled: true,
          trigger: { type: 'deal_inactive', days: 7 },
          conditions: [],
          actions: [{ type: 'create_task', title: 'Follow-up', dueDays: 1 }],
        },
  })

  const { fields: actionFields, append: appendAction, remove: removeAction } = useFieldArray({
    control,
    name: 'actions',
  })

  const triggerType = watch('trigger.type')
  const actions = watch('actions')

  const handleFormSubmit = async (data: AutomationFormData) => {
    await onSubmit(data)
  }

  const addAction = () => {
    appendAction({ type: 'create_task', title: '', dueDays: 1 })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="Nome da Automação *"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Ex: Follow-up automático após 7 dias"
      />

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Descrição
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200 resize-none"
          placeholder="Descreva o que esta automação faz..."
        />
      </div>

      {/* Trigger */}
      <div className="space-y-4 p-4 bg-white/5 rounded-lg">
        <h3 className="text-lg font-semibold text-white">Gatilho (Quando executar?)</h3>
        
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Tipo de Gatilho *
          </label>
          <select
            {...register('trigger.type')}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
            onChange={(e) => {
              const type = e.target.value
              if (type === 'deal_inactive') {
                setValue('trigger', { type, days: 7 })
              } else if (type === 'deal_status_changed') {
                setValue('trigger', { type, status: 'active' })
              } else {
                setValue('trigger', { type })
              }
            }}
          >
            {TRIGGER_TYPES.map(trigger => (
              <option key={trigger.value} value={trigger.value}>
                {trigger.label}
              </option>
            ))}
          </select>
        </div>

        {triggerType === 'deal_inactive' && (
          <Input
            label="Dias sem atividade"
            type="number"
            {...register('trigger.days', { valueAsNumber: true })}
            defaultValue={watch('trigger.days') || 7}
            min={1}
          />
        )}

        {triggerType === 'deal_status_changed' && (
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Status
            </label>
            <select
              {...register('trigger.status')}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
            >
              <option value="active">Ativa</option>
              <option value="won">Vendida</option>
              <option value="lost">Perdida</option>
              <option value="paused">Pausada</option>
            </select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-4 p-4 bg-white/5 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Ações (O que fazer?)</h3>
          <Button type="button" variant="ghost" size="sm" onClick={addAction}>
            + Adicionar Ação
          </Button>
        </div>

        {actionFields.map((field, index) => {
          const action = actions[index]
          return (
            <div key={field.id} className="p-4 bg-white/5 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Ação {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAction(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remover
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Tipo de Ação *
                </label>
                <select
                  {...register(`actions.${index}.type`)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  onChange={(e) => {
                    const type = e.target.value
                    if (type === 'create_task') {
                      setValue(`actions.${index}`, { type, title: '', dueDays: 1 })
                    } else if (type === 'assign_to') {
                      setValue(`actions.${index}`, { type, userId: '' })
                    } else if (type === 'move_stage') {
                      setValue(`actions.${index}`, { type, stageId: activeFunnel?.stages[0]?.id || '' })
                    } else {
                      setValue(`actions.${index}`, { type, message: '' })
                    }
                  }}
                >
                  {ACTION_TYPES.map(actionType => (
                    <option key={actionType.value} value={actionType.value}>
                      {actionType.label}
                    </option>
                  ))}
                </select>
              </div>

              {action?.type === 'create_task' && (
                <>
                  <Input
                    label="Título da Tarefa *"
                    {...register(`actions.${index}.title`)}
                    placeholder="Ex: Seguir com cliente"
                  />
                  <Input
                    label="Dias até vencimento"
                    type="number"
                    {...register(`actions.${index}.dueDays`, { valueAsNumber: true })}
                    min={0}
                    defaultValue={1}
                  />
                </>
              )}

              {action?.type === 'send_notification' && (
                <Input
                  label="Mensagem *"
                  {...register(`actions.${index}.message`)}
                  placeholder="Mensagem da notificação"
                />
              )}

              {action?.type === 'assign_to' && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Atribuir Para *
                  </label>
                  <select
                    {...register(`actions.${index}.userId`)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  >
                    <option value="">Selecione um usuário</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {action?.type === 'move_stage' && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Mover Para Estágio *
                  </label>
                  <select
                    {...register(`actions.${index}.stageId`)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50"
                  >
                    <option value="">Selecione um estágio</option>
                    {activeFunnel?.stages.map(stage => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="enabled"
          {...register('enabled')}
          className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
        />
        <label htmlFor="enabled" className="text-sm font-medium text-white/90">
          Automação ativa
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : automation ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

